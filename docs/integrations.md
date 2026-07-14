# Sentinel AI Integration & Environments Guide

This document lists all environment variables, databases, and third-party services required to take Sentinel AI from a local sandbox simulation to a production-ready system.

---

## 💾 Database Services

To move away from in-memory mocks, Sentinel AI requires the following databases:

1. **PostgreSQL** (Core System Store)
   - **Purpose**: Stores historical incidents, user audit trails, AI reasoning reports, and resolution logs.
   - **Recommended Engine**: AWS RDS PostgreSQL or standard self-hosted PostgreSQL (v15+).

2. **Redis** (Cache & Message Queue)
   - **Purpose**: Handles user session validation, caches active Prometheus metrics queries, and acts as the messaging broker for LangGraph asynchronous agents.
   - **Recommended Engine**: AWS ElastiCache Redis or standard Redis Cluster.

---

## 📊 Observability & Cluster Integrations

To gather real-time telemetry and act on cluster state changes:

1. **Prometheus Server**
   - **Purpose**: Exposes the query API used by the FastAPI metrics service to fetch live CPU, memory, and networking stats.
   - **Connection**: HTTP GET requests to `/api/v1/query` and `/api/v1/query_range`.

2. **Grafana API**
   - **Purpose**: Synchronizes active incident markers directly on engineering Grafana dashboards (using Annotation HTTP APIs).

3. **Kubernetes API Server (kube-apiserver)**
   - **Purpose**: Queries pod trace logs (using `/api/v1/namespaces/{ns}/pods/{pod}/log`) and schedules rolling cluster restarts during auto-healing deployments.

---

## 🛠️ Third-Party Developer Tools

1. **LangGraph / LangChain API** (AI Agents orchestration)
   - **Purpose**: Coordinates multi-agent diagnostic loops (e.g. log collector agent → source code analyzer agent → index suggester agent).

2. **GitHub API (via GitHub Apps)**
   - **Purpose**: Automates git operations: checkouts, code patches, branch creations, and merging remediation PRs.

3. **Slack Webhook / Slack App Bot**
   - **Purpose**: Sends ChatOps warnings and lets developers trigger self-healing remediations directly from Slack channels.

---

## 🔑 Environment Configurations

### 1. Backend Service Configuration (`apps/api/.env`)

Create this file under the `apps/api/` folder to route to production database nodes and APIs.

```bash
# General Configurations
ENVIRONMENT=production
DEBUG=false
API_HOST=0.0.0.0
API_PORT=8000

# PostgreSQL Database Connections
DB_HOST=postgres-prod.internal.net
DB_PORT=5432
DB_NAME=sentinel_ops
DB_USER=sentinel_service
DB_PASSWORD=SecurePasswordString104

# Redis Configuration
REDIS_URL=redis://redis-cluster.internal.net:6379/0
REDIS_TTL_SECONDS=900

# Prometheus Endpoint
PROMETHEUS_URL=http://prometheus-service.monitoring.svc.cluster.local:9090

# LangGraph AI Keys
LANGCHAIN_API_KEY=lsv2_pt_abc123xyz_example
LANGCHAIN_TRACING_V2=true
LANGCHAIN_PROJECT=sentinel-incident-response
OPENAI_API_KEY=sk-proj-LLMDiagnosticKeyStringHere

# GitHub App Integration
GITHUB_APP_ID=987654
GITHUB_PRIVATE_KEY_PATH=/secrets/github_app_key.pem
GITHUB_INSTALLATION_ID=112233

# ChatOps Integration
SLACK_WEBHOOK_URL=MOCK_SLACK_WEBHOOK_URL_PLACEHOLDER
```

### 2. Frontend Configuration (`apps/web/.env.local`)

Create this file under the `apps/web/` folder to direct client-side requests to the APIs.

```bash
# Next.js Server Configurations
PORT=3000
NODE_ENV=production

# Sentinel API Gateway Route
# (Internal route for SSR, public route for client fetches)
NEXT_PUBLIC_API_URL=http://localhost:8000
INTERNAL_API_URL=http://sentinel-api-service.prod.svc.cluster.local:8000
```
