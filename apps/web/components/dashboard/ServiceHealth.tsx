"use client";

import React from 'react';
import { useTriggerOutage } from '@/hooks/useIncidents';
import { ServiceHealth } from '@sentinel-ai/types';
import { Server, XCircle, AlertTriangle } from 'lucide-react';

interface ServiceHealthGridProps {
  services: ServiceHealth[];
}

export default function ServiceHealthGrid({ services }: ServiceHealthGridProps) {
  const triggerMutation = useTriggerOutage();

  return (
    <div className="glass-card p-6 rounded-2xl w-full flex flex-col justify-between">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h3 className="font-bold text-slate-100 text-base">Service Cluster Health</h3>
          <p className="text-xs text-slate-400">Live operational registry and node status</p>
        </div>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-1 gap-4">
        {services.map((srv) => {
          const isHealthy = srv.status === 'healthy';
          const isDegraded = srv.status === 'degraded';
          const isDown = srv.status === 'down';

          return (
            <div key={srv.name} className="p-4 border border-darkBorder bg-slate-950/40 rounded-xl flex flex-col justify-between gap-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={`p-2.5 rounded-lg border ${
                    isHealthy ? 'text-brandEmerald border-brandEmerald/25 bg-brandEmerald/5' :
                    isDegraded ? 'text-brandAmber border-brandAmber/25 bg-brandAmber/5' :
                    'text-brandRose border-brandRose/25 bg-brandRose/5'
                  }`}>
                    <Server className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-sm font-semibold text-slate-200">{srv.name}</h4>
                    <span className="text-[10px] text-slate-500 uppercase font-semibold">{srv.type}</span>
                  </div>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className={`w-2.5 h-2.5 rounded-full ${
                    isHealthy ? 'bg-brandEmerald' : isDegraded ? 'bg-brandAmber animate-pulse' : 'bg-brandRose animate-pulse shadow-[0_0_10px_rgba(239,68,68,0.5)]'
                  }`}></span>
                  <span className={`text-xs font-semibold capitalize ${
                    isHealthy ? 'text-brandEmerald' : isDegraded ? 'text-brandAmber' : 'text-brandRose'
                  }`}>
                    {srv.status}
                  </span>
                </div>
              </div>
              <div className="flex justify-between items-center pt-2.5 border-t border-darkBorder/30">
                {isHealthy ? (
                  <div className="flex gap-2 w-full">
                    <button
                      onClick={() => triggerMutation.mutate({ service: srv.name, severity: 'warning' })}
                      className="flex-1 text-[11px] font-semibold text-brandAmber hover:bg-brandAmber/15 border border-brandAmber/20 hover:border-brandAmber/40 py-1.5 rounded-md transition-all flex items-center justify-center gap-1.5"
                    >
                      <AlertTriangle className="w-3.5 h-3.5" />
                      Degrade
                    </button>
                    <button
                      onClick={() => triggerMutation.mutate({ service: srv.name, severity: 'critical' })}
                      className="flex-1 text-[11px] font-semibold text-brandRose hover:bg-brandRose/15 border border-brandRose/20 hover:border-brandRose/40 py-1.5 rounded-md transition-all flex items-center justify-center gap-1.5"
                    >
                      <XCircle className="w-3.5 h-3.5" />
                      Kill
                    </button>
                  </div>
                ) : (
                  <span className="text-[11px] text-slate-500 italic block py-1.5 w-full text-center">
                    Investigation Panel Open
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
