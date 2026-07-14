import github  # pip install PyGithub

class GitHubConnector:
    def __init__(self, private_key_path: str, app_id: int, installation_id: int):
        # Authenticate securely as a GitHub App
        auth = github.GithubIntegration(app_id, open(private_key_path).read())
        self.client = auth.get_gauth(installation_id)

    def get_recent_commits(self, repo_name: str, since_time: str) -> list:
        repo = self.client.get_repo(repo_name)
        commits = repo.get_commits(since=since_time)
        return [
            {
                "sha": c.sha,
                "message": c.commit.message,
                "author": c.commit.author.name,
                "changed_files": [f.filename for f in c.files]
            } for c in commits[:5]
        ]
