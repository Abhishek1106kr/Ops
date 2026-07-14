"use client";

import React from "react";
import { motion } from "framer-motion";
import { ArrowRight, Cpu, Clock, CheckCircle, AlertCircle, Loader } from "lucide-react";
import type { AgentInfo } from "@/hooks/useAgents";

interface AgentCardProps {
  agent: AgentInfo;
  index: number;
  isSelected?: boolean;
  onClick?: () => void;
}

const EVENT_COLORS: Record<string, string> = {
  "metric.alert":               "bg-rose-500/10 text-rose-400 border-rose-500/20",
  "incident.created":           "bg-orange-500/10 text-orange-400 border-orange-500/20",
  "investigation.completed":    "bg-yellow-500/10 text-yellow-400 border-yellow-500/20",
  "github.analysis.completed":  "bg-blue-500/10 text-blue-400 border-blue-500/20",
  "logs.collected":             "bg-cyan-500/10 text-cyan-400 border-cyan-500/20",
  "rootcause.generated":        "bg-purple-500/10 text-purple-400 border-purple-500/20",
  "slack.posted":               "bg-green-500/10 text-green-400 border-green-500/20",
  "remediation.applied":        "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
};

function EventTag({ event, type }: { event: string; type: "listens" | "publishes" }) {
  const colorClass = EVENT_COLORS[event] || "bg-slate-800 text-slate-400 border-slate-700";
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full border text-[10px] font-semibold ${colorClass}`}>
      {type === "publishes" && <ArrowRight className="w-2.5 h-2.5" />}
      {event.replace(".", "·")}
    </span>
  );
}

function HealthDot({ health }: { health: AgentInfo["health"] }) {
  const config = {
    healthy:  { color: "bg-emerald-500", glow: "shadow-[0_0_6px_rgba(34,197,94,0.6)]", pulse: true },
    running:  { color: "bg-indigo-500",  glow: "shadow-[0_0_8px_#4f46e5]",             pulse: true },
    starting: { color: "bg-yellow-500",  glow: "shadow-[0_0_6px_rgba(234,179,8,0.5)]", pulse: true },
    degraded: { color: "bg-amber-500",   glow: "shadow-[0_0_6px_rgba(245,158,11,0.5)]", pulse: false },
    stopped:  { color: "bg-slate-600",   glow: "", pulse: false },
  }[health] ?? { color: "bg-slate-600", glow: "", pulse: false };

  return (
    <span
      className={`w-2.5 h-2.5 rounded-full ${config.color} ${config.glow} ${config.pulse ? "animate-pulse" : ""}`}
    />
  );
}

export default function AgentCard({ agent, index, isSelected = false, onClick }: AgentCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -2 }}
      transition={{ delay: index * 0.05, duration: 0.3 }}
      onClick={onClick}
      className={`glass-card p-5 rounded-2xl flex flex-col gap-4 cursor-pointer border transition-all ${
        isSelected
          ? "border-brandPurple bg-brandPurple/5 shadow-[0_0_15px_rgba(79,70,229,0.15)]"
          : "border-darkBorder hover:border-[#4f46e5]/40 hover:bg-slate-950/40"
      }`}
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-2.5">
          <HealthDot health={agent.health} />
          <div>
            <h3 className="text-sm font-bold text-slate-100 leading-tight">{agent.name}</h3>
            <span className="text-[10px] text-slate-500 font-semibold uppercase tracking-wider">
              v{agent.version} · {agent.model}
            </span>
          </div>
        </div>
        <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full border ${
          agent.health === "healthy"
            ? "text-brandEmerald border-brandEmerald/20 bg-brandEmerald/10"
            : agent.health === "running"
            ? "text-brandPurple border-brandPurple/20 bg-brandPurple/10"
            : agent.health === "starting"
            ? "text-amber-400 border-amber-500/20 bg-amber-500/10"
            : "text-slate-500 border-slate-700 bg-slate-800"
        }`}>
          {agent.health}
        </span>
      </div>

      {/* Description */}
      <p className="text-xs text-slate-400 leading-relaxed">{agent.description}</p>

      {/* Event subscriptions */}
      <div className="space-y-2.5">
        {agent.listens_to.length > 0 && (
          <div className="space-y-1.5">
            <span className="text-[9px] text-slate-650 font-extrabold uppercase tracking-widest">Listens to</span>
            <div className="flex flex-wrap gap-1">
              {agent.listens_to.map((e) => <EventTag key={e} event={e} type="listens" />)}
            </div>
          </div>
        )}
        {agent.publishes.length > 0 && (
          <div className="space-y-1.5">
            <span className="text-[9px] text-slate-650 font-extrabold uppercase tracking-widest">Publishes</span>
            <div className="flex flex-wrap gap-1">
              {agent.publishes.map((e) => <EventTag key={e} event={e} type="publishes" />)}
            </div>
          </div>
        )}
      </div>

      {/* Footer stats */}
      <div className="pt-3 border-t border-[#27272A] flex items-center justify-between text-[10px] text-slate-500">
        <div className="flex items-center gap-1">
          <Cpu className="w-3 h-3" />
          <span>{agent.events_processed} runs</span>
        </div>
        {agent.last_event_at ? (
          <div className="flex items-center gap-1">
            <Clock className="w-3 h-3" />
            <span>{new Date(agent.last_event_at).toLocaleTimeString()}</span>
          </div>
        ) : (
          <span className="italic">idle</span>
        )}
      </div>
    </motion.div>
  );
}
