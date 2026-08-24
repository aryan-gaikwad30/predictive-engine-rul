import pandas as pd
import numpy as np
from dataclasses import dataclass
from typing import List, Dict, Any, Optional
from sklearn.preprocessing import StandardScaler

from src.data.profiling import PreparedDataset
from src.data.split import split_by_engine
from src.data.features import calculate_feature_statistics, find_constant_features
from src.data.normalization import OperatingConditionNormalizer
from src.models.baseline import train_xgboost, predict_rul, get_feature_importance, XGBOOST_AVAILABLE
from src.models.metrics import rmse_score, mae_score, nasa_phm08_score, early_prediction_pct, late_prediction_pct, mean_signed_error, max_absolute_error
from src.models.maintenance_evaluation import evaluate_maintenance_thresholds

@dataclass
class CustomPipelineResult:
    metrics: Dict[str, float]
    maintenance_metrics: pd.DataFrame
    feature_importance: pd.DataFrame
    predictions: pd.DataFrame
    metadata: Dict[str, Any]

def train_custom_xgboost(dataset: PreparedDataset, validation_size: float = 0.2, random_state: int = 42) -> CustomPipelineResult:
    """
    Train and evaluate a leakage-safe XGBoost pipeline for a custom dataset.
    """
    if not XGBOOST_AVAILABLE:
        raise ImportError("xgboost is not available")
        
    df = dataset.df
    entity_col = dataset.entity_column
    time_col = dataset.time_column
    target_col = dataset.target_column
    initial_features = dataset.feature_columns
    condition_cols = dataset.condition_columns
    
    if not entity_col or not target_col or not time_col:
        raise ValueError("Entity, time, and target columns are required for the supervised custom pipeline.")
        
    # 1. Entity-level split
    train_df, val_df = split_by_engine(df, validation_size=validation_size, random_state=random_state, engine_column=entity_col)
    
    if train_df.empty or val_df.empty:
        raise ValueError("Split resulted in empty training or validation set. Ensure enough entities exist.")
    
    # 2. Train-only feature selection (remove exact constants)
    stats_df = calculate_feature_statistics(train_df, initial_features)
    removed_constant_features = find_constant_features(stats_df, variance_threshold=0.0)
    selected_features = [f for f in initial_features if f not in removed_constant_features]
    
    # 3. Preprocessing (Train-only fit, transform both)
    # If condition_cols exist and aren't empty, use OperatingConditionNormalizer, otherwise standard scaler
    if condition_cols:
        normalizer = OperatingConditionNormalizer(n_conditions=min(6, len(train_df)), random_state=random_state, settings_columns=condition_cols)
        train_df_scaled = normalizer.fit_transform(train_df, selected_features)
        val_df_scaled = normalizer.transform(val_df)
        preprocessing_used = "OperatingConditionNormalizer"
    else:
        scaler = StandardScaler()
        train_df_scaled = train_df.copy()
        val_df_scaled = val_df.copy()
        
        # Cast to float64 to avoid warnings/errors during scaling
        train_df_scaled[selected_features] = train_df_scaled[selected_features].astype(float)
        val_df_scaled[selected_features] = val_df_scaled[selected_features].astype(float)
        
        train_df_scaled[selected_features] = scaler.fit_transform(train_df_scaled[selected_features])
        val_df_scaled[selected_features] = scaler.transform(val_df_scaled[selected_features])
        preprocessing_used = "StandardScaler"
        
    # 4. Extract arrays
    X_train = train_df_scaled[selected_features]
    y_train = train_df_scaled[target_col]
    X_val = val_df_scaled[selected_features]
    y_val = val_df_scaled[target_col]
    
    # 5. Train XGBoost
    model = train_xgboost(X_train, y_train, random_state=random_state)
    
    # 6. Predict and Evaluate
    preds = predict_rul(model, X_val)
    
    metrics = {
        "RMSE": rmse_score(y_val, preds),
        "MAE": mae_score(y_val, preds),
        "NASA_score": nasa_phm08_score(y_val, preds),
        "early_prediction_percentage": early_prediction_pct(y_val, preds),
        "late_prediction_percentage": late_prediction_pct(y_val, preds),
        "mean_signed_error": mean_signed_error(y_val, preds),
        "maximum_absolute_error": max_absolute_error(y_val, preds)
    }
    
    # Diagnostics DF for maintenance evaluation
    diagnostics = pd.DataFrame()
    diagnostics["unit"] = val_df[entity_col]
    diagnostics["cycle"] = val_df[time_col]
    diagnostics["actual_RUL"] = y_val.values
    diagnostics["predicted_RUL"] = preds
    diagnostics["error"] = preds - y_val.values
    diagnostics["absolute_error"] = np.abs(diagnostics["error"])
    
    maintenance_metrics = evaluate_maintenance_thresholds(diagnostics)
    feat_importance = get_feature_importance(model, selected_features)
    
    metadata = {
        "entity_column": entity_col,
        "time_column": time_col,
        "target_column": target_col,
        "selected_features": selected_features,
        "removed_constant_features": removed_constant_features,
        "condition_columns": condition_cols,
        "preprocessing": preprocessing_used,
        "train_entity_count": train_df[entity_col].nunique(),
        "validation_entity_count": val_df[entity_col].nunique(),
        "train_row_count": len(train_df),
        "validation_row_count": len(val_df),
        "random_state": random_state
    }
    
    return CustomPipelineResult(
        metrics=metrics,
        maintenance_metrics=maintenance_metrics,
        feature_importance=feat_importance,
        predictions=diagnostics,
        metadata=metadata
    )
