import pandas as pd
import numpy as np
from dataclasses import dataclass
from typing import List, Dict, Any, Optional, Union
from sklearn.preprocessing import StandardScaler

from src.data.profiling import PreparedDataset
from src.data.split import split_by_engine
from src.data.features import calculate_feature_statistics, find_constant_features
from src.data.normalization import OperatingConditionNormalizer
from src.data.validation import validate_custom_dataset
from src.models.baseline import train_xgboost, predict_rul, get_feature_importance, XGBOOST_AVAILABLE
from src.models.metrics import rmse_score, mae_score, nasa_phm08_score, early_prediction_pct, late_prediction_pct, mean_signed_error, max_absolute_error
from src.models.maintenance_evaluation import evaluate_maintenance_thresholds

@dataclass
class CustomPipelineResult:
    metrics: Dict[str, Union[float, str]]
    maintenance_metrics: pd.DataFrame
    feature_importance: pd.DataFrame
    predictions: pd.DataFrame
    fleet_predictions: pd.DataFrame
    entity_diagnostics: List[Dict[str, Any]]
    metadata: Dict[str, Any]

def train_custom_xgboost(dataset: PreparedDataset, validation_size: float = 0.2, random_state: int = 42) -> CustomPipelineResult:
    """
    Train and evaluate a leakage-safe XGBoost pipeline for a custom dataset.
    """
    if not XGBOOST_AVAILABLE:
        raise ImportError("xgboost is not available")

    # 1. Validation
    validate_custom_dataset(dataset)

    df = dataset.df.copy()
    entity_col = dataset.entity_column
    time_col = dataset.time_column
    target_col = dataset.target_column
    target_semantics = dataset.target_semantics
    initial_features = dataset.feature_columns
    condition_cols = dataset.condition_columns

    # Sort chronologically to prevent temporal leakage
    df = df.sort_values(by=[entity_col, time_col]).reset_index(drop=True)

    # 2. Entity-level split
    train_df, val_df = split_by_engine(df, validation_size=validation_size, random_state=random_state, engine_column=entity_col)

    if train_df.empty or val_df.empty:
        raise ValueError("Split resulted in empty training or validation set. Ensure enough entities exist.")

    # 3. Train-only feature selection (remove exact constants)
    stats_df = calculate_feature_statistics(train_df, initial_features)
    removed_constant_features = find_constant_features(stats_df, variance_threshold=0.0)
    selected_features = sorted([f for f in initial_features if f not in removed_constant_features])

    # 4. Preprocessing (Train-only fit, transform both)
    if condition_cols:
        normalizer = OperatingConditionNormalizer(n_conditions=min(6, len(train_df)), random_state=random_state, settings_columns=condition_cols)
        train_df_scaled = normalizer.fit_transform(train_df, selected_features)
        val_df_scaled = normalizer.transform(val_df)
        preprocessing_used = "OperatingConditionNormalizer"
    else:
        scaler = StandardScaler()
        train_df_scaled = train_df.copy()
        val_df_scaled = val_df.copy()

        train_df_scaled[selected_features] = train_df_scaled[selected_features].astype(float)
        val_df_scaled[selected_features] = val_df_scaled[selected_features].astype(float)

        train_df_scaled[selected_features] = scaler.fit_transform(train_df_scaled[selected_features])
        val_df_scaled[selected_features] = scaler.transform(val_df_scaled[selected_features])
        preprocessing_used = "StandardScaler"

    # 5. Extract arrays
    X_train = train_df_scaled[selected_features]
    y_train = train_df_scaled[target_col]
    X_val = val_df_scaled[selected_features]
    y_val = val_df_scaled[target_col]

    # 6. Train XGBoost
    model = train_xgboost(X_train, y_train, random_state=random_state)

    # 7. Predict and Evaluate
    preds = predict_rul(model, X_val)

    metrics: Dict[str, Union[float, str]] = {
        "RMSE": rmse_score(y_val, preds),
        "MAE": mae_score(y_val, preds),
        "early_prediction_percentage": early_prediction_pct(y_val, preds),
        "late_prediction_percentage": late_prediction_pct(y_val, preds),
        "mean_signed_error": mean_signed_error(y_val, preds),
        "maximum_absolute_error": max_absolute_error(y_val, preds)
    }

    if target_semantics == "rul":
        metrics["NASA_score"] = nasa_phm08_score(y_val, preds)
    else:
        metrics["NASA_score"] = "N/A (NASA score unavailable: target semantics could not be established as Remaining Useful Life.)"

    # Diagnostics DF for maintenance evaluation
    diagnostics = pd.DataFrame()
    diagnostics["unit"] = val_df[entity_col]
    diagnostics["cycle"] = val_df[time_col]
    diagnostics["actual_RUL"] = y_val.values
    diagnostics["predicted_RUL"] = preds
    diagnostics["error"] = preds - y_val.values
    diagnostics["absolute_error"] = np.abs(diagnostics["error"])

    # Entity-level Diagnostics
    entity_diags = []
    grouped_diags = diagnostics.groupby("unit")
    for unit, group in grouped_diags:
        rmse = float(np.sqrt(np.mean(group["error"] ** 2)))
        mae = float(np.mean(group["absolute_error"]))
        entity_diags.append({
            "entity": int(unit) if hasattr(unit, "item") else unit,  # Ensure unit is serializable
            "RMSE": rmse,
            "MAE": mae,
            "mean_predicted": float(group["predicted_RUL"].mean()),
            "mean_actual": float(group["actual_RUL"].mean())
        })
    # Sort by RMSE to easily find best/worst
    entity_diags.sort(key=lambda x: x["RMSE"])

    maintenance_metrics = evaluate_maintenance_thresholds(diagnostics, target_semantics=target_semantics)
    feat_importance = get_feature_importance(model, selected_features)

    # 8. Fleet Predictions
    if condition_cols:
        df_scaled = normalizer.transform(df)
    else:
        df_scaled = df.copy()
        df_scaled[selected_features] = df_scaled[selected_features].astype(float)
        df_scaled[selected_features] = scaler.transform(df_scaled[selected_features])

    X_fleet = df_scaled[selected_features]
    fleet_preds = predict_rul(model, X_fleet)

    fleet_diagnostics = pd.DataFrame()
    fleet_diagnostics["unit"] = df[entity_col]
    fleet_diagnostics["cycle"] = df[time_col]
    if target_col in df.columns:
        fleet_diagnostics["actual_RUL"] = df[target_col].values
    fleet_diagnostics["predicted_RUL"] = fleet_preds

    val_units = set(val_df[entity_col].unique())
    fleet_diagnostics["split"] = fleet_diagnostics["unit"].apply(lambda u: "validation" if u in val_units else "training")

    metadata = {
        "entity_column": entity_col,
        "time_column": time_col,
        "target_column": target_col,
        "target_semantics": target_semantics,
        "selected_features": selected_features,
        "removed_constant_features": removed_constant_features,
        "condition_columns": condition_cols,
        "preprocessing": preprocessing_used,
        "total_machine_count": df[entity_col].nunique(),
        "train_entity_count": train_df[entity_col].nunique(),
        "validation_entity_count": val_df[entity_col].nunique(),
        "train_row_count": len(train_df),
        "validation_row_count": len(val_df),
        "validation_machine_ids": list(val_units),
        "fleet_machine_ids": df[entity_col].unique().tolist(),
        "random_state": random_state
    }

    return CustomPipelineResult(
        metrics=metrics,
        maintenance_metrics=maintenance_metrics,
        feature_importance=feat_importance,
        predictions=diagnostics,
        fleet_predictions=fleet_diagnostics,
        entity_diagnostics=entity_diags,
        metadata=metadata
    )
