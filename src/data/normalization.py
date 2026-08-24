import pandas as pd
import numpy as np
from sklearn.cluster import KMeans
from sklearn.preprocessing import StandardScaler
from typing import List, Optional


class OperatingConditionNormalizer:
    """
    Normalizes sensor features based on the operating condition of each row.
    The operating condition is determined by clustering the standardized settings columns.
    Points falling too far from any training centroid are treated as out-of-distribution (OOD)
    and normalized using global training statistics.
    """
    def __init__(self, n_conditions: int = 6, random_state: int = 42, settings_columns: Optional[List[str]] = None):
        self.n_conditions = n_conditions
        self.random_state = random_state
        # KMeans for clustering standardized settings
        self.kmeans = KMeans(n_clusters=self.n_conditions, random_state=self.random_state, n_init=10)
        # StandardScaler for settings
        self.settings_scaler = StandardScaler()

        # Statistics per cluster
        self.cluster_means_ = {}
        self.cluster_stds_ = {}

        # Global fallback statistics
        self.global_means_ = None
        self.global_stds_ = None

        # OOD Threshold
        self.ood_threshold_ = None

        self.feature_columns = None
        self.settings_columns = settings_columns if settings_columns is not None else ['setting_1', 'setting_2', 'setting_3']
        self.is_fitted = False

    def fit(self, train_df: pd.DataFrame, feature_columns: List[str]) -> "OperatingConditionNormalizer":
        """
        Learn the operating conditions and normalization statistics from training data.
        """
        self.feature_columns = list(feature_columns)

        # 1. Fit scaler on training settings and transform
        settings_raw = train_df[self.settings_columns].values
        settings_scaled = self.settings_scaler.fit_transform(settings_raw)

        # 2. Fit clustering on scaled training settings
        self.kmeans.fit(settings_scaled)

        # Assign clusters to training data
        train_clusters = self.kmeans.predict(settings_scaled)

        # 3. Calculate OOD threshold from training data
        # Distance of each point to all centroids
        distances = self.kmeans.transform(settings_scaled)
        # Distance to the nearest centroid
        min_distances = distances.min(axis=1)
        # Threshold: Maximum distance observed in training + 50% margin
        self.ood_threshold_ = min_distances.max() * 1.5

        # 4. Learn statistics per cluster
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

        # 5. Learn global statistics (fallback)
        self.global_means_ = train_df[self.feature_columns].mean()
        self.global_stds_ = train_df[self.feature_columns].std(ddof=0)

        self.is_fitted = True
        return self

    def transform(self, df: pd.DataFrame) -> pd.DataFrame:
        """
        Apply normalization based on learned operating conditions.
        OOD points use global training statistics.
        """
        if not self.is_fitted:
            raise ValueError("Normalizer is not fitted yet.")

        # Copy to avoid mutating input
        df_out = df.copy()

        # Transform settings using the learned scaler
        settings_raw = df_out[self.settings_columns].values
        settings_scaled = self.settings_scaler.transform(settings_raw)

        # Predict closest clusters and calculate distance
        clusters = self.kmeans.predict(settings_scaled)
        distances = self.kmeans.transform(settings_scaled)
        min_distances = distances.min(axis=1)

        # Determine which points are OOD
        ood_mask = min_distances > self.ood_threshold_

        # Cast feature columns to float64 to prevent LossySetitemError
        df_out[self.feature_columns] = df_out[self.feature_columns].astype('float64')

        # 1. Normalize in-distribution points by cluster
        for cluster_id in range(self.n_conditions):
            # Points belonging to this cluster that are NOT OOD
            mask = (clusters == cluster_id) & (~ood_mask)
            if not mask.any():
                continue

            if cluster_id in self.cluster_means_ and not self.cluster_means_[cluster_id].isna().all():
                means = self.cluster_means_[cluster_id]
                stds = self.cluster_stds_[cluster_id]
            else:
                means = self.global_means_
                stds = self.global_stds_

            stds_safe = stds.copy()
            stds_safe[stds_safe < 1e-8] = 1.0

            df_out.loc[mask, self.feature_columns] = (df_out.loc[mask, self.feature_columns] - means) / stds_safe

        # 2. Normalize OOD points using global statistics
        if ood_mask.any():
            means = self.global_means_
            stds = self.global_stds_

            stds_safe = stds.copy()
            stds_safe[stds_safe < 1e-8] = 1.0

            df_out.loc[ood_mask, self.feature_columns] = (df_out.loc[ood_mask, self.feature_columns] - means) / stds_safe

        return df_out

    def fit_transform(self, train_df: pd.DataFrame, feature_columns: List[str]) -> pd.DataFrame:
        return self.fit(train_df, feature_columns).transform(train_df)
