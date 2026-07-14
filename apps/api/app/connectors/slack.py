import logging

logger = logging.getLogger(__name__)

class SlackConnector:
    def __init__(self, token: str):
        try:
            from slack_sdk import WebClient
            self.client = WebClient(token=token)
        except ImportError:
            self.client = None
            logger.warning("slack_sdk not found in Python environment. Slack API integrations will run in simulation mode.")

    def post_incident_alert(self, channel: str, message_text: str, blocks: list = None) -> bool:
        """
        Posts a ChatOps notification alert to a specific Slack channel.
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
            logger.info(f"[Simulation] Slack alert to {channel}: {message_text}")
            return True
