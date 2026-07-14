# Sentinel AI Architecture Document

This document outlines the core architecture of Sentinel AI.

```mermaid
graph TD
    A[Cluster Monitor] -->|Anomalous Metrics| B(FastAPI Server)
    B -->|Trigger Incident| C{Incident Registry}
    C -->|Alert Webhook| D[Slack ChatOps]
    C -->|Expose UI| E[Next.js 15 Frontend]
    E -->|Fetch AI reasoning| F[AI Diagnostics Engine]
    F -->|Suggest Patch Code| E
    E -->|Deploy GitOps Fix| G[GitHub Service Simulator]
    G -->|Merge PR & Restart| B
```

## Core Workflows

1. **Failure Simulation**:
   - The user triggers a service outage on the React frontend.
   - The API registers a status transition (e.g., degraded or down) and inserts an incident entry.
   - The metrics engine begins injecting dynamic noise (high memory limits, connection failures, elevated timeouts) onto the metrics feed.

2. **Self-Healing Loop**:
   - The user visits the Incident details screen, which queries the AI Diagnostic Engine.
   - The engine provides structural logs showing where/why the container failed.
   - The user triggers "Deploy Remediation PR".
   - The system patches the simulated file, merges a GitHub PR, and triggers service recovery.
   - Metrics return to baseline values.
