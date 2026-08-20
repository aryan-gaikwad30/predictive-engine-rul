import pytest
import numpy as np

from src.data.scaling import SequenceScaler
from src.models.cnn import TF_AVAILABLE, set_random_seeds, build_cnn_model, train_cnn, predict_cnn

def test_sequence_scaler_fits_only_on_train():
    scaler = SequenceScaler()
    X_train = np.random.rand(10, 30, 17)
    X_val = np.random.rand(5, 30, 17)
    
    # transform before fit should fail
    with pytest.raises(ValueError):
        scaler.transform_sequences(X_val)
        
    scaler.fit_sequence_scaler(X_train)
    assert scaler.is_fitted
    
    # transform shouldn't mutate input
    X_val_copy = X_val.copy()
    X_val_scaled = scaler.transform_sequences(X_val)
    
    np.testing.assert_array_equal(X_val, X_val_copy)
    assert X_val_scaled.shape == (5, 30, 17)
    
    # test fit_transform
    scaler2 = SequenceScaler()
    X_train_scaled = scaler2.fit_transform_sequence_scaler(X_train)
    assert X_train_scaled.shape == (10, 30, 17)
    
def test_sequence_scaler_rejects_bad_shapes():
    scaler = SequenceScaler()
    with pytest.raises(ValueError):
        scaler.fit_sequence_scaler(np.random.rand(10, 17))

@pytest.mark.skipif(not TF_AVAILABLE, reason="TensorFlow is not available")
def test_model_builds_successfully():
    set_random_seeds(42)
    model = build_cnn_model(window_size=30, num_features=17)
    assert model is not None
    
    # Verify input/output shapes
    assert model.input_shape == (None, 30, 17)
    assert model.output_shape == (None, 1)
    
    # Verify activation of last layer is linear
    last_layer = model.layers[-1]
    assert last_layer.activation.__name__ == 'linear'
    
    # Verify it uses Conv1D
    layer_types = [type(layer).__name__ for layer in model.layers]
    assert 'Conv1D' in layer_types

@pytest.mark.skipif(not TF_AVAILABLE, reason="TensorFlow is not available")
def test_train_helper_rejects_bad_shapes():
    model = build_cnn_model(window_size=30, num_features=17)
    X_bad = np.random.rand(10, 17) # 2D instead of 3D
    y_good = np.random.rand(10)
    
    with pytest.raises(ValueError, match="X_train and X_val must be 3D arrays"):
        train_cnn(model, X_bad, y_good, X_bad, y_good, epochs=1)

@pytest.mark.skipif(not TF_AVAILABLE, reason="TensorFlow is not available")
def test_train_helper_rejects_mismatched_lengths():
    model = build_cnn_model(window_size=30, num_features=17)
    X_train = np.random.rand(10, 30, 17)
    y_train = np.random.rand(5) # Length mismatch
    
    X_val = np.random.rand(5, 30, 17)
    y_val = np.random.rand(5)
    
    with pytest.raises(ValueError, match="X and y must have the same length"):
        train_cnn(model, X_train, y_train, X_val, y_val, epochs=1)

@pytest.mark.skipif(not TF_AVAILABLE, reason="TensorFlow is not available")
def test_model_can_overfit_tiny_dataset():
    set_random_seeds(42)
    model = build_cnn_model(window_size=30, num_features=17)
    
    # Tiny dataset
    X_train = np.ones((5, 30, 17))
    y_train = np.array([10.0, 20.0, 30.0, 40.0, 50.0])
    
    X_val = np.ones((2, 30, 17))
    y_val = np.array([25.0, 35.0])
    
    # Train for a few epochs just to show the path works
    history = train_cnn(model, X_train, y_train, X_val, y_val, epochs=2, batch_size=2)
    
    assert len(history.history['loss']) == 2
    
    preds = predict_cnn(model, X_val)
    assert preds.shape == (2,)
