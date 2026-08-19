import pytest
import pandas as pd
import numpy as np
from src.data.dataset import prepare_regression_data

@pytest.fixture
def sample_dataset():
    # Create 20 rows of synthetic data
    np.random.seed(42)
    data = []
    for unit in [1, 2]:
        for cycle in range(1, 11):
            data.append({
                "unit": unit,
                "cycle": cycle,
                "setting_1": np.random.rand(),
                "setting_2": np.random.rand(),
                "sensor_1": 1.0, # constant, should be removed
                "sensor_2": np.random.rand(),
                "sensor_3": np.random.rand(),
                "RUL": 200 - cycle,
                "RUL_clipped": min(130, 200 - cycle)
            })
    return pd.DataFrame(data)

def test_prepare_regression_data_shapes_and_types(sample_dataset):
    train_df = sample_dataset[sample_dataset["unit"] == 1].copy()
    val_df = sample_dataset[sample_dataset["unit"] == 2].copy()
    
    X_train, y_train, X_val, y_val = prepare_regression_data(train_df, val_df)
    
    assert X_train.shape == (10, 4) # setting_1, setting_2, sensor_2, sensor_3 (sensor_1 is constant in train)
    assert y_train.shape == (10,)
    
    assert X_val.shape == (10, 4)
    assert y_val.shape == (10,)
    
def test_prepare_regression_data_excludes_meta_columns(sample_dataset):
    train_df = sample_dataset.copy()
    X_train, y_train, X_val, y_val = prepare_regression_data(train_df)
    
    excluded = ["unit", "cycle", "RUL", "RUL_clipped"]
    for col in excluded:
        assert col not in X_train.columns

def test_prepare_regression_data_y_contains_target(sample_dataset):
    train_df = sample_dataset.copy()
    X_train, y_train, X_val, y_val = prepare_regression_data(train_df, target="RUL_clipped")
    
    pd.testing.assert_series_equal(y_train, train_df["RUL_clipped"], check_names=False)
    assert y_train.name == "RUL_clipped"

def test_prepare_regression_data_train_val_columns_match(sample_dataset):
    train_df = sample_dataset[sample_dataset["unit"] == 1].copy()
    val_df = sample_dataset[sample_dataset["unit"] == 2].copy()
    
    X_train, y_train, X_val, y_val = prepare_regression_data(train_df, val_df)
    
    assert list(X_train.columns) == list(X_val.columns)

def test_prepare_regression_data_no_mutation(sample_dataset):
    train_df = sample_dataset.copy()
    orig_copy = train_df.copy(deep=True)
    
    prepare_regression_data(train_df)
    
    pd.testing.assert_frame_equal(train_df, orig_copy)

def test_prepare_regression_data_validation_none(sample_dataset):
    train_df = sample_dataset.copy()
    
    X_train, y_train, X_val, y_val = prepare_regression_data(train_df)
    
    assert X_val is None
    assert y_val is None
