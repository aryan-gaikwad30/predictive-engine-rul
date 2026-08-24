import pandas as pd
import numpy as np
from dataclasses import dataclass, field
from typing import List, Dict, Optional, Any, Tuple

@dataclass
class DatasetConfig:
    """Explicit configuration to override automatic column role detection."""
    entity_column: Optional[str] = None
    time_column: Optional[str] = None
    target_column: Optional[str] = None
    feature_columns: Optional[List[str]] = None
    condition_columns: Optional[List[str]] = None

@dataclass
class DatasetProfile:
    """Statistical and schema profile of a custom dataset."""
    row_count: int
    column_count: int
    column_names: List[str]
    numeric_columns: List[str]
    categorical_columns: List[str]
    datetime_columns: List[str]
    
    missing_value_counts: Dict[str, int]
    duplicate_row_count: int
    unique_counts: Dict[str, int]
    constant_columns: List[str]
    
    # Detected candidates
    likely_entity_columns: List[str] = field(default_factory=list)
    likely_time_columns: List[str] = field(default_factory=list)
    likely_target_columns: List[str] = field(default_factory=list)
    likely_feature_columns: List[str] = field(default_factory=list)
    candidate_operating_condition_columns: List[str] = field(default_factory=list)
    
    warnings: List[str] = field(default_factory=list)


@dataclass
class PreparedDataset:
    """Internal normalized representation of a dataset."""
    df: pd.DataFrame
    entity_column: Optional[str]
    time_column: Optional[str]
    target_column: Optional[str]
    feature_columns: List[str]
    condition_columns: List[str]
    metadata: DatasetProfile


def _detect_entity(df: pd.DataFrame, num_cols: List[str], cat_cols: List[str]) -> List[str]:
    """Identify columns likely to represent a machine/entity."""
    candidates = []
    keywords = ['unit', 'engine', 'machine', 'asset', 'equipment', 'id']
    
    # Prioritize categorical or integer columns
    possible_cols = cat_cols + [c for c in num_cols if pd.api.types.is_integer_dtype(df[c])]
    
    for col in df.columns:
        col_lower = col.lower()
        # Direct match or underscore-separated keyword match
        if any(kw == col_lower or f"_{kw}" in col_lower or f"{kw}_" in col_lower for kw in keywords):
            # Must not have too many unique values (e.g. unique per row is just an index)
            if df[col].nunique() < max(2, len(df) * 0.5): # Ensure we don't pick row indices
                candidates.append(col)
                
    return candidates

def _detect_time(df: pd.DataFrame, num_cols: List[str], dt_cols: List[str]) -> List[str]:
    """Identify columns likely to represent time or sequence."""
    candidates = []
    keywords = ['cycle', 'time', 'timestamp', 'datetime', 'date', 'sequence', 'step']
    
    # Datetime columns are strong candidates
    candidates.extend(dt_cols)
    
    for col in num_cols:
        col_lower = col.lower()
        if any(kw in col_lower for kw in keywords):
            candidates.append(col)
            
    return list(set(candidates))

def _detect_target(df: pd.DataFrame, num_cols: List[str]) -> List[str]:
    """Identify target column (RUL)."""
    candidates = []
    keywords = ['rul', 'remaining_life', 'remaining_useful_life', 'remaining_life_cycles', 'remaining_useful_life_cycles']
    
    for col in num_cols:
        col_lower = col.lower()
        if col_lower in keywords:
            candidates.append(col)
            
    return candidates

def profile_dataset(df: pd.DataFrame) -> DatasetProfile:
    """Analyze the dataframe and generate a profile."""
    if df.empty:
        return DatasetProfile(
            row_count=0, column_count=0, column_names=[], numeric_columns=[],
            categorical_columns=[], datetime_columns=[], missing_value_counts={},
            duplicate_row_count=0, unique_counts={}, constant_columns=[], warnings=["Dataset is empty."]
        )
    
    row_count = len(df)
    column_count = len(df.columns)
    column_names = list(df.columns)
    
    numeric_columns = list(df.select_dtypes(include=[np.number]).columns)
    datetime_columns = list(df.select_dtypes(include=['datetime', 'datetimetz']).columns)
    categorical_columns = list(set(column_names) - set(numeric_columns) - set(datetime_columns))
    
    missing_value_counts = df.isnull().sum().to_dict()
    duplicate_row_count = int(df.duplicated().sum())
    unique_counts = df.nunique().to_dict()
    
    constant_columns = [col for col in column_names if unique_counts[col] <= 1]
    
    warnings = []
    if duplicate_row_count > 0:
        warnings.append(f"Found {duplicate_row_count} duplicate rows.")
    if constant_columns:
        warnings.append(f"Found {len(constant_columns)} constant columns: {constant_columns}")
        
    likely_entity_columns = _detect_entity(df, numeric_columns, categorical_columns)
    likely_time_columns = _detect_time(df, numeric_columns, datetime_columns)
    likely_target_columns = _detect_target(df, numeric_columns)
    
    # Feature candidates
    exclude = set(likely_entity_columns + likely_time_columns + likely_target_columns + constant_columns)
    likely_feature_columns = [col for col in numeric_columns if col not in exclude]
    
    # Condition candidates (heuristics: e.g. settings)
    candidate_operating_condition_columns = [
        col for col in likely_feature_columns 
        if any(kw in col.lower() for kw in ['setting', 'condition', 'mode', 'temperature', 'pressure', 'rpm', 'load', 'speed', 'altitude', 'throttle'])
    ]
    
    return DatasetProfile(
        row_count=row_count,
        column_count=column_count,
        column_names=column_names,
        numeric_columns=numeric_columns,
        categorical_columns=categorical_columns,
        datetime_columns=datetime_columns,
        missing_value_counts=missing_value_counts,
        duplicate_row_count=duplicate_row_count,
        unique_counts=unique_counts,
        constant_columns=constant_columns,
        likely_entity_columns=likely_entity_columns,
        likely_time_columns=likely_time_columns,
        likely_target_columns=likely_target_columns,
        likely_feature_columns=likely_feature_columns,
        candidate_operating_condition_columns=candidate_operating_condition_columns,
        warnings=warnings
    )

def prepare_custom_dataset(df: pd.DataFrame, config: Optional[DatasetConfig] = None) -> PreparedDataset:
    """Resolve columns, validate, and prepare the dataset."""
    df_clean = df.copy()
    profile = profile_dataset(df_clean)
    config = config or DatasetConfig()
    
    warnings = profile.warnings.copy()
    
    # Resolve Entity
    entity_column = config.entity_column
    if not entity_column:
        if len(profile.likely_entity_columns) == 1:
            entity_column = profile.likely_entity_columns[0]
        elif len(profile.likely_entity_columns) > 1:
            warnings.append(f"Ambiguous entity columns detected: {profile.likely_entity_columns}. User config required.")
        else:
            warnings.append("No entity column detected. Engine-level splitting may not be supported.")
            
    # Resolve Time
    time_column = config.time_column
    if not time_column:
        if len(profile.likely_time_columns) == 1:
            time_column = profile.likely_time_columns[0]
        elif len(profile.likely_time_columns) > 1:
            warnings.append(f"Ambiguous time columns detected: {profile.likely_time_columns}. User config required.")
            
    # Resolve Target
    target_column = config.target_column
    if not target_column:
        if len(profile.likely_target_columns) == 1:
            target_column = profile.likely_target_columns[0]
        elif len(profile.likely_target_columns) > 1:
            warnings.append(f"Ambiguous target columns detected: {profile.likely_target_columns}. User config required.")
        else:
            warnings.append("No target column detected. User configuration required.")
            
    # Resolve Features
    feature_columns = config.feature_columns
    if feature_columns is None:
        exclude_for_features = set()
        if entity_column: exclude_for_features.add(entity_column)
        if time_column: exclude_for_features.add(time_column)
        if target_column: exclude_for_features.add(target_column)
        exclude_for_features.update(profile.constant_columns)
        
        feature_columns = [c for c in profile.numeric_columns if c not in exclude_for_features]
        
    # Resolve Conditions
    condition_columns = config.condition_columns
    if condition_columns is None:
        condition_columns = [c for c in profile.candidate_operating_condition_columns if c in feature_columns]
        
    # Validation
    if df_clean.empty:
        warnings.append("Dataset is empty after loading.")
        
    if target_column and target_column in df_clean.columns:
        if df_clean[target_column].isnull().any():
            warnings.append(f"Target column '{target_column}' contains missing values.")
            
    if time_column and time_column in df_clean.columns and entity_column and entity_column in df_clean.columns:
        # Check monotonicity
        is_monotonic = True
        for _, group in df_clean.groupby(entity_column):
            if not group[time_column].is_monotonic_increasing:
                is_monotonic = False
                break
        if not is_monotonic:
            warnings.append(f"Time column '{time_column}' is not monotonically increasing within entity '{entity_column}'.")
            
    profile.warnings = warnings
    
    return PreparedDataset(
        df=df_clean,
        entity_column=entity_column,
        time_column=time_column,
        target_column=target_column,
        feature_columns=feature_columns,
        condition_columns=condition_columns,
        metadata=profile
    )
