from fastapi import APIRouter, HTTPException
from app.services.github_service import github_service

router = APIRouter()

@router.post("/pr/{incident_id}")
def create_pr(incident_id: str):
    try:
        return github_service.create_remediation_pr(incident_id)
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))
