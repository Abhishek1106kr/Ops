import logging
from slack_sdk import WebClient

logger = logging.getLogger(__name__)

class SlackConnector:
    def __init__(self, token: str):
        # Prevent blocking if token is missing, empty, or a mock placeholder
        if not token or token.strip() == "" or "xoxb-your-slack-bot-token" in token or "MOCK" in token:
            self.client = None
            logger.info("Slack bot token is not configured or is a placeholder. Slack API is running in simulation mode.")
        else:
            try:
                self.client = WebClient(token=token)
            except Exception as e:
                self.client = None
                logger.warning(f"Failed to initialize Slack client client: {e}. Slack API will run in simulation mode.")

    def post_incident_alert(self, channel: str, message_text: str, blocks: list = None) -> bool:
        """
        Posts a ChatOps notification alert to a specific Slack channel.
        Runs in simulation mode without making network calls if token is not configured.
        """
        if self.client:
            try:
                self.client.chat_postMessage(
                    channel=channel,
                    text=message_text,
                    blocks=blocks
                )
                logger.info(f"Slack alert posted successfully to {channel}")
                return True
            except Exception as e:
                logger.error(f"Failed to post Slack alert to {channel}: {e}")
                return False
        else:
            logger.info(f"[Simulation Mode] Slack alert to {channel}: {message_text}")
            return True
