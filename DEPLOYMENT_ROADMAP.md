# AtomOps Production Deployment Roadmap

This deployment roadmap outlines the step-by-step phases required to transition the Sentinel AI / AtomOps platform from local simulations to a resilient, live production environment.

---

```mermaid
graph TD
    A[Supabase Provisioning] ──► B[PostgreSQL Database]
    B ──► C[Local settings sync]
    C ──► D[Next.js App Vercel]
    C ──► E[Express Webhook Render]
    C ──► F[FastAPI backend Render]
    F ──► G[Slack / Jira Connectors]
```

---

## 📅 Phase 1: Authentication & User Accounts (Supabase)

Supabase handles user sessions, logins, signups, and access token validation:

1. **Create Supabase Project**:
   * Navigate to [Supabase Console](https://supabase.com) and create a new project.
   * Grab the API keys: **Project URL** and **Anon Public Key**.

2. **Register Environment Variables**:
   Configure these parameters in your Vercel frontend environment console:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI...
   ```

3. **Configure Authentication Settings**:
   * Under Authentication > Providers, enable **Email Auth**.
   * Toggle **Confirm Email** if you want to verify user email signups.
   * Configure Redirect URLs: Add your production frontend URL (e.g., `https://atom-ops.vercel.app/dashboard`) to the Redirect URLs allowed list.

---

## 🗄️ Phase 2: Configuration & Telemetry Database (PostgreSQL)

You can use the built-in PostgreSQL database instance provided by your Supabase project (or any external RDS instance):

1. **Obtain Connection String**:
   * Go to Supabase Project > Database > Connection Strings.
   * Copy the URI connection URL (e.g. `postgresql://postgres:[password]@db.yourorg.supabase.co:5432/postgres`).

2. **Save String to Settings**:
   * Access the `/settings` page on your dashboard.
   * Paste the connection URL inside the **PostgreSQL Database Connection URL** input form.
   * Click **Save Configurations**.
   * *Outcome*: The FastAPI backend will connect, provision the `incidents` and `sentinel_settings` tables dynamically, and sync all secrets to database tables.

---

## 📡 Phase 3: GitHub Webhook Receivers & Integrations

To feed real VCS commits, pulls, and issues into the system:

1. **Deploy Express Webhook Daemon**:
   * Deploy the `backend/` directory as a web service (e.g., on Render or Railway).
   * Expose port `8080`.
   * Configure environment keys:
     ```env
     GITHUB_TOKEN=ghp_yourpersonalaccesstoken
     GITHUB_OWNER=Abhishek1106kr
     GITHUB_REPO=Client-fluxora
     GITHUB_WEBHOOK_SECRET=your_hmac_signing_secret
     ```

2. **Configure GitHub Repository Webhooks**:
   * Go to `https://github.com/Abhishek1106kr/Client-fluxora/settings/hooks`.
   * Click **Add Webhook**.
   * Payload URL: `https://your-express-service.render.com/api/events/github`.
   * Content-Type: `application/json`.
   * Secret: Paste matching `GITHUB_WEBHOOK_SECRET` string.
   * Events: Select **Let me select individual events** (choose `Pushes` and `Pull Requests`).

---

## 🚀 Phase 4: Production Deployment Hosting

We containerized the platform for clean cloud builds using Docker:

### 1. Frontend (Next.js) -> Vercel
* Connect your repository `https://github.com/Abhishek1106kr/Ops.git` to Vercel.
* Set the Root Directory to `apps/web/`.
* Configure Environment Variables:
  * `NEXT_PUBLIC_API_URL`: Your production FastAPI URL.
  * `NEXT_PUBLIC_SUPABASE_URL`: Supabase Project URL.
  * `NEXT_PUBLIC_SUPABASE_ANON_KEY`: Supabase Anon Key.
* Click **Deploy**.

### 2. Backend (FastAPI Service) -> Render / Railway
* Setup a new Web Service on Render from the repository.
* Set the build command or choose Docker build (Render detects the root-level `docker-compose.yml` or specific `Dockerfile` at `apps/api/Dockerfile`).
* Expose Port `8000`.
* Configure Environment Variables:
  * `DATABASE_URL`: Your PostgreSQL connection string.
  * (Optional) `GROQ_API_KEY`: Override the obfuscated fallback Groq key.

### 3. Webhook Scanner Daemon -> Render / Railway
* Setup a Web Service pointing to `backend/Dockerfile`.
* Expose Port `8080`.

---

## 🧪 Phase 5: Verification & Verification Pipeline

Once all three nodes are live:
1. Navigate to `/login` and sign up/in using Supabase or bypass via Guest Mode.
2. Go to `/settings` and verify database mappings are active (indicator shows `Database Linked`).
3. Commit a test fix to your target repo `Client-fluxora`.
4. Check the `/dashboard` and `/incidents` panel to see the incident trigger card spawn automatically.
