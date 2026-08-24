import numpy as np

def rmse_score(y_true, y_pred) -> float:
    """
    Calculate the Root Mean Squared Error (RMSE).
    
    Args:
        y_true: Array-like of actual target values.
        y_pred: Array-like of predicted target values.
        
    Returns:
        The RMSE score.
    """
    y_true = np.array(y_true)
    y_pred = np.array(y_pred)
    return float(np.sqrt(np.mean((y_true - y_pred)**2)))

def nasa_phm08_score(y_true, y_pred) -> float:
    """
    Calculate the asymmetric NASA PHM08 scoring function for C-MAPSS RUL evaluation.
    
    Sign convention:
    d = prediction - actual
    
    - negative d = predicted RUL is LOWER than actual RUL
      → early maintenance prediction
    - positive d = predicted RUL is HIGHER than actual RUL
      → late prediction
      
    Penalty function:
    If d < 0 (early prediction):
        score contribution = exp(-d / 13) - 1
    If d >= 0 (late prediction):
        score contribution = exp(d / 10) - 1
        
    The total score is the sum of all per-observation contributions.
    Late predictions are penalized more steeply than early predictions.
    
    Args:
        y_true: Array-like of actual target values.
        y_pred: Array-like of predicted target values.
        
    Returns:
        The total NASA PHM08 score.
    """
    y_true = np.array(y_true)
    y_pred = np.array(y_pred)
    
    d = y_pred - y_true
    
    # Calculate score conditionally
    # For d < 0, score = exp(-d/13) - 1
    # For d >= 0, score = exp(d/10) - 1
    
    score_early = np.where(d < 0, np.exp(-d / 13.0) - 1, 0)
    score_late = np.where(d >= 0, np.exp(d / 10.0) - 1, 0)
    
    total_score = np.sum(score_early + score_late)
    
    return float(total_score)

def mae_score(y_true, y_pred) -> float:
    """Calculate Mean Absolute Error."""
    y_true = np.array(y_true)
    y_pred = np.array(y_pred)
    return float(np.mean(np.abs(y_true - y_pred)))

def early_prediction_pct(y_true, y_pred) -> float:
    """Calculate percentage of early predictions (predicted < actual)."""
    y_true = np.array(y_true)
    y_pred = np.array(y_pred)
    if len(y_true) == 0:
        return 0.0
    return float(np.mean(y_pred < y_true) * 100)

def late_prediction_pct(y_true, y_pred) -> float:
    """Calculate percentage of late predictions (predicted > actual)."""
    y_true = np.array(y_true)
    y_pred = np.array(y_pred)
    if len(y_true) == 0:
        return 0.0
    return float(np.mean(y_pred > y_true) * 100)

def mean_signed_error(y_true, y_pred) -> float:
    """Calculate mean signed error (predicted - actual)."""
    y_true = np.array(y_true)
    y_pred = np.array(y_pred)
    return float(np.mean(y_pred - y_true))

def max_absolute_error(y_true, y_pred) -> float:
    """Calculate maximum absolute error."""
    y_true = np.array(y_true)
    y_pred = np.array(y_pred)
    if len(y_true) == 0:
        return 0.0
    return float(np.max(np.abs(y_true - y_pred)))

