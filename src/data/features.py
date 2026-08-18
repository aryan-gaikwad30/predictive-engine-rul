import pandas as pd
from typing import List, Tuple

def get_feature_columns(df: pd.DataFrame) -> List[str]:
    """
    Get candidate predictive features (settings + sensors).
    Excludes 'unit', 'RUL', 'RUL_clipped', and 'cycle'.
    'cycle' requires special treatment and is excluded from default features.
    """
    exclude = {"unit", "RUL", "RUL_clipped", "cycle"}
    features = [col for col in df.columns if col not in exclude]
    return features

def calculate_feature_statistics(df: pd.DataFrame, features: List[str]) -> pd.DataFrame:
    """
    Calculate variance, std, n_unique, min, max, mean for each feature.
    Sorts by variance ascending.
    """
    stats = []
    for f in features:
        stats.append({
            "feature": f,
            "variance": df[f].var(),
            "std": df[f].std(),
            "n_unique": df[f].nunique(),
            "min": df[f].min(),
            "max": df[f].max(),
            "mean": df[f].mean()
        })
    stats_df = pd.DataFrame(stats).sort_values("variance", ascending=True).reset_index(drop=True)
    return stats_df

def find_constant_features(stats: pd.DataFrame, variance_threshold: float = 0.0) -> List[str]:
    """
    Return features whose variance is exactly <= variance_threshold (default 0.0).
    """
    return stats[stats["variance"] <= variance_threshold]["feature"].tolist()

def find_near_constant_features(stats: pd.DataFrame, variance_threshold: float) -> List[str]:
    """
    Return features whose variance is <= variance_threshold.
    Configurable threshold for near-constant detection.
    """
    return stats[stats["variance"] <= variance_threshold]["feature"].tolist()

def calculate_target_correlations(df: pd.DataFrame, features: List[str], target: str = "RUL_clipped") -> pd.DataFrame:
    """
    Calculate Pearson correlation between features and the target.
    Sort by absolute correlation descending, but keep the signed value.
    """
    correlations = []
    for f in features:
        corr = df[f].corr(df[target])
        correlations.append({
            "feature": f,
            "correlation": corr,
            "abs_correlation": abs(corr)
        })
    corr_df = pd.DataFrame(correlations).sort_values("abs_correlation", ascending=False).reset_index(drop=True)
    corr_df = corr_df.drop(columns=["abs_correlation"])
    return corr_df

def calculate_feature_correlation_matrix(df: pd.DataFrame, features: List[str]) -> pd.DataFrame:
    """
    Return the feature-feature Pearson correlation matrix.
    """
    return df[features].corr()
