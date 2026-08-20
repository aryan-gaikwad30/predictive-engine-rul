import tensorflow as tf
from tensorflow.keras.models import Sequential
from tensorflow.keras.layers import LSTM, Dense, Dropout, Input
from tensorflow.keras.optimizers import Adam
from tensorflow.keras.callbacks import EarlyStopping, ReduceLROnPlateau
import numpy as np
import random

def set_random_seeds(seed=42):
    """Set random seeds for reproducibility."""
    np.random.seed(seed)
    random.seed(seed)
    tf.random.set_seed(seed)

def build_lstm_model(window_size=30, num_features=17):
    """
    Builds the baseline LSTM model.
    Input: (30, 17)
    LSTM: 64 units, return_sequences=True
    Dropout: 0.2
    LSTM: 32 units, return_sequences=False
    Dropout: 0.2
    Dense: 32 units, activation=ReLU
    Dense: 1 unit, activation=linear
    """
    model = Sequential([
        Input(shape=(window_size, num_features)),
        LSTM(64, return_sequences=True),
        Dropout(0.2),
        LSTM(32, return_sequences=False),
        Dropout(0.2),
        Dense(32, activation='relu'),
        Dense(1, activation='linear')
    ])
    
    optimizer = Adam(learning_rate=0.001)
    model.compile(optimizer=optimizer, loss='mse', metrics=['mae'])
    
    return model

def train_lstm(model, X_train, y_train, X_val, y_val, epochs=100, batch_size=64):
    """
    Trains the LSTM model with standard callbacks.
    """
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
        epochs=epochs,
        batch_size=batch_size,
        validation_data=(X_val, y_val),
        callbacks=[early_stop, reduce_lr],
        verbose=1
    )
    
    return history

def predict_lstm(model, X):
    """
    Predicts using the trained LSTM model.
    """
    return model.predict(X).flatten()
