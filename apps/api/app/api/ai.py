from fastapi import APIRouter
from app.services.ai_service import ai_service

router = APIRouter()

@router.get("/diagnose/{incident_id}")
def get_diagnosis(incident_id: str):
    return ai_service.get_diagnosis(incident_id)
