DETECTION_RULES = """
System Rules: Detection Agent (Threshold Engine)
==============================================
- Input Event: metric.alert
- Trigger logic:
    If cpu > 85.0% OR error_rate > 5.0% -> escalate to Incident
- Severity Logic:
    If cpu > 90.0% OR error_rate > 10.0% -> Severity = "P1"
    Else -> Severity = "P2"
"""
