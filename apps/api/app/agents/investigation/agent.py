import asyncio
import datetime
import logging
from app.agents.base_agent import BaseAgent
from app.events.bus import Event
from app.events import types
from app.services.incident_service import incident_service
from app.services.metrics_service import metrics_service

logger = logging.getLogger(__name__)

class InvestigationAgent(BaseAgent):
    NAME = "Investigation Agent"
    DESCRIPTION = "Collects system metrics snapshots and deployment histories on incident detection."
    VERSION = "2.0"
    MODEL = "telemetry-collector"
    LISTENS_TO = [types.INCIDENT_CREATED]
    PUBLISHES = [types.INVESTIGATION_COMPLETED]
    PROMPT_TEMPLATE = "Query deployment log streams & scrape current CPU/Memory pool connection saturations."

    async def handle(self, event: Event):
        incident_id = event.payload.get("incident_id")
        service = event.payload.get("service", "unknown")

        logger.info(f"[{self.NAME}] Scoping incident telemetry logs for {incident_id}")
        metrics_snapshot, recent_deployments = await asyncio.gather(
            self._collect_metrics(service),
            self._collect_deployments(service),
        )

        incident_service.update_incident_status(incident_id, "Investigating")

        await self.publish(types.INVESTIGATION_COMPLETED, {
            "incident_id": incident_id,
            "service": service,
            "severity": event.payload.get("severity"),
            "metrics_snapshot": metrics_snapshot,
            "recent_deployments": recent_deployments,
            "collected_at": datetime.datetime.utcnow().isoformat() + "Z",
        })

    async def _collect_metrics(self, service: str) -> dict:
        await asyncio.sleep(0.3)
        latest = metrics_service.get_metrics()[-1]
        return {
            "cpu": latest["cpu"],
            "memory": latest["memory"],
            "latency": latest["latency"],
            "error_rate": latest["errorRate"],
            "service": service,
        }

    async def _collect_deployments(self, service: str) -> list:
        await asyncio.sleep(0.2)
        now = datetime.datetime.utcnow()
        return [
            {
                "sha": "a4f2c91",
                "message": "feat: add payment retry logic with exponential backoff",
                "author": "Abhi",
                "deployed_at": (now - datetime.timedelta(minutes=14)).isoformat() + "Z",
                "pr": 432,
                "service": service,
            },
            {
                "sha": "e1b8d43",
                "message": "fix: update checkout transaction timeout config",
                "author": "dev-ci-bot",
                "deployed_at": (now - datetime.timedelta(hours=6)).isoformat() + "Z",
                "pr": 428,
                "service": service,
            }
        ]
