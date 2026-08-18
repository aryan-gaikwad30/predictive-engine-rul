import pytest
import pandas as pd
from pathlib import Path
from src.data.loader import get_cmapps_columns, load_subset

def test_get_cmapps_columns():
    cols = get_cmapps_columns()
    assert len(cols) == 26
    assert cols[0] == "unit"
    assert cols[1] == "cycle"
    
    settings = [c for c in cols if c.startswith("setting_")]
    assert len(settings) == 3
    assert settings == ["setting_1", "setting_2", "setting_3"]
    
    sensors = [c for c in cols if c.startswith("sensor_")]
    assert len(sensors) == 21
    assert sensors[0] == "sensor_1"
    assert sensors[-1] == "sensor_21"

def test_load_subset_invalid():
    with pytest.raises(ValueError, match="Invalid subset"):
        load_subset("FD005")
    
    with pytest.raises(ValueError, match="Invalid subset"):
        load_subset("INVALID")
