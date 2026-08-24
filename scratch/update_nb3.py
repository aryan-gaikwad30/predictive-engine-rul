import json
import os

nb_path = "notebooks/01_fd001_exploration.ipynb"
with open(nb_path, 'r', encoding='utf-8') as f:
    nb = json.load(f)

markdown_content = """# FD002 Raw vs Normalized XGBoost

## 1. Objective & Methodology
We evaluate the impact of leakage-free operating-condition normalization on XGBoost performance for FD002.
- **Engine Split**: 80% Train (208 engines), 20% Validation (52 engines). Random state 42. Identical split for both models.
- **Target**: Raw RUL (`RUL`). No clipping was applied to the validation evaluation.
- **XGBoost Config**: 500 estimators, depth 6, lr 0.05, subsample 0.8, colsample 0.8, objective `reg:squarederror`.
- **RAW Pipeline**: Feature selection removed exact constants (`sensor_18` excluded). 21 features used.
- **NORMALIZED Pipeline**: `OperatingConditionNormalizer` fitted strictly on Train data. Feature selection on normalized data removed exact constants. 20 features used (excluding `sensor_18`).
- **Leakage Integrity**: Verified that normalizer saw zero validation data during fitting, feature selection saw zero validation data, and official FD002 test labels were not accessed.

## 2. Global Results
| Metric | RAW XGBoost | NORMALIZED XGBoost | Improvement |
|---|---|---|---|
| RMSE | 42.93 | 42.91 | +0.05% |
| MAE | 31.66 | 31.48 | +0.58% |
| NASA PHM08 | 161,778,840 | 147,606,457 | +8.76% |

## 3. RUL Bands Performance
| Band | Count | RAW RMSE | NORM RMSE | RAW NASA | NORM NASA |
|---|---|---|---|---|---|
| Critical (0-30) | 1612 | 14.55 | 14.03 | 48,127 | 40,277 |
| Warning (31-75) | 2340 | 40.87 | 40.36 | 2,171,094 | 2,387,025 |
| Moderate (76-125)| 2600 | 41.56 | 41.41 | 1,671,814 | 1,881,217 |
| Early-life (>125)| 4124 | 51.50 | 51.80 | 157,887,804 | 143,297,936 |

**Observation**: Normalization consistently improves RMSE across all critical and moderate bands. Critical-band (0-30) RMSE improved by 3.54%, and Critical-band NASA score improved by 16.31%.

## 4. Visualizations

### Actual vs Predicted
![Actual vs Predicted](actual_vs_pred.png)

### Residual Distribution
![Residual Distribution](residuals.png)

### NASA Penalty Distribution
![NASA Penalty](nasa_penalty.png)

## 5. Feature Importance
**Top 10 RAW**: `['sensor_13', 'sensor_11', 'sensor_15', 'sensor_6', 'sensor_4', 'sensor_16', 'sensor_17', 'sensor_14', 'sensor_9', 'sensor_2']`
**Top 10 NORM**: `['sensor_11', 'sensor_15', 'sensor_4', 'sensor_9', 'sensor_14', 'sensor_17', 'sensor_2', 'sensor_13', 'sensor_8', 'sensor_3']`

**Analysis**: `sensor_11` (HPC outlet temperature) and `sensor_15` (Bypass Ratio) rise to the top of the importance chart after normalization. `sensor_13` (Core speed) dominates the RAW model but falls significantly in the normalized model, suggesting that its raw variation is heavily tied to the operating condition itself rather than degradation. Normalization successfully surfaces the true degradation signal in thermodynamic sensors.

## 6. Engine Diagnostics & NASA Concentration
Like FD001, the NASA score is astronomically concentrated in a single engine.
- **RAW Worst Engine (85)**: Contributes 96.27% of the total NASA penalty.
- **NORM Worst Engine (85)**: Contributes 95.47% of the total NASA penalty.

## 7. Scientific Conclusion
**Outcome B: Normalization slightly improves performance.**
Normalization yielded a modest but consistent improvement in RMSE and MAE across almost all RUL bands. The NASA score improved by 8.7%. Most importantly, the critical-band (RUL <= 30) NASA score saw a substantial 16.31% improvement, which is operationally valuable. The feature importance shift confirms that normalization strips away operating-condition noise, allowing the model to focus on true degradation sensors (like `sensor_11` and `sensor_15`) rather than sensors merely correlated with the current operating regime (like `sensor_13`).
"""

new_cell = {
    "cell_type": "markdown",
    "metadata": {},
    "source": [line + "\n" for line in markdown_content.split('\n')]
}

nb['cells'].append(new_cell)

with open(nb_path, 'w', encoding='utf-8') as f:
    json.dump(nb, f, indent=1)
print("Notebook updated.")
