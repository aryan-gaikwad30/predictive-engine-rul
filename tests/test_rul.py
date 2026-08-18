import pytest
import pandas as pd
import numpy as np
from src.data.rul import add_rul_column, add_clipped_rul_column, add_training_targets

def test_basic_rul():
    df = pd.DataFrame({
        "unit": [1, 1, 1, 1],
        "cycle": [1, 2, 3, 4]
    })
    result = add_rul_column(df)
    assert list(result["RUL"]) == [3, 2, 1, 0]

def test_multiple_engines():
    df = pd.DataFrame({
        "unit": [1, 1, 1, 2, 2, 2, 2, 2],
        "cycle": [1, 2, 3, 1, 2, 3, 4, 5]
    })
    result = add_rul_column(df)
    expected_rul = [2, 1, 0, 4, 3, 2, 1, 0]
    assert list(result["RUL"]) == expected_rul

def test_input_is_not_mutated():
    df = pd.DataFrame({
        "unit": [1, 1],
        "cycle": [1, 2]
    })
    original_cols = list(df.columns)
    add_rul_column(df)
    assert list(df.columns) == original_cols
    assert "RUL" not in df.columns

def test_final_cycle_is_always_zero():
    df = pd.DataFrame({
        "unit": [1, 1, 2, 2, 2, 3, 3, 3, 3],
        "cycle": [1, 2, 1, 2, 3, 1, 2, 3, 4]
    })
    result = add_rul_column(df)
    min_ruls = result.groupby("unit")["RUL"].min()
    assert (min_ruls == 0).all()

def test_no_negative_rul():
    df = pd.DataFrame({
        "unit": [1, 1, 2, 2, 2],
        "cycle": [1, 2, 1, 2, 3]
    })
    result = add_rul_column(df)
    assert (result["RUL"] >= 0).all()

def test_clipping():
    df = pd.DataFrame({"RUL": [300, 200, 125, 100, 0]})
    result = add_clipped_rul_column(df, cap=125)
    assert list(result["RUL_clipped"]) == [125, 125, 125, 100, 0]
    # Verify original RUL is not overwritten
    assert list(result["RUL"]) == [300, 200, 125, 100, 0]

def test_invalid_cap():
    df = pd.DataFrame({"RUL": [100, 50, 0]})
    with pytest.raises(ValueError, match="positive numeric value"):
        add_clipped_rul_column(df, cap=0)
    with pytest.raises(ValueError, match="positive numeric value"):
        add_clipped_rul_column(df, cap=-10)

def test_combined_target_function():
    df = pd.DataFrame({
        "unit": [1, 1, 1, 1],
        "cycle": [1, 2, 3, 4]
    })
    result = add_training_targets(df, rul_cap=2)
    assert "RUL" in result.columns
    assert "RUL_clipped" in result.columns
    assert list(result["RUL"]) == [3, 2, 1, 0]
    assert list(result["RUL_clipped"]) == [2, 2, 1, 0]
