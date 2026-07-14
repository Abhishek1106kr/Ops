import asyncio
import datetime
import logging
import random
from app.agents.base_agent import BaseAgent
from app.events.bus import Event
from app.events import types

logger = logging.getLogger(__name__)

class LogsAgent(BaseAgent):
    NAME = "Logs Agent"
    DESCRIPTION = "Ingests system log streams to check for memory exhaustion (OOM) or query timeout patterns."
    VERSION = "2.0"
    MODEL = "log-analyzer"
    LISTENS_TO = [types.INVESTIGATION_COMPLETED]
    PUBLISHES = [types.LOGS_COLLECTED]
    PROMPT_TEMPLATE = "Scan loki/ELK logs matching trace levels of degraded container clusters."

    async def handle(self, event: Event):
        incident_id = event.payload.get("incident_id")
        service = event.payload.get("service", "unknown")
        metrics = event.payload.get("metrics_snapshot", {})

        logger.info(f"[{self.NAME}] Ingesting log streams for {incident_id}")
        await asyncio.sleep(0.4)

        now = datetime.datetime.utcnow()
        log_lines = self._generate_logs(service, now, metrics)
        anomalies = self._detect_anomalies(log_lines)

        await self.publish(types.LOGS_COLLECTED, {
            "incident_id": incident_id,
            "service": service,
            "log_count": len(log_lines),
            "log_lines": log_lines[:20],
            "anomalies": anomalies,
            "severity": event.payload.get("severity"),
            "metrics_snapshot": metrics,
            "collected_at": now.isoformat() + "Z",
        })

    def _generate_logs(self, service: str, now: datetime.datetime, metrics: dict) -> list:
        error_rate = metrics.get("error_rate", 5.0)
        latency = metrics.get("latency", 500)
        lines = []
        for i in range(25):
            ts = (now - datetime.timedelta(seconds=i * 3)).isoformat() + "Z"
            is_error = random.random() < (error_rate / 100)
            is_slow = latency > 300 and random.random() < 0.4

            if is_error:
                lines.append({
                    "timestamp": ts,
                    "level": "ERROR",
                    "message": f"[{service}] HTTP 504 Gateway Timeout — /api/checkout/transaction",
                    "trace_id": f"t-{random.randint(1000, 9999)}",
                })
            elif is_slow:
                lines.append({
                    "timestamp": ts,
                    "level": "WARN",
                    "message": f"[{service}] Slow query detected — orders table sequential scan ({int(latency)}ms)",
                    "trace_id": f"t-{random.randint(1000, 9999)}",
                })
            else:
                lines.append({
                    "timestamp": ts,
                    "level": "INFO",
                    "message": f"[{service}] Request processed in {random.randint(20, 60)}ms",
                    "trace_id": f"t-{random.randint(1000, 9999)}",
                })
        return sorted(lines, key=lambda x: x["timestamp"], reverse=True)

    def _detect_anomalies(self, log_lines: list) -> list:
        anomalies = []
        error_count = sum(1 for l in log_lines if l["level"] == "ERROR")
        warn_count = sum(1 for l in log_lines if l["level"] == "WARN")

        if error_count > 5:
            anomalies.append({
                "type": "error_spike",
                "description": f"High error rate: {error_count} errors in last 75 seconds",
                "severity": "critical",
            })
        if warn_count > 3:
            anomalies.append({
                "type": "slow_query",
                "description": f"Sequential table scans detected: {warn_count} slow query warnings",
                "severity": "warning",
            })
        return anomalies
