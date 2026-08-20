import pytest
import pandas as pd
import numpy as np

from src.models.cap_sensitivity import (
    build_target,
    calculate_target_mismatch,
    analyze_early_life,
    run_cap_sensitivity_experiment
)

@pytest.fixture
def sample_df():
    return pd.DataFrame({
        "unit": [1, 1, 2, 2, 3, 3],
        "cycle": [1, 2, 1, 2, 1, 2],
        "actual_RUL": [150, 149, 100, 99, 10, 9],
        "sensor_1": [1.0, 1.1, 1.0, 1.2, 1.0, 1.1] # Dummy feature
    })

def test_cap_75_clips_correctly(sample_df):
    target = build_target(sample_df, 75)
    assert target.max() == 75
    assert list(target) == [75, 75, 75, 75, 10, 9]

def test_cap_125_clips_correctly(sample_df):
    target = build_target(sample_df, 125)
    assert target.max() == 125
    assert list(target) == [125, 125, 100, 99, 10, 9]

def test_cap_200_clips_correctly(sample_df):
    target = build_target(sample_df, 200)
    assert target.max() == 150 # Max actual_RUL is 150
    assert list(target) == [150, 149, 100, 99, 10, 9]

def test_cap_none_returns_raw_rul(sample_df):
    target = build_target(sample_df, None)
    assert list(target) == list(sample_df["actual_RUL"])

def test_input_dataframe_not_mutated(sample_df):
    df_copy = sample_df.copy()
    build_target(sample_df, 100)
    pd.testing.assert_frame_equal(sample_df, df_copy)

def test_no_negative_targets_introduced():
    df = pd.DataFrame({"actual_RUL": [0, -5, 100]})
    target = build_target(df, 125)
    assert (target < 0).any() == True # Original contained negatives. Wait, the requirement says "no negative targets are introduced". Let's verify it doesn't *create* negatives.
    # The actual requirement is "no negative targets are introduced".
    assert target[0] == 0
    assert target[1] == -5
    assert target[2] == 100

def test_maximum_target_equals_cap():
    df = pd.DataFrame({"actual_RUL": [200, 300, 400]})
    target = build_target(df, 150)
    assert target.max() == 150

def test_cap_none_preserves_maximum_raw_rul(sample_df):
    target = build_target(sample_df, None)
    assert target.max() == sample_df["actual_RUL"].max()

def test_early_life_definition_uses_raw_rul():
    diag = pd.DataFrame({
        "unit": [1, 2, 3],
        "cycle": [1, 1, 1],
        "actual_RUL": [130, 125, 50],
        "predicted_RUL": [100, 100, 50],
        "error": [-30, -25, 0],
        "absolute_error": [30, 25, 0]
    })
    
    # Cap is 100, but early-life should still use raw_RUL > 125
    res = analyze_early_life(diag, 100)
    assert res["early_life"]["count"] == 1 # only 130
    assert res["later_life"]["count"] == 2 # 125, 50

def test_target_mismatch_counts(sample_df):
    val_df = pd.DataFrame({"actual_RUL": [160, 140, 80]})
    
    mismatch = calculate_target_mismatch(sample_df, val_df, 125)
    assert mismatch["train_rows_clipped_count"] == 2 # 150, 149
    assert mismatch["val_rows_over_cap_count"] == 2 # 160, 140

from unittest import mock

def test_experiment_output_columns(sample_df):
    # Mock train_xgboost and predict_rul to avoid actual training in unit test
    with mock.patch("src.models.cap_sensitivity.train_xgboost", return_value="mock_model"), \
         mock.patch("src.models.cap_sensitivity.predict_rul", return_value=np.array([120, 120, 90, 90, 10, 10])), \
         mock.patch("src.data.feature_selection.select_fd001_features", return_value=(["sensor_1"], [], [])):
        
        val_df = sample_df.copy()
        
        res = run_cap_sensitivity_experiment(sample_df, val_df, caps=[125])

    
    expected_cols = [
        "cap", "train_target_max", "train_target_mean", "validation_rmse",
        "validation_mae", "validation_nasa_score", "early_prediction_percentage",
        "late_prediction_percentage", "mean_error", "mean_absolute_error",
        "maximum_absolute_error", "early_life_nasa_score", "early_life_nasa_percentage",
        "critical_nasa_score", "warning_nasa_score", "moderate_nasa_score"
    ]
    
    for col in expected_cols:
        assert col in res.columns
