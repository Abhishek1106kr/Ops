"""
Agents API — exposes the live agent registry to the frontend.
"""

from fastapi import APIRouter, HTTPException
from app.core.agent_registry import agent_registry

router = APIRouter()


@router.get("/")
def get_all_agents():
    """Returns all registered agents with health, version, events."""
    return agent_registry.get_all()


@router.get("/analytics")
def get_analytics():
    """Returns aggregated system-wide performance and token cost analytics."""
    return agent_registry.get_analytics()


@router.get("/{agent_name}")
def get_agent(agent_name: str):
    """Returns a single agent by name."""
    agent = agent_registry.get(agent_name)
    if not agent:
        raise HTTPException(status_code=404, detail=f"Agent '{agent_name}' not found")
    return agent.to_dict()
