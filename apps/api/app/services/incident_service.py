import datetime
import uuid
import os
from typing import Dict, List, Optional
from pydantic import BaseModel

from sqlalchemy import create_engine, Column, String, Integer
from sqlalchemy.orm import sessionmaker, declarative_base

# Define SQLAlchemy DB Base
Base = declarative_base()

class IncidentModel(Base):
    __tablename__ = "incidents"
    id = Column(String, primary_key=True)
    title = Column(String)
    severity = Column(String)
    status = Column(String)
    service = Column(String)
    triggeredAt = Column(String)
    updatedAt = Column(String)
    summary = Column(String)
    description = Column(String)
    rootCause = Column(String, nullable=True)
    filePath = Column(String, nullable=True)
    slackChannel = Column(String, nullable=True)
    githubPrNumber = Column(Integer, nullable=True)
    githubPrUrl = Column(String, nullable=True)

class IncidentUpdate(BaseModel):
    status: str

class IncidentCreate(BaseModel):
    title: str
    severity: str
    service: str
    summary: str
    description: str

class IncidentService:
    def __init__(self):
        self.services = {
            "API Gateway": {"name": "API Gateway", "status": "healthy", "type": "api", "latency": 28.0, "error_rate": 0.0},
            "Auth API": {"name": "Auth API", "status": "healthy", "type": "auth", "latency": 45.0, "error_rate": 0.0},
            "Database Cluster": {"name": "Database Cluster", "status": "degraded", "type": "database", "latency": 3100.0, "error_rate": 0.0},
            "Redis Cache": {"name": "Redis Cache", "status": "healthy", "type": "cache", "latency": 2.0, "error_rate": 0.0},
            "Checkout API": {"name": "Checkout API", "status": "down", "type": "api", "latency": 8200.0, "error_rate": 14.5}
        }
        
        # Detect production PostgreSQL or SQLite config from environment
        from app.services.settings_service import settings_service
        self.db_url = settings_service.get("DATABASE_URL")
        self.engine = None
        self.SessionLocal = None
        
        if self.db_url:
            try:
                self.engine = create_engine(self.db_url)
                Base.metadata.create_all(bind=self.engine)
                self.SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=self.engine)
                
                # Pre-load initial records if database has no rows
                db = self.SessionLocal()
                try:
                    count = db.query(IncidentModel).count()
                    if count == 0:
                        for inc in self._get_initial_incidents():
                            db.add(IncidentModel(**inc))
                        db.commit()
                finally:
                    db.close()
            except Exception as e:
                # Log error and fallback to memory registry
                print(f"[IncidentService] Database initialization failed: {e}")
                self.engine = None
                self.SessionLocal = None
                
        # In-memory backing lists
        self.incidents = self._get_initial_incidents()
        self._sync_services_with_incidents()

    def _get_initial_incidents(self) -> List[Dict]:
        now = datetime.datetime.utcnow()
        return [
            {
                "id": "INC-104",
                "title": "Checkout API Failure",
                "severity": "P1",
                "status": "Investigating",
                "service": "Checkout API",
                "triggeredAt": (now - datetime.timedelta(minutes=14)).isoformat() + "Z",
                "updatedAt": (now - datetime.timedelta(minutes=12)).isoformat() + "Z",
                "summary": "Database read timeout on Checkout transactions. High latency on query processing.",
                "description": "Checkout API latency escalated to 8.2s resulting in 504 timeouts. The problem originated immediately following the 11:23 AM deployment of payment retry features.",
                "rootCause": "Database Index Missing",
                "filePath": "apps/checkout/db/schema.sql",
                "slackChannel": "#alerts-checkout-p1",
                "githubPrNumber": 432,
                "githubPrUrl": "https://github.com/sentinel-ai/repo/pull/432"
            },
            {
                "id": "INC-102",
                "title": "Auth Verification Cache Expiry",
                "severity": "P2",
                "status": "Resolved",
                "service": "Auth API",
                "triggeredAt": (now - datetime.timedelta(hours=3)).isoformat() + "Z",
                "updatedAt": (now - datetime.timedelta(hours=2)).isoformat() + "Z",
                "summary": "High verification error rate in user logins.",
                "description": "Session token validation checks began throwing authentication faults. Cache keys had expired without rolling renewals.",
                "rootCause": "Expired Cache Key TTL",
                "filePath": "apps/auth/redis.ts",
                "slackChannel": "#alerts-auth",
                "githubPrNumber": 412,
                "githubPrUrl": "https://github.com/sentinel-ai/repo/pull/412"
            }
        ]

    def _model_to_dict(self, model: IncidentModel) -> Dict:
        return {
            "id": model.id,
            "title": model.title,
            "severity": model.severity,
            "status": model.status,
            "service": model.service,
            "triggeredAt": model.triggeredAt,
            "updatedAt": model.updatedAt,
            "summary": model.summary,
            "description": model.description,
            "rootCause": model.rootCause,
            "filePath": model.filePath,
            "slackChannel": model.slackChannel,
            "githubPrNumber": model.githubPrNumber,
            "githubPrUrl": model.githubPrUrl,
        }

    def _sync_services_with_incidents(self):
        # Reset to baseline
        for s in self.services.values():
            s["status"] = "healthy"
            
        # Get active status
        incidents = self.get_incidents()
        for inc in incidents:
            if inc["status"] in ["active", "investigating", "mitigating"]:
                srv = inc["service"]
                if srv in self.services:
                    if inc["severity"] == "P1":
                        self.services[srv]["status"] = "down"
                    else:
                        self.services[srv]["status"] = "degraded"

    def get_services(self) -> List[Dict]:
        return list(self.services.values())

    def get_incidents(self) -> List[Dict]:
        if self.SessionLocal:
            db = self.SessionLocal()
            try:
                records = db.query(IncidentModel).all()
                return [self._model_to_dict(r) for r in records]
            finally:
                db.close()
        return self.incidents

    def get_incident(self, incident_id: str) -> Optional[Dict]:
        if self.SessionLocal:
            db = self.SessionLocal()
            try:
                record = db.query(IncidentModel).filter(IncidentModel.id == incident_id).first()
                return self._model_to_dict(record) if record else None
            finally:
                db.close()
        for inc in self.incidents:
            if inc["id"] == incident_id:
                return inc
        return None

    def update_incident_status(self, incident_id: str, status: str) -> Optional[Dict]:
        if self.SessionLocal:
            db = self.SessionLocal()
            try:
                record = db.query(IncidentModel).filter(IncidentModel.id == incident_id).first()
                if record:
                    record.status = status
                    record.updatedAt = datetime.datetime.utcnow().isoformat() + "Z"
                    db.commit()
                    updated = self._model_to_dict(record)
                    self._sync_services_with_incidents()
                    return updated
                return None
            finally:
                db.close()
        for inc in self.incidents:
            if inc["id"] == incident_id:
                inc["status"] = status
                inc["updatedAt"] = datetime.datetime.utcnow().isoformat() + "Z"
                self._sync_services_with_incidents()
                return inc
        return None

    def resolve_incident(self, incident_id: str) -> Optional[Dict]:
        if self.SessionLocal:
            db = self.SessionLocal()
            try:
                record = db.query(IncidentModel).filter(IncidentModel.id == incident_id).first()
                if record:
                    record.status = "resolved"
                    record.updatedAt = datetime.datetime.utcnow().isoformat() + "Z"
                    db.commit()
                    updated = self._model_to_dict(record)
                    
                    # Recover service status
                    srv = record.service
                    if srv in self.services:
                        self.services[srv]["status"] = "healthy"
                    self._sync_services_with_incidents()
                    return updated
                return None
            finally:
                db.close()
        for inc in self.incidents:
            if inc["id"] == incident_id:
                inc["status"] = "resolved"
                inc["updatedAt"] = datetime.datetime.utcnow().isoformat() + "Z"
                srv = inc["service"]
                if srv in self.services:
                    self.services[srv]["status"] = "healthy"
                self._sync_services_with_incidents()
                return inc
        return None

    def trigger_service_outage(self, service_name: str, severity: str = "critical") -> Dict:
        if service_name not in self.services:
            raise ValueError("Service not found")
        
        # Check active duplicate
        active_inc = None
        if self.SessionLocal:
            db = self.SessionLocal()
            try:
                active_inc = db.query(IncidentModel).filter(
                    IncidentModel.service == service_name,
                    IncidentModel.status.in_(["active", "investigating", "mitigating"])
                ).first()
                if active_inc:
                    return self._model_to_dict(active_inc)
            finally:
                db.close()
        else:
            for inc in self.incidents:
                if inc["service"] == service_name and inc["status"] in ["active", "investigating", "mitigating"]:
                    return inc

        # Generate new incident
        inc_id = f"INC-{uuid.uuid4().hex[:3].upper()}"
        new_inc = {
            "id": inc_id,
            "title": f"{service_name} Outage" if severity == "critical" else f"{service_name} Performance Degraded",
            "severity": "P1" if severity == "critical" else "P2",
            "status": "active",
            "service": service_name,
            "triggeredAt": datetime.datetime.utcnow().isoformat() + "Z",
            "updatedAt": datetime.datetime.utcnow().isoformat() + "Z",
            "summary": f"Incident triggered: {service_name} is experiencing critical threshold breaches.",
            "description": f"Manual incident escalation trigger. Service cluster {service_name} status updated to {severity}.",
            "rootCause": None,
            "filePath": None,
            "slackChannel": f"#alerts-{service_name.lower().replace(' ', '-')}",
            "githubPrNumber": None,
            "githubPrUrl": None,
        }

        if self.SessionLocal:
            db = self.SessionLocal()
            try:
                db.add(IncidentModel(**new_inc))
                db.commit()
            except Exception as e:
                db.rollback()
                raise e
            finally:
                db.close()
        else:
            self.incidents.insert(0, new_inc)

        self._sync_services_with_incidents()
        return new_inc

incident_service = IncidentService()
