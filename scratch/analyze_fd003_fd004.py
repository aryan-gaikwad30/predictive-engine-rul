import pandas as pd

for name in ['FD003', 'FD004']:
    df = pd.read_csv(f'data/Raw/CMAPSSData/train_{name}.txt', sep='\s+', header=None)
    print(f"Dataset {name}:")
    print(f"  Rows, Columns: {df.shape}")
    print(f"  Engines: {df[0].nunique()}")
    print(f"  Max cycle per engine (mean): {df.groupby(0)[1].max().mean():.2f}")
    
    # Test dataset
    df_test = pd.read_csv(f'data/Raw/CMAPSSData/test_{name}.txt', sep='\s+', header=None)
    print(f"  Test Engines: {df_test[0].nunique()}")
    print("-" * 40)
