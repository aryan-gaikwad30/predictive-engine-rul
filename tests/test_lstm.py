import pytest
import numpy as np
tf = pytest.importorskip("tensorflow")
from src.models.lstm import build_lstm_model

def test_lstm_model_accepts_expected_shape_and_outputs_scalar():
    """Test 1 & 2: Model accepts (N, 30, 17) and outputs (N, 1)"""
    model = build_lstm_model(window_size=30, num_features=17)
    
    # Create dummy input of shape (Batch, 30, 17)
    X_dummy = np.random.rand(5, 30, 17).astype(np.float32)
    
    # Predict
    preds = model.predict(X_dummy, verbose=0)
    
    # Assert output shape
    assert preds.shape == (5, 1)

def test_lstm_layer_structure():
    """Test 3: Expected layer structure"""
    model = build_lstm_model(window_size=30, num_features=17)
    
    layers = model.layers
    
    assert isinstance(layers[0], tf.keras.layers.LSTM)
    assert layers[0].units == 64
    assert layers[0].return_sequences is True
    
    assert isinstance(layers[1], tf.keras.layers.Dropout)
    assert layers[1].rate == 0.2
    
    assert isinstance(layers[2], tf.keras.layers.LSTM)
    assert layers[2].units == 32
    assert layers[2].return_sequences is False
    
    assert isinstance(layers[3], tf.keras.layers.Dropout)
    assert layers[3].rate == 0.2
    
    assert isinstance(layers[4], tf.keras.layers.Dense)
    assert layers[4].units == 32
    assert layers[4].activation.__name__ == 'relu'
    
    assert isinstance(layers[5], tf.keras.layers.Dense)
    assert layers[5].units == 1
    assert layers[5].activation.__name__ == 'linear'

def test_lstm_parameter_count():
    """Test 4: Expected parameter count"""
    model = build_lstm_model(window_size=30, num_features=17)
    param_count = model.count_params()
    
    # Calculate expected:
    # LSTM1: 4 * (17 + 64 + 1) * 64 = 20992
    # LSTM2: 4 * (64 + 32 + 1) * 32 = 12416
    # Dense1: (32 + 1) * 32 = 1056
    # Dense2: (32 + 1) * 1 = 33
    # Total = 20992 + 12416 + 1056 + 33 = 34497
    
    assert param_count == 34497

def test_lstm_raw_rul_is_continuous():
    """Test 5: RAW RUL output is continuous (not integers)"""
    model = build_lstm_model(window_size=30, num_features=17)
    X_dummy = np.random.rand(5, 30, 17).astype(np.float32)
    
    preds = model.predict(X_dummy, verbose=0)
    
    # Ensure they are floating point and not all integers
    assert preds.dtype == np.float32
    # There is a very high probability that random weights and random input won't produce exact integers
    is_all_integers = np.all(preds == np.round(preds))
    assert not is_all_integers

def test_lstm_does_not_mutate_input():
    """Test 6: Model does not mutate input"""
    model = build_lstm_model(window_size=30, num_features=17)
    X_dummy = np.random.rand(5, 30, 17).astype(np.float32)
    X_copy = X_dummy.copy()
    
    _ = model.predict(X_dummy, verbose=0)
    
    np.testing.assert_array_equal(X_dummy, X_copy)

def test_lstm_rejects_invalid_dimensions():
    """Test 7: Invalid input dimensions are rejected appropriately"""
    model = build_lstm_model(window_size=30, num_features=17)
    
    # 2D input instead of 3D
    X_invalid_2d = np.random.rand(5, 17).astype(np.float32)
    with pytest.raises(ValueError):
        model.predict(X_invalid_2d, verbose=0)
        
    # Wrong sequence length or feature size (Keras might allow varying seq len if input shape was (None, 17) but we specified (30, 17))
    # Actually, tf.keras sequential with specific shape (30, 17) usually expects (batch, 30, 17).
    # Wait, Keras often allows different sequence lengths unless explicitly enforced, but features MUST match.
    X_invalid_features = np.random.rand(5, 30, 16).astype(np.float32)
    with pytest.raises(ValueError):
        model.predict(X_invalid_features, verbose=0)
