import { github } from "./client.js";

/**
 * Fetch list of recent commits from the repository.
 */
export async function listCommits(owner: string, repo: string, options: { sha?: string; path?: string } = {}) {
  try {
    const response = await github.repos.listCommits({
      owner,
      repo,
      ...options,
    });
    return response.data;
  } catch (error: any) {
    console.error(`Failed to list commits for ${owner}/${repo}:`, error.message);
    throw error;
  }
}
