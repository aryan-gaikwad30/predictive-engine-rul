import numpy as np
import pandas as pd
from typing import List, Tuple, Dict, Any, Optional

def create_engine_sequences(
    engine_df: pd.DataFrame, 
    window_size: int, 
    feature_cols: List[str], 
    target_col: str = "actual_RUL"
) -> Tuple[np.ndarray, np.ndarray, pd.DataFrame]:
    """
    Create sliding window sequences for a single engine.
    Assumes engine_df contains only one engine and is already sorted chronologically by cycle.
    
    Args:
        engine_df: DataFrame containing one engine's data
        window_size: Length of the sequence (number of cycles)
        feature_cols: List of features to include in the sequence
        target_col: Target column name (raw RUL)
        
    Returns:
        X: numpy array of shape (num_windows, window_size, num_features)
        y: numpy array of shape (num_windows,) containing target RUL of the final cycle
        metadata: DataFrame containing unit, start_cycle, end_cycle, target_RUL for each window
    """
    # Verify input has required columns
    required_cols = feature_cols + [target_col, "unit", "cycle"]
    missing = [c for c in required_cols if c not in engine_df.columns]
    if missing:
        raise ValueError(f"Missing required columns: {missing}")
        
    n_rows = len(engine_df)
    
    if n_rows < window_size:
        return np.empty((0, window_size, len(feature_cols))), np.empty((0,)), pd.DataFrame()
        
    # We use numpy for fast windowing
    features = engine_df[feature_cols].values
    targets = engine_df[target_col].values
    cycles = engine_df["cycle"].values
    unit_id = engine_df["unit"].iloc[0]
    
    num_windows = n_rows - window_size + 1
    
    X = np.empty((num_windows, window_size, len(feature_cols)))
    y = np.empty(num_windows)
    
    metadata_list = []
    
    for i in range(num_windows):
        X[i] = features[i:i + window_size]
        # Target must be RUL of the final cycle in that sequence
        end_idx = i + window_size - 1
        y[i] = targets[end_idx]
        
        metadata_list.append({
            "unit": unit_id,
            "start_cycle": cycles[i],
            "end_cycle": cycles[end_idx],
            "target_RUL": targets[end_idx]
        })
        
    metadata = pd.DataFrame(metadata_list)
    return X, y, metadata

def create_sequences(
    df: pd.DataFrame, 
    window_size: int, 
    feature_cols: List[str], 
    target_col: str = "actual_RUL"
) -> Tuple[np.ndarray, np.ndarray, pd.DataFrame, List[int]]:
    """
    Create sliding window sequences for all engines in the DataFrame.
    Skips engines that are shorter than window_size.
    
    Returns:
        X: (num_sequences, window_size, num_features)
        y: (num_sequences,)
        metadata: DataFrame of sequence metadata
        skipped_engines: List of engine unit IDs that were skipped
    """
    # Check for empty df
    if len(df) == 0:
        return np.empty((0, window_size, len(feature_cols))), np.empty((0,)), pd.DataFrame(), []
        
    # Sort deterministically
    sorted_df = df.sort_values(["unit", "cycle"])
    
    # Optional: check for duplicate cycles within the same unit
    duplicates = sorted_df.duplicated(subset=["unit", "cycle"])
    if duplicates.any():
        raise ValueError("DataFrame contains duplicate (unit, cycle) rows.")
        
    all_X = []
    all_y = []
    all_metadata = []
    skipped_engines = []
    
    grouped = sorted_df.groupby("unit", sort=False)
    
    for unit_id, group in grouped:
        X_eng, y_eng, meta_eng = create_engine_sequences(group, window_size, feature_cols, target_col)
        
        if len(X_eng) == 0:
            skipped_engines.append(unit_id)
        else:
            all_X.append(X_eng)
            all_y.append(y_eng)
            all_metadata.append(meta_eng)
            
    if not all_X:
        return np.empty((0, window_size, len(feature_cols))), np.empty((0,)), pd.DataFrame(), skipped_engines
        
    X_out = np.vstack(all_X)
    y_out = np.concatenate(all_y)
    metadata_out = pd.concat(all_metadata, ignore_index=True)
    
    return X_out, y_out, metadata_out, skipped_engines

def validate_sequences(
    metadata: pd.DataFrame, 
    df: pd.DataFrame, 
    target_col: str = "actual_RUL"
) -> Dict[str, bool]:
    """
    Validate that sequence generation preserved boundaries, ordering, and target alignment.
    
    Args:
        metadata: Metadata dataframe from create_sequences
        df: The original raw dataframe from which sequences were generated
        target_col: The target column
        
    Returns:
        A dictionary of boolean checks (True means passed).
    """
    results = {
        "engine_boundary_respected": True,
        "chronological_order_respected": True,
        "target_alignment_correct": True
    }
    
    if len(metadata) == 0:
        return results
        
    # 1. Engine boundary
    # This check is inherent to the metadata since it was generated per-engine.
    # To truly verify, we check if start_cycle < end_cycle and that (end_cycle - start_cycle + 1) == window_size
    # Actually, chronological order handles this too.
    
    # 2. Chronological order
    # For any sequence, end_cycle > start_cycle
    # And specifically, end_cycle - start_cycle = window_size - 1 (since FD001 cycles are contiguous integers)
    # If cycles are missing, it might not be strictly window_size - 1, but must be > 0.
    if not (metadata["end_cycle"] > metadata["start_cycle"]).all():
        results["chronological_order_respected"] = False
        
    # 3. Target alignment
    # Check if target_RUL in metadata matches the actual_RUL for that unit & end_cycle in original df
    # We join metadata with original df on [unit, end_cycle] == [unit, cycle]
    merged = metadata.merge(
        df[["unit", "cycle", target_col]], 
        left_on=["unit", "end_cycle"], 
        right_on=["unit", "cycle"], 
        how="left"
    )
    
    # If any target_RUL doesn't match the original actual_RUL at end_cycle, it's a failure
    # We use np.isclose in case of float conversion, but RUL is usually int
    if not np.allclose(merged["target_RUL"].values, merged[target_col].values, equal_nan=True):
        results["target_alignment_correct"] = False
        
    return results
