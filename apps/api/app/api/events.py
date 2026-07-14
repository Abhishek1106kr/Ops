"""
Events API — Server-Sent Events stream, event history, and manual publish.
"""

import asyncio
import json
from typing import Optional

from fastapi import APIRouter
from fastapi.responses import StreamingResponse

from app.events.bus import event_bus

router = APIRouter()


@router.get("/stream")
async def event_stream():
    """
    SSE endpoint. Frontend connects once and receives a real-time
    stream of all events flowing through the bus.

    Usage (JS):
      const es = new EventSource("http://localhost:8000/api/events/stream");
      es.onmessage = (e) => console.log(JSON.parse(e.data));
    """
    async def generator():
        async for event in event_bus.get_broadcast_stream():
            data = json.dumps(event.to_dict())
            yield f"data: {data}\n\n"
            await asyncio.sleep(0)  # Yield control to event loop

    return StreamingResponse(
        generator(),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "X-Accel-Buffering": "no",
            "Connection": "keep-alive",
            "Access-Control-Allow-Origin": "*",
        },
    )


@router.get("/history")
async def get_event_history(limit: int = 50, event_type: Optional[str] = None):
    """Returns last N events from the bus history log."""
    if event_type:
        return event_bus.get_history_by_type(event_type, limit)
    return event_bus.get_history(limit)


@router.post("/publish")
async def manual_publish(event_type: str, payload: dict):
    """
    Manual event injection — for testing and dashboard demo triggers.
    E.g. trigger a metric.alert to kick off the full agent chain.
    """
    event = await event_bus.publish(event_type, payload, source="manual-trigger")
    return {"status": "published", "event_id": event.id, "type": event.type}
