import pytest
import pandas as pd
import numpy as np
from src.data.normalization import OperatingConditionNormalizer
from sklearn.exceptions import NotFittedError

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
        'setting_1': [42.0, 999.0], # Second one is extreme OOD
        'setting_2': [0.84, 999.0],
        'setting_3': [100.0, 999.0],
        'sensor_1': [11.0, 30.0],
        'sensor_2': [5.0, 10.0],
        'RUL': [100, 99],
        'RUL_clipped': [125, 125]
    })
    return df


def test_scaler_fitted_only_on_train(dummy_train_data):
    normalizer = OperatingConditionNormalizer(n_conditions=2, random_state=42)
    normalizer.fit(dummy_train_data, ['sensor_1', 'sensor_2'])

    # Check if scaler is fitted
    assert hasattr(normalizer.settings_scaler, 'mean_')
    assert normalizer.settings_scaler.n_samples_seen_ == len(dummy_train_data)

def test_scaler_parameters_unchanged_after_val_transform(dummy_train_data, dummy_val_data):
    normalizer = OperatingConditionNormalizer(n_conditions=2, random_state=42)
    normalizer.fit(dummy_train_data, ['sensor_1', 'sensor_2'])

    mean_before = normalizer.settings_scaler.mean_.copy()
    scale_before = normalizer.settings_scaler.scale_.copy()

    normalizer.transform(dummy_val_data)

    np.testing.assert_array_equal(normalizer.settings_scaler.mean_, mean_before)
    np.testing.assert_array_equal(normalizer.settings_scaler.scale_, scale_before)

def test_kmeans_is_deterministic(dummy_train_data):
    norm1 = OperatingConditionNormalizer(n_conditions=2, random_state=42)
    norm1.fit(dummy_train_data, ['sensor_1', 'sensor_2'])

    norm2 = OperatingConditionNormalizer(n_conditions=2, random_state=42)
    norm2.fit(dummy_train_data, ['sensor_1', 'sensor_2'])

    np.testing.assert_array_equal(norm1.kmeans.cluster_centers_, norm2.kmeans.cluster_centers_)

def test_val_never_refits_scaler(dummy_train_data, dummy_val_data):
    normalizer = OperatingConditionNormalizer(n_conditions=2, random_state=42)
    with pytest.raises(ValueError):
        normalizer.transform(dummy_val_data)

def test_normalizer_does_not_mutate_inputs(dummy_train_data):
    normalizer = OperatingConditionNormalizer(n_conditions=2, random_state=42)
    df_copy = dummy_train_data.copy(deep=True)
    normalizer.fit_transform(dummy_train_data, ['sensor_1', 'sensor_2'])
    pd.testing.assert_frame_equal(dummy_train_data, df_copy)

def test_row_count_and_index_preserved(dummy_train_data, dummy_val_data):
    normalizer = OperatingConditionNormalizer(n_conditions=2, random_state=42)
    normalizer.fit(dummy_train_data, ['sensor_1', 'sensor_2'])

    transformed = normalizer.transform(dummy_val_data)

    assert len(transformed) == len(dummy_val_data)
    assert (transformed.index == dummy_val_data.index).all()

def test_non_feature_columns_preserved(dummy_train_data):
    normalizer = OperatingConditionNormalizer(n_conditions=2, random_state=42)
    transformed = normalizer.fit_transform(dummy_train_data, ['sensor_1', 'sensor_2'])

    non_features = ['unit', 'cycle', 'setting_1', 'setting_2', 'setting_3', 'RUL', 'RUL_clipped']
    pd.testing.assert_frame_equal(transformed[non_features], dummy_train_data[non_features])

def test_transformed_sensors_are_deterministic(dummy_train_data):
    norm1 = OperatingConditionNormalizer(n_conditions=2, random_state=42)
    t1 = norm1.fit_transform(dummy_train_data, ['sensor_1', 'sensor_2'])

    norm2 = OperatingConditionNormalizer(n_conditions=2, random_state=42)
    t2 = norm2.fit_transform(dummy_train_data, ['sensor_1', 'sensor_2'])

    pd.testing.assert_frame_equal(t1, t2)

def test_zero_near_zero_std_handled_safely(dummy_train_data):
    normalizer = OperatingConditionNormalizer(n_conditions=2, random_state=42)
    transformed = normalizer.fit_transform(dummy_train_data, ['sensor_1', 'sensor_2'])

    assert not transformed['sensor_2'].isna().any()
    assert not np.isinf(transformed['sensor_2']).any()

def test_ood_condition_triggers_global_fallback(dummy_train_data, dummy_val_data):
    normalizer = OperatingConditionNormalizer(n_conditions=2, random_state=42)
    normalizer.fit(dummy_train_data, ['sensor_1', 'sensor_2'])

    # Second row in dummy_val_data has extreme settings, should be OOD
    transformed = normalizer.transform(dummy_val_data)

    val_row_ood = dummy_val_data.iloc[1]
    global_mean = normalizer.global_means_['sensor_1']
    global_std = normalizer.global_stds_['sensor_1']
    expected_val = (val_row_ood['sensor_1'] - global_mean) / global_std

    assert np.isclose(transformed.iloc[1]['sensor_1'], expected_val)

def test_normal_in_distribution_uses_condition_stats(dummy_train_data, dummy_val_data):
    normalizer = OperatingConditionNormalizer(n_conditions=2, random_state=42)
    normalizer.fit(dummy_train_data, ['sensor_1', 'sensor_2'])

    # First row in dummy_val_data has settings matching a training cluster
    transformed = normalizer.transform(dummy_val_data)

    # Find which cluster the first row belongs to
    settings_raw = dummy_val_data.iloc[0][normalizer.settings_columns].values.reshape(1, -1)
    scaled = normalizer.settings_scaler.transform(settings_raw)
    cluster_id = normalizer.kmeans.predict(scaled)[0]

    cluster_mean = normalizer.cluster_means_[cluster_id]['sensor_1']
    cluster_std = normalizer.cluster_stds_[cluster_id]['sensor_1']
    expected_val = (dummy_val_data.iloc[0]['sensor_1'] - cluster_mean) / cluster_std

    assert np.isclose(transformed.iloc[0]['sensor_1'], expected_val)

def test_fit_twice_identical(dummy_train_data):
    normalizer = OperatingConditionNormalizer(n_conditions=2, random_state=42)
    normalizer.fit(dummy_train_data, ['sensor_1', 'sensor_2'])
    means_1 = {k: v.copy() for k, v in normalizer.cluster_means_.items()}
    threshold_1 = normalizer.ood_threshold_

    normalizer.fit(dummy_train_data, ['sensor_1', 'sensor_2'])
    means_2 = {k: v.copy() for k, v in normalizer.cluster_means_.items()}
    threshold_2 = normalizer.ood_threshold_

    for k in means_1:
        pd.testing.assert_series_equal(means_1[k], means_2[k])

    assert threshold_1 == threshold_2
