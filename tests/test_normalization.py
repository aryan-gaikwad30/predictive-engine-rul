import pytest
import pandas as pd
import numpy as np
from src.data.normalization import OperatingConditionNormalizer


@pytest.fixture
def dummy_train_data():
    """Create a deterministic dummy training dataset."""
    np.random.seed(42)
    df = pd.DataFrame({
        'unit': [1, 1, 2, 2],
        'cycle': [1, 2, 1, 2],
        'setting_1': [42.0, 42.0, 10.0, 10.0],
        'setting_2': [0.84, 0.84, 0.25, 0.25],
        'setting_3': [100.0, 100.0, 100.0, 100.0],
        'sensor_1': [10.0, 12.0, 50.0, 52.0],
        'sensor_2': [5.0, 5.0, 15.0, 15.0], # Constant within cluster
        'RUL': [100, 99, 100, 99],
        'RUL_clipped': [125, 125, 125, 125]
    })
    return df

@pytest.fixture
def dummy_val_data():
    """Create a deterministic dummy validation dataset."""
    df = pd.DataFrame({
        'unit': [3, 3],
        'cycle': [1, 2],
        'setting_1': [42.0, 0.0], # Second one is unseen setting
        'setting_2': [0.84, 0.0],
        'setting_3': [100.0, 100.0],
        'sensor_1': [11.0, 30.0],
        'sensor_2': [5.0, 10.0],
        'RUL': [100, 99],
        'RUL_clipped': [125, 125]
    })
    return df


def test_fit_uses_training_data_only(dummy_train_data):
    normalizer = OperatingConditionNormalizer(n_conditions=2, random_state=42)
    normalizer.fit(dummy_train_data, ['sensor_1', 'sensor_2'])
    
    assert normalizer.is_fitted
    assert len(normalizer.cluster_means_) == 2
    assert normalizer.global_means_ is not None

def test_validation_transformation_does_not_alter_parameters(dummy_train_data, dummy_val_data):
    normalizer = OperatingConditionNormalizer(n_conditions=2, random_state=42)
    normalizer.fit(dummy_train_data, ['sensor_1', 'sensor_2'])
    
    # Store parameters
    cluster_means_before = {k: v.copy() for k, v in normalizer.cluster_means_.items()}
    
    # Transform validation
    normalizer.transform(dummy_val_data)
    
    # Check parameters
    for k in cluster_means_before:
        pd.testing.assert_series_equal(cluster_means_before[k], normalizer.cluster_means_[k])

def test_input_dataframes_are_not_mutated(dummy_train_data):
    normalizer = OperatingConditionNormalizer(n_conditions=2, random_state=42)
    df_copy = dummy_train_data.copy()
    
    normalizer.fit_transform(dummy_train_data, ['sensor_1', 'sensor_2'])
    
    pd.testing.assert_frame_equal(dummy_train_data, df_copy)

def test_row_count_and_ordering_preserved(dummy_train_data, dummy_val_data):
    normalizer = OperatingConditionNormalizer(n_conditions=2, random_state=42)
    normalizer.fit(dummy_train_data, ['sensor_1', 'sensor_2'])
    
    transformed = normalizer.transform(dummy_val_data)
    
    assert len(transformed) == len(dummy_val_data)
    assert (transformed.index == dummy_val_data.index).all()

def test_non_feature_columns_unchanged(dummy_train_data):
    normalizer = OperatingConditionNormalizer(n_conditions=2, random_state=42)
    transformed = normalizer.fit_transform(dummy_train_data, ['sensor_1', 'sensor_2'])
    
    non_features = ['unit', 'cycle', 'setting_1', 'setting_2', 'setting_3', 'RUL', 'RUL_clipped']
    pd.testing.assert_frame_equal(transformed[non_features], dummy_train_data[non_features])

def test_transformed_sensor_values_are_deterministic(dummy_train_data):
    norm1 = OperatingConditionNormalizer(n_conditions=2, random_state=42)
    t1 = norm1.fit_transform(dummy_train_data, ['sensor_1', 'sensor_2'])
    
    norm2 = OperatingConditionNormalizer(n_conditions=2, random_state=42)
    t2 = norm2.fit_transform(dummy_train_data, ['sensor_1', 'sensor_2'])
    
    pd.testing.assert_frame_equal(t1, t2)

def test_unseen_operating_conditions_use_fallback(dummy_train_data, dummy_val_data):
    normalizer = OperatingConditionNormalizer(n_conditions=2, random_state=42)
    normalizer.fit(dummy_train_data, ['sensor_1', 'sensor_2'])
    
    # We set n_conditions to 2. The train data has 2 conditions.
    # The val data has a 3rd condition (0.0, 0.0, 100.0).
    # Since K-Means predicts the closest cluster, it will map to one of the 2 train clusters
    # Unless we specifically simulated an unseen condition that kmeans assigns to an empty cluster.
    # In KMeans, it will just assign it to the closest centroid. The fallback is used if the closest centroid
    # had no training data (which shouldn't happen with KMeans unless n_clusters > n_unique_train_points).
    
    # Let's artificially set a cluster to empty to test fallback
    normalizer.cluster_means_[0] = pd.Series([np.nan, np.nan], index=['sensor_1', 'sensor_2'])
    normalizer.cluster_stds_[0] = pd.Series([np.nan, np.nan], index=['sensor_1', 'sensor_2'])
    
    # Transform will use global fallback for cluster 0
    transformed = normalizer.transform(dummy_val_data)
    
    # No NaNs should be present
    assert not transformed.isna().any().any()

def test_zero_std_does_not_create_nan(dummy_train_data):
    normalizer = OperatingConditionNormalizer(n_conditions=2, random_state=42)
    transformed = normalizer.fit_transform(dummy_train_data, ['sensor_1', 'sensor_2'])
    
    # sensor_2 has 0 std within each cluster
    assert not transformed['sensor_2'].isna().any()
    assert not np.isinf(transformed['sensor_2']).any()

def test_fitting_twice_identical(dummy_train_data):
    normalizer = OperatingConditionNormalizer(n_conditions=2, random_state=42)
    normalizer.fit(dummy_train_data, ['sensor_1', 'sensor_2'])
    means_1 = normalizer.cluster_means_.copy()
    
    normalizer.fit(dummy_train_data, ['sensor_1', 'sensor_2'])
    means_2 = normalizer.cluster_means_.copy()
    
    for k in means_1:
        pd.testing.assert_series_equal(means_1[k], means_2[k])
