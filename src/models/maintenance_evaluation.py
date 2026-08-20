import pandas as pd
import numpy as np
from typing import Dict, Any, List, Tuple
from src.models.metrics import rmse_score, nasa_phm08_score

def evaluate_rul_bands(diagnostics: pd.DataFrame) -> pd.DataFrame:
    """
    Evaluate model performance by predefined raw RUL bands:
    CRITICAL: 0–30 cycles
    WARNING: 31–75 cycles
    MODERATE: 76–125 cycles
    EARLY-LIFE: >125 cycles
    """
    df = diagnostics.copy()
    
    def get_band(rul):
        if rul <= 30:
            return "Critical"
        elif rul <= 75:
            return "Warning"
        elif rul <= 125:
            return "Moderate"
        else:
            return "Early-life"
            
    df["RUL_band"] = df["actual_RUL"].apply(get_band)
    band_order = ["Critical", "Warning", "Moderate", "Early-life"]
    df["RUL_band"] = pd.Categorical(df["RUL_band"], categories=band_order, ordered=True)
    
    def agg_band(group):
        count = len(group)
        if count == 0:
            return pd.Series({
                "count": 0, "RMSE": 0.0, "MAE": 0.0, "NASA_score": 0.0,
                "mean_error": 0.0, "early_prediction_percentage": 0.0, 
                "late_prediction_percentage": 0.0, "maximum_absolute_error": 0.0
            })
            
        rmse = rmse_score(group["actual_RUL"], group["predicted_RUL"])
        mae = group["absolute_error"].mean()
        mean_err = group["error"].mean()
        max_abs = group["absolute_error"].max()
        
        # We need nasa_penalty in the df or we compute it on the fly
        if "nasa_penalty" in group.columns:
            nasa_score = group["nasa_penalty"].sum()
        else:
            nasa_score = nasa_phm08_score(group["actual_RUL"], group["predicted_RUL"])
            
        early_pct = (group["error"] < 0).mean() * 100
        late_pct = (group["error"] > 0).mean() * 100
        
        return pd.Series({
            "count": count,
            "RMSE": rmse,
            "MAE": mae,
            "NASA_score": nasa_score,
            "mean_error": mean_err,
            "early_prediction_percentage": early_pct,
            "late_prediction_percentage": late_pct,
            "maximum_absolute_error": max_abs
        })
        
    return df.groupby("RUL_band", observed=False).apply(agg_band).reset_index()


def evaluate_maintenance_thresholds(diagnostics: pd.DataFrame) -> pd.DataFrame:
    """
    Evaluate practical maintenance thresholds: <=30, <=50, <=75, <=100.
    """
    thresholds = [30, 50, 75, 100]
    results = []
    
    for thr in thresholds:
        group = diagnostics[diagnostics["actual_RUL"] <= thr]
        count = len(group)
        
        if count == 0:
            results.append({
                "threshold": f"<={thr}",
                "count": 0, "RMSE": 0.0, "MAE": 0.0, "NASA_score": 0.0,
                "mean_error": 0.0, "early_prediction_percentage": 0.0, 
                "late_prediction_percentage": 0.0
            })
            continue
            
        rmse = rmse_score(group["actual_RUL"], group["predicted_RUL"])
        mae = group["absolute_error"].mean()
        mean_err = group["error"].mean()
        
        if "nasa_penalty" in group.columns:
            nasa_score = group["nasa_penalty"].sum()
        else:
            nasa_score = nasa_phm08_score(group["actual_RUL"], group["predicted_RUL"])
            
        early_pct = (group["error"] < 0).mean() * 100
        late_pct = (group["error"] > 0).mean() * 100
        
        results.append({
            "threshold": f"<={thr}",
            "count": count,
            "RMSE": rmse,
            "MAE": mae,
            "NASA_score": nasa_score,
            "mean_error": mean_err,
            "early_prediction_percentage": early_pct,
            "late_prediction_percentage": late_pct
        })
        
    return pd.DataFrame(results)


def calculate_engine_metrics(diagnostics: pd.DataFrame) -> pd.DataFrame:
    """
    Calculate per-engine validation metrics.
    """
    def agg_engine(group):
        count = len(group)
        if count == 0:
            return pd.Series({
                "observation_count": 0, "RMSE": 0.0, "MAE": 0.0, 
                "NASA_score": 0.0, "mean_error": 0.0, 
                "early_prediction_percentage": 0.0, "late_prediction_percentage": 0.0
            })
            
        rmse = rmse_score(group["actual_RUL"], group["predicted_RUL"])
        mae = group["absolute_error"].mean()
        mean_err = group["error"].mean()
        
        if "nasa_penalty" in group.columns:
            nasa_score = group["nasa_penalty"].sum()
        else:
            nasa_score = nasa_phm08_score(group["actual_RUL"], group["predicted_RUL"])
            
        early_pct = (group["error"] < 0).mean() * 100
        late_pct = (group["error"] > 0).mean() * 100
        
        return pd.Series({
            "observation_count": count,
            "RMSE": rmse,
            "MAE": mae,
            "NASA_score": nasa_score,
            "mean_error": mean_err,
            "early_prediction_percentage": early_pct,
            "late_prediction_percentage": late_pct
        })
        
    engine_stats = diagnostics.groupby("unit").apply(agg_engine).reset_index()
    # Ensure all original engines are present, even if empty (though groupby usually handles it if categorical, here unit is likely int)
    return engine_stats


def select_representative_engines(engine_metrics: pd.DataFrame, random_state: int = 42) -> Dict[str, int]:
    """
    Select representative validation engines deterministically based on NASA score percentiles.
    strong = ~25th percentile (low score, good)
    average = ~50th percentile (median score)
    poor = ~90th percentile (high score, bad, but not necessarily the absolute worst outlier)
    """
    if len(engine_metrics) == 0:
        return {}
        
    sorted_df = engine_metrics.sort_values("NASA_score").reset_index(drop=True)
    n = len(sorted_df)
    
    idx_strong = int(n * 0.25)
    idx_avg = int(n * 0.50)
    idx_poor = int(n * 0.90)
    
    # Cap indices
    idx_strong = min(max(0, idx_strong), n - 1)
    idx_avg = min(max(0, idx_avg), n - 1)
    idx_poor = min(max(0, idx_poor), n - 1)
    
    return {
        "strong": int(sorted_df.iloc[idx_strong]["unit"]),
        "average": int(sorted_df.iloc[idx_avg]["unit"]),
        "poor": int(sorted_df.iloc[idx_poor]["unit"])
    }


def calculate_rul_bias(diagnostics: pd.DataFrame) -> pd.DataFrame:
    """
    Calculate mean signed error by RUL band to determine systematic bias.
    """
    band_df = evaluate_rul_bands(diagnostics)
    # We just need the band and the mean_error
    return band_df[["RUL_band", "mean_error"]].copy()


def generate_baseline_comparison(
    historical_metrics: Dict[str, Any], 
    current_metrics: Dict[str, Any]
) -> pd.DataFrame:
    """
    Create a direct comparison table.
    """
    return pd.DataFrame([
        {
            "model": "Historical XGBoost",
            "training target": "CAP=125",
            "RMSE": historical_metrics.get("RMSE", 0.0),
            "MAE": historical_metrics.get("MAE", 0.0),
            "NASA score": historical_metrics.get("NASA_score", 0.0),
            "early %": historical_metrics.get("early_pct", 0.0),
            "late %": historical_metrics.get("late_pct", 0.0),
            "worst engine": historical_metrics.get("worst_engine", 0),
            "worst engine NASA %": historical_metrics.get("worst_engine_nasa_pct", 0.0)
        },
        {
            "model": "Current XGBoost",
            "training target": "UNCAPPED (RAW)",
            "RMSE": current_metrics.get("RMSE", 0.0),
            "MAE": current_metrics.get("MAE", 0.0),
            "NASA score": current_metrics.get("NASA_score", 0.0),
            "early %": current_metrics.get("early_pct", 0.0),
            "late %": current_metrics.get("late_pct", 0.0),
            "worst engine": current_metrics.get("worst_engine", 0),
            "worst engine NASA %": current_metrics.get("worst_engine_nasa_pct", 0.0)
        }
    ])
