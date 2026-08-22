import pandas as pd
import numpy as np
from sklearn.cluster import KMeans
from typing import List, Optional


class OperatingConditionNormalizer:
    """
    Normalizes sensor features based on the operating condition of each row.
    The operating condition is determined by clustering the settings columns.
    """
    def __init__(self, n_conditions: int = 6, random_state: int = 42):
        self.n_conditions = n_conditions
        self.random_state = random_state
        self.kmeans = KMeans(n_clusters=self.n_conditions, random_state=self.random_state, n_init=10)
        
        # Statistics per cluster
        self.cluster_means_ = {}
        self.cluster_stds_ = {}
        
        # Global fallback statistics
        self.global_means_ = None
        self.global_stds_ = None
        
        self.feature_columns = None
        self.settings_columns = ['setting_1', 'setting_2', 'setting_3']
        self.is_fitted = False

    def fit(self, train_df: pd.DataFrame, feature_columns: List[str]) -> "OperatingConditionNormalizer":
        """
        Learn the operating conditions and normalization statistics from training data.
        """
        self.feature_columns = list(feature_columns)
        
        # 1. Fit clustering on training settings
        settings = train_df[self.settings_columns].values
        self.kmeans.fit(settings)
        
        # Assign clusters to training data
        train_clusters = self.kmeans.predict(settings)
        
        # 2. Learn statistics per cluster
        self.cluster_means_ = {}
        self.cluster_stds_ = {}
        
        for cluster_id in range(self.n_conditions):
            mask = (train_clusters == cluster_id)
            cluster_data = train_df.loc[mask, self.feature_columns]
            
            if len(cluster_data) > 0:
                self.cluster_means_[cluster_id] = cluster_data.mean()
                self.cluster_stds_[cluster_id] = cluster_data.std(ddof=0)
            else:
                self.cluster_means_[cluster_id] = pd.Series(np.nan, index=self.feature_columns)
                self.cluster_stds_[cluster_id] = pd.Series(np.nan, index=self.feature_columns)
                
        # 3. Learn global statistics (fallback)
        self.global_means_ = train_df[self.feature_columns].mean()
        self.global_stds_ = train_df[self.feature_columns].std(ddof=0)
        
        self.is_fitted = True
        return self

    def transform(self, df: pd.DataFrame) -> pd.DataFrame:
        """
        Apply normalization based on learned operating conditions.
        """
        if not self.is_fitted:
            raise ValueError("Normalizer is not fitted yet.")
            
        # Copy to avoid mutating input
        df_out = df.copy()
        
        # Predict clusters for the input data
        settings = df_out[self.settings_columns].values
        clusters = self.kmeans.predict(settings)
        
        # Cast feature columns to float64 to prevent LossySetitemError when assigning floats to int64 columns
        df_out[self.feature_columns] = df_out[self.feature_columns].astype('float64')
        
        for cluster_id in range(self.n_conditions):
            mask = (clusters == cluster_id)
            if not mask.any():
                continue
                
            # If the cluster was observed during training, use its stats
            if cluster_id in self.cluster_means_ and not self.cluster_means_[cluster_id].isna().all():
                means = self.cluster_means_[cluster_id]
                stds = self.cluster_stds_[cluster_id]
            else:
                # Fallback to global statistics if cluster was empty in train (unlikely but safe)
                means = self.global_means_
                stds = self.global_stds_
                
            # Handle zero or near-zero standard deviation
            # Avoid division by zero by replacing zero/near-zero stds with 1.0 (mean subtraction only)
            stds_safe = stds.copy()
            stds_safe[stds_safe < 1e-8] = 1.0
            
            df_out.loc[mask, self.feature_columns] = (df_out.loc[mask, self.feature_columns] - means) / stds_safe
            
        return df_out

    def fit_transform(self, train_df: pd.DataFrame, feature_columns: List[str]) -> pd.DataFrame:
        return self.fit(train_df, feature_columns).transform(train_df)
