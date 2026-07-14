import random
import logging
from typing import Dict, List, Any

logger = logging.getLogger(__name__)

class VectorDBClient:
    def __init__(self, db_type: str = "chromadb", url: str = "http://localhost:8000"):
        self.db_type = db_type
        self.url = url
        self.client = None
        self.collection = None
        
    def connect_and_create_collection(self, collection_name: str = "sentinel_runbooks") -> bool:
        """
        Establishes connection with the Vector DB and provisions the target collection.
        Uses real chromadb client if installed, otherwise falls back to the simulator context.
        """
        logger.info(f"[VectorDB] Initiating connection to {self.db_type} at {self.url}...")
        try:
            import chromadb
            # Try connecting to a remote ChromaDB server via HTTP
            # e.g., url = "http://localhost:8000"
            host = self.url.replace("http://", "").replace("https://", "").split(":")[0]
            port = 8000
            if ":" in self.url.replace("http://", "").replace("https://", ""):
                port = int(self.url.split(":")[-1].replace("/", ""))
                
            self.client = chromadb.HttpClient(host=host, port=port)
            self.collection = self.client.get_or_create_collection(name=collection_name)
            logger.info(f"✅ [VectorDB] Connected successfully. Collection '{collection_name}' is provisioned.")
            return True
        except ImportError:
            logger.info("ℹ️ [VectorDB] 'chromadb' python package not found. Initiating simulator fallback mode.")
            return False
        except Exception as e:
            logger.warning(f"⚠️ [VectorDB] Failed to connect to remote server: {e}. Initiating simulator fallback mode.")
            return False

    def ingest_document(self, doc_id: str, text: str, metadata: Dict[str, Any]):
        """
        Runs document text through the embedding layer and stores it in the collection index.
        """
        # Simulated embedding layer: generates a normalized 128-dimensional vector
        embedding = [random.uniform(-1.0, 1.0) for _ in range(128)]
        # Normalize vector
        magnitude = sum(x**2 for x in embedding) ** 0.5
        embedding = [x / magnitude for x in embedding]

        if self.collection:
            try:
                # Real ChromaDB API ingestion block
                self.collection.add(
                    documents=[text],
                    metadatas=[metadata],
                    ids=[doc_id]
                )
                logger.info(f"🚀 [VectorDB] Ingested document '{doc_id}' into ChromaDB index.")
            except Exception as e:
                logger.error(f"❌ [VectorDB] Ingestion failed: {e}")
        else:
            # Simulator Output logs
            logger.info(
                f"[VectorDB Simulator] Ingested doc '{doc_id}'. "
                f"Embedding Layer generated 128-dim vector: {str(embedding[:3])[:-1]}...]"
            )

    def query_runbooks(self, query_text: str, n_results: int = 1) -> Dict[str, Any]:
        """
        Queries the vector index for semantically matching runbooks.
        """
        if self.collection:
            try:
                results = self.collection.query(
                    query_texts=[query_text],
                    n_results=n_results
                )
                return results
            except Exception as e:
                logger.error(f"❌ [VectorDB] Query execution failed: {e}")
                return {}
        else:
            # Simulator Return matching contextual telemetry suggestion
            logger.info(f"[VectorDB Simulator] Semantic query: '{query_text}'. Computing cosine-similarity...")
            return {
                "documents": [["Title: Database Latency suggestion.\nAction: Add missing composite indexes to checkout_transactions(created_at)."]],
                "metadatas": [[{"service": "Checkout API", "relevance": 0.96}]],
                "ids": [["doc-104"]]
            }

# Self-contained Demo Execution
if __name__ == "__main__":
    logging.basicConfig(level=logging.INFO)
    
    # 1. Setup client
    db = VectorDBClient(db_type="chromadb", url="http://localhost:8000")
    db.connect_and_create_collection("sentinel_runbooks")
    
    # 2. Ingest sample incident resolution documentation
    db.ingest_document(
        doc_id="runbook-checkout-latency",
        text="Incident: checkout-api timeout spike. Fix: check missing indexes on checkout_transactions database table.",
        metadata={"service": "Checkout API", "category": "database"}
    )
    
    # 3. Query the collection
    results = db.query_runbooks("latency issues in checkout database")
    print("\n[Search] Query Results matches:")
    print(results)
