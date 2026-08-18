import pytest
import pandas as pd
import numpy as np
from src.data.loader import get_cmapps_columns
from src.data.validation import validate_cmapps_frame, validate_test_rul

@pytest.fixture
def valid_synthetic_frame():
    cols = get_cmapps_columns()
    data = []
    # unit 1, cycles 1, 2
    data.append([1, 1] + [0.0]*24)
    data.append([1, 2] + [0.0]*24)
    # unit 2, cycle 1
    data.append([2, 1] + [0.0]*24)
    return pd.DataFrame(data, columns=cols)

def test_valid_synthetic_frame_passes(valid_synthetic_frame):
    # Should not raise any exception
    validate_cmapps_frame(valid_synthetic_frame)

def test_wrong_column_count_fails(valid_synthetic_frame):
    df = valid_synthetic_frame.copy()
    df["extra_col"] = 0
    with pytest.raises(ValueError, match="exactly 26 columns"):
        validate_cmapps_frame(df)

def test_missing_values_fail(valid_synthetic_frame):
    df = valid_synthetic_frame.copy()
    df.loc[0, "sensor_1"] = np.nan
    with pytest.raises(ValueError, match="missing values"):
        validate_cmapps_frame(df)

def test_invalid_unit_fails(valid_synthetic_frame):
    df = valid_synthetic_frame.copy()
    df.loc[0, "unit"] = 0 # should be strictly positive
    with pytest.raises(ValueError, match="strictly positive"):
        validate_cmapps_frame(df)

def test_invalid_cycle_fails(valid_synthetic_frame):
    df = valid_synthetic_frame.copy()
    df.loc[0, "cycle"] = -1
    with pytest.raises(ValueError, match="strictly positive"):
        validate_cmapps_frame(df)

def test_duplicate_unit_cycle_fails(valid_synthetic_frame):
    df = valid_synthetic_frame.copy()
    # Duplicate unit 1, cycle 1
    df.loc[1, "cycle"] = 1
    with pytest.raises(ValueError, match="Duplicate"):
        validate_cmapps_frame(df)

def test_non_monotonic_cycle_fails(valid_synthetic_frame):
    df = valid_synthetic_frame.copy()
    # unit 1, cycles: 2, 1 instead of 1, 2
    df.loc[0, "cycle"] = 2
    df.loc[1, "cycle"] = 1
    with pytest.raises(ValueError, match="not monotonically increasing"):
        validate_cmapps_frame(df)

@pytest.fixture
def valid_synthetic_rul():
    # 2 units in test data
    return pd.DataFrame({"RUL": [100, 150]})

def test_valid_test_rul_passes(valid_synthetic_rul):
    # Should not raise exception
    validate_test_rul(valid_synthetic_rul, expected_engines=2)

def test_test_rul_length_mismatch_fails(valid_synthetic_rul):
    with pytest.raises(ValueError, match="exactly 3 rows"):
        validate_test_rul(valid_synthetic_rul, expected_engines=3)

def test_negative_rul_fails(valid_synthetic_rul):
    df = valid_synthetic_rul.copy()
    df.loc[0, "RUL"] = -5
    with pytest.raises(ValueError, match="non-negative"):
        validate_test_rul(df, expected_engines=2)
