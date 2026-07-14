import asyncio
import logging

from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api import incidents, metrics, ai, github
from app.api import events as events_router
from app.api import agents as agents_router

# Import all agents (triggers class definition + registration on instantiation)
from app.agents.detection.agent import DetectionAgent
from app.agents.investigation.agent import InvestigationAgent
from app.agents.github.agent import GithubAgent
from app.agents.logs.agent import LogsAgent
from app.agents.root_cause.agent import RootCauseAgent
from app.agents.communication.agent import CommunicationAgent
from app.agents.remediation.agent import RemediationAgent

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# ─── Lifespan: start all agents as background tasks ───────────────────────────

@asynccontextmanager
async def lifespan(app: FastAPI):
    logger.info("🚀 Sentinel AI booting — starting agent mesh...")

    agents = [
        DetectionAgent(),
        InvestigationAgent(),
        GithubAgent(),
        LogsAgent(),
        RootCauseAgent(),
        CommunicationAgent(),
        RemediationAgent(),
    ]

    # Start each agent in a background asyncio task
    tasks = [asyncio.create_task(agent.start()) for agent in agents]
    logger.info(f"✅ {len(agents)} agents registered and listening")

    yield  # App runs here

    # Graceful shutdown
    for task in tasks:
        task.cancel()
    await asyncio.gather(*tasks, return_exceptions=True)
    logger.info("🛑 All agents stopped")


# ─── App ──────────────────────────────────────────────────────────────────────

app = FastAPI(
    title="Sentinel AI — Event-Driven Incident Response",
    description=(
        "Multi-agent event bus system for autonomous incident detection, "
        "investigation, root cause analysis, and self-healing remediation."
    ),
    version="2.0.0",
    lifespan=lifespan,
)

# Enable CORS for Next.js frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "http://localhost:4000",
        "http://127.0.0.1:4000",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ─── Routers ──────────────────────────────────────────────────────────────────

app.include_router(incidents.router,     prefix="/api/incidents", tags=["incidents"])
app.include_router(metrics.router,       prefix="/api/metrics",   tags=["metrics"])
app.include_router(ai.router,            prefix="/api/ai",        tags=["ai"])
app.include_router(github.router,        prefix="/api/github",    tags=["github"])
app.include_router(events_router.router, prefix="/api/events",    tags=["events"])
app.include_router(agents_router.router, prefix="/api/agents",    tags=["agents"])


@app.get("/api/health")
def health_check():
    return {"status": "ok", "service": "sentinel-api", "version": "2.0.0"}


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app.main:app", host="0.0.0.0", port=8000, reload=True)
