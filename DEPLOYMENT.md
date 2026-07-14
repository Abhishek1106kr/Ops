# Production Deployment & Setup Guide

This guide details how to build, containerize, test, and deploy **AtomOps** (Sentinel AI) to production hosting providers (Render, Railway, Vercel) and wire it to listen to your repository: `https://github.com/Abhishek1106kr/Client-fluxora`.

---

## 🛠️ Required Environment Setup

Ensure you have a `.env` file at the root of the project with the following variables configured:

```ini
# Git VCS Integration
GITHUB_TOKEN=ghp_yourGitHubClassicAccessTokenHere
GITHUB_OWNER=Abhishek1106kr
GITHUB_REPO=Client-fluxora
GITHUB_WEBHOOK_SECRET=yourCustomWebhookSecuritySecretPass

# LLM Core Diagnostician
GROQ_API_KEY=gsk_yourGroqCloudAPIKeyPlaceholderHere

# State Database Engine
DATABASE_URL=postgresql://user:pass@localhost:5432/sentinel

# ChatOps Alerting (Optional)
SLACK_BOT_TOKEN=xoxb-your-slack-bot-token
```

---

## 🐳 Option 1: Local Container Orchestration (Docker Compose)

The easiest way to run the entire stack (FastAPI Backend, TS Webhook Client, and Next.js Dashboard) in an isolated container group is using Docker Compose:

### 1. Build and Launch
Execute the build command from the workspace root:
```bash
docker compose up --build
```

### 2. Live Services Routing
* **Next.js Dashboard**: `http://localhost:3000`
* **Python API Event Bus**: `http://localhost:8000`
* **TS Webhook Client**: `http://localhost:8080`

---

## 📡 Option 2: Live Production Hosting

### 1. Backend (Python API & TS Webhook Server) — Render or Railway

You can deploy the backend services directly from your repository using the provided **Dockerfiles**:

#### Deploying FastAPI (apps/api)
1. Register a new web service on **Render** / **Railway**.
2. Select your repository: `https://github.com/Abhishek1106kr/Ops.git`.
3. Set the **Build Context** to `apps/api` and specify `Dockerfile` as the build path.
4. Input the Environment Variables:
   - `GROQ_API_KEY`
   - `DATABASE_URL` (You can spin up a managed Postgres instance in Render/Railway).
5. Deploy.

#### Deploying Node/TS Hook Receiver (backend)
1. Register another web service.
2. Select the repository `Ops.git`.
3. Set the **Build Context** to the root folder `.` and specify `./backend/Dockerfile` as the build path.
4. Input the Environment Variables:
   - `GITHUB_TOKEN`
   - `GITHUB_OWNER=Abhishek1106kr`
   - `GITHUB_REPO=Client-fluxora`
   - `GITHUB_WEBHOOK_SECRET`
   - `SENTINEL_API_URL` (Set this to the private network domain of your FastAPI service, e.g., `http://api:8000` or its public URL).
5. Deploy.

---

### 2. Frontend (Next.js Dashboard) — Vercel

1. Import the project workspace into **Vercel**.
2. Select `apps/web` as the root directory of the application.
3. Configure the environment variables:
   - `NEXT_PUBLIC_API_URL` (Set to the public URL of your deployed Python API service).
4. Click **Deploy**.

---

## 📩 Setting Up Webhooks for `Client-fluxora`

For GitHub to push events to your local setup, you must establish an internet-accessible webhook endpoint.

### 1. Establish an ngrok Tunnel
Tunnel your local TypeScript Express backend (Port `8080`):
```bash
ngrok http 8080
```
This will print a public forwarding URL like: `https://abcd-123.ngrok-free.app`.

### 2. Configure GitHub Webhooks
1. Open the settings of your repository: [Client-fluxora Settings](https://github.com/Abhishek1106kr/Client-fluxora/settings/hooks).
2. Click **Add webhook**.
3. Set **Payload URL** to: `https://your-tunnel-subdomain.ngrok-free.app/api/github/webhook`.
4. Set **Content type** to: `application/json`.
5. Enter your `GITHUB_WEBHOOK_SECRET` value.
6. Select the events: **Push**, **Pull requests**, **Workflow runs**, and **Releases**.
7. Click **Add webhook**.

Whenever code is pushed to `Client-fluxora`, GitHub will dispatch the event metadata, triggering the `DetectionAgent` loop to start an automated triage.
