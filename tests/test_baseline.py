import pytest
import pandas as pd
import numpy as np

from src.models.baseline import (
    train_random_forest,
    train_xgboost,
    predict_rul,
    get_feature_importance,
    SKLEARN_AVAILABLE,
    XGBOOST_AVAILABLE
)

@pytest.fixture
def synthetic_data():
    np.random.seed(42)
    X = pd.DataFrame({
        "feature1": np.random.rand(50),
        "feature2": np.random.rand(50),
        "feature3": np.random.rand(50)
    })
    y = pd.Series(np.random.rand(50) * 100)
    return X, y

def test_random_forest_baseline(synthetic_data):
    if not SKLEARN_AVAILABLE:
        pytest.skip("scikit-learn is not available")
        
    X, y = synthetic_data
    model = train_random_forest(X, y)
    
    # Check predictions
    preds = predict_rul(model, X)
    assert len(preds) == len(X)
    assert np.issubdtype(preds.dtype, np.number)
    
    # Check feature importance
    features = list(X.columns)
    importance_df = get_feature_importance(model, features)
    
    assert len(importance_df) == len(features)
    assert "feature" in importance_df.columns
    assert "importance" in importance_df.columns
    assert all(importance_df["importance"] >= 0)
    assert importance_df["importance"].is_monotonic_decreasing

def test_xgboost_baseline(synthetic_data):
    if not XGBOOST_AVAILABLE:
        pytest.importorskip("xgboost")
        
    X, y = synthetic_data
    model = train_xgboost(X, y)
    
    preds = predict_rul(model, X)
    assert len(preds) == len(X)
    assert np.issubdtype(preds.dtype, np.number)
    
def test_feature_importance_missing_attribute(synthetic_data):
    X, y = synthetic_data
    class DummyModel:
        pass
        
    model = DummyModel()
    with pytest.raises(ValueError, match="does not have feature_importances_ attribute"):
        get_feature_importance(model, list(X.columns))
