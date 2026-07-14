"use client";

import React, { useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Radio, Trash2, Wifi, WifiOff, Loader } from "lucide-react";
import { useEventStream, type BusEvent } from "@/hooks/useEventStream";

const EVENT_COLORS: Record<string, { bg: string; badge: string; dot: string }> = {
  "metric.alert":              { bg: "border-l-rose-500",    badge: "bg-rose-500/10 text-rose-400",    dot: "bg-rose-500" },
  "incident.created":          { bg: "border-l-orange-500",  badge: "bg-orange-500/10 text-orange-400", dot: "bg-orange-500" },
  "investigation.completed":   { bg: "border-l-yellow-500",  badge: "bg-yellow-500/10 text-yellow-400", dot: "bg-yellow-500" },
  "github.analysis.completed": { bg: "border-l-blue-500",    badge: "bg-blue-500/10 text-blue-400",    dot: "bg-blue-500" },
  "logs.collected":            { bg: "border-l-cyan-500",    badge: "bg-cyan-500/10 text-cyan-400",    dot: "bg-cyan-500" },
  "rootcause.generated":       { bg: "border-l-purple-500",  badge: "bg-purple-500/10 text-purple-400", dot: "bg-purple-500" },
  "slack.posted":              { bg: "border-l-green-500",   badge: "bg-green-500/10 text-green-400",  dot: "bg-green-500" },
  "remediation.applied":       { bg: "border-l-emerald-500", badge: "bg-emerald-500/10 text-emerald-400", dot: "bg-emerald-500" },
};

function EventRow({ event, index }: { event: BusEvent; index: number }) {
  const style = EVENT_COLORS[event.type] ?? {
    bg: "border-l-slate-600", badge: "bg-slate-800 text-slate-400", dot: "bg-slate-500"
  };

  const incidentId = (event.payload?.incident_id as string) || null;

  return (
    <motion.div
      initial={{ opacity: 0, x: -8 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.25 }}
      className={`flex items-start gap-3 px-3 py-2.5 border-l-2 ${style.bg} bg-slate-950/40 rounded-r-lg`}
    >
      <span className={`w-2 h-2 rounded-full ${style.dot} shrink-0 mt-1.5`} />
      <div className="flex-1 min-w-0 space-y-1">
        <div className="flex items-center gap-2 flex-wrap">
          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${style.badge}`}>
            {event.type}
          </span>
          <span className="text-[10px] text-slate-600 font-mono">from {event.source}</span>
          {incidentId && (
            <span className="text-[10px] text-indigo-400 font-semibold">{incidentId}</span>
          )}
        </div>
        <div className="text-[10px] text-slate-500 font-mono">
          {new Date(event.timestamp).toLocaleTimeString()} · id:{event.id}
        </div>
      </div>
    </motion.div>
  );
}

export default function EventStream() {
  const { events, status, clearEvents } = useEventStream(80);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to top on new events (newest first)
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = 0;
    }
  }, [events.length]);

  return (
    <div className="glass-card rounded-2xl flex flex-col h-full min-h-0">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-[#27272A]">
        <div className="flex items-center gap-2.5">
          <Radio className="w-4 h-4 text-indigo-400" />
          <h3 className="font-bold text-slate-100 text-sm">Live Event Bus</h3>
          <span className="text-[10px] text-slate-500 font-mono">{events.length} events</span>
        </div>
        <div className="flex items-center gap-2">
          {status === "connected" && (
            <span className="flex items-center gap-1 text-[10px] text-emerald-400 font-semibold">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              <Wifi className="w-3 h-3" />
              LIVE
            </span>
          )}
          {status === "connecting" && (
            <span className="flex items-center gap-1 text-[10px] text-yellow-400 font-semibold">
              <Loader className="w-3 h-3 animate-spin" />
              Connecting
            </span>
          )}
          {status === "error" && (
            <span className="flex items-center gap-1 text-[10px] text-rose-400 font-semibold">
              <WifiOff className="w-3 h-3" />
              Reconnecting
            </span>
          )}
          <button
            onClick={clearEvents}
            className="p-1 text-slate-600 hover:text-slate-400 transition-colors"
            title="Clear events"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Event List */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto p-3 space-y-1.5 min-h-0">
        <AnimatePresence initial={false}>
          {events.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 gap-3 text-center">
              <Radio className="w-8 h-8 text-slate-700" />
              <p className="text-xs text-slate-600">Waiting for events...</p>
              <p className="text-[10px] text-slate-700">
                Trigger an outage from the dashboard to see the agent chain activate
              </p>
            </div>
          ) : (
            events.map((event, i) => (
              <EventRow key={event.id + i} event={event} index={i} />
            ))
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
