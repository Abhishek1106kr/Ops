"use client";

import React from "react";
import { useServices, useIncidents } from "@/hooks/useIncidents";
import { useMetrics } from "@/hooks/useMetrics";
import { Cpu, Clock, AlertTriangle, ShieldCheck, Activity } from "lucide-react";
import MetricCard from "@/components/dashboard/MetricCard";
import CpuChart from "@/components/dashboard/CpuChart";
import ServiceHealthGrid from "@/components/dashboard/ServiceHealth";
import IncidentTable from "@/components/dashboard/IncidentTable";

export default function DashboardPage() {
  const { data: services = [], isLoading: servicesLoading } = useServices();
  const { data: incidents = [], isLoading: incidentsLoading } = useIncidents();
  const { data: metrics = [], isLoading: metricsLoading } = useMetrics();

  // Loading state
  if (servicesLoading || incidentsLoading || metricsLoading) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center gap-4 py-20">
        <div className="w-10 h-10 border-4 border-brandPurple/30 border-t-brandPurple rounded-full animate-spin"></div>
        <p className="text-sm font-semibold text-slate-400">Loading Operations Panel...</p>
      </div>
    );
  }

  // Calculate live stats from simulation
  const latestMetric = metrics[metrics.length - 1] || { cpu: 18.5, memory: 45.2, latency: 38.0, errorRate: 0.1 };
  const activeIncidents = incidents.filter((inc: any) => inc.status !== "resolved");
  const incidentCount = activeIncidents.length;

  return (
    <div className="p-8 space-y-8 flex-1">
      {/* Dashboard Header */}
      <header className="flex justify-between items-start">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-slate-100">Operations Control Center</h2>
          <p className="text-sm text-slate-400 mt-1">Real-time AI monitoring and self-healing infrastructure console</p>
        </div>
        <div className="flex items-center gap-2 text-xs font-semibold px-3 py-1.5 border border-darkBorder bg-slate-950/40 rounded-lg text-slate-400">
          <Clock className="w-4 h-4 text-brandPurple" />
          <span>Live Refetching (3s intervals)</span>
        </div>
      </header>

      {/* Grid Row 1: Metrics Overview */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricCard
          title="CPU Core Util"
          value={`${latestMetric.cpu}%`}
          change={latestMetric.cpu > 70 ? "Critical load detected" : "Operating within normal limits"}
          icon={Cpu}
          color={latestMetric.cpu > 70 ? "rose" : "purple"}
          isAlert={latestMetric.cpu > 70}
        />
        <MetricCard
          title="Average Latency"
          value={`${latestMetric.latency} ms`}
          change={latestMetric.latency > 300 ? "Severe latency overhead" : "Fast connection times"}
          icon={Activity}
          color={latestMetric.latency > 300 ? "amber" : "cyan"}
          isAlert={latestMetric.latency > 300}
        />
        <MetricCard
          title="Network Error Rate"
          value={`${latestMetric.errorRate}%`}
          change={latestMetric.errorRate > 2.0 ? "Traffic loss occurring" : "No packets dropped"}
          icon={AlertTriangle}
          color={latestMetric.errorRate > 2.0 ? "rose" : "amber"}
          isAlert={latestMetric.errorRate > 2.0}
        />
        <MetricCard
          title="Active Issues"
          value={incidentCount}
          change={incidentCount > 0 ? "AI investigations active" : "Everything is green"}
          icon={ShieldCheck}
          color={incidentCount > 0 ? "rose" : "emerald"}
          isAlert={incidentCount > 0}
        />
      </div>

      {/* Grid Row 2: Charts and Microservices */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <div className="xl:col-span-2">
          <CpuChart data={metrics} />
        </div>
        <div className="xl:col-span-1">
          <ServiceHealthGrid services={services} />
        </div>
      </div>

      {/* Grid Row 3: Live Incident Registry */}
      <div>
        <IncidentTable incidents={incidents} />
      </div>
    </div>
  );
}
