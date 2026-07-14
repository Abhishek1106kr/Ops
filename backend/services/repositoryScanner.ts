import { listPullRequests } from "../integrations/github/pulls.js";
import { listCommits } from "../integrations/github/commits.js";
import { fetchRepository } from "../integrations/github/repos.js";
import dotenv from "dotenv";

dotenv.config();

const SCAN_INTERVAL_MS = 60000; // 60 seconds
const API_BASE = process.env.SENTINEL_API_URL || "http://localhost:8000";

let scannerTimer: NodeJS.Timeout | null = null;

/**
 * Executes a single repository scan check.
 */
export async function performScan() {
  const owner = process.env.GITHUB_OWNER;
  const repo = process.env.GITHUB_REPO;

  if (!owner || !repo) {
    console.log("ℹ️ Repository Scanner: GITHUB_OWNER or GITHUB_REPO are missing. Polling skipped.");
    return;
  }

  console.log(`🔍 Repository Scanner: Checking repository changes for ${owner}/${repo}...`);

  try {
    // 1. Fetch Repository Details
    const repoDetails = await fetchRepository(owner, repo);
    
    // 2. Fetch Open PRs list
    const openPRs = await listPullRequests(owner, repo, "open");
    
    // 3. Fetch Commits list
    const recentCommits = await listCommits(owner, repo);

    console.log(`📊 Scanner results: ${openPRs.length} open PRs, ${recentCommits.length} commits parsed`);

    // Compile scanner payload block
    const scanPayload = {
      repository: repoDetails.name,
      owner: repoDetails.owner?.login,
      timestamp: new Date().toISOString(),
      open_prs: openPRs.map(pr => ({
        id: pr.id,
        number: pr.number,
        title: pr.title,
        author: pr.user?.login || "unknown",
        state: pr.state,
        created_at: pr.created_at
      })),
      commits: recentCommits.slice(0, 5).map(c => ({
        sha: c.sha,
        message: c.commit.message,
        author: c.commit.author?.name || "unknown",
        timestamp: c.commit.author?.date || ""
      }))
    };

    // Publish findings as github.poll.completed back to the Python bus
    const publishResponse = await fetch(`${API_BASE}/api/events/publish?event_type=github.poll.completed`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(scanPayload)
    });

    if (publishResponse.ok) {
      console.log("🚀 Scanner data successfully published back to Python event bus");
    } else {
      console.error("❌ Scanner failed to publish findings to event bus");
    }

  } catch (error: any) {
    console.error("❌ Repository Scanner encountered an error:", error.message);
  }
}

/**
 * Starts the repository scanner service loop.
 */
export function startRepositoryScanner() {
  if (scannerTimer) return;

  console.log("⚡ Starting repository scanning daemon...");
  
  // Run an initial scan immediately
  performScan().catch(err => console.error("Scanner startup error:", err));

  // Register interval loop
  scannerTimer = setInterval(() => {
    performScan().catch(err => console.error("Scanner interval execution error:", err));
  }, SCAN_INTERVAL_MS);
}

/**
 * Stops the repository scanner service loop.
 */
export function stopRepositoryScanner() {
  if (scannerTimer) {
    clearInterval(scannerTimer);
    scannerTimer = null;
    console.log("🛑 Repository scanning daemon stopped.");
  }
}
