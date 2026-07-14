from typing import Dict, List, Optional

class AIService:
    def __init__(self):
        # Predefined rich AI reasoning reports for initial mock incidents
        self.reasoning_database = {
            "INC-104": {
                "incidentId": "INC-104",
                "confidenceScore": 96.0,
                "reasoningSteps": [
                    "Monitor query analyzer: sequential table scans detected on orders table during checkout customer checks.",
                    "Trace deployment logs: PR #432 'Transaction optimization filter' merged at 11:23 AM.",
                    "Identify latency spikes: Checkout API response time rose to 8.2s resulting in 504 timeouts at 11:24 AM.",
                    "Isolate query bottleneck: Missing composite index on orders(customer_id, status) where status='PENDING'."
                ],
                "possibleTriggers": [
                    "PR #432 deployment altered the checkout order query filter scope without matching indexes.",
                    "Morning shopping rush causing connection queue spikes on unindexed fields."
                ],
                "suggestedFix": {
                    "description": "Create index concurrently on orders customer_id and status columns.",
                    "filePath": "apps/checkout/db/schema.sql",
                    "codeChange": """diff
-- Migration script: Add missing index for quick orders lookup
-SELECT * FROM orders WHERE customer_id = ? AND status = 'PENDING';
+CREATE INDEX CONCURRENTLY idx_orders_customer_status 
+ON orders(customer_id, status) 
+WHERE status = 'PENDING';"""
                }
            },
            "INC-102": {
                "incidentId": "INC-102",
                "confidenceScore": 84.0,
                "reasoningSteps": [
                    "Observe verification error rate rise to 18% on User Token authorization checks.",
                    "Audit session cache states: Redis session keys are expired without roll renewals.",
                    "Identify code issue: Redis client key save command does not define a TTL parameter."
                ],
                "possibleTriggers": [
                    "Peak auth token volume renewal cycle.",
                    "Session verification cache TTL expiration."
                ],
                "suggestedFix": {
                    "description": "Define key expiration TTL of 900 seconds (15 minutes).",
                    "filePath": "apps/auth/redis.ts",
                    "codeChange": """diff
-client.set(key, val);
+client.set(key, val, { EX: 900 }); // 15 mins TTL"""
                }
            }
        }

    def get_diagnosis(self, incident_id: str) -> Dict:
        if incident_id in self.reasoning_database:
            return self.reasoning_database[incident_id]
        
        # Fallback dynamic diagnosis for custom triggered incidents
        return {
            "incidentId": incident_id,
            "confidenceScore": 76.5,
            "reasoningSteps": [
                f"Identify service status change to Down/Degraded for this service.",
                "Scan recent environment configurations and log file trace paths.",
                "Locate connection/performance abnormalities related to recent infrastructure changes."
            ],
            "possibleTriggers": [
                "Manual service configuration overwrite.",
                "Service configuration sync error."
            ],
            "suggestedFix": {
                "description": "Reset service configurations to baseline values and perform rolling restart.",
                "filePath": "config/services.yaml",
                "codeChange": """diff
-status: disabled
+status: enabled
+max_retries: 3"""
            }
        }

ai_service = AIService()
