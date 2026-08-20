import numpy as np
import pandas as pd
from typing import Dict, Any

from src.models.metrics import nasa_phm08_score, rmse_score


def calculate_prediction_errors(diagnostics: pd.DataFrame) -> pd.DataFrame:
    """
    Calculate prediction errors, absolute errors, and squared errors.
    Returns a copy of the input dataframe with new columns.
    
    A positive error means predicted RUL > actual RUL (late prediction).
    A negative error means predicted RUL < actual RUL (early prediction).
    """
    df = diagnostics.copy()
    
    df["error"] = df["predicted_RUL"] - df["actual_RUL"]
    df["absolute_error"] = df["error"].abs()
    df["squared_error"] = df["error"] ** 2
    
    return df


def calculate_nasa_penalty_per_prediction(diagnostics: pd.DataFrame) -> pd.DataFrame:
    """
    Calculate the NASA PHM08 penalty per prediction row.
    Returns a copy of the dataframe with a 'nasa_penalty' column.
    """
    df = diagnostics.copy()
    
    if "error" not in df.columns:
        df = calculate_prediction_errors(df)
        
    d = df["error"].values
    
    # Asymmetric penalty function
    penalties = np.where(d < 0, np.exp(-d / 13.0) - 1, np.exp(d / 10.0) - 1)
    
    df["nasa_penalty"] = penalties
    
    return df


def get_worst_predictions(diagnostics: pd.DataFrame, n: int = 20, sort_by: str = "nasa_penalty") -> pd.DataFrame:
    """
    Get the top N worst predictions sorted by a given metric.
    
    Args:
        diagnostics: DataFrame with predictions and errors/penalties.
        n: Number of rows to return.
        sort_by: Column name to sort by ('nasa_penalty' or 'absolute_error').
    """
    if sort_by not in diagnostics.columns:
        if sort_by == "nasa_penalty":
            diagnostics = calculate_nasa_penalty_per_prediction(diagnostics)
        elif sort_by == "absolute_error":
            diagnostics = calculate_prediction_errors(diagnostics)
            
    return diagnostics.sort_values(by=sort_by, ascending=False).head(n)


def summarize_error_direction(diagnostics: pd.DataFrame) -> Dict[str, Any]:
    """
    Summarize prediction errors by direction (early vs late).
    """
    if "error" not in diagnostics.columns:
        df = calculate_prediction_errors(diagnostics)
    else:
        df = diagnostics
        
    total_predictions = len(df)
    
    early_mask = df["error"] < 0
    late_mask = df["error"] > 0
    exact_mask = df["error"] == 0
    
    early_count = early_mask.sum()
    late_count = late_mask.sum()
    exact_count = exact_mask.sum()
    
    res = {
        "total_predictions": total_predictions,
        "early_prediction_count": early_count,
        "late_prediction_count": late_count,
        "exact_prediction_count": exact_count,
        "early_prediction_percentage": (early_count / total_predictions) * 100 if total_predictions > 0 else 0.0,
        "late_prediction_percentage": (late_count / total_predictions) * 100 if total_predictions > 0 else 0.0,
        "mean_error": df["error"].mean(),
        "mean_absolute_error": df["absolute_error"].mean(),
        "mean_early_error": df.loc[early_mask, "error"].mean() if early_count > 0 else 0.0,
        "mean_late_error": df.loc[late_mask, "error"].mean() if late_count > 0 else 0.0,
        "max_early_error": df.loc[early_mask, "error"].min() if early_count > 0 else 0.0, # Most negative
        "max_late_error": df.loc[late_mask, "error"].max() if late_count > 0 else 0.0
    }
    
    return res


def summarize_errors_by_engine(diagnostics: pd.DataFrame) -> pd.DataFrame:
    """
    Summarize errors for each individual engine unit.
    Returns DataFrame sorted by NASA_score descending.
    """
    if "nasa_penalty" not in diagnostics.columns:
        df = calculate_nasa_penalty_per_prediction(diagnostics)
    else:
        df = diagnostics
        
    def aggregate_engine(group):
        obs_count = len(group)
        # Handle cases where actual_RUL is exactly equal to predicted_RUL for all obs
        rmse = rmse_score(group["actual_RUL"], group["predicted_RUL"])
        mae = group["absolute_error"].mean()
        mean_err = group["error"].mean()
        max_abs_err = group["absolute_error"].max()
        nasa_score = group["nasa_penalty"].sum()
        
        late_count = (group["error"] > 0).sum()
        early_count = (group["error"] < 0).sum()
        
        return pd.Series({
            "observation_count": obs_count,
            "RMSE": rmse,
            "MAE": mae,
            "mean_error": mean_err,
            "maximum_absolute_error": max_abs_err,
            "NASA_score": nasa_score,
            "late_prediction_count": late_count,
            "early_prediction_count": early_count
        })

    engine_summary = df.groupby("unit").apply(aggregate_engine).reset_index()
    engine_summary = engine_summary.sort_values("NASA_score", ascending=False).reset_index(drop=True)
    
    return engine_summary


def summarize_errors_by_rul_band(diagnostics: pd.DataFrame) -> pd.DataFrame:
    """
    Summarize errors by life stage RUL bands based on raw RUL.
    
    Bands:
    Critical: 0 <= RUL <= 30
    Warning: 31 <= RUL <= 75
    Moderate: 76 <= RUL <= 125
    Early-life: RUL > 125
    """
    if "nasa_penalty" not in diagnostics.columns:
        df = calculate_nasa_penalty_per_prediction(diagnostics)
    else:
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
    
    # Categorical ordering
    band_order = ["Critical", "Warning", "Moderate", "Early-life"]
    df["RUL_band"] = pd.Categorical(df["RUL_band"], categories=band_order, ordered=True)
    
    def aggregate_band(group):
        count = len(group)
        if count == 0:
            return pd.Series({
                "count": 0, "RMSE": 0.0, "MAE": 0.0, "mean_error": 0.0, 
                "NASA_score": 0.0, "late_prediction_percentage": 0.0, "early_prediction_percentage": 0.0
            })
            
        rmse = rmse_score(group["actual_RUL"], group["predicted_RUL"])
        mae = group["absolute_error"].mean()
        mean_err = group["error"].mean()
        nasa_score = group["nasa_penalty"].sum()
        
        late_pct = (group["error"] > 0).mean() * 100
        early_pct = (group["error"] < 0).mean() * 100
        
        return pd.Series({
            "count": count,
            "RMSE": rmse,
            "MAE": mae,
            "mean_error": mean_err,
            "NASA_score": nasa_score,
            "early_prediction_percentage": early_pct,
            "late_prediction_percentage": late_pct
        })
        
    band_summary = df.groupby("RUL_band", observed=False).apply(aggregate_band).reset_index()
    return band_summary


def calculate_nasa_concentration(diagnostics: pd.DataFrame) -> Dict[str, Any]:
    """
    Calculate how concentrated the NASA penalty is among the worst predictions.
    """
    if "nasa_penalty" not in diagnostics.columns:
        df = calculate_nasa_penalty_per_prediction(diagnostics)
    else:
        df = diagnostics
        
    total_score = df["nasa_penalty"].sum()
    
    if total_score == 0:
        return {
            "total_score": 0.0,
            "worst_1_penalty": 0.0,
            "worst_1_percentage": 0.0,
            "worst_5_percentage": 0.0,
            "worst_10_percentage": 0.0,
            "worst_1pct_percentage": 0.0,
            "worst_5pct_percentage": 0.0
        }
        
    sorted_penalties = df["nasa_penalty"].sort_values(ascending=False).values
    total_obs = len(sorted_penalties)
    
    n_1pct = max(1, int(total_obs * 0.01))
    n_5pct = max(1, int(total_obs * 0.05))
    
    return {
        "total_score": total_score,
        "worst_1_penalty": sorted_penalties[0] if total_obs > 0 else 0.0,
        "worst_1_percentage": (sorted_penalties[0] / total_score) * 100 if total_obs > 0 else 0.0,
        "worst_5_percentage": (np.sum(sorted_penalties[:5]) / total_score) * 100 if total_obs >= 5 else 100.0,
        "worst_10_percentage": (np.sum(sorted_penalties[:10]) / total_score) * 100 if total_obs >= 10 else 100.0,
        "worst_1pct_percentage": (np.sum(sorted_penalties[:n_1pct]) / total_score) * 100,
        "worst_5pct_percentage": (np.sum(sorted_penalties[:n_5pct]) / total_score) * 100
    }
