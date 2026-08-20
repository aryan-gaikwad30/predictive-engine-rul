import pytest
import pandas as pd
import numpy as np

from src.models.error_analysis import (
    calculate_prediction_errors,
    calculate_nasa_penalty_per_prediction,
    get_worst_predictions,
    summarize_error_direction,
    summarize_errors_by_engine,
    summarize_errors_by_rul_band,
    calculate_nasa_concentration
)
from src.models.metrics import nasa_phm08_score

@pytest.fixture
def synthetic_diagnostics():
    return pd.DataFrame({
        "unit": [1, 1, 2, 2, 3],
        "cycle": [1, 2, 1, 2, 1],
        "actual_RUL": [130, 20, 50, 0, 100],
        "predicted_RUL": [130, 30, 40, 0, 150]
    })

def test_dataframe_not_mutated(synthetic_diagnostics):
    df_copy = synthetic_diagnostics.copy()
    _ = calculate_prediction_errors(synthetic_diagnostics)
    pd.testing.assert_frame_equal(synthetic_diagnostics, df_copy)

def test_error_sign_convention_and_values(synthetic_diagnostics):
    df = calculate_prediction_errors(synthetic_diagnostics)
    # Unit 1 cycle 2: actual=20, predicted=30 -> error=10 (late)
    # Unit 2 cycle 1: actual=50, predicted=40 -> error=-10 (early)
    assert df.loc[1, "error"] == 10
    assert df.loc[2, "error"] == -10
    
def test_absolute_error_correct(synthetic_diagnostics):
    df = calculate_prediction_errors(synthetic_diagnostics)
    assert df.loc[1, "absolute_error"] == 10
    assert df.loc[2, "absolute_error"] == 10

def test_squared_error_correct(synthetic_diagnostics):
    df = calculate_prediction_errors(synthetic_diagnostics)
    assert df.loc[1, "squared_error"] == 100
    assert df.loc[2, "squared_error"] == 100

def test_early_late_exact_counts(synthetic_diagnostics):
    df = calculate_prediction_errors(synthetic_diagnostics)
    summary = summarize_error_direction(df)
    
    assert summary["exact_prediction_count"] == 2 # (130,130), (0,0)
    assert summary["early_prediction_count"] == 1 # (50,40)
    assert summary["late_prediction_count"] == 2  # (20,30), (100,150)
    assert summary["total_predictions"] == 5

def test_early_late_percentages_sum_correctly(synthetic_diagnostics):
    df = calculate_prediction_errors(synthetic_diagnostics)
    summary = summarize_error_direction(df)
    
    total_pct = summary["early_prediction_percentage"] + summary["late_prediction_percentage"] + (summary["exact_prediction_count"] / summary["total_predictions"] * 100)
    assert np.isclose(total_pct, 100.0)

def test_nasa_penalties_reproduce_score(synthetic_diagnostics):
    df = calculate_nasa_penalty_per_prediction(synthetic_diagnostics)
    sum_penalties = df["nasa_penalty"].sum()
    
    actual_score = nasa_phm08_score(df["actual_RUL"], df["predicted_RUL"])
    assert np.isclose(sum_penalties, actual_score)

def test_perfect_predictions_zero_penalty(synthetic_diagnostics):
    df = calculate_nasa_penalty_per_prediction(synthetic_diagnostics)
    assert df.loc[0, "nasa_penalty"] == 0.0 # exact
    assert df.loc[3, "nasa_penalty"] == 0.0 # exact

def test_equal_magnitude_late_greater_penalty():
    df = pd.DataFrame({
        "unit": [1, 2],
        "cycle": [1, 1],
        "actual_RUL": [50, 50],
        "predicted_RUL": [40, 60] # early 10, late 10
    })
    df_pen = calculate_nasa_penalty_per_prediction(df)
    early_pen = df_pen.loc[0, "nasa_penalty"]
    late_pen = df_pen.loc[1, "nasa_penalty"]
    
    assert late_pen > early_pen

def test_engine_aggregation(synthetic_diagnostics):
    summary = summarize_errors_by_engine(synthetic_diagnostics)
    assert len(summary) == 3
    # unit 3 has worst penalty: (100, 150) -> late 50. exp(5) - 1 > exp(1) - 1
    assert summary.loc[0, "unit"] == 3
    assert summary.loc[0, "NASA_score"] > 0
    
    # Check counts for unit 1
    unit1_stats = summary[summary["unit"] == 1].iloc[0]
    assert unit1_stats["observation_count"] == 2
    assert unit1_stats["late_prediction_count"] == 1
    assert unit1_stats["early_prediction_count"] == 0

def test_rul_bands_assigned_correctly():
    df = pd.DataFrame({
        "unit": [1, 1, 1, 1],
        "cycle": [1, 2, 3, 4],
        "actual_RUL": [130, 100, 50, 10], # Early-life, Moderate, Warning, Critical
        "predicted_RUL": [130, 100, 50, 10]
    })
    band_summary = summarize_errors_by_rul_band(df)
    
    assert len(band_summary) == 4
    counts = band_summary.set_index("RUL_band")["count"].to_dict()
    assert counts["Early-life"] == 1
    assert counts["Moderate"] == 1
    assert counts["Warning"] == 1
    assert counts["Critical"] == 1

def test_worst_prediction_sorting(synthetic_diagnostics):
    worst = get_worst_predictions(synthetic_diagnostics, n=2, sort_by="nasa_penalty")
    assert len(worst) == 2
    # Unit 3 should be worst
    assert worst.iloc[0]["unit"] == 3

def test_nasa_concentration(synthetic_diagnostics):
    df_pen = calculate_nasa_penalty_per_prediction(synthetic_diagnostics)
    conc = calculate_nasa_concentration(df_pen)
    
    total_score = df_pen["nasa_penalty"].sum()
    worst_1 = df_pen["nasa_penalty"].max()
    
    assert np.isclose(conc["total_score"], total_score)
    assert np.isclose(conc["worst_1_penalty"], worst_1)
    if total_score > 0:
        assert np.isclose(conc["worst_1_percentage"], (worst_1 / total_score) * 100)
