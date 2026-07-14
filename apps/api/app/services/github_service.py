import random
from typing import Dict
from app.services.incident_service import incident_service

class GithubService:
    def __init__(self):
        pass

    def create_remediation_pr(self, incident_id: str) -> Dict:
        inc = incident_service.get_incident(incident_id)
        if not inc:
            raise ValueError("Incident not found")

        # Generate mock details if not set
        pr_number = inc.get("githubPrNumber") or random.randint(110, 199)
        pr_url = inc.get("githubPrUrl") or f"https://github.com/sentinel-ai/repo/pull/{pr_number}"

        # Update incident status to mitigating/resolved
        # We'll set it to 'resolved' so the metrics return to baseline
        incident_service.resolve_incident(incident_id)
        
        # Save back the PR details in case they weren't saved
        inc["githubPrNumber"] = pr_number
        inc["githubPrUrl"] = pr_url

        return {
            "status": "success",
            "message": f"Successfully merged PR #{pr_number} and deployed the fix.",
            "prNumber": pr_number,
            "prUrl": pr_url,
            "incidentId": incident_id
        }

github_service = GithubService()
