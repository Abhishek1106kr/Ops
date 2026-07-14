import asyncio
import logging
from app.agents.base_agent import BaseAgent
from app.events.bus import Event
from app.events import types

logger = logging.getLogger(__name__)

class GithubAgent(BaseAgent):
    NAME = "GitHub Agent"
    DESCRIPTION = "Connects to VCS repositories to isolate commit diffs, modified files, and matching PRs."
    VERSION = "2.0"
    MODEL = "suspect-commit-finder"
    LISTENS_TO = [types.INVESTIGATION_COMPLETED]
    PUBLISHES = [types.GITHUB_ANALYSIS_COMPLETED]
    PROMPT_TEMPLATE = "Scan VCS repositories for files changed within the deployment timeline boundary."

    async def handle(self, event: Event):
        incident_id = event.payload.get("incident_id")
        service = event.payload.get("service", "unknown")
        deployments = event.payload.get("recent_deployments", [])

        logger.info(f"[{self.NAME}] Querying changed repositories file trees for {incident_id}")
        await asyncio.sleep(0.5)

        suspect_deployment = deployments[0] if deployments else None

        changed_files = [
            "apps/checkout/db/schema.sql",
            "apps/checkout/src/transaction.ts",
            "apps/checkout/src/retry.ts",
        ]

        commits_analysis = {
            "total_commits_last_24h": 8,
            "files_changed": len(changed_files),
            "high_risk_files": ["apps/checkout/db/schema.sql"],
            "suspect_pr": suspect_deployment.get("pr") if suspect_deployment else None,
            "suspect_sha": suspect_deployment.get("sha") if suspect_deployment else None,
            "suspect_message": suspect_deployment.get("message") if suspect_deployment else "unknown",
            "suspect_author": suspect_deployment.get("author") if suspect_deployment else "unknown",
            "suspect_deployed_at": suspect_deployment.get("deployed_at") if suspect_deployment else None,
        }

        await self.publish(types.GITHUB_ANALYSIS_COMPLETED, {
            "incident_id": incident_id,
            "service": service,
            "changed_files": changed_files,
            "commits_analysis": commits_analysis,
            "recent_deployments": deployments,
            "severity": event.payload.get("severity"),
            "metrics_snapshot": event.payload.get("metrics_snapshot"),
        })
