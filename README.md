# Sentinel AI 🛡️

An AI-driven incident investigation and automated self-healing remediation dashboard.

## 🚀 Overview

Sentinel AI monitors cluster nodes for performance anomalies. When failures occur (e.g., container memory leaks or connection pool exhaustion), the FastAPI engine generates simulated incidents. Sentinel AI runs LLM diagnostics to analyze trace logs, determine root cause logic paths, compile suggested code diff fixes, and simulate GitOps PR releases to restore system metrics in real-time.

### Technology Stack

* **Frontend**: Next.js 15, TypeScript, Tailwind CSS, Recharts, Framer Motion, TanStack Query, Lucide Icons
* **Backend**: FastAPI, Python 3.13, Uvicorn
* **Monorepo**: pnpm workspaces

---

## 🛠️ Getting Started

### Prerequisites

* **Node.js**: v18+ (tested on v26)
* **Python**: v3.10+ (tested on v3.13)
* **pnpm**: v9+ (tested on v10)

### Installation

1. Install Node workspace dependencies:
   ```bash
   pnpm install
   ```
2. Install Python backend requirements:
   ```bash
   pip install -r apps/api/requirements.txt
   ```

### Running the Platform

Boot both Next.js and the FastAPI server concurrently with a single command from the workspace root:

```bash
pnpm dev
```

* **Dashboard Web App**: [http://localhost:3000](http://localhost:3000)
* **Simulation API**: [http://localhost:8000](http://localhost:8000)
* **Interactive API Swagger Docs**: [http://localhost:8000/docs](http://localhost:8000/docs)

---

## 📂 Project Structure

```text
sentinel-ai/
│
├── apps/
│   ├── web/           # Next.js frontend pages and dashboard components
│   └── api/           # FastAPI backend simulation logic and routing
│
├── packages/
│   ├── types/         # Shared TypeScript interfaces (Incident, MetricPoint)
│   └── utils/         # Formatting helpers (formatDate, getStatusColor)
│
├── docker/            # Deployment configuration presets (Dockerfiles, compose)
├── docs/              # User guides and design docs
└── README.md
```
