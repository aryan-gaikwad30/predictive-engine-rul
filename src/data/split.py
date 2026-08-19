import pandas as pd
import numpy as np
from typing import Tuple, Set

def get_engine_split_ids(
    df: pd.DataFrame,
    validation_size: float = 0.2,
    random_state: int = 42,
    engine_column: str = "unit"
) -> Tuple[Set[int], Set[int]]:
    """
    Get the engine IDs for training and validation splits.
    
    Args:
        df: The DataFrame containing the dataset.
        validation_size: The proportion of engines to include in the validation split (0 < validation_size < 1).
        random_state: Random seed for reproducibility.
        engine_column: The name of the column containing engine IDs.
        
    Returns:
        A tuple of (train_engine_ids, validation_engine_ids).
        
    Raises:
        ValueError: If validation_size is not between 0 and 1 exclusive, or if engine_column does not exist.
    """
    if not 0.0 < validation_size < 1.0:
        raise ValueError("validation_size must be between 0 and 1 exclusive.")
        
    if engine_column not in df.columns:
        raise ValueError(f"Column '{engine_column}' not found in the DataFrame.")
        
    unique_engines = df[engine_column].unique()
    
    # Shuffle and split
    np.random.seed(random_state)
    shuffled_engines = np.random.permutation(unique_engines)
    
    n_val = int(len(unique_engines) * validation_size)
    if n_val == 0:
        n_val = 1 # At least one engine if validation_size > 0
    if n_val == len(unique_engines):
        n_val = len(unique_engines) - 1 # At least one training engine
        
    validation_engine_ids = set(shuffled_engines[:n_val])
    train_engine_ids = set(shuffled_engines[n_val:])
    
    return train_engine_ids, validation_engine_ids


def split_by_engine(
    df: pd.DataFrame,
    validation_size: float = 0.2,
    random_state: int = 42,
    engine_column: str = "unit"
) -> Tuple[pd.DataFrame, pd.DataFrame]:
    """
    Split the dataset into training and validation sets by engine ID.
    
    Args:
        df: The DataFrame containing the dataset.
        validation_size: The proportion of engines to include in the validation split.
        random_state: Random seed for reproducibility.
        engine_column: The name of the column containing engine IDs.
        
    Returns:
        A tuple of (train_df, validation_df).
    """
    train_ids, val_ids = get_engine_split_ids(
        df, 
        validation_size=validation_size, 
        random_state=random_state, 
        engine_column=engine_column
    )
    
    train_df = df[df[engine_column].isin(train_ids)].copy()
    validation_df = df[df[engine_column].isin(val_ids)].copy()
    
    return train_df, validation_df


def validate_engine_split(
    original_df: pd.DataFrame,
    train_df: pd.DataFrame,
    validation_df: pd.DataFrame,
    engine_column: str = "unit"
) -> None:
    """
    Validate that the engine split preserves required invariants.
    
    Args:
        original_df: The original DataFrame before splitting.
        train_df: The training split.
        validation_df: The validation split.
        engine_column: The name of the column containing engine IDs.
        
    Raises:
        ValueError: If any validation check fails.
    """
    orig_engines = set(original_df[engine_column].unique())
    train_engines = set(train_df[engine_column].unique())
    val_engines = set(validation_df[engine_column].unique())
    
    # 1. No engine appears in both datasets.
    if not train_engines.isdisjoint(val_engines):
        overlap = train_engines.intersection(val_engines)
        raise ValueError(f"Engines found in both splits: {overlap}")
        
    # 2. Every original engine appears exactly once across the two splits.
    combined_engines = train_engines.union(val_engines)
    if combined_engines != orig_engines:
        missing = orig_engines - combined_engines
        extra = combined_engines - orig_engines
        if missing:
            raise ValueError(f"Engines missing from splits: {missing}")
        if extra:
            raise ValueError(f"Extra engines found in splits: {extra}")
            
    # 3. The number of rows is preserved.
    # 4. No rows were duplicated or silently removed.
    if len(train_df) + len(validation_df) != len(original_df):
        raise ValueError(
            f"Row count mismatch! Original: {len(original_df)}, "
            f"Train: {len(train_df)}, Validation: {len(validation_df)}"
        )
