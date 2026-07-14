import { Octokit } from "@octokit/rest";
import dotenv from "dotenv";

dotenv.config();

if (!process.env.GITHUB_TOKEN) {
  console.warn("⚠️ GITHUB_TOKEN is not defined in the environment. GitHub API integrations will run unauthenticated.");
}

export const github = new Octokit({
  auth: process.env.GITHUB_TOKEN || undefined,
});
