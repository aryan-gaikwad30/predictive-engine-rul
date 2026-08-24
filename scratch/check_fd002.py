import sys
import os
sys.path.append(os.path.abspath(os.path.dirname(os.path.dirname(__file__))))
import pandas as pd
from src.data.loader import load_train_data
df = load_train_data('data/raw/CMAPSSData/train_FD002.txt')
settings_df = df[['setting_1', 'setting_2', 'setting_3']].drop_duplicates().round(4).sort_values(by=['setting_1', 'setting_2', 'setting_3'])
print(f"Number of unique operating conditions: {len(settings_df)}")
print(settings_df.head(20))

from sklearn.cluster import KMeans
import numpy as np

# Let's round first to see how many exactly unique conditions we have in a slightly rounded space
rounded = df[['setting_1', 'setting_2', 'setting_3']].round(1)
print(f"Number of unique operating conditions (rounded to 1 decimal): {len(rounded.drop_duplicates())}")
print(rounded.drop_duplicates().sort_values(by=['setting_1', 'setting_2', 'setting_3']))

# Let's use KMeans to see if k=6 correctly maps
kmeans = KMeans(n_clusters=6, random_state=42)
kmeans.fit(df[['setting_1', 'setting_2', 'setting_3']])
print("\nCluster centers (k=6):")
print(pd.DataFrame(kmeans.cluster_centers_, columns=['setting_1', 'setting_2', 'setting_3']).round(4))

df['cluster'] = kmeans.labels_
print(df.groupby('cluster')[['setting_1', 'setting_2', 'setting_3']].agg(['mean', 'std', 'min', 'max']).round(4))
