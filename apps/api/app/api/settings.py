from fastapi import APIRouter
from app.services.settings_service import settings_service
from typing import Dict

router = APIRouter()

@router.get("/")
def get_settings():
    """Retrieves all configuration variables."""
    return settings_service.settings

@router.post("/")
def update_settings(payload: Dict):
    """Saves updated settings to config.json."""
    return settings_service.save_settings(payload)
