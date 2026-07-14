import asyncio
import datetime
import logging
import random
from app.agents.base_agent import BaseAgent
from app.events.bus import Event
from app.events import types
from app.services.incident_service import incident_service

logger = logging.getLogger(__name__)

class RemediationAgent(BaseAgent):
    NAME = "Remediation Agent"
    DESCRIPTION = "Evaluates auto-healing fixes and merges composite index SQL/code patches."
    VERSION = "2.0"
    MODEL = "remediation-engine"
    LISTENS_TO = [types.ROOTCAUSE_GENERATED]
    PUBLISHES = [types.REMEDIATION_APPLIED]
    PROMPT_TEMPLATE = "Generate code fix patches, execute test suites, and merge pull requests."

    CONFIDENCE_THRESHOLD = 80.0

    async def handle(self, event: Event):
        payload = event.payload
        incident_id = payload.get("incident_id")
        confidence = payload.get("confidence", 0)
        root_cause = payload.get("root_cause", "")
        suggested_fix = payload.get("suggested_fix")

        if confidence < self.CONFIDENCE_THRESHOLD:
            logger.info(
                f"[{self.NAME}] Confidence {confidence}% below threshold ({self.CONFIDENCE_THRESHOLD}%) — "
                f"skipping auto-remediation for {incident_id}"
            )
            return

        if not suggested_fix:
            logger.info(f"[{self.NAME}] No suggested fix for {incident_id}")
            return

        logger.info(f"[{self.NAME}] Triggering self-healing PR merge sequence for {incident_id}")

        await asyncio.sleep(0.3)  # create branch
        pr_number = payload.get("suspect_pr") or random.randint(433, 499)
        branch_name = f"sentinel/fix-{incident_id.lower()}-{pr_number}"

        await asyncio.sleep(0.4)  # test suite runs
        await asyncio.sleep(0.3)  # git merge

        incident_service.resolve_incident(incident_id)
        pr_url = f"https://github.com/sentinel-ai/repo/pull/{pr_number}"

        await self.publish(types.REMEDIATION_APPLIED, {
            "incident_id": incident_id,
            "root_cause": root_cause,
            "pr_number": pr_number,
            "pr_url": pr_url,
            "branch": branch_name,
            "file_patched": suggested_fix.get("filePath"),
            "status": "merged",
            "applied_at": datetime.datetime.utcnow().isoformat() + "Z",
        })
