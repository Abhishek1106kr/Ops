from fastapi import APIRouter, HTTPException
from app.services.incident_service import incident_service, IncidentUpdate, IncidentCreate

router = APIRouter()

@router.get("/")
def get_all_incidents():
    return incident_service.get_incidents()

@router.get("/services")
def get_services_health():
    return incident_service.get_services()

@router.get("/{incident_id}")
def get_incident_by_id(incident_id: str):
    inc = incident_service.get_incident(incident_id)
    if not inc:
        raise HTTPException(status_code=404, detail="Incident not found")
    return inc

@router.put("/{incident_id}")
def update_incident(incident_id: str, payload: IncidentUpdate):
    inc = incident_service.update_incident_status(incident_id, payload.status)
    if not inc:
        raise HTTPException(status_code=404, detail="Incident not found")
    return inc

@router.post("/{incident_id}/resolve")
def resolve_incident(incident_id: str):
    inc = incident_service.resolve_incident(incident_id)
    if not inc:
        raise HTTPException(status_code=404, detail="Incident not found")
    return inc

@router.post("/trigger-outage")
def trigger_outage(service_name: str, severity: str = "critical"):
    try:
        return incident_service.trigger_service_outage(service_name, severity)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
