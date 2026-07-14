"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { Bot, Zap, RefreshCw, Play, CheckCircle2, Loader2, Circle } from "lucide-react";
import AgentCard from "@/components/agents/AgentCard";
import EventStream from "@/components/agents/EventStream";
import AgentInspectorDrawer from "@/components/agents/AgentInspectorDrawer";
import { useAgents, useAgentAnalytics } from "@/hooks/useAgents";
import { useIncidents } from "@/hooks/useIncidents";

interface FlowNode {
  id: string;
  label: string;
  status: "success" | "running" | "waiting";
}

export default function AgentsPage() {
  const { data: agents = [], isLoading, refetch } = useAgents();
  const { data: analytics } = useAgentAnalytics();
  const { data: incidents = [] } = useIncidents();
  const [selectedAgentName, setSelectedAgentName] = useState<string | null>(null);
  const [triggering, setTriggering] = useState(false);
  const [triggerSuccess, setTriggerSuccess] = useState(false);

  // Find the selected agent object
  const selectedAgent = agents.find((a) => a.name === selectedAgentName) || null;

  // Resolve the live flowchart status by looking at the latest incident state
  const latestIncident = incidents && incidents.length > 0 ? incidents[0] : null;

  const getFlowNodes = (): FlowNode[] => {
    const defaultNodes: FlowNode[] = [
      { id: "detection", label: "Detection Engine", status: "waiting" },
      { id: "investigation", label: "Metrics & Deployments", status: "waiting" },
      { id: "logs", label: "Logs Ingestion", status: "waiting" },
      { id: "github", label: "GitHub Commits", status: "waiting" },
      { id: "root_cause", label: "Root Cause Correlator", status: "waiting" },
      { id: "communication", label: "Slack ChatOps Alert", status: "waiting" },
      { id: "remediation", label: "Remediation Auto-Fix", status: "waiting" },
    ];

    if (!latestIncident) return defaultNodes;

    const status = String(latestIncident.status).toLowerCase();
    const hasCause = !!latestIncident.rootCause;

    if (status === "resolved") {
      return defaultNodes.map((n) => ({ ...n, status: "success" }));
    }

    if (status === "mitigating") {
      return defaultNodes.map((n) => {
        if (n.id === "remediation") return { ...n, status: "running" };
        return { ...n, status: "success" };
      });
    }

    if (status === "investigating" || status === "active") {
      if (hasCause) {
        return defaultNodes.map((n) => {
          if (n.id === "communication") return { ...n, status: "running" };
          if (n.id === "remediation") return { ...n, status: "running" };
          return { ...n, status: "success" };
        });
      }
      return defaultNodes.map((n) => {
        if (n.id === "detection" || n.id === "investigation") return { ...n, status: "success" };
        if (n.id === "logs" || n.id === "github") return { ...n, status: "running" };
        if (n.id === "root_cause") return { ...n, status: "waiting" };
        return { ...n, status: "waiting" };
      });
    }

    return defaultNodes;
  };

  const flowNodes = getFlowNodes();

  const triggerDemo = async () => {
    setTriggering(true);
    setTriggerSuccess(false);
    try {
      await fetch(
        "http://localhost:8000/api/events/publish?event_type=metric.alert",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            service: "Checkout API",
            metric: "cpu",
            value: 98,
            cpu: 98.0,
            memory: 87.0,
            latency: 8200.0,
            error_rate: 14.5,
          }),
        }
      );
      setTriggerSuccess(true);
      setTimeout(() => setTriggerSuccess(false), 3000);
    } catch (e) {
      console.error(e);
    } finally {
      setTriggering(false);
    }
  };

  // Compile real-time telemetry card configurations
  const stats = [
    {
      label: "Queue Backlog",
      value: analytics?.backlog ?? 0,
      desc: "Pending bus events",
      color: (analytics?.backlog ?? 0) > 0 ? "text-amber-400 animate-pulse" : "text-slate-400"
    },
    {
      label: "System Runs",
      value: analytics?.total_runs ?? 0,
      desc: "Agent steps executed",
      color: "text-brandCyan"
    },
    {
      label: "Success Rate",
      value: `${analytics?.success_rate ?? 100}%`,
      desc: "Successful executions",
      color: (analytics?.success_rate ?? 100) < 95 ? "text-brandRose animate-pulse" : "text-brandEmerald"
    },
    {
      label: "Avg Latency",
      value: `${analytics?.avg_latency_ms ?? 0}ms`,
      desc: "Inference response time",
      color: "text-brandPurple"
    },
    {
      label: "Total LLM Cost",
      value: `$${analytics?.total_cost?.toFixed(4) ?? "0.0000"}`,
      desc: "Accumulated tokens cost",
      color: "text-emerald-400"
    }
  ];

  return (
    <div className="p-8 space-y-8 flex-1 relative overflow-hidden">
      {/* Header */}
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5 mb-1">
            <Bot className="w-6 h-6 text-brandPurple" />
            <h2 className="text-2xl font-bold tracking-tight text-slate-100">AI Operations Registry</h2>
          </div>
          <p className="text-sm text-slate-400">
            {agents.length} active agents · event-driven orchestration · click an agent card to inspect trace logs
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => refetch()}
            className="p-2.5 border border-darkBorder bg-slate-950/40 hover:bg-slate-900 text-slate-400 hover:text-slate-100 rounded-lg transition-all"
            title="Refresh agents"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
          <button
            onClick={triggerDemo}
            disabled={triggering}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all ${
              triggerSuccess
                ? "bg-brandEmerald/25 border border-brandEmerald/30 text-brandEmerald"
                : "bg-brandPurple hover:bg-brandPurple/90 text-white shadow-[0_4px_14px_rgba(79,70,229,0.3)]"
            } disabled:opacity-50`}
          >
            <Play className="w-3.5 h-3.5 fill-current" />
            {triggerSuccess ? "Demo Event Sent!" : triggering ? "Triggering..." : "Simulate Outage Alert"}
          </button>
        </div>
      </header>

      {/* Real-time System Telemetry Grid */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        {stats.map((s, idx) => (
          <motion.div
            key={s.label}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.05, duration: 0.3 }}
            className="glass-card p-4 rounded-2xl flex flex-col justify-between h-24 border border-darkBorder/40 bg-slate-950/20"
          >
            <span className="text-[10px] text-slate-500 uppercase font-extrabold tracking-wider">{s.label}</span>
            <div>
              <span className={`text-lg font-bold tracking-tight block leading-tight ${s.color}`}>{s.value}</span>
              <span className="text-[9px] text-slate-600 font-bold block mt-0.5">{s.desc}</span>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Grid: Agents list + Pipeline & logs */}
      <div className="grid grid-cols-1 xl:grid-cols-4 gap-8 items-start">
        {/* Left Columns: Agents cards & Flowchart */}
        <div className="xl:col-span-3 space-y-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
            {/* Cards Column */}
            <div className="lg:col-span-2 space-y-5">
              <h3 className="text-xs font-extrabold uppercase text-slate-500 tracking-wider">Active System Agents</h3>
              {isLoading ? (
                <div className="flex items-center justify-center py-20 gap-3">
                  <Loader2 className="w-6 h-6 text-brandPurple animate-spin" />
                  <p className="text-xs text-slate-400">Syncing agent logs...</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {agents.map((agent, i) => (
                    <AgentCard
                      key={agent.name}
                      agent={agent}
                      index={i}
                      isSelected={selectedAgentName === agent.name}
                      onClick={() => setSelectedAgentName(agent.name)}
                    />
                  ))}
                </div>
              )}
            </div>

            {/* Current Investigation Flowchart */}
            <div className="lg:col-span-1 glass-card p-6 rounded-2xl space-y-6">
              <div className="border-b border-darkBorder/40 pb-3 flex items-center justify-between">
                <h3 className="text-xs font-extrabold uppercase text-slate-100 tracking-wider">Current Investigation</h3>
                {latestIncident && (
                  <span className="text-[10px] text-brandCyan font-mono font-bold uppercase">{latestIncident.id}</span>
                )}
              </div>

              <div className="relative pl-6 ml-2 space-y-6">
                {/* Visual Connector Track */}
                <div className="absolute left-[3px] top-1.5 bottom-1.5 w-[2px] bg-darkBorder/60" />

                {flowNodes.map((node) => {
                  const isSuccess = node.status === "success";
                  const isRunning = node.status === "running";

                  return (
                    <div key={node.id} className="relative flex items-center gap-3">
                      {/* Node Icon */}
                      <span className="absolute -left-[32px] top-0.5 z-10 bg-darkBg rounded-full p-0.5">
                        {isSuccess ? (
                          <CheckCircle2 className="w-4 h-4 text-brandEmerald bg-darkBg" />
                        ) : isRunning ? (
                          <Loader2 className="w-4 h-4 text-brandPurple bg-darkBg animate-spin" />
                        ) : (
                          <Circle className="w-4 h-4 text-slate-650 bg-darkBg fill-slate-900" />
                        )}
                      </span>

                      {/* Node Label */}
                      <div className="space-y-0.5">
                        <span className={`text-xs font-semibold block transition-colors ${
                          isSuccess ? "text-slate-200" :
                          isRunning ? "text-brandPurple font-bold" : "text-slate-600"
                        }`}>
                          {node.label}
                        </span>
                        <span className="text-[9px] uppercase font-bold text-slate-550 block">
                          {node.status}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Live stream log */}
        <div className="xl:col-span-1 h-[620px] flex flex-col">
          <EventStream />
        </div>
      </div>

      {/* Selection Details Slider Drawer */}
      <AgentInspectorDrawer
        agent={selectedAgent}
        onClose={() => setSelectedAgentName(null)}
      />
    </div>
  );
}
