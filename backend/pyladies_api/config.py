import os
from pathlib import Path


BACKEND_DIR = Path(__file__).resolve().parents[1]


class Config:
    SECRET_KEY = os.getenv("PYLADIES_SECRET_KEY", "dev-secret-change-me")
    DATABASE = Path(os.getenv("PYLADIES_DATABASE", BACKEND_DIR / "pyladies.db"))
    ADMIN_PASSWORD = os.getenv("PYLADIES_ADMIN_PASSWORD", "pyladies123")
