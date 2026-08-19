import pytest
import pandas as pd
import numpy as np

from src.models.pipeline import run_baseline_models, get_prediction_diagnostics
from src.models.baseline import SKLEARN_AVAILABLE, XGBOOST_AVAILABLE

@pytest.fixture
def synthetic_split_data():
    np.random.seed(42)
    
    # Train data
    train_data = []
    for unit in [1, 2]:
        for cycle in range(1, 11):
            train_data.append({
                "unit": unit,
                "cycle": cycle,
                "setting_1": np.random.rand(),
                "sensor_2": np.random.rand(),
                "sensor_3": np.random.rand(),
                "RUL": 200 - cycle,
                "RUL_clipped": 150 - cycle
            })
    train_df = pd.DataFrame(train_data)
    
    # Val data
    val_data = []
    for unit in [3]:
        for cycle in range(1, 6):
            val_data.append({
                "unit": unit,
                "cycle": cycle,
                "setting_1": np.random.rand(),
                "sensor_2": np.random.rand(),
                "sensor_3": np.random.rand(),
                "RUL": 180 - cycle,
                "RUL_clipped": 120 - cycle
            })
    val_df = pd.DataFrame(val_data)
    
    return train_df, val_df

def test_run_baseline_models(synthetic_split_data):
    train_df, val_df = synthetic_split_data
    
    results = run_baseline_models(train_df, val_df, target="RUL_clipped")
    
    assert isinstance(results, pd.DataFrame)
    assert len(results) == 2
    assert "Model" in results.columns
    assert "RMSE" in results.columns
    assert "NASA PHM08 Score" in results.columns
    
    models = results["Model"].tolist()
    assert "Random Forest" in models
    assert "XGBoost" in models
    
    rf_row = results[results["Model"] == "Random Forest"].iloc[0]
    if SKLEARN_AVAILABLE:
        assert isinstance(rf_row["RMSE"], float)
        assert isinstance(rf_row["NASA PHM08 Score"], float)
    else:
        assert rf_row["RMSE"] == "NOT EXECUTED"
        assert "Error" in str(rf_row["NASA PHM08 Score"])
        
    xgb_row = results[results["Model"] == "XGBoost"].iloc[0]
    if XGBOOST_AVAILABLE:
        assert isinstance(xgb_row["RMSE"], float)
        assert isinstance(xgb_row["NASA PHM08 Score"], float)
    else:
        assert xgb_row["RMSE"] == "NOT EXECUTED"
        assert "Error" in str(xgb_row["NASA PHM08 Score"])

def test_get_prediction_diagnostics(synthetic_split_data):
    _, val_df = synthetic_split_data
    
    y_pred = pd.Series([110] * len(val_df))
    
    diag_df = get_prediction_diagnostics(val_df, y_pred, target="RUL_clipped")
    
    assert len(diag_df) == len(val_df)
    assert "unit" in diag_df.columns
    assert "cycle" in diag_df.columns
    assert "actual_RUL" in diag_df.columns
    assert "actual_RUL_clipped" in diag_df.columns
    assert "predicted_RUL" in diag_df.columns
    assert "error" in diag_df.columns
    
    # error = predicted - actual
    expected_errors = y_pred.values - val_df["RUL"].values
    np.testing.assert_array_almost_equal(diag_df["error"].values, expected_errors)
