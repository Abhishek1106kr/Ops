import asyncio
import datetime
import logging
import random
from typing import List, Dict
from app.services.incident_service import incident_service

logger = logging.getLogger(__name__)

class MetricsService:
    def __init__(self):
        self.history_size = 30
        self.metrics_history: List[Dict] = []
        self._initialize_history()

    def _initialize_history(self):
        # Build 30 historical data points ending now
        now = datetime.datetime.utcnow()
        for i in range(self.history_size, 0, -1):
            timestamp = (now - datetime.timedelta(minutes=i)).isoformat() + "Z"
            self.metrics_history.append(self._generate_point(timestamp, offset_minutes=i))

    def _generate_point(self, timestamp: str, offset_minutes: int = 0) -> Dict:
        # Check active incidents
        active_incidents = incident_service.get_incidents()
        active_critical = any(inc["severity"] == "critical" and inc["status"] in ["active", "investigating", "mitigating"] for inc in active_incidents)
        active_warning = any(inc["severity"] == "warning" and inc["status"] in ["active", "investigating", "mitigating"] for inc in active_incidents)

        # Baseline healthy values
        cpu = random.uniform(15.0, 25.0)
        memory = random.uniform(42.0, 48.0)
        latency = random.uniform(25.0, 45.0)
        error_rate = random.uniform(0.01, 0.2)

        # Apply incident scaling
        if active_critical:
            # Huge CPU spike, rising memory, high latency, high error rate
            # Add some dynamic escalation so it looks like it builds up or stays high
            cpu = random.uniform(88.0, 97.8)
            memory = random.uniform(85.0, 94.5)
            latency = random.uniform(850.0, 1420.0)
            error_rate = random.uniform(8.5, 16.4)
        elif active_warning:
            # Moderate spikes
            cpu = random.uniform(55.0, 72.0)
            memory = random.uniform(60.0, 70.0)
            latency = random.uniform(320.0, 580.0)
            error_rate = random.uniform(2.5, 5.2)

        return {
            "timestamp": timestamp,
            "cpu": round(cpu, 2),
            "memory": round(memory, 2),
            "latency": round(latency, 2),
            "errorRate": round(error_rate, 2)
        }

    def get_metrics(self) -> List[Dict]:
        # Append a new live point and shift
        now = datetime.datetime.utcnow().isoformat() + "Z"
        new_point = self._generate_point(now)
        
        self.metrics_history.append(new_point)
        if len(self.metrics_history) > self.history_size:
            self.metrics_history.pop(0)

        # Check for active critical/warning incidents to determine the service
        active_incidents = incident_service.get_incidents()
        active_critical = [
            inc for inc in active_incidents
            if inc["status"] not in ["Resolved", "resolved"]
        ]

        # Publish metric.alert event if thresholds are breached
        if new_point["cpu"] > 85.0 or new_point["errorRate"] > 5.0:
            service = active_critical[0]["service"] if active_critical else "unknown-service"
            asyncio.ensure_future(self._publish_metric_alert(new_point, service))

        return self.metrics_history

    async def _publish_metric_alert(self, point: Dict, service: str):
        try:
            # Late import to avoid circular dependency at module load
            from app.events.bus import event_bus
            from app.events import types
            await event_bus.publish(
                types.METRIC_ALERT,
                {
                    "service": service,
                    "metric": "cpu" if point["cpu"] > 85 else "error_rate",
                    "value": point["cpu"] if point["cpu"] > 85 else point["errorRate"],
                    "cpu": point["cpu"],
                    "memory": point["memory"],
                    "latency": point["latency"],
                    "error_rate": point["errorRate"],
                },
                source="metrics-service",
            )
        except Exception as e:
            logger.warning(f"[MetricsService] Failed to publish metric.alert: {e}")

metrics_service = MetricsService()
