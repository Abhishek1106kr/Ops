import asyncio
import datetime
import logging
from app.agents.base_agent import BaseAgent
from app.events.bus import Event
from app.events import types
from app.connectors.slack import SlackConnector

logger = logging.getLogger(__name__)

class CommunicationAgent(BaseAgent):
    NAME = "Communication Agent"
    DESCRIPTION = "Formats alerts for messaging channels (Slack, Microsoft Teams) and opens incident files."
    VERSION = "2.0"
    MODEL = "slack-formatter"
    LISTENS_TO = [types.ROOTCAUSE_GENERATED]
    PUBLISHES = [types.SLACK_POSTED]
    PROMPT_TEMPLATE = "Compose clear operational alerts summarizing reasoning path steps and links."

    async def handle(self, event: Event):
        payload = event.payload
        incident_id = payload.get("incident_id")
        service = payload.get("service", "unknown")
        root_cause = payload.get("root_cause", "Unknown")
        confidence = payload.get("confidence", 0)
        severity = payload.get("severity", "P2")
        suspect_pr = payload.get("suspect_pr")
        reasoning_steps = payload.get("reasoning_steps", [])

        logger.info(f"[{self.NAME}] Broadcasting alerts to Slack channel for {incident_id}")
        await asyncio.sleep(0.2)

        severity_emoji = ":rotating_light:" if severity == "P1" else ":warning:"
        slack_message = (
            f"{severity_emoji} *[Sentinel-AI]* Incident `{incident_id}` — *{service}*\n\n"
            f"*Severity:* `{severity}` | *Root Cause:* {root_cause} ({confidence:.0f}% confidence)\n\n"
            f"*Reasoning:*\n" +
            "\n".join(f"  • {s}" for s in reasoning_steps[:3]) +
            (f"\n\n*Suspect PR:* `#{suspect_pr}`" if suspect_pr else "") +
            f"\n\n*Console:* http://localhost:3000/incidents/{incident_id}"
        )

        jira_summary = {
            "summary": f"[{severity}] {service} — {root_cause}",
            "description": "\n".join(reasoning_steps),
            "priority": "Critical" if severity == "P1" else "High",
            "labels": ["sentinel-ai", "auto-generated", service.lower().replace(" ", "-")],
        }

        import os
        token = os.getenv("SLACK_BOT_TOKEN", "")
        connector = SlackConnector(token=token)
        channel = f"#alerts-{service.lower().replace(' ', '-')}"
        connector.post_incident_alert(channel=channel, message_text=slack_message)

        await self.publish(types.SLACK_POSTED, {
            "incident_id": incident_id,
            "channel": channel,
            "slack_message": slack_message,
            "jira_ticket": jira_summary,
            "posted_at": datetime.datetime.utcnow().isoformat() + "Z",
        })
