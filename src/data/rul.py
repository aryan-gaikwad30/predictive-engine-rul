import pandas as pd
import src.config as config

def add_rul_column(df: pd.DataFrame) -> pd.DataFrame:
    """
    Add the RUL column to a training DataFrame.
    RUL(t) = maximum cycle for that engine - current cycle.
    
    Args:
        df: Training DataFrame containing 'unit' and 'cycle' columns.
        
    Returns:
        A copy of the DataFrame with the 'RUL' column added.
    """
    df_out = df.copy()
    
    # Calculate max cycle per unit
    max_cycles = df_out.groupby("unit")["cycle"].transform("max")
    
    # RUL is max_cycle - current_cycle
    df_out["RUL"] = max_cycles - df_out["cycle"]
    
    return df_out

def add_clipped_rul_column(df: pd.DataFrame, cap: int = 125) -> pd.DataFrame:
    """
    Add a clipped RUL column.
    
    Args:
        df: DataFrame that already contains 'RUL'.
        cap: The maximum RUL value (positive int).
        
    Returns:
        A copy of the DataFrame with the 'RUL_clipped' column added.
    """
    if cap <= 0:
        raise ValueError("Cap must be a positive numeric value.")
        
    df_out = df.copy()
    df_out["RUL_clipped"] = df_out["RUL"].clip(upper=cap)
    
    return df_out

def add_training_targets(df: pd.DataFrame, rul_cap: int = config.DEFAULT_RUL_CAP) -> pd.DataFrame:
    """
    Apply both raw RUL calculation and RUL clipping.
    
    Args:
        df: Training DataFrame.
        rul_cap: The maximum RUL value for clipping.
        
    Returns:
        A copy of the DataFrame containing both 'RUL' and 'RUL_clipped'.
    """
    df_with_rul = add_rul_column(df)
    df_with_targets = add_clipped_rul_column(df_with_rul, cap=rul_cap)
    
    return df_with_targets
