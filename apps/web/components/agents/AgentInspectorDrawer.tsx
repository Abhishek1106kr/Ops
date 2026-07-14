"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Cpu, Clock, Terminal, ShieldAlert, Award, FileCode, CheckCircle2, ChevronRight } from "lucide-react";
import type { AgentInfo, AgentExecution } from "@/hooks/useAgents";

interface AgentInspectorDrawerProps {
  agent: AgentInfo | null;
  onClose: () => void;
}

export default function AgentInspectorDrawer({ agent, onClose }: AgentInspectorDrawerProps) {
  const [activeTab, setActiveTab] = useState<"overview" | "prompt" | "input" | "output" | "errors">("overview");

  if (!agent) return null;

  // Grab the latest execution record for the agent if available
  const latestExec: AgentExecution | null = agent.executions && agent.executions.length > 0
    ? agent.executions[agent.executions.length - 1]
    : null;

  const renderJson = (data: any) => {
    if (!data) return <span className="text-slate-500 italic">No payload available</span>;
    return (
      <pre className="p-4 bg-slate-950/60 border border-darkBorder/40 rounded-xl overflow-x-auto font-mono text-[11px] text-brandCyan leading-relaxed selection:bg-brandPurple/20 max-h-[400px]">
        {JSON.stringify(data, null, 2)}
      </pre>
    );
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-y-0 right-0 w-full md:w-[480px] bg-slate-950/95 border-l border-darkBorder z-50 shadow-[0_0_50px_rgba(0,0,0,0.8)] backdrop-blur-md flex flex-col h-full">
        {/* Header */}
        <div className="p-6 border-b border-darkBorder flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={`w-2.5 h-2.5 rounded-full ${
              agent.health === "healthy" ? "bg-brandEmerald" :
              agent.health === "running" ? "bg-brandPurple animate-pulse" : "bg-yellow-500"
            }`} />
            <div>
              <h3 className="font-bold text-slate-100 text-base">{agent.name}</h3>
              <span className="text-[10px] text-slate-500 uppercase tracking-widest font-extrabold">{agent.model}</span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg border border-darkBorder hover:bg-slate-900 transition-colors text-slate-400 hover:text-slate-100"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tabs selector */}
        <div className="flex px-4 border-b border-darkBorder/40 bg-slate-950/40 text-xs">
          {(["overview", "prompt", "input", "output", "errors"] as const).map((tab) => {
            const isActive = activeTab === tab;
            return (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-4 py-3 capitalize font-semibold transition-all relative border-b-2 ${
                  isActive ? "text-brandPurple border-brandPurple font-bold" : "text-slate-450 border-transparent hover:text-slate-200"
                }`}
              >
                {tab}
              </button>
            );
          })}
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {activeTab === "overview" && (
            <div className="space-y-6">
              {/* Health Metrics Grid */}
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 bg-slate-900/40 border border-darkBorder/40 rounded-xl space-y-1">
                  <span className="text-[10px] text-slate-500 uppercase font-bold tracking-wider">Average Latency</span>
                  <div className="flex items-baseline gap-1 text-slate-100 font-bold">
                    <Clock className="w-4 h-4 text-brandCyan shrink-0 mt-0.5" />
                    <span className="text-lg">{latestExec ? `${latestExec.latency_ms} ms` : "0 ms"}</span>
                  </div>
                </div>
                <div className="p-4 bg-slate-900/40 border border-darkBorder/40 rounded-xl space-y-1">
                  <span className="text-[10px] text-slate-500 uppercase font-bold tracking-wider">Status</span>
                  <div className="flex items-baseline gap-1 text-slate-100 font-bold">
                    <CheckCircle2 className="w-4 h-4 text-brandEmerald shrink-0 mt-0.5" />
                    <span className="text-lg uppercase text-brandEmerald text-sm leading-7">
                      {latestExec ? latestExec.status : "Idle"}
                    </span>
                  </div>
                </div>
              </div>

              {/* LLM Tokens Tracking */}
              {latestExec && latestExec.token_usage.prompt_tokens > 0 && (
                <div className="p-4 bg-slate-900/20 border border-darkBorder/30 rounded-xl space-y-4">
                  <div className="flex items-center gap-2">
                    <Award className="w-4 h-4 text-brandPurple" />
                    <span className="text-xs font-bold text-slate-200">LLM Inference Telemetry</span>
                  </div>
                  <div className="grid grid-cols-3 gap-2 text-center text-xs">
                    <div className="space-y-1">
                      <span className="text-[9px] text-slate-500 uppercase font-bold tracking-wider block">Prompt</span>
                      <span className="font-semibold text-slate-305">{latestExec.token_usage.prompt_tokens}</span>
                    </div>
                    <div className="space-y-1">
                      <span className="text-[9px] text-slate-500 uppercase font-bold tracking-wider block">Completion</span>
                      <span className="font-semibold text-slate-305">{latestExec.token_usage.completion_tokens}</span>
                    </div>
                    <div className="space-y-1">
                      <span className="text-[9px] text-slate-500 uppercase font-bold tracking-wider block">Est. Cost</span>
                      <span className="font-semibold text-brandCyan">${latestExec.token_usage.cost}</span>
                    </div>
                  </div>
                </div>
              )}

              {/* Execution History Registry */}
              <div className="space-y-3">
                <h4 className="text-xs font-bold uppercase text-slate-400 tracking-wider">Execution History Log</h4>
                {agent.executions && agent.executions.length > 0 ? (
                  <div className="space-y-2">
                    {agent.executions.slice().reverse().map((exec, idx) => (
                      <div key={exec.id + idx} className="flex items-center justify-between p-3 bg-slate-950 border border-darkBorder rounded-xl text-xs font-mono">
                        <div className="flex items-center gap-2">
                          <span className={`w-2 h-2 rounded-full ${exec.status === "success" ? "bg-brandEmerald" : "bg-brandRose"}`} />
                          <span className="text-slate-400">{exec.id}</span>
                        </div>
                        <div className="flex items-center gap-3 text-slate-500">
                          <span>{exec.latency_ms}ms</span>
                          <span>{new Date(exec.timestamp).toLocaleTimeString()}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-slate-650 italic">No executions recorded yet.</p>
                )}
              </div>
            </div>
          )}

          {activeTab === "prompt" && (
            <div className="space-y-3">
              <span className="text-[10px] text-slate-500 uppercase font-bold tracking-wider block">Active System Rules / Prompt Template</span>
              <div className="p-4 bg-slate-950/60 border border-darkBorder/40 rounded-xl font-mono text-xs text-slate-350 whitespace-pre-wrap leading-relaxed max-h-[480px] overflow-y-auto">
                {latestExec ? latestExec.prompt : "Standard rule configuration matches event hooks."}
              </div>
            </div>
          )}

          {activeTab === "input" && (
            <div className="space-y-3">
              <span className="text-[10px] text-slate-500 uppercase font-bold tracking-wider block">Input Event Payload</span>
              {latestExec ? renderJson(latestExec.input_payload) : <p className="text-xs text-slate-500 italic">No trigger payload stored.</p>}
            </div>
          )}

          {activeTab === "output" && (
            <div className="space-y-3">
              <span className="text-[10px] text-slate-500 uppercase font-bold tracking-wider block">Output Event Payload</span>
              {latestExec ? renderJson(latestExec.output_payload) : <p className="text-xs text-slate-500 italic">No published output payload stored.</p>}
            </div>
          )}

          {activeTab === "errors" && (
            <div className="space-y-3">
              <span className="text-[10px] text-slate-500 uppercase font-bold tracking-wider block">Exceptions & Errors Log</span>
              {latestExec && latestExec.errors ? (
                <div className="p-4 bg-red-950/20 border border-brandRose/30 rounded-xl flex gap-3 text-xs">
                  <ShieldAlert className="w-5 h-5 text-brandRose shrink-0 mt-0.5" />
                  <pre className="font-mono text-brandRose leading-relaxed whitespace-pre-wrap">
                    {latestExec.errors}
                  </pre>
                </div>
              ) : (
                <div className="p-4 bg-slate-950/60 border border-darkBorder/40 rounded-xl flex gap-3 text-xs text-slate-400">
                  <CheckCircle2 className="w-5 h-5 text-brandEmerald shrink-0 mt-0.5" />
                  <span>All test suites & handlers executed successfully. No exception metrics logged.</span>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </AnimatePresence>
  );
}
