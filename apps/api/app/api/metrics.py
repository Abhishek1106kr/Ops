from fastapi import APIRouter
from app.services.metrics_service import metrics_service

router = APIRouter()

@router.get("/")
async def get_live_metrics():
    return metrics_service.get_metrics()
