import pytest
import pandas as pd
import numpy as np
from src.data.split import split_by_engine, get_engine_split_ids, validate_engine_split

@pytest.fixture
def sample_df():
    # Create 10 engines, each with 5-15 rows
    np.random.seed(42)
    data = []
    for unit in range(1, 11):
        num_rows = np.random.randint(5, 16)
        for cycle in range(1, num_rows + 1):
            data.append({
                "unit": unit,
                "cycle": cycle,
                "feature1": np.random.rand(),
                "target": np.random.rand()
            })
    return pd.DataFrame(data)

def test_engine_ids_do_not_overlap(sample_df):
    train_df, val_df = split_by_engine(sample_df, validation_size=0.2)
    train_engines = set(train_df["unit"])
    val_engines = set(val_df["unit"])
    assert train_engines.isdisjoint(val_engines)

def test_all_engines_preserved(sample_df):
    orig_engines = set(sample_df["unit"])
    train_df, val_df = split_by_engine(sample_df, validation_size=0.3)
    train_engines = set(train_df["unit"])
    val_engines = set(val_df["unit"])
    assert orig_engines == train_engines.union(val_engines)

def test_all_rows_preserved(sample_df):
    train_df, val_df = split_by_engine(sample_df, validation_size=0.2)
    combined = pd.concat([train_df, val_df]).sort_index()
    pd.testing.assert_frame_equal(sample_df.sort_index(), combined, check_exact=True)

def test_split_deterministic(sample_df):
    t1, v1 = get_engine_split_ids(sample_df, random_state=42)
    t2, v2 = get_engine_split_ids(sample_df, random_state=42)
    assert t1 == t2
    assert v1 == v2

def test_split_different_random_state(sample_df):
    t1, v1 = get_engine_split_ids(sample_df, random_state=42)
    t2, v2 = get_engine_split_ids(sample_df, random_state=43)
    assert t1 != t2 or v1 != v2

def test_invalid_validation_size_raises(sample_df):
    with pytest.raises(ValueError):
        split_by_engine(sample_df, validation_size=0.0)
    with pytest.raises(ValueError):
        split_by_engine(sample_df, validation_size=1.0)
    with pytest.raises(ValueError):
        split_by_engine(sample_df, validation_size=-0.2)
    with pytest.raises(ValueError):
        split_by_engine(sample_df, validation_size=1.2)

def test_missing_engine_column_raises(sample_df):
    with pytest.raises(ValueError):
        split_by_engine(sample_df, engine_column="nonexistent")

def test_original_dataframe_not_mutated(sample_df):
    orig_copy = sample_df.copy(deep=True)
    split_by_engine(sample_df, validation_size=0.2)
    pd.testing.assert_frame_equal(sample_df, orig_copy)

def test_every_engine_rows_remain_together(sample_df):
    train_df, val_df = split_by_engine(sample_df, validation_size=0.2)
    
    # Take an engine from validation and ensure ALL of its rows from original are in validation
    val_engines = val_df["unit"].unique()
    for engine in val_engines:
        orig_count = len(sample_df[sample_df["unit"] == engine])
        val_count = len(val_df[val_df["unit"] == engine])
        assert orig_count == val_count
        
        # Ensure 0 rows in train
        train_count = len(train_df[train_df["unit"] == engine])
        assert train_count == 0

def test_validate_engine_split_success(sample_df):
    train_df, val_df = split_by_engine(sample_df, validation_size=0.2)
    # Should not raise
    validate_engine_split(sample_df, train_df, val_df)

def test_validate_engine_split_fails_overlap(sample_df):
    train_df, val_df = split_by_engine(sample_df, validation_size=0.2)
    # Intentionally cause overlap
    val_df = pd.concat([val_df, train_df.iloc[:5]])
    with pytest.raises(ValueError, match="Engines found in both splits"):
        validate_engine_split(sample_df, train_df, val_df)

def test_validate_engine_split_fails_missing(sample_df):
    train_df, val_df = split_by_engine(sample_df, validation_size=0.2)
    # Intentionally remove an engine from train_df
    first_engine = train_df["unit"].iloc[0]
    train_df = train_df[train_df["unit"] != first_engine]
    with pytest.raises(ValueError, match="Engines missing from splits"):
        validate_engine_split(sample_df, train_df, val_df)

def test_validate_engine_split_fails_duplicated_rows(sample_df):
    train_df, val_df = split_by_engine(sample_df, validation_size=0.2)
    # Duplicate a row in train_df
    train_df = pd.concat([train_df, train_df.iloc[[-1]]])
    with pytest.raises(ValueError, match="Row count mismatch"):
        validate_engine_split(sample_df, train_df, val_df)

def test_validate_engine_split_fails_missing_rows(sample_df):
    train_df, val_df = split_by_engine(sample_df, validation_size=0.2)
    # Remove a row from train_df
    train_df = train_df.iloc[:-1]
    with pytest.raises(ValueError, match="Row count mismatch"):
        validate_engine_split(sample_df, train_df, val_df)

def test_validate_engine_split_fails_altered_rows(sample_df):
    train_df, val_df = split_by_engine(sample_df, validation_size=0.2)
    # Alter a row's value
    train_df.loc[train_df.index[0], "feature1"] = 999.0
    with pytest.raises(ValueError, match="Exact row preservation failed"):
        validate_engine_split(sample_df, train_df, val_df)
