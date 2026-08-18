from pathlib import Path

# Project root is two levels up from src/config.py
PROJECT_ROOT = Path(__file__).resolve().parent.parent

# Data directories
DATA_ROOT = PROJECT_ROOT / "data"
CMAPSS_DATA_DIR = DATA_ROOT / "raw" / "CMAPSSData"

# Reports directories
REPORTS_DIR = PROJECT_ROOT / "reports"

# Target constants
DEFAULT_RUL_CAP = 125
