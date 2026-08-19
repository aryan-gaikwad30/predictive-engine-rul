import pytest
import numpy as np
from src.models.metrics import rmse_score, nasa_phm08_score

def test_rmse_perfect_prediction():
    y_true = [100, 50, 0]
    y_pred = [100, 50, 0]
    assert rmse_score(y_true, y_pred) == 0.0

def test_rmse_known_calculation():
    y_true = [10, 20]
    y_pred = [13, 16]
    # errors: +3, -4
    # squared: 9, 16
    # mean: 12.5
    # rmse: sqrt(12.5) ≈ 3.5355
    expected = np.sqrt(12.5)
    assert np.isclose(rmse_score(y_true, y_pred), expected)

def test_nasa_phm08_perfect_prediction():
    y_true = [100, 50, 0]
    y_pred = [100, 50, 0]
    assert nasa_phm08_score(y_true, y_pred) == 0.0

def test_nasa_phm08_early_predictions():
    y_true = [100]
    y_pred = [90]
    # d = -10 (early prediction)
    # score = exp(-(-10)/13) - 1 = exp(10/13) - 1
    expected = np.exp(10.0 / 13.0) - 1.0
    score = nasa_phm08_score(y_true, y_pred)
    assert score > 0
    assert np.isclose(score, expected)

def test_nasa_phm08_late_predictions():
    y_true = [100]
    y_pred = [110]
    # d = 10 (late prediction)
    # score = exp(10/10) - 1 = exp(1) - 1
    expected = np.exp(1.0) - 1.0
    score = nasa_phm08_score(y_true, y_pred)
    assert score > 0
    assert np.isclose(score, expected)

def test_nasa_phm08_late_penalty_steeper():
    y_true = [100, 100]
    y_pred_early = [90, 100] # error -10
    y_pred_late = [110, 100] # error +10
    
    score_early = nasa_phm08_score(y_true, y_pred_early)
    score_late = nasa_phm08_score(y_true, y_pred_late)
    
    assert score_late > score_early

def test_nasa_phm08_larger_error_larger_score():
    y_true = [100, 100]
    y_pred_small_err = [95, 100] # early 5
    y_pred_large_err = [80, 100] # early 20
    
    score_small = nasa_phm08_score(y_true, y_pred_small_err)
    score_large = nasa_phm08_score(y_true, y_pred_large_err)
    
    assert score_large > score_small
    
    y_pred_small_late = [105, 100] # late 5
    y_pred_large_late = [120, 100] # late 20
    
    score_small_late = nasa_phm08_score(y_true, y_pred_small_late)
    score_large_late = nasa_phm08_score(y_true, y_pred_large_late)
    
    assert score_large_late > score_small_late
