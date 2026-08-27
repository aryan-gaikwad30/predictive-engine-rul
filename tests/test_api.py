import io
import pytest
import pandas as pd
from fastapi.testclient import TestClient

from src.api.app import app
from src.api.jobs import _jobs

client = TestClient(app)

def create_csv_file(num_machines=10, seq_length=20):
    """Create a synthetic dataset and return it as a BytesIO file-like object."""
    import numpy as np
    np.random.seed(42)
    data = []
    
    for machine_id in range(1, num_machines + 1):
        for time_step in range(1, seq_length + 1):
            rul = seq_length - time_step
            data.append({
                'machine_id': machine_id,
                'timestamp': f"2023-01-{time_step:02d}",
                'temperature': 100.0 + (time_step * 0.1) + np.random.randn(),
                'pressure': 50.0 - (time_step * 0.05) + np.random.randn(),
                'vibration': 0.1 + (time_step * 0.01) + np.random.randn() * 0.01,
                'mode': float(np.random.choice([1.0, 2.0])),
                'rpm': 2000.0,
                'remaining_life': rul
            })
    df = pd.DataFrame(data)
    csv_bytes = df.to_csv(index=False).encode('utf-8')
    return csv_bytes

@pytest.fixture(autouse=True)
def reset_jobs():
    """Reset the in-memory jobs store before each test."""
    _jobs.clear()

def test_health():
    response = client.get("/health")
    assert response.status_code == 200
    assert response.json() == {"status": "ok", "service": "predictive-engine-rul", "version": "0.1.0"}

def test_profile_valid_csv():
    csv_bytes = create_csv_file()
    
    response = client.post(
        "/profile",
        files={"file": ("dataset.csv", io.BytesIO(csv_bytes), "text/csv")}
    )
    
    assert response.status_code == 200
    data = response.json()
    assert data["row_count"] == 200
    assert data["detected_entity"] == "machine_id"
    assert data["detected_target"] == "remaining_life"
    assert "rpm" in data["constant_columns"]

def test_profile_invalid_file_type():
    response = client.post(
        "/profile",
        files={"file": ("dataset.txt", io.BytesIO(b"hello world"), "text/plain")}
    )
    assert response.status_code == 400
    assert "Only CSV files are supported" in response.json()["detail"]["message"]

def test_train_valid_dataset():
    csv_bytes = create_csv_file()
    
    response = client.post(
        "/train",
        files={"file": ("dataset.csv", io.BytesIO(csv_bytes), "text/csv")},
        data={
            "entity_column": "machine_id",
            "time_column": "timestamp",
            "target_column": "remaining_life",
            "condition_columns": "mode",
            "target_semantics": "rul"
        }
    )
    
    assert response.status_code == 200
    data = response.json()
    assert "job_id" in data
    assert data["status"] == "completed"
    
    job_id = data["job_id"]
    
    # Check job status
    job_resp = client.get(f"/job/{job_id}")
    assert job_resp.status_code == 200
    assert job_resp.json()["status"] == "completed"
    
    # Check prediction results
    pred_resp = client.get(f"/prediction/{job_id}")
    assert pred_resp.status_code == 200
    pred_data = pred_resp.json()
    
    assert pred_data["status"] == "completed"
    assert "RMSE" in pred_data["metrics"]
    assert len(pred_data["feature_importance"]) > 0
    assert len(pred_data["predictions"]) > 0

def test_train_missing_target_returns_error():
    # A dataset without a clear target
    import pandas as pd
    df = pd.DataFrame({"id": [1, 2], "time": [1, 2], "val": [10.0, 20.0]})
    csv_bytes = df.to_csv(index=False).encode('utf-8')
    
    response = client.post(
        "/train",
        files={"file": ("dataset.csv", io.BytesIO(csv_bytes), "text/csv")},
        data={"target_semantics": "rul"}
    )
    
    # Expect 422 due to ambiguous or missing target (validation error)
    assert response.status_code == 400
    assert "Dataset is not compatible with the current RUL workflow. A valid target column is required." in response.json()["detail"]["message"]

def test_unknown_job_returns_404():
    response = client.get("/job/unknown-id")
    assert response.status_code == 404
    
    response = client.get("/prediction/unknown-id")
    assert response.status_code == 404
