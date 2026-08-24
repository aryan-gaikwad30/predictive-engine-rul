import io
import json
import pandas as pd
from typing import List, Optional
from fastapi import APIRouter, UploadFile, File, Form, HTTPException

from src.api.schemas import (
    HealthResponse, ProfileResponse, TrainResponse, 
    JobStatusResponse, PredictionResponse
)
from src.api.jobs import create_job, update_job_status, get_job

from src.data.profiling import profile_dataset, prepare_custom_dataset, DatasetConfig
from src.models.custom_pipeline import train_custom_xgboost

router = APIRouter()

@router.get("/health", response_model=HealthResponse)
def health_check():
    return HealthResponse(status="ok", service="predictive-engine-rul")

@router.post("/profile", response_model=ProfileResponse)
def profile_data(file: UploadFile = File(...)):
    if not file.filename.endswith('.csv'):
        raise HTTPException(status_code=400, detail="Only CSV files are supported")
        
    try:
        content = file.file.read()
        df = pd.read_csv(io.BytesIO(content))
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Failed to read CSV file: {str(e)}")
        
    if len(df) > 100000:
        raise HTTPException(status_code=400, detail="File too large for prototype (max 100,000 rows)")
        
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
    if not file.filename.endswith('.csv'):
        raise HTTPException(status_code=400, detail="Only CSV files are supported")
        
    try:
        content = file.file.read()
        df = pd.read_csv(io.BytesIO(content))
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Failed to read CSV file: {str(e)}")
        
    if len(df) > 100000:
        raise HTTPException(status_code=400, detail="File too large for prototype (max 100,000 rows)")
        
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
    
    # Synchronous processing for prototype, but wrap in a job structure
    job_id = create_job()
    update_job_status(job_id, "running")
    
    try:
        dataset = prepare_custom_dataset(df, config=config)
        
        if not dataset.entity_column or not dataset.time_column or not dataset.target_column:
            raise ValueError("Entity, time, and target columns must be unambiguously detected or explicitly provided.")
            
        result = train_custom_xgboost(dataset)
        
        # Convert DataFrames to dicts for JSON serialization
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
        update_job_status(job_id, "failed", error=str(e))
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        update_job_status(job_id, "failed", error=str(e))
        raise HTTPException(status_code=500, detail="Training failed internally.")
        
    return TrainResponse(job_id=job_id, status="completed")

@router.get("/job/{job_id}", response_model=JobStatusResponse)
def get_job_status(job_id: str):
    job = get_job(job_id)
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")
        
    return JobStatusResponse(job_id=job_id, status=job["status"])

@router.get("/prediction/{job_id}", response_model=PredictionResponse)
def get_prediction(job_id: str):
    job = get_job(job_id)
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")
        
    if job["status"] == "failed":
        return PredictionResponse(job_id=job_id, status="failed", error=job["error"])
        
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
