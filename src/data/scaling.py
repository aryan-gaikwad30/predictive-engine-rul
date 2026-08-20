import numpy as np
from sklearn.preprocessing import StandardScaler

class SequenceScaler:
    """
    Scaler for 3D temporal sequences.
    Fits ONLY on training sequences by temporarily reshaping them to 2D.
    Transforms sequences preserving the (N, W, F) shape.
    """
    def __init__(self):
        self.scaler = StandardScaler()
        self.is_fitted = False
        
    def fit_sequence_scaler(self, X: np.ndarray):
        """
        Fits the scaler on the training sequences.
        Args:
            X: numpy array of shape (N, W, F)
        """
        if X.ndim != 3:
            raise ValueError("Expected 3D array of shape (N, W, F).")
            
        N, W, F = X.shape
        # Reshape to (N * W, F) for fitting
        X_2d = X.reshape(-1, F)
        self.scaler.fit(X_2d)
        self.is_fitted = True
        return self
        
    def transform_sequences(self, X: np.ndarray) -> np.ndarray:
        """
        Transforms sequences using the fitted scaler.
        Args:
            X: numpy array of shape (N, W, F)
        Returns:
            Scaled numpy array of shape (N, W, F)
        """
        if not self.is_fitted:
            raise ValueError("Scaler must be fitted before transform.")
            
        if X.ndim != 3:
            raise ValueError("Expected 3D array of shape (N, W, F).")
            
        N, W, F = X.shape
        X_2d = X.reshape(-1, F)
        X_scaled_2d = self.scaler.transform(X_2d)
        
        # Reshape back to 3D
        return X_scaled_2d.reshape(N, W, F)
        
    def fit_transform_sequence_scaler(self, X: np.ndarray) -> np.ndarray:
        """
        Fits on training sequences and returns the transformed sequences.
        """
        self.fit_sequence_scaler(X)
        return self.transform_sequences(X)
