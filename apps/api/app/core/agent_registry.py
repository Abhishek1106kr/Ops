"""
Agent Registry — catalog of all active agents with live execution telemetry database.
"""

import datetime
from typing import Dict, List, Optional

class AgentInfo:
    def __init__(
        self,
        name: str,
        description: str,
        listens_to: List[str],
        publishes: List[str],
        version: str = "1.0",
        model: str = "mock",
    ):
        self.name = name
        self.description = description
        self.listens_to = listens_to
        self.publishes = publishes
        self.version = version
        self.model = model
        self.health: str = "starting"
        self.registered_at = datetime.datetime.utcnow().isoformat() + "Z"
        self.last_event_at: Optional[str] = None
        self.events_processed: int = 0
        self.executions: List[Dict] = []

    def mark_healthy(self):
        self.health = "healthy"

    def mark_running(self):
        self.health = "running"

    def record_event(self):
        self.events_processed += 1
        self.last_event_at = datetime.datetime.utcnow().isoformat() + "Z"

    def add_execution(self, exec_data: Dict):
        self.executions.append({
            "id": exec_data.get("id") or datetime.datetime.utcnow().timestamp(),
            "timestamp": datetime.datetime.utcnow().isoformat() + "Z",
            **exec_data
        })
        if len(self.executions) > 30:
            self.executions.pop(0)

    def to_dict(self) -> Dict:
        return {
            "name": self.name,
            "description": self.description,
            "listens_to": self.listens_to,
            "publishes": self.publishes,
            "version": self.version,
            "model": self.model,
            "health": self.health,
            "registered_at": self.registered_at,
            "last_event_at": self.last_event_at,
            "events_processed": self.events_processed,
            "executions": self.executions
        }

class AgentRegistry:
    def __init__(self):
        self._agents: Dict[str, AgentInfo] = {}

    def register(self, agent: AgentInfo):
        self._agents[agent.name] = agent

    def get(self, name: str) -> Optional[AgentInfo]:
        return self._agents.get(name)

    def get_all(self) -> List[Dict]:
        return [a.to_dict() for a in self._agents.values()]

    def mark_healthy(self, name: str):
        if a := self._agents.get(name):
            a.mark_healthy()

    def mark_running(self, name: str):
        if a := self._agents.get(name):
            a.mark_running()

    def record_execution(self, name: str, exec_data: Dict):
        if a := self._agents.get(name):
            a.record_event()
            a.add_execution(exec_data)

    def get_analytics(self) -> Dict:
        total_runs = 0
        failed_runs = 0
        total_latency = 0.0
        latency_count = 0
        total_cost = 0.0
        total_tokens = 0
        
        for agent in self._agents.values():
            for exec_data in agent.executions:
                total_runs += 1
                if exec_data.get("status") == "error":
                    failed_runs += 1
                
                latency = exec_data.get("latency_ms", 0.0)
                if latency > 0:
                    total_latency += latency
                    latency_count += 1
                
                token_usage = exec_data.get("token_usage", {})
                total_cost += token_usage.get("cost", 0.0)
                total_tokens += token_usage.get("total_tokens", 0)

        success_rate = 100.0
        if total_runs > 0:
            success_rate = ((total_runs - failed_runs) / total_runs) * 100.0
            
        avg_latency = 0.0
        if latency_count > 0:
            avg_latency = total_latency / latency_count

        # Compute real event bus queue backlog size
        backlog = 0
        try:
            from app.events.bus import event_bus
            for subs in event_bus._subscribers.values():
                for q in subs:
                    backlog += q.qsize()
            for q in event_bus._broadcast_queues:
                backlog += q.qsize()
        except Exception:
            pass

        return {
            "total_runs": total_runs,
            "failed_runs": failed_runs,
            "success_rate": round(success_rate, 2),
            "avg_latency_ms": round(avg_latency, 2),
            "total_cost": round(total_cost, 5),
            "total_tokens": total_tokens,
            "backlog": backlog
        }

agent_registry = AgentRegistry()
