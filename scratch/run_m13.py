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
from sklearn.metrics import mean_absolute_error
from xgboost import XGBRegressor

def evaluate_dataset(subset_name):
    print(f"\n{'='*50}\nEvaluating {subset_name}\n{'='*50}")
    
    # 1. Load Data
    train_df, test_df, test_rul_df = load_subset(subset_name)
    train_df = add_training_targets(train_df)
    
    # Check conditions
    settings_cols = ['setting_1', 'setting_2', 'setting_3']
    
    # Meaningful variation check: look at standard deviation of settings
    stds = train_df[settings_cols].std()
    max_std = stds.max()
    print(f"Max setting std: {max_std}")
    
    normalization_used = False
    if max_std > 1.0: # FD002/FD004 have large std (e.g. setting_1 varies 0 to 42)
        print("Decision: Normalization REQUIRED (Multiple conditions).")
        normalization_used = True
    else: # FD001/FD003 have tiny noise std (e.g. 0.002)
        print("Decision: Normalization NOT REQUIRED (Single condition).")
        
    # 2. Split
    train_split, val_split = split_by_engine(train_df, validation_size=0.2, random_state=42)
    
    print(f"Train rows: {len(train_split)}")
    print(f"Validation rows: {len(val_split)}")
    print(f"Train engines: {train_split['unit'].nunique()}")
    print(f"Validation engines: {val_split['unit'].nunique()}")
    print(f"Train/Val overlap: {len(set(train_split['unit']).intersection(set(val_split['unit'])))}")
    
    y_train = train_split["RUL"]
    y_val = val_split["RUL"]
    
    sensors = [f"sensor_{i}" for i in range(1, 22)]
    
    if normalization_used:
        normalizer = OperatingConditionNormalizer(n_conditions=6, random_state=42)
        normalizer.fit(train_split, sensors)
        train_x = normalizer.transform(train_split)
        val_x = normalizer.transform(val_split)
    else:
        train_x = train_split.copy()
        val_x = val_split.copy()
        
    # 3. Feature Selection (on train_x)
    stats = train_x[sensors].agg(['nunique'])
    constants = stats.columns[stats.loc['nunique'] <= 1].tolist()
    features = [s for s in sensors if s not in constants]
    
    print(f"Candidate features: {len(sensors)}")
    print(f"Exact constants removed: {constants}")
    print(f"Final feature count: {len(features)}")
    
    # 4. XGBoost
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
    
    model = XGBRegressor(**xgb_config)
    model.fit(train_x[features], y_train)
    preds = model.predict(val_x[features])
    
    # 5. Metrics
    def eval_metrics(y_t, y_p):
        rmse = rmse_score(y_t, y_p)
        mae = mean_absolute_error(y_t, y_p)
        nasa = nasa_phm08_score(y_t, y_p)
        d = y_p - y_t
        early = (d < 0).mean() * 100
        late = (d >= 0).mean() * 100
        return rmse, mae, nasa, early, late
        
    rmse, mae, nasa, early, late = eval_metrics(y_val, preds)
    print(f"RMSE: {rmse:.2f}")
    print(f"MAE: {mae:.2f}")
    print(f"NASA score: {nasa:.2f}")
    print(f"Early %: {early:.1f}%")
    print(f"Late %: {late:.1f}%")
    
    mask_30 = y_val <= 30
    if mask_30.any():
        r30, m30, n30, e30, l30 = eval_metrics(y_val[mask_30], preds[mask_30])
        print(f"<=30 | Count: {mask_30.sum()} | RMSE: {r30:.2f}, MAE: {m30:.2f}, NASA: {n30:.2f}, Early: {e30:.1f}%, Late: {l30:.1f}%")
        
    mask_75 = y_val <= 75
    if mask_75.any():
        r75, m75, n75, e75, l75 = eval_metrics(y_val[mask_75], preds[mask_75])
        print(f"<=75 | Count: {mask_75.sum()} | RMSE: {r75:.2f}, MAE: {m75:.2f}, NASA: {n75:.2f}, Early: {e75:.1f}%, Late: {l75:.1f}%")
        
    # 6. Engine Diagnostics
    engine_results = []
    for engine_id in val_split['unit'].unique():
        mask = val_split['unit'] == engine_id
        _, _, n, _, _ = eval_metrics(y_val[mask], preds[mask])
        engine_results.append({'engine': engine_id, 'nasa': n})
        
    engine_df = pd.DataFrame(engine_results)
    worst_5 = engine_df.nlargest(5, 'nasa')
    print(f"Worst 5 engines (by NASA): {worst_5['engine'].tolist()}")
    print(f"Worst engine NASA %: {worst_5.iloc[0]['nasa'] / nasa * 100:.2f}%")
    
    return {
        "rmse": rmse,
        "mae": mae,
        "nasa": nasa,
        "early": early,
        "late": late,
        "norm": normalization_used,
        "features": len(features)
    }

res3 = evaluate_dataset("FD003")
res4 = evaluate_dataset("FD004")

print(f"\n{'='*50}\nCROSS-DATASET SUMMARY\n{'='*50}")
print(f"Dataset | Features | RMSE | MAE | NASA | Early % | Late %")
print(f"FD003   | {res3['features']:<8} | {res3['rmse']:<4.2f} | {res3['mae']:<3.2f} | {res3['nasa']:<4.0f} | {res3['early']:<7.1f} | {res3['late']:<6.1f}")
print(f"FD004   | {res4['features']:<8} | {res4['rmse']:<4.2f} | {res4['mae']:<3.2f} | {res4['nasa']:<4.0f} | {res4['early']:<7.1f} | {res4['late']:<6.1f}")
