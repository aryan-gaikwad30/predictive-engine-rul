# M20 Real-World Generalization Experiment Record

## Objective
The objective of this experiment was to validate the deterministic XGBoost regression pipeline on complex, unseen datasets to prove real-world viability beyond the synthetic/demo FD001 dataset. The baseline pipeline architecture was explicitly frozen to verify generalizability.

## Datasets Evaluated
We procured and evaluated two additional NASA C-MAPSS sub-datasets:
1. **FD003 (Moderate Complexity)**: 
   - 100 Train Engines, 100 Test Engines
   - Max Cycle (mean): ~247 cycles
   - 2 Operating Conditions, 1 Fault Mode
2. **FD004 (High Complexity)**: 
   - 249 Train Engines, 248 Test Engines
   - Max Cycle (mean): ~246 cycles
   - 6 Operating Conditions, 2 Fault Modes

*Note: The demo dataset (FD001) contains 100 engines with 1 operating condition and 1 fault mode.*

## Methodology
- **Data Preprocessing**: Strict leakage-free feature selection. Features were learned exclusively on the respective training subsets.
- **RUL Calculation**: Ground truth RUL was calculated using the identical `max_cycle - current_cycle` logic, with an arbitrary capping limit set at `RUL_clipped <= 125` to manage early-stage prediction noise.
- **Model**: Deterministic XGBoost Regressor (`random_state=42`) with fixed baseline hyperparameters.

## Experiment Comparison (Results)
The following table compares the demo performance (FD001) against the real-world generalized datasets (FD003 and FD004) evaluated on the true unseen test sequences (using the last recorded cycle).

| Dataset | Complexity | Model | RMSE | NASA PHM08 Score |
|---|---|---|---|---|
| **FD001 (Demo)** | Low (1 Cond, 1 Fault) | XGBoost | 17.90 | 831.55 |
| **FD003 (Eval)** | Medium (2 Cond, 1 Fault)| XGBoost | 21.38 | 2,153.93 |
| **FD004 (Eval)** | High (6 Cond, 2 Fault) | XGBoost | 29.97 | 7,811.21 |

### Interpretation
As expected, as the number of operating conditions and fault modes increases, the deterministic XGBoost baseline degrades from an RMSE of 17.90 to 29.97. 
However, the model successfully generalizes to these datasets without *any* architectural modifications or hyperparameter tuning. The RMSE of 21.38 on FD003 represents a very strong baseline out-of-the-box performance for predictive maintenance scenarios.
