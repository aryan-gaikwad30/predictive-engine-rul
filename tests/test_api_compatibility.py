import pytest
import io
import sys

from src.api.routes import train_model
from fastapi import UploadFile, HTTPException

def create_mock_upload_file(content: str, filename="test.csv"):
    file_obj = io.BytesIO(content.encode('utf-8'))
    return UploadFile(filename=filename, file=file_obj)

def test_api_rejects_missing_time():
    content = "machine,feat1,RUL\nM-1,10.0,5\nM-1,11.0,4"
    upload_file = create_mock_upload_file(content)
    
    with pytest.raises(HTTPException) as exc:
        train_model(
            file=upload_file,
            entity_column="machine",
            time_column="",
            target_column="RUL",
            target_semantics="rul",
            feature_columns=None,
            condition_columns=None
        )
    assert exc.value.status_code == 400
    assert exc.value.detail["code"] == "MISSING_TIME_COLUMN"

def test_api_rejects_invalid_semantics():
    content = "machine,time,feat1,failure\nM-1,1,10.0,0\nM-1,2,11.0,1"
    upload_file = create_mock_upload_file(content)
    
    with pytest.raises(HTTPException) as exc:
        train_model(
            file=upload_file,
            entity_column="machine",
            time_column="time",
            target_column="failure",
            target_semantics="classification",
            feature_columns=None,
            condition_columns=None
        )
    assert exc.value.status_code == 400
    assert exc.value.detail["code"] == "INVALID_TARGET_SEMANTICS"

def test_api_rejects_missing_target():
    content = "machine,time,feat1\nM-1,1,10.0\nM-1,2,11.0"
    upload_file = create_mock_upload_file(content)
    
    with pytest.raises(HTTPException) as exc:
        train_model(
            file=upload_file,
            entity_column="machine",
            time_column="time",
            target_column="",
            target_semantics="rul",
            feature_columns=None,
            condition_columns=None
        )
    assert exc.value.status_code == 400
    assert exc.value.detail["code"] == "MISSING_TARGET_COLUMN"

def test_api_rejects_missing_entity():
    content = "time,feat1,RUL\n1,10.0,5\n2,11.0,4"
    upload_file = create_mock_upload_file(content)
    
    with pytest.raises(HTTPException) as exc:
        train_model(
            file=upload_file,
            entity_column="",
            time_column="time",
            target_column="RUL",
            target_semantics="rul",
            feature_columns=None,
            condition_columns=None
        )
    assert exc.value.status_code == 400
    assert exc.value.detail["code"] == "INCOMPATIBLE_RUL_DATASET"

def test_api_accepts_valid_rul():
    # Valid RUL should not raise HTTP exception 400 for compatibility
    content = "machine,time,feat1,RUL\nM-1,1,10.0,2\nM-1,2,11.0,1\nM-1,3,10.5,0\nM-2,1,10.0,1\nM-2,2,11.0,0"
    upload_file = create_mock_upload_file(content)
    
    # It might fail later in training if dataset is too small, but should pass compatibility checks.
    try:
        train_model(
            file=upload_file,
            entity_column="machine",
            time_column="time",
            target_column="RUL",
            target_semantics="rul",
            feature_columns=None,
            condition_columns=None
        )
    except HTTPException as exc:
        # If it raises a validation error about size, that's fine, it bypassed compatibility.
        assert exc.status_code == 422
    except ValueError:
        pass
