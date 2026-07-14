import requests
import datetime

class PrometheusConnector:
    def __init__(self, prometheus_url: str):
        self.url = prometheus_url

    def get_cpu_history(self, service_name: str, duration_minutes: int = 15) -> float:
        """
        Query Prometheus TSDB for container CPU metrics.
        """
        # Query Prometheus for actual CPU metrics over the past 2 minutes
        query = f'sum(rate(container_cpu_usage_seconds_total{{container="{service_name}"}}[2m])) * 100' 
        
        try:
            response = requests.get(
                f"{self.url}/api/v1/query",
                params={"query": query},
                timeout=5
            )
            response.raise_for_status()
            res_data = response.json()
            
            # Safe traversal of the Prometheus JSON output
            result = res_data.get("data", {}).get("result", [])
            if result:
                # Value structure in Prom JSON: [timestamp, "value_string"]
                return float(result[0]["value"][1])
            return 0.0
        except Exception:
            # Fallback to zero if connection or parsing fails
            return 0.0
