import pytest
import pandas as pd
import numpy as np
from src.data.profiling import DatasetConfig, profile_dataset, prepare_custom_dataset

def create_synthetic_dataset():
    """Create a synthetic dataset for testing."""
    data = []
    for machine_id in [1, 2, 3]:
        for time_step in range(1, 11):
            rul = 10 - time_step
            data.append({
                'machine_id': machine_id,
                'timestamp': pd.Timestamp('2023-01-01') + pd.Timedelta(days=time_step),
                'temperature': 100.0 + np.random.randn(),
                'pressure': 50.0 + np.random.randn(),
                'vibration': 0.1 + np.random.randn() * 0.01,
                'rpm': 2000, # Constant column for test
                'category_col': 'A', # categorical
                'remaining_life': rul
            })
    return pd.DataFrame(data)

def test_profile_dataset_basic_stats():
    df = create_synthetic_dataset()
    profile = profile_dataset(df)
    
    assert profile.row_count == 30
    assert profile.column_count == 8
    assert 'timestamp' in profile.datetime_columns
    assert 'category_col' in profile.categorical_columns
    assert 'temperature' in profile.numeric_columns
    assert 'rpm' in profile.constant_columns

def test_custom_dataset_detection():
    df = create_synthetic_dataset()
    prepared = prepare_custom_dataset(df)
    
    assert prepared.entity_column == 'machine_id'
    assert prepared.time_column == 'timestamp'
    assert prepared.target_column == 'remaining_life'
    
    # Feature columns should exclude entity, time, target, and constant columns
    assert set(prepared.feature_columns) == {'temperature', 'pressure', 'vibration'}
    
    # Condition column (rpm is constant so it's excluded from features and thus conditions, but let's check heuristics anyway)
    # wait, 'rpm' is constant, so it's excluded from features.
    assert 'rpm' not in prepared.feature_columns

def test_missing_entity_detection():
    df = create_synthetic_dataset()
    df = df.drop(columns=['machine_id'])
    prepared = prepare_custom_dataset(df)
    
    assert prepared.entity_column is None
    assert any("No entity column detected" in w for w in prepared.metadata.warnings)

def test_ambiguous_target_detection():
    df = create_synthetic_dataset()
    df['remaining_useful_life'] = df['remaining_life']
    prepared = prepare_custom_dataset(df)
    
    assert prepared.target_column is None
    assert any("Ambiguous target columns detected" in w for w in prepared.metadata.warnings)

def test_dataset_config_override():
    df = create_synthetic_dataset()
    # Create ambiguity
    df['machine_2'] = df['machine_id']
    df['time_2'] = df['timestamp']
    df['rul_2'] = df['remaining_life']
    
    config = DatasetConfig(
        entity_column='machine_id',
        time_column='timestamp',
        target_column='remaining_life',
        feature_columns=['temperature', 'pressure'],
        condition_columns=[]
    )
    
    prepared = prepare_custom_dataset(df, config=config)
    
    assert prepared.entity_column == 'machine_id'
    assert prepared.time_column == 'timestamp'
    assert prepared.target_column == 'remaining_life'
    assert prepared.feature_columns == ['temperature', 'pressure']
    assert prepared.condition_columns == []

def test_duplicate_and_missing_warnings():
    df = create_synthetic_dataset()
    # Add missing value to target in row 0
    df.loc[0, 'remaining_life'] = np.nan
    # Now duplicate row 0 so it actually is a duplicate
    df = pd.concat([df, df.iloc[[0]]], ignore_index=True)
    
    prepared = prepare_custom_dataset(df)
    
    warnings = prepared.metadata.warnings
    assert any("duplicate rows" in w for w in warnings)
    assert any("contains missing values" in w for w in warnings)

def test_non_monotonic_time():
    df = create_synthetic_dataset()
    # Swap timestamps for machine 1
    ts1 = df.loc[0, 'timestamp']
    df.loc[0, 'timestamp'] = df.loc[1, 'timestamp']
    df.loc[1, 'timestamp'] = ts1
    
    prepared = prepare_custom_dataset(df)
    assert any("not monotonically increasing" in w for w in prepared.metadata.warnings)

def test_input_dataframe_not_mutated():
    df = create_synthetic_dataset()
    df_copy = df.copy(deep=True)
    
    prepared = prepare_custom_dataset(df)
    
    # Add a column to prepared to check mutation
    prepared.df['new_col'] = 1
    
    pd.testing.assert_frame_equal(df, df_copy)

def test_empty_dataset_handling():
    df = pd.DataFrame()
    prepared = prepare_custom_dataset(df)
    assert prepared.metadata.row_count == 0
    assert any("Dataset is empty" in w for w in prepared.metadata.warnings)
