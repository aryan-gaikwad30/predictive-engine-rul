import pytest
import pandas as pd
import numpy as np
from src.data.features import (
    get_feature_columns,
    calculate_feature_statistics,
    find_constant_features,
    find_near_constant_features,
    calculate_target_correlations,
    calculate_feature_correlation_matrix
)
from src.data.feature_selection import select_fd001_features

@pytest.fixture
def synthetic_df():
    # Construct a synthetic dataframe
    data = {
        "unit": [1, 1, 1, 2, 2],
        "cycle": [1, 2, 3, 1, 2],
        "setting_1": [10.0, 10.0, 10.0, 10.0, 10.0], # constant
        "setting_2": [0.5, 0.5, 0.5, 0.5, 0.6],      # near constant
        "setting_3": [1.0, 2.0, 3.0, 1.0, 2.0],
    }
    for i in range(1, 22):
        if i == 1:
            data[f"sensor_{i}"] = [0.0, 0.0, 0.0, 0.0, 0.0] # constant
        else:
            data[f"sensor_{i}"] = [float(x) for x in range(i, i+5)]
            
    data["RUL"] = [2, 1, 0, 1, 0]
    data["RUL_clipped"] = [2, 1, 0, 1, 0]
    return pd.DataFrame(data)

def test_get_feature_columns(synthetic_df):
    features = get_feature_columns(synthetic_df)
    
    assert "unit" not in features
    assert "cycle" not in features
    assert "RUL" not in features
    assert "RUL_clipped" not in features
    
    settings = [f for f in features if f.startswith("setting_")]
    assert len(settings) == 3
    
    sensors = [f for f in features if f.startswith("sensor_")]
    assert len(sensors) == 21
    
    assert len(features) == 24

def test_calculate_feature_statistics(synthetic_df):
    features = get_feature_columns(synthetic_df)
    stats = calculate_feature_statistics(synthetic_df, features)
    
    assert list(stats.columns) == ["feature", "variance", "std", "n_unique", "min", "max", "mean"]
    assert len(stats) == 24
    
    # Check it's sorted by variance ascending
    assert stats["variance"].is_monotonic_increasing

def test_find_constant_features(synthetic_df):
    features = get_feature_columns(synthetic_df)
    stats = calculate_feature_statistics(synthetic_df, features)
    constants = find_constant_features(stats)
    
    assert "setting_1" in constants
    assert "sensor_1" in constants
    assert "setting_2" not in constants # It has a 0.6 value

def test_find_near_constant_features(synthetic_df):
    features = get_feature_columns(synthetic_df)
    stats = calculate_feature_statistics(synthetic_df, features)
    
    # setting_2 variance is roughly 0.002
    near_constants = find_near_constant_features(stats, variance_threshold=0.01)
    
    assert "setting_1" in near_constants
    assert "sensor_1" in near_constants
    assert "setting_2" in near_constants
    assert "setting_3" not in near_constants

def test_calculate_target_correlations(synthetic_df):
    features = get_feature_columns(synthetic_df)
    corrs = calculate_target_correlations(synthetic_df, features, target="RUL")
    
    assert list(corrs.columns) == ["feature", "correlation"]
    assert len(corrs) == 24

def test_calculate_feature_correlation_matrix(synthetic_df):
    features = get_feature_columns(synthetic_df)
    corr_matrix = calculate_feature_correlation_matrix(synthetic_df, features)
    
    assert corr_matrix.shape == (24, 24)
    assert list(corr_matrix.columns) == features

def test_select_fd001_features(synthetic_df):
    df_copy = synthetic_df.copy()
    selected, removed, summary = select_fd001_features(synthetic_df)
    
    # Input is not mutated
    pd.testing.assert_frame_equal(synthetic_df, df_copy)
    
    assert "setting_1" in removed
    assert "sensor_1" in removed
    assert "setting_2" in selected # Only exact constants removed
    
    assert summary["removed_constant_count"] == 2
    assert summary["selected_feature_count"] == 22
