import sys
import os
sys.path.append(os.path.abspath(os.path.dirname(os.path.dirname(__file__))))
import pandas as pd
import numpy as np
from src.data.loader import load_subset
from src.data.split import split_by_engine
from src.data.rul import add_training_targets
from src.data.normalization import OperatingConditionNormalizer
from src.models.metrics import rmse_score, nasa_phm08_score
from sklearn.metrics import mean_absolute_error, max_error
from xgboost import XGBRegressor
import xgboost as xgb
import sklearn
import matplotlib.pyplot as plt

print(f"2. Python version: {sys.version.split()[0]}")
print(f"3. XGBoost version: {xgb.__version__}")
print(f"4. scikit-learn version: {sklearn.__version__}")

# Load and Split Data
train_df, test_df, test_rul_df = load_subset("FD002")
train_df = add_training_targets(train_df)
train_split, val_split = split_by_engine(train_df, validation_size=0.2, random_state=42)

print(f"6. FD002 train rows: {len(train_split)}")
print(f"7. FD002 validation rows: {len(val_split)}")
print(f"8. train engine count: {train_split['unit'].nunique()}")
print(f"9. validation engine count: {val_split['unit'].nunique()}")
print(f"10. exact train engine IDs: {sorted(train_split['unit'].unique().tolist())}")
print(f"11. exact validation engine IDs: {sorted(val_split['unit'].unique().tolist())}")

y_train_raw = train_split["RUL"]
y_val_raw = val_split["RUL"]

# Feature Selection - RAW
sensors = [f"sensor_{i}" for i in range(1, 22)]
raw_stats = train_split[sensors].agg(['nunique'])
raw_constants = raw_stats.columns[raw_stats.loc['nunique'] <= 1].tolist()
raw_features = [s for s in sensors if s not in raw_constants]

print(f"12. RAW feature count: {len(raw_features)}")
print(f"13. RAW exact feature list: {raw_features}")

# Train RAW XGBoost
xgb_config = dict(
    n_estimators=500,
    max_depth=6,
    learning_rate=0.05,
    subsample=0.8,
    colsample_bytree=0.8,
    objective="reg:squarederror",
    random_state=42,
    n_jobs=-1
)

model_raw = XGBRegressor(**xgb_config)
model_raw.fit(train_split[raw_features], y_train_raw)
preds_raw = model_raw.predict(val_split[raw_features])

# Feature Selection - NORMALIZED
normalizer = OperatingConditionNormalizer(n_conditions=6, random_state=42)
normalizer.fit(train_split, sensors)

train_split_norm = normalizer.transform(train_split)
val_split_norm = normalizer.transform(val_split)

norm_stats = train_split_norm[sensors].agg(['nunique'])
norm_constants = norm_stats.columns[norm_stats.loc['nunique'] <= 1].tolist()
norm_features = [s for s in sensors if s not in norm_constants]

print(f"21. NORMALIZED feature count: {len(norm_features)}")
print(f"22. NORMALIZED exact feature list: {norm_features}")

# Train NORMALIZED XGBoost
model_norm = XGBRegressor(**xgb_config)
model_norm.fit(train_split_norm[norm_features], y_train_raw)
preds_norm = model_norm.predict(val_split_norm[norm_features])

# Metrics evaluation helper
def eval_metrics(y_true, y_pred, name=""):
    rmse = rmse_score(y_true, y_pred)
    mae = mean_absolute_error(y_true, y_pred)
    nasa = nasa_phm08_score(y_true, y_pred)
    d = y_pred - y_true
    early_pct = (d < 0).mean() * 100
    late_pct = (d >= 0).mean() * 100
    mse = d.mean()
    max_err = max_error(y_true, y_pred)
    return {
        "RMSE": rmse, "MAE": mae, "NASA": nasa, "early_pct": early_pct,
        "late_pct": late_pct, "mse": mse, "max_err": max_err, "count": len(y_true)
    }

metrics_raw = eval_metrics(y_val_raw, preds_raw)
metrics_norm = eval_metrics(y_val_raw, preds_norm)

print(f"14. RAW RMSE: {metrics_raw['RMSE']}")
print(f"15. RAW MAE: {metrics_raw['MAE']}")
print(f"16. RAW NASA score: {metrics_raw['NASA']}")
print(f"17. RAW early %: {metrics_raw['early_pct']}%")
print(f"18. RAW late %: {metrics_raw['late_pct']}%")
print(f"19. RAW mean signed error: {metrics_raw['mse']}")
print(f"20. RAW max absolute error: {metrics_raw['max_err']}")

print(f"23. NORMALIZED RMSE: {metrics_norm['RMSE']}")
print(f"24. NORMALIZED MAE: {metrics_norm['MAE']}")
print(f"25. NORMALIZED NASA score: {metrics_norm['NASA']}")
print(f"26. NORMALIZED early %: {metrics_norm['early_pct']}%")
print(f"27. NORMALIZED late %: {metrics_norm['late_pct']}%")
print(f"28. NORMALIZED mean signed error: {metrics_norm['mse']}")
print(f"29. NORMALIZED max absolute error: {metrics_norm['max_err']}")

# Subset evaluation helper
def eval_subsets(mask_func, name):
    mask = mask_func(y_val_raw)
    res_r = eval_metrics(y_val_raw[mask], preds_raw[mask])
    res_n = eval_metrics(y_val_raw[mask], preds_norm[mask])
    return f"{name} | Count: {res_r['count']} | RAW (RMSE: {res_r['RMSE']:.2f}, MAE: {res_r['MAE']:.2f}, NASA: {res_r['NASA']:.2f}, Early: {res_r['early_pct']:.1f}%, Late: {res_r['late_pct']:.1f}%) | NORM (RMSE: {res_n['RMSE']:.2f}, MAE: {res_n['MAE']:.2f}, NASA: {res_n['NASA']:.2f}, Early: {res_n['early_pct']:.1f}%, Late: {res_n['late_pct']:.1f}%)"

print("30.", eval_subsets(lambda y: y <= 30, "<=30"))
print("31.", eval_subsets(lambda y: y <= 50, "<=50"))
print("32.", eval_subsets(lambda y: y <= 75, "<=75"))
print("33.", eval_subsets(lambda y: y <= 100, "<=100"))

print("34.", eval_subsets(lambda y: (y >= 0) & (y <= 30), "Critical 0-30"))
print("35.", eval_subsets(lambda y: (y >= 31) & (y <= 75), "Warning 31-75"))
print("36.", eval_subsets(lambda y: (y >= 76) & (y <= 125), "Moderate 76-125"))
print("37.", eval_subsets(lambda y: y > 125, "Early-life >125"))

# Engine Diagnostics
engine_results = []
for engine_id in val_split['unit'].unique():
    mask = val_split['unit'] == engine_id
    y_true = y_val_raw[mask]
    p_raw = preds_raw[mask]
    p_norm = preds_norm[mask]
    
    r_raw = eval_metrics(y_true, p_raw)
    r_norm = eval_metrics(y_true, p_norm)
    
    engine_results.append({
        'engine': engine_id,
        'raw_rmse': r_raw['RMSE'],
        'raw_nasa': r_raw['NASA'],
        'norm_rmse': r_norm['RMSE'],
        'norm_nasa': r_norm['NASA'],
    })
    
engine_df = pd.DataFrame(engine_results)

print("38. Worst 10 RAW engines (by NASA):", engine_df.nlargest(10, 'raw_nasa')['engine'].tolist())
print("39. Worst 10 NORMALIZED engines (by NASA):", engine_df.nlargest(10, 'norm_nasa')['engine'].tolist())

print("40. RAW NASA concentration:")
print(f"   Worst 1 engine %: {engine_df['raw_nasa'].nlargest(1).sum() / metrics_raw['NASA'] * 100:.2f}%")
print(f"   Worst 5 engines %: {engine_df['raw_nasa'].nlargest(5).sum() / metrics_raw['NASA'] * 100:.2f}%")
print(f"   Worst 10 engines %: {engine_df['raw_nasa'].nlargest(10).sum() / metrics_raw['NASA'] * 100:.2f}%")

print("41. NORMALIZED NASA concentration:")
print(f"   Worst 1 engine %: {engine_df['norm_nasa'].nlargest(1).sum() / metrics_norm['NASA'] * 100:.2f}%")
print(f"   Worst 5 engines %: {engine_df['norm_nasa'].nlargest(5).sum() / metrics_norm['NASA'] * 100:.2f}%")
print(f"   Worst 10 engines %: {engine_df['norm_nasa'].nlargest(10).sum() / metrics_norm['NASA'] * 100:.2f}%")

# Feature Importance
raw_imp = pd.Series(model_raw.feature_importances_, index=raw_features).sort_values(ascending=False)
norm_imp = pd.Series(model_norm.feature_importances_, index=norm_features).sort_values(ascending=False)
print("42. Top 10 RAW features:", raw_imp.head(10).index.tolist())
print("43. Top 10 NORMALIZED features:", norm_imp.head(10).index.tolist())

# Scientific Comparison
print(f"44. RMSE improvement: {(metrics_raw['RMSE'] - metrics_norm['RMSE']) / metrics_raw['RMSE'] * 100:.2f}%")
print(f"45. MAE improvement: {(metrics_raw['MAE'] - metrics_norm['MAE']) / metrics_raw['MAE'] * 100:.2f}%")
print(f"46. NASA improvement: {(metrics_raw['NASA'] - metrics_norm['NASA']) / metrics_raw['NASA'] * 100:.2f}%")

crit_r = eval_metrics(y_val_raw[(y_val_raw >= 0) & (y_val_raw <= 30)], preds_raw[(y_val_raw >= 0) & (y_val_raw <= 30)])
crit_n = eval_metrics(y_val_raw[(y_val_raw >= 0) & (y_val_raw <= 30)], preds_norm[(y_val_raw >= 0) & (y_val_raw <= 30)])
print(f"47. Critical-band improvement: RMSE {(crit_r['RMSE'] - crit_n['RMSE']) / crit_r['RMSE'] * 100:.2f}%, NASA {(crit_r['NASA'] - crit_n['NASA']) / crit_r['NASA'] * 100:.2f}%")

warn_r = eval_metrics(y_val_raw[(y_val_raw >= 31) & (y_val_raw <= 75)], preds_raw[(y_val_raw >= 31) & (y_val_raw <= 75)])
warn_n = eval_metrics(y_val_raw[(y_val_raw >= 31) & (y_val_raw <= 75)], preds_norm[(y_val_raw >= 31) & (y_val_raw <= 75)])
print(f"48. Warning-band improvement: RMSE {(warn_r['RMSE'] - warn_n['RMSE']) / warn_r['RMSE'] * 100:.2f}%, NASA {(warn_r['NASA'] - warn_n['NASA']) / warn_r['NASA'] * 100:.2f}%")

# Save plots for notebook
import matplotlib.pyplot as plt

plt.figure(figsize=(10, 5))
plt.scatter(y_val_raw, preds_raw, alpha=0.3, label='RAW')
plt.scatter(y_val_raw, preds_norm, alpha=0.3, label='NORMALIZED', color='red')
plt.plot([0, 350], [0, 350], 'k--')
plt.xlabel('Actual RUL')
plt.ylabel('Predicted RUL')
plt.legend()
plt.title('Actual vs Predicted RUL')
plt.savefig('scratch/actual_vs_pred.png')

plt.figure(figsize=(10, 5))
plt.hist(preds_raw - y_val_raw, bins=50, alpha=0.5, label='RAW Residuals', density=True)
plt.hist(preds_norm - y_val_raw, bins=50, alpha=0.5, label='NORM Residuals', density=True)
plt.xlabel('Prediction Error (Pred - Actual)')
plt.legend()
plt.title('Residual Distribution')
plt.savefig('scratch/residuals.png')

def nasa_penalty(d):
    return np.where(d < 0, np.exp(-d / 13.0) - 1, np.exp(d / 10.0) - 1)

plt.figure(figsize=(10, 5))
plt.hist(nasa_penalty(preds_raw - y_val_raw), bins=50, alpha=0.5, label='RAW Penalty', range=(0, 1000), density=True)
plt.hist(nasa_penalty(preds_norm - y_val_raw), bins=50, alpha=0.5, label='NORM Penalty', range=(0, 1000), density=True)
plt.xlabel('NASA Penalty')
plt.legend()
plt.title('NASA Penalty Distribution')
plt.xlim(0, 1000)
plt.savefig('scratch/nasa_penalty.png')
