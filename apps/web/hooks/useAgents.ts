"use client";

import { useQuery } from "@tanstack/react-query";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

export interface AgentExecution {
  id: string;
  status: "success" | "error";
  latency_ms: number;
  input_payload: any;
  output_payload: any;
  prompt: string;
  retries: number;
  token_usage: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
    cost: number;
  };
  errors: string | null;
  timestamp: string;
}

export interface AgentInfo {
  name: string;
  description: string;
  listens_to: string[];
  publishes: string[];
  version: string;
  model: string;
  health: "starting" | "healthy" | "degraded" | "stopped" | "running";
  registered_at: string;
  last_event_at: string | null;
  events_processed: number;
  executions: AgentExecution[];
}

export interface SystemAnalytics {
  total_runs: number;
  failed_runs: number;
  success_rate: number;
  avg_latency_ms: number;
  total_cost: number;
  total_tokens: number;
  backlog: number;
}

export function useAgents() {
  return useQuery<AgentInfo[]>({
    queryKey: ["agents"],
    queryFn: async () => {
      const res = await fetch(`${API_BASE}/api/agents/`);
      if (!res.ok) throw new Error("Failed to fetch agents");
      return res.json();
    },
    refetchInterval: 2000,
    staleTime: 1000,
  });
}

export function useAgentAnalytics() {
  return useQuery<SystemAnalytics>({
    queryKey: ["agent-analytics"],
    queryFn: async () => {
      const res = await fetch(`${API_BASE}/api/agents/analytics`);
      if (!res.ok) throw new Error("Failed to fetch agent analytics");
      return res.json();
    },
    refetchInterval: 2500,
    staleTime: 1500,
  });
}
