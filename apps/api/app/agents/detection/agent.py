import logging
from app.agents.base_agent import BaseAgent
from app.events.bus import Event
from app.events import types
from app.services.incident_service import incident_service
from app.agents.detection.prompts import DETECTION_RULES

logger = logging.getLogger(__name__)

class DetectionAgent(BaseAgent):
    NAME = "Detection Agent"
    DESCRIPTION = "Monitors metrics anomalies and creates system incidents on threshold breach."
    VERSION = "2.0"
    MODEL = "threshold-rules"
    LISTENS_TO = [types.METRIC_ALERT]
    PUBLISHES = [types.INCIDENT_CREATED]
    PROMPT_TEMPLATE = DETECTION_RULES

    CPU_THRESHOLD = 85.0
    ERROR_RATE_THRESHOLD = 5.0

    async def handle(self, event: Event):
        payload = event.payload
        service = payload.get("service", "unknown")
        cpu = payload.get("cpu", 0)
        error_rate = payload.get("error_rate", 0)
        metric = payload.get("metric", "unknown")
        value = payload.get("value", 0)

        is_critical = cpu > self.CPU_THRESHOLD or error_rate > self.ERROR_RATE_THRESHOLD

        if not is_critical:
            return

        severity = "P1" if (cpu > 90 or error_rate > 10) else "P2"

        # Avoid duplicates
        existing = [
            inc for inc in incident_service.get_incidents()
            if inc["service"] == service and inc["status"] not in ["Resolved", "resolved"]
        ]
        if existing:
            logger.info(f"[{self.NAME}] Active incident already exists for {service}, skipping")
            return

        new_inc = incident_service.trigger_service_outage(service, severity)
        logger.info(f"[{self.NAME}] Incident {new_inc['id']} created for {service}")

        await self.publish(types.INCIDENT_CREATED, {
            "incident_id": new_inc["id"],
            "title": new_inc["title"],
            "service": service,
            "severity": severity,
            "trigger_metric": metric,
            "trigger_value": value,
            "cpu": cpu,
            "error_rate": error_rate,
        })
