"use client";

import React from 'react';
import { useIncidents } from '@/hooks/useIncidents';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import IncidentTable from '@/components/dashboard/IncidentTable';

export default function IncidentsPage() {
  const { data: incidents = [], isLoading } = useIncidents();

  if (isLoading) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center gap-4 py-20">
        <div className="w-10 h-10 border-4 border-brandPurple/30 border-t-brandPurple rounded-full animate-spin"></div>
        <p className="text-sm font-semibold text-slate-400">Loading Incidents...</p>
      </div>
    );
  }

  return (
    <div className="p-8 space-y-8 flex-1">
      <header className="flex flex-col gap-4 pb-4 border-b border-darkBorder/40">
        <div className="flex items-center gap-3">
          <Link href="/dashboard" className="p-2 border border-darkBorder bg-slate-950/40 hover:bg-slate-900 text-slate-400 hover:text-slate-100 rounded-lg transition-all">
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <span className="text-[10px] text-slate-500 uppercase font-bold tracking-wider">Operational logs / Registry</span>
        </div>
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-slate-100">System Incidents Registry</h2>
          <p className="text-xs text-slate-450 mt-1">Audit log registry of active, investigated, and remediated platform incidents</p>
        </div>
      </header>

      <div>
        <IncidentTable incidents={incidents} />
      </div>
    </div>
  );
}
