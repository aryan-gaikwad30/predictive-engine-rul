import pandas as pd
from typing import List

def get_cmapps_columns() -> List[str]:
    # Import locally to avoid circular dependency if ever they import each other
    # or just replicate since it's just a definition. Actually, better import from loader
    from src.data.loader import get_cmapps_columns as get_cols
    return get_cols()

def validate_cmapps_frame(df: pd.DataFrame) -> None:
    """
    Validate a C-MAPSS train or test DataFrame.
    Raises ValueError if validation fails.
    """
    expected_cols = get_cmapps_columns()
    
    # 1. Exactly 26 columns for train/test.
    # 2. Expected canonical column names.
    # 12. No unexpected columns.
    if len(df.columns) != 26:
        raise ValueError(f"DataFrame must have exactly 26 columns, found {len(df.columns)}.")
        
    if list(df.columns) != expected_cols:
        raise ValueError(f"DataFrame columns do not match expected canonical columns.\nExpected: {expected_cols}\nFound: {list(df.columns)}")
        
    # 3. No missing values.
    if df.isnull().any().any():
        raise ValueError("DataFrame contains missing values.")
        
    # 4. unit must be numeric.
    if not pd.api.types.is_numeric_dtype(df["unit"]):
        raise ValueError("'unit' column must be numeric.")
        
    # 5. cycle must be numeric.
    if not pd.api.types.is_numeric_dtype(df["cycle"]):
        raise ValueError("'cycle' column must be numeric.")
        
    # 6. unit IDs must be positive.
    if (df["unit"] <= 0).any():
        raise ValueError("All 'unit' IDs must be strictly positive.")
        
    # 7. cycle values must be positive.
    if (df["cycle"] <= 0).any():
        raise ValueError("All 'cycle' values must be strictly positive.")
        
    # 8. Every engine's cycles should be monotonically increasing.
    # 9. No duplicate (unit, cycle) combinations.
    # Check uniqueness of (unit, cycle)
    if df.duplicated(subset=["unit", "cycle"]).any():
        raise ValueError("Duplicate (unit, cycle) combinations found.")
        
    # Check monotonic increase
    for unit_id, group in df.groupby("unit"):
        if not group["cycle"].is_monotonic_increasing:
            raise ValueError(f"Cycles for unit {unit_id} are not monotonically increasing.")

def validate_test_rul(test_rul: pd.DataFrame, expected_engines: int) -> None:
    """
    Validate a C-MAPSS test RUL DataFrame.
    Raises ValueError if validation fails.
    """
    if len(test_rul.columns) != 1 or list(test_rul.columns) != ["RUL"]:
        raise ValueError("Test RUL DataFrame must contain exactly one column named 'RUL'.")
        
    # 10. Test RUL must contain exactly one value per test engine.
    if len(test_rul) != expected_engines:
        raise ValueError(f"Test RUL must contain exactly {expected_engines} rows, found {len(test_rul)}.")
        
    if test_rul.isnull().any().any():
        raise ValueError("Test RUL contains missing values.")
        
    # 11. RUL values must be numeric and non-negative.
    if not pd.api.types.is_numeric_dtype(test_rul["RUL"]):
        raise ValueError("'RUL' column must be numeric.")
        
    if (test_rul["RUL"] < 0).any():
        raise ValueError("All 'RUL' values must be non-negative.")

def validate_subset(train_df: pd.DataFrame, test_df: pd.DataFrame, test_rul: pd.DataFrame) -> None:
    """
    Validate an entire C-MAPSS subset.
    """
    validate_cmapps_frame(train_df)
    validate_cmapps_frame(test_df)
    
    expected_test_engines = test_df["unit"].nunique()
    validate_test_rul(test_rul, expected_test_engines)

def validate_custom_dataset(dataset: 'PreparedDataset') -> None:
    """
    Validate a custom dataset before training.
    Raises ValueError with a human-readable message if validation fails.
    """
    import numpy as np
    
    df = dataset.df
    entity_col = dataset.entity_column
    time_col = dataset.time_column
    target_col = dataset.target_column
    feature_cols = dataset.feature_columns

    if df.empty:
        raise ValueError("The dataset is empty. Cannot proceed with training.")

    if not entity_col:
        raise ValueError("Entity column is missing or ambiguous. It must be explicitly configured.")
    if entity_col not in df.columns:
        raise ValueError(f"Entity column '{entity_col}' not found in the dataset.")
        
    if not time_col:
        raise ValueError("Time column is missing or ambiguous. It must be explicitly configured.")
    if time_col not in df.columns:
        raise ValueError(f"Time column '{time_col}' not found in the dataset.")
        
    if not target_col:
        raise ValueError("Target column is missing or ambiguous. It must be explicitly configured.")
    if target_col not in df.columns:
        raise ValueError(f"Target column '{target_col}' not found in the dataset.")
        
    if not feature_cols:
        raise ValueError("No valid feature columns were identified for training.")

    # Target checks
    missing_targets = df[target_col].isnull().sum()
    if missing_targets > 0:
        raise ValueError(f"Target column '{target_col}' contains {missing_targets} missing values. Training cannot continue until these rows are handled.")
    if not pd.api.types.is_numeric_dtype(df[target_col]):
        raise ValueError(f"Target column '{target_col}' must be numeric.")

    # Entity and Time missing checks
    if df[entity_col].isnull().any():
        raise ValueError(f"Entity column '{entity_col}' contains missing values.")
    if df[time_col].isnull().any():
        raise ValueError(f"Time column '{time_col}' contains missing values.")

    # Duplicate rows Check
    duplicates = df.duplicated(subset=[entity_col, time_col]).sum()
    if duplicates > 0:
        raise ValueError(f"Found {duplicates} duplicate (entity, time) observations. Time steps must be unique per entity.")

    # Chronological Ordering & Sample size
    grouped = df.groupby(entity_col)
    for entity_id, group in grouped:
        if len(group) < 2:
            raise ValueError(f"Entity '{entity_id}' has fewer than 2 samples. Cannot model temporal degradation.")
        if not group[time_col].is_monotonic_increasing:
            raise ValueError(f"Time column '{time_col}' is not chronologically ordered for entity '{entity_id}'.")

    # Feature Checks
    for col in feature_cols:
        if col not in df.columns:
            raise ValueError(f"Configured feature column '{col}' not found in dataset.")
        if not pd.api.types.is_numeric_dtype(df[col]):
            raise ValueError(f"Feature column '{col}' is non-numeric. Only numeric features are supported.")
        if df[col].isnull().any():
            raise ValueError(f"Feature column '{col}' contains NaN values. Please impute or remove them before training.")
        if np.isinf(df[col]).any():
            raise ValueError(f"Feature column '{col}' contains infinite values.")
