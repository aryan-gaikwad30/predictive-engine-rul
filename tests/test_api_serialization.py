import pytest
import io
import json

from fastapi import UploadFile
from src.api.routes import train_model, get_prediction, get_job_status

def create_mock_upload_file(content: str, filename="test.csv"):
    file_obj = io.BytesIO(content.encode('utf-8'))
    return UploadFile(filename=filename, file=file_obj)

def check_no_numpy(obj):
    import numpy as np
    import pandas as pd
    if isinstance(obj, dict):
        for k, v in obj.items():
            check_no_numpy(k)
            check_no_numpy(v)
    elif isinstance(obj, list):
        for i in obj:
            check_no_numpy(i)
    elif isinstance(obj, tuple):
        for i in obj:
            check_no_numpy(i)
    else:
        assert not isinstance(obj, np.generic), f"Found np.generic: {obj} (type: {type(obj)})"
        assert not isinstance(obj, np.ndarray), f"Found np.ndarray: {obj}"
        if pd.api.types.is_scalar(obj):
            assert not pd.isna(obj) or obj is None, f"Found pandas NA: {obj}"

from fastapi.testclient import TestClient
from src.api.app import app

client = TestClient(app)

def test_prediction_serialization():
    # A tiny but complete RUL dataset
    content = "machine_id,time_cycles,sensor_1,RUL\nM-001,1,10.1,2\nM-001,2,10.5,1\nM-001,3,11.2,0\nM-002,1,10.0,3\nM-002,2,10.2,2\nM-002,3,10.4,1\nM-002,4,11.0,0\nM-003,1,10.1,1\nM-003,2,11.1,0\nM-004,1,10.0,1\nM-004,2,10.5,0\nM-005,1,10.0,1\nM-005,2,10.5,0\n"
    
    # 1. Train model via API
    response = client.post(
        "/train",
        files={"file": ("dataset.csv", io.BytesIO(content.encode('utf-8')), "text/csv")},
        data={
            "entity_column": "machine_id",
            "time_column": "time_cycles",
            "target_column": "RUL",
            "target_semantics": "rul"
        }
    )
    assert response.status_code == 200, f"Train failed: {response.text}"
    job_id = response.json()["job_id"]
    
    # 2. Call prediction endpoint
    pred_response = client.get(f"/prediction/{job_id}")
    
    # Verify HTTP 200 (this proves no PydanticSerializationError occurred)
    assert pred_response.status_code == 200, f"Prediction failed: {pred_response.text}"
    
    # 3. Verify response can be JSON serialized (implicit in response.json(), but we dump just to be sure)
    data = pred_response.json()
    json_str = json.dumps(data)
    assert len(json_str) > 0
    
    # Verify no numpy types exist in the dumped dict 
    # (Since we loaded it via json, it is native types, but let's test check_no_numpy on it anyway)
    check_no_numpy(data)
    
    # 4. fleet_predictions works
    assert "fleet_predictions" in data
    assert len(data["fleet_predictions"]) > 0
    
    # 5. validation_predictions works
    assert "validation_predictions" in data
    assert len(data["validation_predictions"]) > 0
    
    # 6. entity_diagnostics works
    assert "entity_diagnostics" in data
    assert len(data["entity_diagnostics"]) > 0

