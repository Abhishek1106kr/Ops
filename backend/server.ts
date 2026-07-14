import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { verifySignature } from "./integrations/github/webhooks.js";
import { startRepositoryScanner } from "./services/repositoryScanner.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 8080;
const API_BASE = process.env.SENTINEL_API_URL || "http://localhost:8000";

// Standard CORS configuration
app.use(cors());

// Capture raw body for signature validation checks
app.use(express.json({
  verify: (req: any, _res, buf) => {
    req.rawBody = buf.toString("utf8");
  }
}));

// ─── Health Check ────────────────────────────────────────────────────────────
app.get("/api/health", (_req, res) => {
  res.json({ status: "ok", service: "atomops-backend" });
});

// ─── Webhook Listener ────────────────────────────────────────────────────────
app.post("/api/github/webhook", async (req: any, res: any) => {
  const signature = req.headers["x-hub-signature-256"] as string;
  const webhookSecret = process.env.GITHUB_WEBHOOK_SECRET;

  // Verify signature if a secret key is configured
  if (webhookSecret && signature) {
    const isValid = verifySignature(signature, req.rawBody || "", webhookSecret);
    if (!isValid) {
      console.warn("⚠️ Signature verification failed for GitHub webhook event");
      return res.status(401).json({ error: "Invalid signature payload" });
    }
  }

  const githubEvent = req.headers["x-github-event"] as string;
  const payload = req.body;

  console.log(`📩 Webhook payload received from GitHub: event='${githubEvent}'`);

  try {
    let eventName = `github.${githubEvent}.received`;
    let forwardPayload: Record<string, any> = { event: githubEvent, raw: payload };

    // Format special payload events for Detection & Root Cause Agents
    if (githubEvent === "push") {
      const branch = payload.ref?.replace("refs/heads/", "") || "unknown";
      const commitSha = payload.head_commit?.id || "unknown";
      
      eventName = "github.push.received";
      forwardPayload = {
        event: "push",
        repository: payload.repository?.name || "unknown",
        branch,
        commit: commitSha,
        author: payload.head_commit?.author?.username || "unknown",
        message: payload.head_commit?.message || ""
      };
    } else if (githubEvent === "pull_request") {
      eventName = "github.pr.received";
      forwardPayload = {
        event: "pull_request",
        repository: payload.repository?.name || "unknown",
        action: payload.action || "opened",
        number: payload.pull_request?.number || 0,
        title: payload.pull_request?.title || "",
        author: payload.pull_request?.user?.login || "unknown",
        state: payload.pull_request?.state || "open"
      };
    }

    // Forward the formatted payload to the main python event bus
    const publishResponse = await fetch(`${API_BASE}/api/events/publish?event_type=${eventName}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(forwardPayload)
    });

    if (publishResponse.ok) {
      console.log(`🚀 Formatted event '${eventName}' published to central Python event bus`);
    } else {
      console.error(`❌ Failed to publish formatted event '${eventName}' to event bus`);
    }

    return res.status(200).json({ status: "processed", event: eventName });
  } catch (error: any) {
    console.error("❌ Failed to process webhook request:", error.message);
    return res.status(500).json({ error: "Internal processing error" });
  }
});

// ─── Startup ──────────────────────────────────────────────────────────────────
app.listen(PORT, () => {
  console.log(`📡 AtomOps TS Backend listening on http://localhost:${PORT}`);
  
  // Launch repository interval scanning service
  startRepositoryScanner();
});
