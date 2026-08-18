import pandas as pd
from pathlib import Path
from typing import Tuple, List
import src.config as config

def get_cmapps_columns() -> List[str]:
    """
    Generate the 26 canonical C-MAPSS columns.
    Returns:
        List of column names (unit, cycle, setting_1..3, sensor_1..21).
    """
    settings = [f"setting_{i}" for i in range(1, 4)]
    sensors = [f"sensor_{i}" for i in range(1, 22)]
    return ["unit", "cycle"] + settings + sensors

def load_train_data(path: Path | str) -> pd.DataFrame:
    """
    Load C-MAPSS training data from a whitespace-separated file.
    """
    df = pd.read_csv(
        path,
        sep=r"\s+",
        header=None,
        names=get_cmapps_columns()
    )
    return df

def load_test_data(path: Path | str) -> pd.DataFrame:
    """
    Load C-MAPSS test data from a whitespace-separated file.
    """
    df = pd.read_csv(
        path,
        sep=r"\s+",
        header=None,
        names=get_cmapps_columns()
    )
    return df

def load_test_rul(path: Path | str) -> pd.DataFrame:
    """
    Load C-MAPSS test RUL data from a whitespace-separated file.
    Returns DataFrame with exactly one column: RUL.
    """
    df = pd.read_csv(
        path,
        sep=r"\s+",
        header=None,
        names=["RUL"]
    )
    return df

def load_subset(subset: str) -> Tuple[pd.DataFrame, pd.DataFrame, pd.DataFrame]:
    """
    Load a specific C-MAPSS subset (FD001 to FD004).
    
    Args:
        subset: String identifier of the subset, e.g., "FD001".
        
    Returns:
        Tuple of (train_df, test_df, test_rul_df).
        
    Raises:
        ValueError: If subset is invalid.
    """
    subset = subset.strip().upper()
    valid_subsets = {"FD001", "FD002", "FD003", "FD004"}
    
    if subset not in valid_subsets:
        raise ValueError(f"Invalid subset '{subset}'. Must be one of {valid_subsets}")
    
    train_path = config.CMAPSS_DATA_DIR / f"train_{subset}.txt"
    test_path = config.CMAPSS_DATA_DIR / f"test_{subset}.txt"
    rul_path = config.CMAPSS_DATA_DIR / f"RUL_{subset}.txt"
    
    train_df = load_train_data(train_path)
    test_df = load_test_data(test_path)
    test_rul = load_test_rul(rul_path)
    
    return train_df, test_df, test_rul
