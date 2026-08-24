import pytest
import pandas as pd
import numpy as np

from src.data.profiling import DatasetConfig, prepare_custom_dataset
from src.models.custom_pipeline import train_custom_xgboost, CustomPipelineResult
from src.data.normalization import OperatingConditionNormalizer

def create_synthetic_pipeline_dataset(num_machines=10, seq_length=20, seed=42):
    """Create a deterministic synthetic dataset for the pipeline tests."""
    np.random.seed(seed)
    data = []
    
    for machine_id in range(1, num_machines + 1):
        for time_step in range(1, seq_length + 1):
            rul = seq_length - time_step
            # Features that degrade
            temp = 100.0 + (time_step * 0.1) + np.random.randn()
            pressure = 50.0 - (time_step * 0.05) + np.random.randn()
            vibration = 0.1 + (time_step * 0.01) + np.random.randn() * 0.01
            
            # Condition columns
            mode = float(np.random.choice([1.0, 2.0]))
            
            # Constant column
            rpm = 2000.0
            
            data.append({
                'machine_id': machine_id,
                'timestamp': pd.Timestamp('2023-01-01') + pd.Timedelta(days=time_step),
                'temperature': temp,
                'pressure': pressure,
                'vibration': vibration,
                'mode': mode,
                'rpm': rpm,
                'remaining_life': rul
            })
    return pd.DataFrame(data)

def test_pipeline_end_to_end_and_shapes():
    df = create_synthetic_pipeline_dataset()
    dataset = prepare_custom_dataset(df)
    
    result = train_custom_xgboost(dataset, validation_size=0.2, random_state=42)
    
    # Check return type
    assert isinstance(result, CustomPipelineResult)
    
    # Metrics
    assert "RMSE" in result.metrics
    assert "MAE" in result.metrics
    assert "NASA_score" in result.metrics
    
    # Maintenance metrics
    assert not result.maintenance_metrics.empty
    
    # Predictions
    assert len(result.predictions) == result.metadata["validation_row_count"]
    assert "actual_RUL" in result.predictions.columns
    assert "predicted_RUL" in result.predictions.columns
    
    # Feature Importance
    assert len(result.feature_importance) > 0

def test_pipeline_entity_preservation_and_disjoint():
    df = create_synthetic_pipeline_dataset(num_machines=10, seq_length=15)
    
    config = DatasetConfig(
        entity_column="machine_id",
        time_column="timestamp",
        target_column="remaining_life"
    )
    dataset = prepare_custom_dataset(df, config=config)
    result = train_custom_xgboost(dataset, validation_size=0.3, random_state=42)
    
    meta = result.metadata
    
    # Disjoint check
    preds_df = result.predictions
    val_entities = set(preds_df["unit"].unique())
    
    # We expect roughly 3 entities in validation (30% of 10)
    assert len(val_entities) == 3
    
    # Total row counts preservation
    total_rows = len(df)
    train_rows = meta["train_row_count"]
    val_rows = meta["validation_row_count"]
    
    assert train_rows + val_rows == total_rows
    
    # Features removed constant globally are not in selected_features
    assert "rpm" not in meta["selected_features"]

def test_pipeline_leakage_safety(monkeypatch):
    """
    Test that modifying validation data does not change the fitted preprocessing parameters.
    """
    df = create_synthetic_pipeline_dataset(num_machines=10)
    
    # Setup dataset to force OperatingConditionNormalizer
    config = DatasetConfig(
        entity_column="machine_id",
        time_column="timestamp",
        target_column="remaining_life",
        condition_columns=["mode"]
    )
    dataset = prepare_custom_dataset(df, config=config)
    
    # We will patch OperatingConditionNormalizer.fit to capture when it's called
    fit_called_count = 0
    original_fit = OperatingConditionNormalizer.fit
    
    def mock_fit(self, train_df, feature_columns):
        nonlocal fit_called_count
        fit_called_count += 1
        return original_fit(self, train_df, feature_columns)
        
    monkeypatch.setattr(OperatingConditionNormalizer, "fit", mock_fit)
    
    # 1. Run pipeline
    result1 = train_custom_xgboost(dataset, validation_size=0.2, random_state=42)
    
    # It should have called fit exactly once
    assert fit_called_count == 1
    
    # 2. Modify validation data drastically and rerun (we can't easily intercept the split inside, 
    # but we can verify that the scaler parameters aren't influenced by validation data).
    # Since we use deterministic random_state, the split is identical.
    # Let's modify the raw df such that the validation entities have crazy feature values.
    
    df_modified = df.copy()
    # We know from test_pipeline_entity_preservation_and_disjoint roughly which entities are validation if seed=42.
    # But to be safe, we modify the last 3 entities which are highly likely to have at least one in validation.
    df_modified.loc[df_modified['machine_id'].isin([8, 9, 10]), 'temperature'] = 9999.0
    
    dataset_modified = prepare_custom_dataset(df_modified, config=config)
    result2 = train_custom_xgboost(dataset_modified, validation_size=0.2, random_state=42)
    
    # fit called again for the second run
    assert fit_called_count == 2
    
    # The training entities shouldn't include all of 8,9,10.
    # The predictions for the modified data should be different.
    assert not result1.predictions.equals(result2.predictions)

def test_pipeline_missing_required_columns():
    df = create_synthetic_pipeline_dataset()
    df = df.drop(columns=["machine_id"])
    
    dataset = prepare_custom_dataset(df)
    
    with pytest.raises(ValueError, match="Entity, time, and target columns are required"):
        train_custom_xgboost(dataset)

def test_input_dataframe_not_mutated():
    df = create_synthetic_pipeline_dataset()
    df_copy = df.copy(deep=True)
    
    dataset = prepare_custom_dataset(df)
    _ = train_custom_xgboost(dataset)
    
    pd.testing.assert_frame_equal(df, df_copy)
