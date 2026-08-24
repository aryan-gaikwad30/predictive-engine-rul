import io
import os
import json
import pandas as pd
from typing import List, Optional
from fastapi import APIRouter, UploadFile, File, Form, HTTPException, Response

from src.api.schemas import (
    HealthResponse, ProfileResponse, TrainResponse, 
    JobStatusResponse, PredictionResponse, ErrorDetail
)
from src.api.jobs import create_job, update_job_status, get_job

from src.data.profiling import profile_dataset, prepare_custom_dataset, DatasetConfig
from src.models.custom_pipeline import train_custom_xgboost

APP_VERSION = "0.1.0"

router = APIRouter()

def get_max_upload_size() -> int:
    return int(os.environ.get("MAX_UPLOAD_SIZE", 10485760)) # Default 10 MB

def raise_api_error(status_code: int, code: str, message: str, details: str = None):
    error_detail = ErrorDetail(code=code, message=message, details=details).model_dump()
    raise HTTPException(status_code=status_code, detail=error_detail)

@router.get("/health", response_model=HealthResponse)
def health_check():
    return HealthResponse(status="ok", service="predictive-engine-rul", version=APP_VERSION)

@router.post("/profile", response_model=ProfileResponse)
def profile_data(file: UploadFile = File(...)):
    if not file:
        raise_api_error(400, "MISSING_FILE", "No file uploaded.")
    if not file.filename.lower().endswith('.csv'):
        raise_api_error(400, "INVALID_EXTENSION", "Only CSV files are supported.")
        
    try:
        content = file.file.read()
    except Exception as e:
        raise_api_error(400, "UNREADABLE_FILE", "Failed to read uploaded file.", str(e))
        
    if not content:
        raise_api_error(400, "EMPTY_FILE", "The uploaded file is empty.")
        
    if len(content) > get_max_upload_size():
        raise_api_error(400, "FILE_TOO_LARGE", f"File size exceeds maximum allowed size ({get_max_upload_size()} bytes).")

    try:
        df = pd.read_csv(io.BytesIO(content))
    except Exception as e:
        raise_api_error(400, "MALFORMED_CSV", "Failed to parse CSV content.", str(e))
        
    profile = profile_dataset(df)
    
    return ProfileResponse(
        row_count=profile.row_count,
        column_count=profile.column_count,
        columns=profile.column_names,
        numeric_columns=profile.numeric_columns,
        categorical_columns=profile.categorical_columns,
        entity_candidates=profile.likely_entity_columns,
        detected_entity=profile.likely_entity_columns[0] if len(profile.likely_entity_columns) == 1 else None,
        time_candidates=profile.likely_time_columns,
        detected_time=profile.likely_time_columns[0] if len(profile.likely_time_columns) == 1 else None,
        target_candidates=profile.likely_target_columns,
        detected_target=profile.likely_target_columns[0] if len(profile.likely_target_columns) == 1 else None,
        feature_candidates=profile.likely_feature_columns,
        condition_candidates=profile.candidate_operating_condition_columns,
        missing_values=profile.missing_value_counts,
        duplicate_count=profile.duplicate_row_count,
        constant_columns=profile.constant_columns,
        warnings=profile.warnings
    )

@router.post("/train", response_model=TrainResponse)
def train_model(
    file: UploadFile = File(...),
    entity_column: Optional[str] = Form(None),
    time_column: Optional[str] = Form(None),
    target_column: Optional[str] = Form(None),
    target_semantics: Optional[str] = Form(None),
    feature_columns: Optional[str] = Form(None),
    condition_columns: Optional[str] = Form(None)
):
    if not file:
        raise_api_error(400, "MISSING_FILE", "No file uploaded.")
    if not file.filename.lower().endswith('.csv'):
        raise_api_error(400, "INVALID_EXTENSION", "Only CSV files are supported.")
        
    try:
        content = file.file.read()
    except Exception as e:
        raise_api_error(400, "UNREADABLE_FILE", "Failed to read uploaded file.", str(e))
        
    if not content:
        raise_api_error(400, "EMPTY_FILE", "The uploaded file is empty.")
        
    if len(content) > get_max_upload_size():
        raise_api_error(400, "FILE_TOO_LARGE", f"File size exceeds maximum allowed size ({get_max_upload_size()} bytes).")

    try:
        df = pd.read_csv(io.BytesIO(content))
    except Exception as e:
        raise_api_error(400, "MALFORMED_CSV", "Failed to parse CSV content.", str(e))
        
    # Parse comma separated lists if provided
    feat_cols = [c.strip() for c in feature_columns.split(",")] if feature_columns else None
    cond_cols = [c.strip() for c in condition_columns.split(",")] if condition_columns else None
        
    config = DatasetConfig(
        entity_column=entity_column,
        time_column=time_column,
        target_column=target_column,
        target_semantics=target_semantics,
        feature_columns=feat_cols,
        condition_columns=cond_cols
    )
    
    job_id = create_job()
    update_job_status(job_id, "running")
    
    try:
        dataset = prepare_custom_dataset(df, config=config)
        
        if not dataset.entity_column or not dataset.time_column or not dataset.target_column:
            raise ValueError("Entity, time, and target columns must be unambiguously detected or explicitly provided.")
            
        result = train_custom_xgboost(dataset)
        
        res_dict = {
            "metrics": result.metrics,
            "feature_importance": result.feature_importance.to_dict(orient="records"),
            "maintenance_metrics": result.maintenance_metrics.to_dict(orient="records"),
            "predictions": result.predictions.to_dict(orient="records"),
            "entity_diagnostics": result.entity_diagnostics,
            "dataset_metadata": result.metadata
        }
        
        update_job_status(job_id, "completed", result=res_dict)
        
    except ValueError as e:
        err = ErrorDetail(code="VALIDATION_ERROR", message=str(e)).model_dump()
        update_job_status(job_id, "failed", error=err)
        raise_api_error(422, "VALIDATION_ERROR", str(e))
    except Exception as e:
        err = ErrorDetail(code="INTERNAL_ERROR", message="Training failed internally.", details=str(e)).model_dump()
        update_job_status(job_id, "failed", error=err)
        raise_api_error(500, "INTERNAL_ERROR", "Training failed internally.")
        
    return TrainResponse(job_id=job_id, status="completed")

@router.get("/job/{job_id}", response_model=JobStatusResponse)
def get_job_status(job_id: str):
    job = get_job(job_id)
    if not job:
        raise_api_error(404, "JOB_NOT_FOUND", "The requested job ID was not found.")
        
    return JobStatusResponse(job_id=job_id, status=job["status"])

@router.get("/prediction/{job_id}", response_model=PredictionResponse)
def get_prediction(job_id: str):
    job = get_job(job_id)
    if not job:
        raise_api_error(404, "JOB_NOT_FOUND", "The requested job ID was not found.")
        
    if job["status"] == "failed":
        # job["error"] is a dict representing ErrorDetail
        err_dict = job.get("error", {"code": "UNKNOWN", "message": "Unknown error occurred"})
        return PredictionResponse(job_id=job_id, status="failed", error=ErrorDetail(**err_dict))
        
    if job["status"] != "completed":
        return PredictionResponse(job_id=job_id, status=job["status"])
        
    res = job["result"]
    return PredictionResponse(
        job_id=job_id,
        status="completed",
        metrics=res["metrics"],
        feature_importance=res["feature_importance"],
        maintenance_metrics=res["maintenance_metrics"],
        predictions=res["predictions"],
        entity_diagnostics=res.get("entity_diagnostics", []),
        dataset_metadata=res["dataset_metadata"]
    )
