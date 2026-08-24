import pytest
import pandas as pd
import numpy as np
import io

from src.data.profiling import DatasetConfig, profile_dataset, prepare_custom_dataset
from src.data.validation import validate_custom_dataset
from src.models.custom_pipeline import train_custom_xgboost

def generate_synthetic_industrial_data(num_machines=5, max_cycles=100, random_state=42):
    """
    Generate a deterministic synthetic dataset for predictive maintenance.
    """
    np.random.seed(random_state)
    data = []
    
    for machine_id in range(1, num_machines + 1):
        # Different machines fail at different times
        cycles = np.random.randint(max_cycles // 2, max_cycles)
        
        # Base degradation curve
        base_temp = 500.0
        base_vib = 1.0
        
        for cycle in range(1, cycles + 1):
            rul = cycles - cycle
            
            # Add degradation: temperature goes up, vibration goes up as rul decreases
            degradation_factor = (cycle / cycles) ** 2
            
            temp = base_temp + (50 * degradation_factor) + np.random.normal(0, 2)
            vib = base_vib + (5 * degradation_factor) + np.random.normal(0, 0.2)
            pressure = 100.0 + np.random.normal(0, 1) # Static noisy feature
            
            # Operating condition (load)
            load = np.random.choice([50, 75, 100])
            if load == 100:
                temp += 20
                vib += 1.5
                
            data.append({
                "machine_id": machine_id,
                "timestamp": cycle,
                "temperature": temp,
                "vibration": vib,
                "pressure": pressure,
                "load": load,
                "remaining_life": rul
            })
            
    df = pd.DataFrame(data)
    return df

def test_m18_custom_dataset_workflow():
    df = generate_synthetic_industrial_data(num_machines=10, max_cycles=150, random_state=42)
    
    # 1. Profiling
    profile = profile_dataset(df)
    assert profile.row_count == len(df)
    assert "machine_id" in profile.likely_entity_columns
    assert "timestamp" in profile.likely_time_columns
    assert "remaining_life" in profile.likely_target_columns
    assert profile.constant_columns == []
    
    # 2. Configuration & Preparation (explicit semantics)
    config = DatasetConfig(
        entity_column="machine_id",
        time_column="timestamp",
        target_column="remaining_life",
        target_semantics="rul"
    )
    dataset = prepare_custom_dataset(df, config)
    
    assert dataset.target_semantics == "rul"
    assert "temperature" in dataset.feature_columns
    assert "vibration" in dataset.feature_columns
    
    # 3. Validation
    # Should not raise exception
    validate_custom_dataset(dataset)
    
    # 4. Training
    result = train_custom_xgboost(dataset, validation_size=0.2, random_state=42)
    
    # Verify outputs
    assert "RMSE" in result.metrics
    assert "MAE" in result.metrics
    assert "NASA_score" in result.metrics
    # Since target_semantics == "rul", NASA score must be a float
    assert isinstance(result.metrics["NASA_score"], float)
    
    # Check diagnostics
    assert len(result.entity_diagnostics) > 0
    assert "entity" in result.entity_diagnostics[0]
    assert "RMSE" in result.entity_diagnostics[0]

def test_m18_nasa_score_semantics():
    df = generate_synthetic_industrial_data(num_machines=5, max_cycles=50, random_state=42)
    
    # Unspecified semantics
    config = DatasetConfig(
        entity_column="machine_id",
        time_column="timestamp",
        target_column="remaining_life"
        # Not providing target_semantics
    )
    dataset = prepare_custom_dataset(df, config)
    
    # It should NOT guess "rul" because target is "remaining_life". It should remain None
    assert dataset.target_semantics is None
    result = train_custom_xgboost(dataset)
    assert isinstance(result.metrics["NASA_score"], str)
    assert "N/A" in result.metrics["NASA_score"]
    
    # Force generic semantics
    config_generic = DatasetConfig(
        entity_column="machine_id",
        time_column="timestamp",
        target_column="remaining_life",
        target_semantics="generic_regression"
    )
    dataset_generic = prepare_custom_dataset(df, config_generic)
    assert dataset_generic.target_semantics == "generic_regression"
    
    result_generic = train_custom_xgboost(dataset_generic)
    assert isinstance(result_generic.metrics["NASA_score"], str)
    assert "N/A" in result_generic.metrics["NASA_score"]

def test_m18_validation_failures():
    df = generate_synthetic_industrial_data(num_machines=2, max_cycles=20, random_state=42)
    
    # Test missing target values
    df_missing_target = df.copy()
    df_missing_target.loc[0, "remaining_life"] = np.nan
    
    config = DatasetConfig(
        entity_column="machine_id",
        time_column="timestamp",
        target_column="remaining_life"
    )
    dataset = prepare_custom_dataset(df_missing_target, config)
    
    with pytest.raises(ValueError, match="contains 1 missing values"):
        validate_custom_dataset(dataset)
        
    # Test duplicate rows
    df_dup = pd.concat([df, df.iloc[[0]]])
    dataset_dup = prepare_custom_dataset(df_dup, config)
    with pytest.raises(ValueError, match="duplicate \\(entity, time\\) observations"):
        validate_custom_dataset(dataset_dup)
        
    # Test non-numeric feature
    df_str = df.copy()
    df_str["temperature"] = "hot"
    config_str = DatasetConfig(
        entity_column="machine_id",
        time_column="timestamp",
        target_column="remaining_life",
        feature_columns=["temperature"]
    )
    dataset_str = prepare_custom_dataset(df_str, config_str)
    with pytest.raises(ValueError, match="is non-numeric"):
        validate_custom_dataset(dataset_str)
