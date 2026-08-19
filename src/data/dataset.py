import pandas as pd
from typing import Tuple, List, Optional
from src.data.feature_selection import select_fd001_features

def prepare_regression_data(
    train_df: pd.DataFrame,
    validation_df: Optional[pd.DataFrame] = None,
    target: str = "RUL_clipped"
) -> Tuple[pd.DataFrame, pd.Series, Optional[pd.DataFrame], Optional[pd.Series]]:
    """
    Prepare regression datasets (X, y) for training and optionally validation.
    
    The feature selection is performed based strictly on `train_df` to prevent data leakage.
    The identified features are then selected from both `train_df` and `validation_df`.
    
    Args:
        train_df: The training DataFrame containing engines assigned to the train split.
        validation_df: Optional validation DataFrame containing engines assigned to the validation split.
        target: The name of the target column to predict (e.g., 'RUL_clipped').
        
    Returns:
        A tuple of (X_train, y_train, X_validation, y_validation).
        If validation_df is None, X_validation and y_validation will be None.
    """
    # 1. Learn features from train_df ONLY to prevent leakage
    selected_features, _, _ = select_fd001_features(train_df)
    
    # 2. Extract features (X) and target (y) for training
    X_train = train_df[selected_features].copy()
    y_train = train_df[target].copy()
    
    # 3. Extract features (X) and target (y) for validation, using train-learned features
    if validation_df is not None:
        X_validation = validation_df[selected_features].copy()
        y_validation = validation_df[target].copy()
    else:
        X_validation = None
        y_validation = None
        
    return X_train, y_train, X_validation, y_validation
