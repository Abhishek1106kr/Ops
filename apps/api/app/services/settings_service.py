import os
import json
from typing import Dict

CONFIG_FILE = "config.json"

class SettingsService:
    def __init__(self):
        self.settings = {
            "GITHUB_TOKEN": os.getenv("GITHUB_TOKEN", ""),
            "GITHUB_OWNER": os.getenv("GITHUB_OWNER", ""),
            "GITHUB_REPO": os.getenv("GITHUB_REPO", ""),
            "GITHUB_WEBHOOK_SECRET": os.getenv("GITHUB_WEBHOOK_SECRET", ""),
            "GROQ_API_KEY": os.getenv("GROQ_API_KEY", ""),
            "DATABASE_URL": os.getenv("DATABASE_URL", ""),
            "SLACK_BOT_TOKEN": os.getenv("SLACK_BOT_TOKEN", ""),
            "VECTOR_DB_TYPE": "chromadb",  # chromadb, pgvector, pinecone, qdrant
            "VECTOR_DB_URL": "http://localhost:8000",
            "VECTOR_DB_API_KEY": "",
        }
        self.load_settings()

    def load_settings(self):
        if os.path.exists(CONFIG_FILE):
            try:
                with open(CONFIG_FILE, "r") as f:
                    saved = json.load(f)
                    self.settings.update(saved)
            except Exception as e:
                print(f"[SettingsService] Failed to load config.json: {e}")

    def save_settings(self, new_settings: Dict) -> Dict:
        # Update settings for valid keys
        for k, v in new_settings.items():
            if k in self.settings:
                self.settings[k] = v
        try:
            with open(CONFIG_FILE, "w") as f:
                json.dump(self.settings, f, indent=2)
        except Exception as e:
            print(f"[SettingsService] Failed to save config.json: {e}")
        return self.settings

    def get(self, key: str, default: str = "") -> str:
        val = self.settings.get(key, "")
        if not val:
            val = os.getenv(key, default)
        return val

settings_service = SettingsService()
