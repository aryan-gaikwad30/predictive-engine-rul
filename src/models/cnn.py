import os
import random
import numpy as np

try:
    import tensorflow as tf
    from tensorflow.keras.models import Sequential
    from tensorflow.keras.layers import Conv1D, MaxPooling1D, GlobalAveragePooling1D, Dense, Dropout
    from tensorflow.keras.optimizers import Adam
    from tensorflow.keras.callbacks import EarlyStopping, ReduceLROnPlateau
    TF_AVAILABLE = True
except ImportError:
    TF_AVAILABLE = False

def set_random_seeds(seed: int = 42):
    """
    Set deterministic random seeds for Python, NumPy, and TensorFlow.
    """
    os.environ['PYTHONHASHSEED'] = str(seed)
    random.seed(seed)
    np.random.seed(seed)
    
    if TF_AVAILABLE:
        tf.random.set_seed(seed)
        # tf.config.experimental.enable_op_determinism() may be used but has performance trade-offs
        
def build_cnn_model(window_size: int, num_features: int) -> 'tf.keras.Model':
    """
    Builds the 1D-CNN temporal baseline model.
    """
    if not TF_AVAILABLE:
        raise ImportError("TensorFlow is required to build the CNN model.")
        
    model = Sequential([
        Conv1D(filters=64, kernel_size=3, activation='relu', padding='same', input_shape=(window_size, num_features)),
        Conv1D(filters=64, kernel_size=3, activation='relu', padding='same'),
        MaxPooling1D(pool_size=2),
        Dropout(rate=0.2),
        
        Conv1D(filters=128, kernel_size=3, activation='relu', padding='same'),
        GlobalAveragePooling1D(),
        
        Dense(units=64, activation='relu'),
        Dropout(rate=0.2),
        
        Dense(units=1, activation='linear')
    ])
    
    optimizer = Adam(learning_rate=0.001)
    model.compile(optimizer=optimizer, loss='mse', metrics=['mae'])
    
    return model

def train_cnn(
    model: 'tf.keras.Model', 
    X_train: np.ndarray, 
    y_train: np.ndarray, 
    X_val: np.ndarray, 
    y_val: np.ndarray,
    epochs: int = 100,
    batch_size: int = 64
):
    """
    Train the CNN model with standard callbacks.
    """
    if not TF_AVAILABLE:
        raise ImportError("TensorFlow is required to train the CNN model.")
        
    if X_train.ndim != 3 or X_val.ndim != 3:
        raise ValueError("X_train and X_val must be 3D arrays (N, W, F).")
        
    if len(X_train) != len(y_train) or len(X_val) != len(y_val):
        raise ValueError("X and y must have the same length.")
        
    early_stop = EarlyStopping(
        monitor='val_loss', 
        patience=10, 
        restore_best_weights=True
    )
    
    reduce_lr = ReduceLROnPlateau(
        monitor='val_loss', 
        factor=0.5, 
        patience=5, 
        min_lr=1e-6
    )
    
    history = model.fit(
        X_train, y_train,
        validation_data=(X_val, y_val),
        epochs=epochs,
        batch_size=batch_size,
        callbacks=[early_stop, reduce_lr],
        verbose=1
    )
    
    return history

def predict_cnn(model: 'tf.keras.Model', X: np.ndarray) -> np.ndarray:
    """
    Generate predictions using the CNN model.
    """
    if not TF_AVAILABLE:
        raise ImportError("TensorFlow is required to predict with the CNN model.")
        
    if X.ndim != 3:
        raise ValueError("X must be a 3D array (N, W, F).")
        
    predictions = model.predict(X, batch_size=64)
    return predictions.flatten()
