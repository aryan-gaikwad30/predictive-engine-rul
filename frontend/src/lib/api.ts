const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000";

export interface ProfileResponse {
  row_count: number;
  column_count: number;
  columns: string[];
  numeric_columns: string[];
  categorical_columns: string[];
  entity_candidates: string[];
  detected_entity: string | null;
  time_candidates: string[];
  detected_time: string | null;
  target_candidates: string[];
  detected_target: string | null;
  feature_candidates: string[];
  condition_candidates: string[];
  missing_values: Record<string, number>;
  duplicate_count: number;
  constant_columns: string[];
  warnings: string[];
}

export interface TrainingResponse {
  job_id: string;
  status: string;
}

export interface JobStatusResponse {
  job_id: string;
  status: string;
}

export interface PredictionMetrics {
  RMSE: number;
  MAE: number;
  NASA_score: number;
  early_prediction_percentage: number;
  late_prediction_percentage: number;
  mean_signed_error: number;
  maximum_absolute_error: number;
}

export interface MaintenanceMetric {
  threshold: string;
  count: number;
  RMSE: number;
  MAE: number;
  NASA_score: number;
  mean_error: number;
  early_prediction_percentage: number;
  late_prediction_percentage: number;
}

export interface FeatureImportance {
  feature: string;
  importance: number;
}

export interface PredictionRow {
  [key: string]: unknown;
}

export interface PredictionResponse {
  job_id: string;
  status: string;
  error?: string;
  metrics?: PredictionMetrics;
  feature_importance?: FeatureImportance[];
  maintenance_metrics?: MaintenanceMetric[];
  predictions?: PredictionRow[];
  dataset_metadata?: Record<string, unknown>;
}

export const getHealth = async () => {
  const res = await fetch(`${API_BASE}/health`);
  if (!res.ok) throw new Error("Backend unavailable");
  return res.json();
};

export const uploadProfile = async (file: File): Promise<ProfileResponse> => {
  const formData = new FormData();
  formData.append("file", file);
  
  const res = await fetch(`${API_BASE}/profile`, {
    method: "POST",
    body: formData,
  });
  
  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.detail || "Failed to profile dataset");
  }
  return res.json();
};

export const startTraining = async (
  file: File, 
  config: { 
    entity_column?: string; 
    time_column?: string; 
    target_column?: string; 
    feature_columns?: string; 
    condition_columns?: string 
  }
): Promise<TrainingResponse> => {
  const formData = new FormData();
  formData.append("file", file);
  
  if (config.entity_column) formData.append("entity_column", config.entity_column);
  if (config.time_column) formData.append("time_column", config.time_column);
  if (config.target_column) formData.append("target_column", config.target_column);
  if (config.feature_columns) formData.append("feature_columns", config.feature_columns);
  if (config.condition_columns) formData.append("condition_columns", config.condition_columns);
  
  const res = await fetch(`${API_BASE}/train`, {
    method: "POST",
    body: formData,
  });
  
  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.detail || "Failed to start training");
  }
  return res.json();
};

export const pollJobStatus = async (jobId: string): Promise<JobStatusResponse> => {
  const res = await fetch(`${API_BASE}/job/${jobId}`);
  if (!res.ok) throw new Error("Failed to get job status");
  return res.json();
};

export const getPredictions = async (jobId: string): Promise<PredictionResponse> => {
  const res = await fetch(`${API_BASE}/prediction/${jobId}`);
  if (!res.ok) throw new Error("Failed to get predictions");
  return res.json();
};
