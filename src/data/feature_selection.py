import pandas as pd
from typing import List, Tuple, Dict, Any
from src.data.features import get_feature_columns, calculate_feature_statistics, find_constant_features

def select_fd001_features(df: pd.DataFrame) -> Tuple[List[str], List[str], Dict[str, Any]]:
    """
    Produce a documented baseline feature list for FD001.
    
    Args:
        df: Training DataFrame.
        
    Returns:
        Tuple containing:
        - selected_features: List of feature names retained.
        - removed_constant_features: List of feature names removed because variance == 0.
        - analysis_summary: Dictionary with metadata about the selection process.
    """
    # 1. Start from settings + sensors
    candidate_features = get_feature_columns(df)
    
    # 2. Calculate statistics and identify exact constants (variance == 0)
    stats_df = calculate_feature_statistics(df, candidate_features)
    removed_constant_features = find_constant_features(stats_df, variance_threshold=0.0)
    
    # 3. Retain features that are not exactly constant
    selected_features = [f for f in candidate_features if f not in removed_constant_features]
    
    analysis_summary = {
        "initial_candidate_count": len(candidate_features),
        "removed_constant_count": len(removed_constant_features),
        "selected_feature_count": len(selected_features),
        "note": "Features were removed only if variance == 0. Low correlation features were explicitly retained."
    }
    
    return selected_features, removed_constant_features, analysis_summary
