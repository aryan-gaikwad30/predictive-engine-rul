import pytest
from src.data.loader import (
    get_cmapps_columns,
    load_subset,
    load_train_data,
    load_test_data,
    load_test_rul,
)


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


def test_load_train_data(tmp_path):
    train_file = tmp_path / "train.txt"
    train_file.write_text(
        "1 1 " + "0.0 " * 24 + "\n" +
        "1 2 " + "0.0 " * 24 + "\n"
    )

    df = load_train_data(train_file)

    assert len(df.columns) == 26
    assert list(df.columns) == get_cmapps_columns()
    assert len(df) == 2


def test_load_test_data(tmp_path):
    test_file = tmp_path / "test.txt"
    test_file.write_text("1 1 " + "0.0 " * 24 + "\n")

    df = load_test_data(test_file)

    assert len(df.columns) == 26
    assert list(df.columns) == get_cmapps_columns()
    assert len(df) == 1


def test_load_test_rul(tmp_path):
    rul_file = tmp_path / "RUL.txt"
    rul_file.write_text("100\n200\n")

    df = load_test_rul(rul_file)

    assert list(df.columns) == ["RUL"]
    assert len(df) == 2


def test_load_subset_valid(tmp_path, monkeypatch):
    import src.config as config

    monkeypatch.setattr(config, "CMAPSS_DATA_DIR", tmp_path)

    train_file = tmp_path / "train_FD001.txt"
    test_file = tmp_path / "test_FD001.txt"
    rul_file = tmp_path / "RUL_FD001.txt"

    train_file.write_text("1 1 " + "0.0 " * 24 + "\n")
    test_file.write_text("1 1 " + "0.0 " * 24 + "\n")
    rul_file.write_text("100\n")

    train_df, test_df, test_rul = load_subset("FD001")

    assert len(train_df) == 1
    assert len(test_df) == 1
    assert len(test_rul) == 1
