import asyncio
import datetime
import uuid
from typing import Any, AsyncGenerator, Dict, List, Optional

class Event:
    def __init__(
        self,
        event_type: str,
        payload: Dict[str, Any],
        source: Optional[str] = None,
    ):
        self.id = str(uuid.uuid4())[:8]
        self.type = event_type
        self.payload = payload
        self.source = source or "system"
        self.timestamp = datetime.datetime.utcnow().isoformat() + "Z"

    def to_dict(self) -> Dict[str, Any]:
        return {
            "id": self.id,
            "type": self.type,
            "source": self.source,
            "timestamp": self.timestamp,
            "payload": self.payload,
        }

class EventBus:
    def __init__(self, history_size: int = 200):
        self._history_size = history_size
        self._history: List[Event] = []
        self._subscribers: Dict[str, List[asyncio.Queue]] = {}
        self._broadcast_queues: List[asyncio.Queue] = []
        self._lock = asyncio.Lock()

    async def publish(
        self,
        event_type: str,
        payload: Dict[str, Any],
        source: Optional[str] = None,
    ) -> Event:
        event = Event(event_type, payload, source)

        self._history.append(event)
        if len(self._history) > self._history_size:
            self._history.pop(0)

        for q in self._subscribers.get(event_type, []):
            await q.put(event)

        for q in self._broadcast_queues:
            await q.put(event)

        return event

    async def subscribe(self, event_type: str) -> AsyncGenerator[Event, None]:
        q: asyncio.Queue = asyncio.Queue()
        async with self._lock:
            self._subscribers.setdefault(event_type, []).append(q)
        try:
            while True:
                event = await q.get()
                yield event
        finally:
            async with self._lock:
                subs = self._subscribers.get(event_type, [])
                if q in subs:
                    subs.remove(q)

    async def get_broadcast_stream(self) -> AsyncGenerator[Event, None]:
        q: asyncio.Queue = asyncio.Queue()
        self._broadcast_queues.append(q)
        try:
            while True:
                event = await q.get()
                yield event
        finally:
            if q in self._broadcast_queues:
                self._broadcast_queues.remove(q)

    def get_history(self, limit: int = 50) -> List[Dict]:
        return [e.to_dict() for e in self._history[-limit:]]

    def get_history_by_type(self, event_type: str, limit: int = 20) -> List[Dict]:
        filtered = [e for e in self._history if e.type == event_type]
        return [e.to_dict() for e in filtered[-limit:]]

event_bus = EventBus()
