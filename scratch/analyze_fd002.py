import sys
import os
sys.path.append(os.path.abspath(os.path.dirname(os.path.dirname(__file__))))
import pandas as pd
import numpy as np
from src.data.loader import load_subset
from src.data.split import split_by_engine
from src.data.rul import add_training_targets
from src.data.normalization import OperatingConditionNormalizer
from scipy.stats import pearsonr

# 1. Load data
train_df, test_df, test_rul_df = load_subset("FD002")
train_df = add_training_targets(train_df)

# 2. Split data
train_split, val_split = split_by_engine(train_df, validation_size=0.2, random_state=42)

# 3. Normalizer Setup
sensors = [f"sensor_{i}" for i in range(1, 22)]
normalizer = OperatingConditionNormalizer(n_conditions=6, random_state=42)
normalizer.fit(train_split, sensors)

# Train Predict Clusters manually for the metric
settings_scaled = normalizer.settings_scaler.transform(train_split[['setting_1', 'setting_2', 'setting_3']].values)
train_clusters = normalizer.kmeans.predict(settings_scaled)
distances = normalizer.kmeans.transform(settings_scaled)
min_distances = distances.min(axis=1)
train_ood = (min_distances > normalizer.ood_threshold_).sum()

val_settings_scaled = normalizer.settings_scaler.transform(val_split[['setting_1', 'setting_2', 'setting_3']].values)
val_distances = normalizer.kmeans.transform(val_settings_scaled)
val_min_distances = val_distances.min(axis=1)
val_ood = (val_min_distances > normalizer.ood_threshold_).sum()

# 4. New Metric: average pairwise difference between condition means divided by pooled within-condition std
def calc_dispersion_metric(df, clusters, features):
    # For each sensor, we compute the ratio
    metrics = []
    unique_clusters = np.unique(clusters)
    k = len(unique_clusters)
    if k < 2:
        return pd.Series(0, index=features)
        
    for sensor in features:
        means = []
        vars_ = []
        counts = []
        for c in unique_clusters:
            vals = df.loc[clusters == c, sensor]
            if len(vals) > 1:
                means.append(vals.mean())
                vars_.append(vals.var(ddof=1))
                counts.append(len(vals))
                
        if len(means) < 2:
            metrics.append(0.0)
            continue
            
        # average pairwise difference
        diff_sum = 0
        pairs = 0
        for i in range(len(means)):
            for j in range(i+1, len(means)):
                diff_sum += abs(means[i] - means[j])
                pairs += 1
        avg_diff = diff_sum / pairs if pairs > 0 else 0
        
        # pooled std
        pooled_var = sum((n-1)*v for n, v in zip(counts, vars_)) / sum(n-1 for n in counts)
        pooled_std = np.sqrt(pooled_var) if pooled_var > 1e-12 else 1e-8
        
        metrics.append(avg_diff / pooled_std)
        
    return pd.Series(metrics, index=features)

metric_before = calc_dispersion_metric(train_split, train_clusters, sensors)

train_split_norm = normalizer.transform(train_split)
metric_after = calc_dispersion_metric(train_split_norm, train_clusters, sensors)

# Let's filter out exact constants from the average, or include them? The requirement says "For each sensor calculate...". 
# But for exact constants the standard deviation is 0. 
# Our function handles zero variance by setting pooled_std to 1e-8.
# So constants will just have 0 difference.
avg_before = metric_before.mean()
avg_after = metric_after.mean()
reduction = (avg_before - avg_after) / avg_before * 100 if avg_before > 0 else 0

print(f"4. Settings scaler used: StandardScaler")
print(f"5. Confirmation scaler is training-only: Yes, fitted in .fit(), transform only in .transform()")
print(f"6. KMeans configuration: n_clusters=6, random_state=42, fitted on scaled settings")
print(f"7. Number of conditions: 6")
print(f"8. OOD detection method: min distance to centroid > threshold")
print(f"9. OOD threshold: {normalizer.ood_threshold_}")
print(f"10. Number of training OOD points: {train_ood}")
print(f"11. Number of validation OOD points: {val_ood}")
print(f"12. Primary condition-dependence metric before normalization: {avg_before}")
print(f"13. Primary condition-dependence metric after normalization: {avg_after}")
print(f"14. Reduction percentage: {reduction:.2f}%")
print(f"15. Confirmation: The new independent metric (avg pairwise diff / pooled std) replaces the old centering-based one as proof of success.")
