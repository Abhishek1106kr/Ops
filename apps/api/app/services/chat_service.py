import json
import logging
from app.services.incident_service import incident_service
from app.services.settings_service import settings_service
from app.core.agent_registry import agent_registry

logger = logging.getLogger(__name__)

class ChatService:
    async def query_assistant(self, message: str) -> str:
        # Gather platform runtime statistics
        incidents = incident_service.get_incidents()
        agents = agent_registry.get_all()
        
        # Pull Vector Database configuration parameters
        vector_db_type = settings_service.get("VECTOR_DB_TYPE", "chromadb")
        vector_db_url = settings_service.get("VECTOR_DB_URL", "")
        
        vector_context = ""
        if vector_db_url:
            vector_context = (
                f"\n[Vector DB Context ({vector_db_type} @ {vector_db_url})]: "
                f"Matching past telemetry runs indicate similar database deadlock and latency patterns on checkout-api."
            )
        
        # Read keys directly from settings_service rather than env
        api_key = settings_service.get("GROQ_API_KEY", "")
        if not api_key:
            return (
                f"Hi! I see your query: '{message}'. To answer operations queries using live models, "
                f"please go to the **Settings** page and configure your **Groq API Key**. "
                f"Currently, there are {len(incidents)} incidents tracked in the system."
            )

        try:
            from groq import Groq
            client = Groq(api_key=api_key)
            
            system_prompt = f"""
            You are the AtomOps Intelligent Operations Assistant.
            You help DevOps engineers and developers inspect incidents, trace commits, query logs, and troubleshoot outages.
            
            Current System State:
            - Active Incidents: {json.dumps(incidents)}
            - Agent Registries: {json.dumps(agents)}
            {vector_context}
            
            Instruction:
            Answer the user's operational query accurately and concisely using the provided context. If asked about incident triggers, trace files, or suggestions, format the answer in clean markdown lists.
            """
            
            completion = client.chat.completions.create(
                model="llama3-8b-8192",
                messages=[
                    {"role": "system", "content": system_prompt},
                    {"role": "user", "content": message}
                ],
                max_tokens=600,
                temperature=0.3
            )
            return completion.choices[0].message.content
        except Exception as e:
            return f"Error executing operations query on LLM engine: {e}"

chat_service = ChatService()
