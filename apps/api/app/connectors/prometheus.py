import requests
import datetime
import random
import logging

logger = logging.getLogger(__name__)

class PrometheusConnector:
    # Class-level state cache to skip querying and prevent execution delays if offline
    _is_offline = False

    def __init__(self, prometheus_url: str):
        self.url = prometheus_url

    def get_cpu_history(self, service_name: str, duration_minutes: int = 15) -> float:
        """
        Query Prometheus TSDB for container CPU metrics.
        Instantly bypasses queries and returns mock anomalies if Prometheus is flagged offline.
        """
        if PrometheusConnector._is_offline or not self.url:
            return self._get_mock_cpu(service_name)
            
        # Standard Prometheus query structure
        query = f'sum(rate(container_cpu_usage_seconds_total{{container="{service_name}"}}[2m])) * 100' 
        
        try:
            response = requests.get(
                f"{self.url}/api/v1/query",
                params={"query": query},
                timeout=0.3  # Minimal timeout to allow instant skips
            )
            response.raise_for_status()
            res_data = response.json()
            result = res_data.get("data", {}).get("result", [])
            if result:
                return float(result[0]["value"][1])
            return 0.0
        except Exception as e:
            # Catch connection/network refusal and cache offline state
            logger.warning(f"[PrometheusConnector] Connection failed ({e}). Flagging Prometheus as offline and initiating instant mock metrics fallback.")
            PrometheusConnector._is_offline = True
            return self._get_mock_cpu(service_name)

    def _get_mock_cpu(self, service_name: str) -> float:
        """Generates realistic telemetry mock values based on targeted service incidents."""
        if service_name == "Checkout API":
            return round(random.uniform(93.4, 98.2), 2)
        return round(random.uniform(15.2, 28.6), 2)
