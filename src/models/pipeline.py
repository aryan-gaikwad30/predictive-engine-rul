import pandas as pd
from typing import Tuple, Optional
from src.data.dataset import prepare_regression_data
from src.models.baseline import train_random_forest, train_xgboost, predict_rul, SKLEARN_AVAILABLE, XGBOOST_AVAILABLE
from src.models.metrics import rmse_score, nasa_phm08_score

def get_prediction_diagnostics(
    validation_df: pd.DataFrame, 
    y_pred: pd.Series, 
    target: str = "RUL_clipped"
) -> pd.DataFrame:
    """
    Create a prediction diagnostic DataFrame.
    
    Args:
        validation_df: The original validation DataFrame
        y_pred: The predicted target values
        target: The target column name (e.g. 'RUL_clipped')
        
    Returns:
        A DataFrame with engine/unit, cycle, actual_RUL, predicted_RUL, and error.
    """
    df = pd.DataFrame()
    df["unit"] = validation_df["unit"]
    df["cycle"] = validation_df["cycle"]
    df["actual_RUL"] = validation_df[target]
    df["predicted_RUL"] = y_pred
    df["error"] = y_pred - validation_df[target]
    
    if "RUL" in validation_df.columns and target != "RUL":
        df["raw_RUL"] = validation_df["RUL"]
        
    return df

def run_baseline_models(
    train_df: pd.DataFrame,
    validation_df: pd.DataFrame,
    random_state: int = 42,
    target: str = "RUL_clipped"
) -> pd.DataFrame:
    """
    Run baseline models (Random Forest and XGBoost) on the provided dataset splits.
    
    Responsibilities:
    1. Prepare regression datasets.
    2. Train Random Forest and XGBoost.
    3. Predict validation RUL.
    4. Calculate RMSE and NASA PHM08 score.
    
    Args:
        train_df: The training DataFrame split.
        validation_df: The validation DataFrame split.
        random_state: Random state for reproducibility.
        target: The target column to predict.
        
    Returns:
        A structured results DataFrame with models and their metrics.
    """
    # 1. Prepare data
    X_train, y_train, X_validation, y_validation = prepare_regression_data(
        train_df, validation_df, target=target
    )
    
    results = []
    
    # 2. Random Forest
    try:
        if not SKLEARN_AVAILABLE:
            raise ImportError("scikit-learn is not available")
            
        rf_model = train_random_forest(X_train, y_train, random_state=random_state)
        rf_preds = predict_rul(rf_model, X_validation)
        
        rf_rmse = rmse_score(y_validation, rf_preds)
        rf_nasa = nasa_phm08_score(y_validation, rf_preds)
        
        results.append({
            "Model": "Random Forest",
            "RMSE": rf_rmse,
            "NASA PHM08 Score": rf_nasa
        })
    except ImportError as e:
        results.append({
            "Model": "Random Forest",
            "RMSE": "NOT EXECUTED",
            "NASA PHM08 Score": f"Error: {e}"
        })
        
    # 3. XGBoost
    try:
        if not XGBOOST_AVAILABLE:
            raise ImportError("xgboost is not available")
            
        xgb_model = train_xgboost(X_train, y_train, random_state=random_state)
        xgb_preds = predict_rul(xgb_model, X_validation)
        
        xgb_rmse = rmse_score(y_validation, xgb_preds)
        xgb_nasa = nasa_phm08_score(y_validation, xgb_preds)
        
        results.append({
            "Model": "XGBoost",
            "RMSE": xgb_rmse,
            "NASA PHM08 Score": xgb_nasa
        })
    except ImportError as e:
        results.append({
            "Model": "XGBoost",
            "RMSE": "NOT EXECUTED",
            "NASA PHM08 Score": f"Error: {e}"
        })
        
    return pd.DataFrame(results)
