"""Compatibility shim so `uvicorn main:app` works from the `backend/` folder.

This re-exports the FastAPI `app` object defined in `app/main.py`.
"""
from app.main import app  # re-export for uvicorn
