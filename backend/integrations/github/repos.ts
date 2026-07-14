import { github } from "./client.js";

/**
 * Fetch general details of the target repository.
 */
export async function fetchRepository(owner: string, repo: string) {
  try {
    const response = await github.repos.get({
      owner,
      repo,
    });
    return response.data;
  } catch (error: any) {
    console.error(`Failed to fetch repository metadata for ${owner}/${repo}:`, error.message);
    throw error;
  }
}
