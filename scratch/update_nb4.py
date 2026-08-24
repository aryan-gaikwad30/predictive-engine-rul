import json

nb_path = "notebooks/01_fd001_exploration.ipynb"
with open(nb_path, 'r', encoding='utf-8') as f:
    nb = json.load(f)

markdown_content = """# Cross-Dataset Validation — FD003 & FD004

## 1. Dataset Summary & Decisions
We tested the existing pipeline architecture on FD003 and FD004 to verify cross-dataset robustness.
- **FD003**: 100 engines. Single operating condition (Sea Level). Train/Val split: 80/20. `max_std` of settings was `0.002`. Decision: Normalization skipped. 5 exact constants removed, leaving **16 features**.
- **FD004**: 249 engines. Six operating conditions. Train/Val split: 80/20 (200/49 engines). `max_std` of settings was `14.78`. Decision: `OperatingConditionNormalizer` applied. 1 exact constant (`sensor_18`) removed, leaving **20 features**.

## 2. Model Metrics
| Dataset | Features | RMSE | MAE | NASA Score | Early % | Late % |
|---|---|---|---|---|---|---|
| **FD003** | 16 | 53.56 | 37.14 | 7,459,453,665 | 31.2% | 68.8% |
| **FD004** | 20 | 59.47 | 42.08 | 30,860,474,839 | 43.4% | 56.6% |

## 3. Maintenance Metrics (Cumulative RUL)
**FD003**:
- **<=30 RUL**: RMSE 9.82, MAE 6.99, NASA 2,950
- **<=75 RUL**: RMSE 30.33, MAE 19.48, NASA 315,013,437
- **Worst Engine**: Unit 34 (Contributes 84.79% of total NASA penalty)

**FD004**:
- **<=30 RUL**: RMSE 11.77, MAE 7.84, NASA 11,483
- **<=75 RUL**: RMSE 30.32, MAE 19.77, NASA 20,996,640
- **Worst Engine**: Unit 133 (Contributes 96.45% of total NASA penalty)

## 4. Short Comparison
FD004 is significantly harder than FD003 due to multi-condition deterioration complexity, resulting in higher global RMSE and MAE. However, the existing pipeline (engine splitting, dynamic train-only feature selection, condition normalizer toggle, and canonical XGBoost) ingested both datasets natively **without any architectural changes**. The normalizer abstracted the complexity of FD004 gracefully. Both datasets still suffer from massive NASA penalty concentration in extreme outlier engines.

## 5. Custom-Dataset Readiness Assessment
The final goal is applying this to real company datasets.

### Currently C-MAPSS-Specific:
- Fixed feature extraction (`sensor_1` through `sensor_21`).
- Fixed operating setting assumptions (`setting_1` to `setting_3`).
- Fixed piece-wise linear RUL target generation logic (specifically assuming RUL caps around 125 cycles).
- Hardcoded txt file format loader logic.

### Already Reusable:
- Deterministic engine-level group splitting.
- Leakage-proof pipeline barriers (train-only fitting).
- Dynamic feature selection (automatic constant/variance removal).
- Conditional normalization abstraction.
- Core XGBoost configuration and evaluation frameworks.
- Business-oriented maintenance horizon evaluation.

The next engineering phase must strip out the C-MAPSS column names and TXT format assumptions to support generalized schema injection.
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
