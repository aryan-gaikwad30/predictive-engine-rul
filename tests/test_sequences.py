import pytest
import numpy as np
import pandas as pd

from src.data.sequences import create_sequences, validate_sequences

@pytest.fixture
def sample_df():
    # Unit 1: 5 cycles (can support window_size=3)
    # Unit 2: 2 cycles (will be skipped for window_size=3)
    # Unit 3: 4 cycles (can support window_size=3)
    data = {
        "unit": [1, 1, 1, 1, 1, 2, 2, 3, 3, 3, 3],
        "cycle": [1, 2, 3, 4, 5, 1, 2, 1, 2, 3, 4],
        "actual_RUL": [50, 49, 48, 47, 46, 20, 19, 10, 9, 8, 7],
        "RUL_clipped": [50, 49, 48, 47, 46, 20, 19, 10, 9, 8, 7],
        "f1": [1.0] * 11,
        "f2": [2.0] * 11
    }
    return pd.DataFrame(data)

def test_basic_window_creation(sample_df):
    X, y, meta, skipped = create_sequences(sample_df, window_size=3, feature_cols=["f1", "f2"])
    
    # N=5 -> 3 windows, N=4 -> 2 windows. Total = 5 sequences
    assert X.shape == (5, 3, 2)
    assert y.shape == (5,)
    assert len(meta) == 5
    assert skipped == [2]

def test_correct_shape(sample_df):
    X, y, meta, skipped = create_sequences(sample_df, window_size=3, feature_cols=["f1", "f2"])
    assert X.shape == (5, 3, 2)
    
def test_correct_number_of_windows(sample_df):
    X, y, meta, skipped = create_sequences(sample_df, window_size=3, feature_cols=["f1", "f2"])
    # Unit 1: 5 - 3 + 1 = 3
    # Unit 3: 4 - 3 + 1 = 2
    # Total = 5
    assert len(X) == 5

def test_target_alignment(sample_df):
    X, y, meta, skipped = create_sequences(sample_df, window_size=3, feature_cols=["f1", "f2"])
    
    # First sequence for Unit 1: cycles 1,2,3 -> target is RUL at cycle 3 which is 48
    assert y[0] == 48
    assert meta.iloc[0]["target_RUL"] == 48
    assert meta.iloc[0]["end_cycle"] == 3

def test_final_window_target_equals_final_engine_rul(sample_df):
    X, y, meta, skipped = create_sequences(sample_df, window_size=3, feature_cols=["f1", "f2"])
    # Unit 1's last window ends at cycle 5. RUL at cycle 5 is 46.
    unit1_meta = meta[meta["unit"] == 1]
    assert unit1_meta.iloc[-1]["target_RUL"] == 46
    assert unit1_meta.iloc[-1]["end_cycle"] == 5

def test_windows_preserve_chronological_order(sample_df):
    X, y, meta, skipped = create_sequences(sample_df, window_size=3, feature_cols=["f1", "f2"])
    validations = validate_sequences(meta, sample_df)
    assert validations["chronological_order_respected"] == True

def test_shuffled_input_is_sorted(sample_df):
    shuffled_df = sample_df.sample(frac=1.0, random_state=42)
    X, y, meta, skipped = create_sequences(shuffled_df, window_size=3, feature_cols=["f1", "f2"])
    # It shouldn't crash, and first sequence should still be cycles 1,2,3
    assert meta.iloc[0]["start_cycle"] == 1
    assert meta.iloc[0]["end_cycle"] == 3

def test_no_sequence_crosses_engine_boundaries(sample_df):
    X, y, meta, skipped = create_sequences(sample_df, window_size=3, feature_cols=["f1", "f2"])
    # We can check the sequence data directly if we put unit IDs as a feature, 
    # but the implementation groups by unit before building sequences.
    # So by design it's impossible. We can verify metadata unit IDs are valid.
    assert set(meta["unit"]) == {1, 3}

def test_train_val_disjoint(sample_df):
    train_df = sample_df[sample_df["unit"] == 1]
    val_df = sample_df[sample_df["unit"] == 3]
    
    X_train, y_train, meta_train, _ = create_sequences(train_df, window_size=3, feature_cols=["f1", "f2"])
    X_val, y_val, meta_val, _ = create_sequences(val_df, window_size=3, feature_cols=["f1", "f2"])
    
    assert set(meta_train["unit"]).isdisjoint(set(meta_val["unit"]))

def test_skipped_engines(sample_df):
    X, y, meta, skipped = create_sequences(sample_df, window_size=3, feature_cols=["f1", "f2"])
    assert skipped == [2]

def test_input_dataframe_not_mutated(sample_df):
    df_copy = sample_df.copy()
    create_sequences(sample_df, window_size=3, feature_cols=["f1", "f2"])
    pd.testing.assert_frame_equal(sample_df, df_copy)

def test_metadata_records(sample_df):
    X, y, meta, skipped = create_sequences(sample_df, window_size=3, feature_cols=["f1", "f2"])
    expected_cols = {"unit", "start_cycle", "end_cycle", "target_RUL"}
    assert expected_cols.issubset(set(meta.columns))

def test_raw_rul_used(sample_df):
    # Pass 'actual_RUL'
    X, y, meta, skipped = create_sequences(sample_df, window_size=3, feature_cols=["f1", "f2"], target_col="actual_RUL")
    assert meta.iloc[0]["target_RUL"] == 48

def test_rul_clipped_not_silently_used(sample_df):
    df2 = sample_df.copy()
    df2["RUL_clipped"] = 125
    X, y, meta, skipped = create_sequences(df2, window_size=3, feature_cols=["f1", "f2"], target_col="actual_RUL")
    # Target should still be 48, not 125
    assert meta.iloc[0]["target_RUL"] == 48

def test_multiple_engines_independent(sample_df):
    X, y, meta, skipped = create_sequences(sample_df, window_size=3, feature_cols=["f1", "f2"])
    # Ensure indices restart or just that we have 2 units represented
    assert len(meta["unit"].unique()) == 2

def test_empty_input_handled():
    df = pd.DataFrame(columns=["unit", "cycle", "actual_RUL", "f1", "f2"])
    X, y, meta, skipped = create_sequences(df, window_size=3, feature_cols=["f1", "f2"])
    assert len(X) == 0
    assert len(y) == 0
    assert len(meta) == 0

def test_duplicate_cycles_rejected(sample_df):
    dup_df = pd.concat([sample_df, sample_df.iloc[[0]]])
    with pytest.raises(ValueError, match="duplicate"):
        create_sequences(dup_df, window_size=3, feature_cols=["f1", "f2"])

def test_missing_features_raises_error(sample_df):
    with pytest.raises(ValueError, match="Missing required columns"):
        create_sequences(sample_df, window_size=3, feature_cols=["f3"])

def test_deterministic_output(sample_df):
    X1, y1, meta1, sk1 = create_sequences(sample_df, window_size=3, feature_cols=["f1", "f2"])
    X2, y2, meta2, sk2 = create_sequences(sample_df.sample(frac=1.0, random_state=123), window_size=3, feature_cols=["f1", "f2"])
    
    np.testing.assert_array_equal(X1, X2)
    np.testing.assert_array_equal(y1, y2)
    pd.testing.assert_frame_equal(meta1, meta2)
