import pandas as pd
import numpy as np
from typing import Any, Tuple, List

try:
    from sklearn.ensemble import RandomForestRegressor
    SKLEARN_AVAILABLE = True
except ImportError:
    SKLEARN_AVAILABLE = False
    
try:
    from xgboost import XGBRegressor
    XGBOOST_AVAILABLE = True
except ImportError:
    XGBOOST_AVAILABLE = False

def train_random_forest(X_train: pd.DataFrame, y_train: pd.Series, random_state: int = 42) -> Any:
    """
    Train a baseline Random Forest Regressor.
    
    Why Random Forest:
    - strong nonlinear baseline
    - handles mixed feature behavior
    - little preprocessing required
    - provides feature importance
    - useful benchmark before sequence models
    
    Args:
        X_train: Feature DataFrame
        y_train: Target Series
        random_state: Seed for reproducibility
        
    Returns:
        Fitted RandomForestRegressor model.
    """
    if not SKLEARN_AVAILABLE:
        raise ImportError("scikit-learn is not available in the current environment.")
        
    model = RandomForestRegressor(
        n_estimators=300,
        random_state=random_state,
        n_jobs=-1,
        max_features="sqrt"
    )
    model.fit(X_train, y_train)
    return model

def train_xgboost(X_train: pd.DataFrame, y_train: pd.Series, random_state: int = 42) -> Any:
    """
    Train a baseline XGBoost Regressor.
    
    This is a baseline configuration, NOT an optimized model.
    
    Args:
        X_train: Feature DataFrame
        y_train: Target Series
        random_state: Seed for reproducibility
        
    Returns:
        Fitted XGBRegressor model.
    """
    if not XGBOOST_AVAILABLE:
        raise ImportError("xgboost is not available in the current environment.")
        
    model = XGBRegressor(
        n_estimators=500,
        max_depth=6,
        learning_rate=0.05,
        subsample=0.8,
        colsample_bytree=0.8,
        objective="reg:squarederror",
        random_state=random_state,
        n_jobs=-1
    )
    model.fit(X_train, y_train)
    return model

def predict_rul(model: Any, X: pd.DataFrame) -> np.ndarray:
    """
    Generic prediction helper to predict RUL.
    
    Note: Predictions are returned raw. Do not clip predictions automatically.
    Negative predictions must remain visible for diagnostic purposes.
    
    Args:
        model: Fitted model
        X: Feature DataFrame
        
    Returns:
        Numeric prediction array
    """
    return model.predict(X)

def get_feature_importance(model: Any, feature_names: List[str]) -> pd.DataFrame:
    """
    Extract feature importances from a tree-based model.
    
    Args:
        model: Fitted model (must have feature_importances_ attribute)
        feature_names: List of feature names matching the model inputs
        
    Returns:
        DataFrame with 'feature' and 'importance' columns, sorted descending.
    """
    if not hasattr(model, 'feature_importances_'):
        raise ValueError("Model does not have feature_importances_ attribute.")
        
    importances = model.feature_importances_
    df = pd.DataFrame({
        "feature": feature_names,
        "importance": importances
    })
    return df.sort_values(by="importance", ascending=False).reset_index(drop=True)
