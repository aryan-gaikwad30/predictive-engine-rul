from pydantic import BaseModel, Field
from typing import List, Dict, Optional, Any, Union

class HealthResponse(BaseModel):
    status: str
    service: str
    version: str

class ErrorDetail(BaseModel):
    code: str
    message: str
    details: Optional[str] = None

class ProfileResponse(BaseModel):
    row_count: int
    column_count: int
    columns: List[str]
    numeric_columns: List[str]
    categorical_columns: List[str]
    entity_candidates: List[str]
    detected_entity: Optional[str]
    time_candidates: List[str]
    detected_time: Optional[str]
    target_candidates: List[str]
    detected_target: Optional[str]
    feature_candidates: List[str]
    condition_candidates: List[str]
    missing_values: Dict[str, int]
    duplicate_count: int
    constant_columns: List[str]
    warnings: List[str]

class TrainResponse(BaseModel):
    job_id: str
    status: str

class JobStatusResponse(BaseModel):
    job_id: str
    status: str

class MaintenanceMetricsResponse(BaseModel):
    threshold: str
    count: int
    RMSE: float
    MAE: float
    NASA_score: Union[float, str]
    mean_error: float
    early_prediction_percentage: float
    late_prediction_percentage: float

class MetricsResponse(BaseModel):
    RMSE: float
    MAE: float
    NASA_score: Union[float, str]
    early_prediction_percentage: float
    late_prediction_percentage: float
    mean_signed_error: float
    maximum_absolute_error: float

class PredictionResponse(BaseModel):
    job_id: str
    status: str
    metrics: Optional[MetricsResponse] = None
    feature_importance: Optional[List[Dict[str, Any]]] = None
    maintenance_metrics: Optional[List[Dict[str, Any]]] = None
    predictions: Optional[List[Dict[str, Any]]] = None
    entity_diagnostics: Optional[List[Dict[str, Any]]] = None
    dataset_metadata: Optional[Dict[str, Any]] = None
    error: Optional[ErrorDetail] = None
