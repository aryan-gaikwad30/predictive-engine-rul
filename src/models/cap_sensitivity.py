import pandas as pd
import numpy as np
from typing import Optional, Dict, Any, List
import json

from src.models.metrics import rmse_score, nasa_phm08_score
from src.models.error_analysis import (
    calculate_prediction_errors,
    calculate_nasa_penalty_per_prediction,
    summarize_error_direction,
    calculate_nasa_concentration
)
from src.data.dataset import prepare_regression_data
from src.models.baseline import train_xgboost, predict_rul

def build_target(df: pd.DataFrame, cap: Optional[int]) -> pd.Series:
    """
    Build the training target based on the provided cap.
    
    If cap is None:
        target = raw RUL
    else:
        target = raw RUL clipped at cap
        
    Does not mutate the input dataframe.
    """
    if "actual_RUL" in df.columns:
        rul_col = "actual_RUL"
    elif "RUL" in df.columns:
        rul_col = "RUL"
    else:
        raise ValueError("DataFrame must contain 'actual_RUL' or 'RUL' column.")
        
    raw_rul = df[rul_col]
    
    if cap is None:
        return raw_rul.copy()
    else:
        # Prevent negative targets from being introduced (though cap should be positive)
        return raw_rul.clip(upper=cap)


def calculate_target_mismatch(train_df: pd.DataFrame, val_df: pd.DataFrame, cap: Optional[int]) -> Dict[str, Any]:
    """
    Calculate the target mismatch between training and validation data.
    """
    if "actual_RUL" in train_df.columns:
        train_rul = train_df["actual_RUL"]
        val_rul = val_df["actual_RUL"]
    elif "RUL" in train_df.columns:
        train_rul = train_df["RUL"]
        val_rul = val_df["RUL"]
    else:
        raise ValueError("DataFrame must contain 'actual_RUL' or 'RUL' column.")
        
    max_train_raw = train_rul.max()
    
    if cap is None:
        train_clipped_count = 0
        train_clipped_pct = 0.0
        train_target_max = max_train_raw
        
        val_over_cap_count = 0
        val_over_cap_pct = 0.0
    else:
        train_clipped_count = (train_rul > cap).sum()
        train_clipped_pct = (train_clipped_count / len(train_df)) * 100 if len(train_df) > 0 else 0.0
        train_target_max = min(max_train_raw, cap)
        
        val_over_cap_count = (val_rul > cap).sum()
        val_over_cap_pct = (val_over_cap_count / len(val_df)) * 100 if len(val_df) > 0 else 0.0
        
    return {
        "train_rows_clipped_count": int(train_clipped_count),
        "train_rows_clipped_percentage": float(train_clipped_pct),
        "train_raw_rul_max": float(max_train_raw),
        "train_target_max": float(train_target_max),
        "val_rows_over_cap_count": int(val_over_cap_count),
        "val_rows_over_cap_percentage": float(val_over_cap_pct)
    }


def analyze_early_life(diagnostics: pd.DataFrame, cap: Optional[int]) -> Dict[str, Any]:
    """
    Analyze the errors separately for raw RUL > 125 and RUL <= 125.
    The early-life definition ALWAYS uses raw RUL > 125, regardless of the cap.
    """
    if "nasa_penalty" not in diagnostics.columns:
        df = calculate_nasa_penalty_per_prediction(diagnostics)
    else:
        df = diagnostics
        
    early_life_mask = df["actual_RUL"] > 125
    
    results = {}
    for group_name, mask in [("early_life", early_life_mask), ("later_life", ~early_life_mask)]:
        group_df = df[mask]
        count = len(group_df)
        
        if count == 0:
            results[group_name] = {
                "count": 0, "RMSE": 0.0, "MAE": 0.0, "NASA_score": 0.0,
                "mean_error": 0.0, "early_prediction_percentage": 0.0, "late_prediction_percentage": 0.0
            }
            continue
            
        rmse = rmse_score(group_df["actual_RUL"], group_df["predicted_RUL"])
        mae = group_df["absolute_error"].mean()
        nasa_score = group_df["nasa_penalty"].sum()
        mean_err = group_df["error"].mean()
        
        early_pct = (group_df["error"] < 0).mean() * 100
        late_pct = (group_df["error"] > 0).mean() * 100
        
        results[group_name] = {
            "count": count,
            "RMSE": rmse,
            "MAE": mae,
            "NASA_score": nasa_score,
            "mean_error": mean_err,
            "early_prediction_percentage": early_pct,
            "late_prediction_percentage": late_pct
        }
        
    return results


def run_cap_sensitivity_experiment(
    train_df: pd.DataFrame, 
    validation_df: pd.DataFrame, 
    caps: List[Optional[int]] = [75, 100, 125, 150, 200, None]
) -> pd.DataFrame:
    """
    Run the controlled cap sensitivity experiments.
    """
    results = []
    
    # 1. Feature selection from train_df ONLY (without using target yet)
    # Target will be added momentarily. We extract features first.
    # Note: prepare_regression_data requires the target column to exist.
    # So we'll iterate caps and construct targets on the fly.
    
    from src.data.feature_selection import select_fd001_features
    selected_features, _, _ = select_fd001_features(train_df)
    
    X_train_base = train_df[selected_features].copy()
    X_val_base = validation_df[selected_features].copy()
    
    val_raw_rul = validation_df["RUL"] if "RUL" in validation_df.columns else validation_df["actual_RUL"]
    
    for cap in caps:
        # Build training target
        y_train = build_target(train_df, cap)
        
        # Train XGBoost
        xgb_model = train_xgboost(X_train_base, y_train, random_state=42)
        
        # Predict on validation (features remain exactly the same)
        y_pred = predict_rul(xgb_model, X_val_base)
        
        # Diagnostics
        diag = pd.DataFrame({
            "unit": validation_df["unit"],
            "cycle": validation_df["cycle"],
            "actual_RUL": val_raw_rul,
            "predicted_RUL": y_pred
        })
        diag = calculate_prediction_errors(diag)
        diag = calculate_nasa_penalty_per_prediction(diag)
        
        # Target mismatch
        mismatch = calculate_target_mismatch(train_df, validation_df, cap)
        
        # NASA penalty from validation rows where raw RUL > cap
        if cap is not None:
            over_cap_mask = diag["actual_RUL"] > cap
            val_over_cap_nasa = diag.loc[over_cap_mask, "nasa_penalty"].sum()
        else:
            val_over_cap_nasa = 0.0
            
        mismatch["val_over_cap_nasa_penalty"] = val_over_cap_nasa
        
        # Overall metrics
        rmse = rmse_score(diag["actual_RUL"], diag["predicted_RUL"])
        mae = diag["absolute_error"].mean()
        total_nasa = diag["nasa_penalty"].sum()
        
        err_dir = summarize_error_direction(diag)
        conc = calculate_nasa_concentration(diag)
        
        # Early-life analysis
        early_life_results = analyze_early_life(diag, cap)
        
        # Other RUL bands NASA scores
        critical_mask = (diag["actual_RUL"] >= 0) & (diag["actual_RUL"] <= 30)
        warning_mask = (diag["actual_RUL"] >= 31) & (diag["actual_RUL"] <= 75)
        moderate_mask = (diag["actual_RUL"] >= 76) & (diag["actual_RUL"] <= 125)
        
        critical_nasa = diag.loc[critical_mask, "nasa_penalty"].sum()
        warning_nasa = diag.loc[warning_mask, "nasa_penalty"].sum()
        moderate_nasa = diag.loc[moderate_mask, "nasa_penalty"].sum()
        
        # Unit 5 analysis
        unit5_nasa = diag.loc[diag["unit"] == 5, "nasa_penalty"].sum()
        unit5_pct = (unit5_nasa / total_nasa) * 100 if total_nasa > 0 else 0.0
        
        # Worst prediction
        worst_pred = diag.sort_values("nasa_penalty", ascending=False).iloc[0]
        
        res_row = {
            "cap": cap if cap is not None else "None",
            "train_target_max": mismatch["train_target_max"],
            "train_target_mean": y_train.mean(),
            "train_rows_clipped_percentage": mismatch["train_rows_clipped_percentage"],
            "val_rows_over_cap_percentage": mismatch["val_rows_over_cap_percentage"],
            "val_over_cap_nasa_penalty": val_over_cap_nasa,
            
            "validation_rmse": rmse,
            "validation_mae": mae,
            "validation_nasa_score": total_nasa,
            
            "early_prediction_percentage": err_dir["early_prediction_percentage"],
            "late_prediction_percentage": err_dir["late_prediction_percentage"],
            
            "mean_error": err_dir["mean_error"],
            "mean_absolute_error": err_dir["mean_absolute_error"],
            "maximum_absolute_error": max(abs(err_dir["max_early_error"]), err_dir["max_late_error"]),
            
            "early_life_nasa_score": early_life_results["early_life"]["NASA_score"],
            "early_life_nasa_percentage": (early_life_results["early_life"]["NASA_score"] / total_nasa) * 100 if total_nasa > 0 else 0.0,
            
            "critical_nasa_score": critical_nasa,
            "warning_nasa_score": warning_nasa,
            "moderate_nasa_score": moderate_nasa,
            
            "worst_single_prediction_penalty": conc["worst_1_penalty"],
            "worst_1pct_contribution_percentage": conc["worst_1pct_percentage"],
            "worst_5pct_contribution_percentage": conc["worst_5pct_percentage"],
            
            "unit_5_nasa_percentage": unit5_pct,
            
            "worst_pred_unit": worst_pred["unit"],
            "worst_pred_cycle": worst_pred["cycle"],
            "worst_pred_actual_RUL": worst_pred["actual_RUL"],
            "worst_pred_predicted_RUL": worst_pred["predicted_RUL"],
            "worst_pred_error": worst_pred["error"]
        }
        results.append(res_row)
        
    return pd.DataFrame(results)
