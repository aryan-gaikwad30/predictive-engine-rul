import pandas as pd
from src.data.loader import load_subset
from src.data.rul import add_training_targets, add_clipped_rul_column
from src.models.pipeline import run_baseline_models

def run_evaluation(subset):
    train_df, test_df, test_rul = load_subset(subset)
    
    # Train targets
    train_df = add_training_targets(train_df)
    
    # Test targets
    last_cycles = test_df.groupby("unit").last().reset_index()
    last_cycles["RUL"] = test_rul["RUL"].values
    last_cycles = add_clipped_rul_column(last_cycles)
    
    print(f"Running baseline models on {subset}...")
    results = run_baseline_models(train_df, last_cycles, random_state=42)
    print(f"{subset} Results:")
    print(results)
    print("-" * 40)

if __name__ == "__main__":
    run_evaluation("FD004")
