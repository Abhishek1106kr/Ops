import { github } from "./client.js";

/**
 * Lists pull requests on the target repository.
 */
export async function listPullRequests(owner: string, repo: string, state: "open" | "closed" | "all" = "open") {
  try {
    const response = await github.pulls.list({
      owner,
      repo,
      state,
    });
    return response.data;
  } catch (error: any) {
    console.error(`Failed to list pull requests for ${owner}/${repo}:`, error.message);
    throw error;
  }
}

/**
 * Lists the files modified in a specific pull request.
 */
export async function listPullRequestFiles(owner: string, repo: string, pullNumber: number) {
  try {
    const response = await github.pulls.listFiles({
      owner,
      repo,
      pull_number: pullNumber,
    });
    return response.data;
  } catch (error: any) {
    console.error(`Failed to list files for PR #${pullNumber} in ${owner}/${repo}:`, error.message);
    throw error;
  }
}
