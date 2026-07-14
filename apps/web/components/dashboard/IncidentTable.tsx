"use client";

import React from 'react';
import Link from 'next/link';
import { Incident } from '@sentinel-ai/types';
import { getStatusColor, getSeverityColor, formatFullDate } from '@sentinel-ai/utils';
import { Eye, Clock, ShieldCheck } from 'lucide-react';

interface IncidentTableProps {
  incidents: Incident[];
}

export default function IncidentTable({ incidents }: IncidentTableProps) {
  return (
    <div className="glass-card p-6 rounded-2xl w-full flex flex-col justify-between">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h3 className="font-bold text-slate-100 text-base">Active & Recent Incidents</h3>
          <p className="text-xs text-slate-400">Platform incident logging history</p>
        </div>
      </div>
      
      {incidents.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 border border-dashed border-darkBorder rounded-xl">
          <ShieldCheck className="w-10 h-10 text-brandEmerald mb-2.5" />
          <p className="text-slate-300 font-semibold text-sm">System Fully Operational</p>
          <p className="text-slate-500 text-xs mt-0.5">No anomalies detected in clusters.</p>
        </div>
      ) : (
        <div className="overflow-x-auto w-full">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-darkBorder/60 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                <th className="pb-3">Incident</th>
                <th className="pb-3">Severity</th>
                <th className="pb-3">Status</th>
                <th className="pb-3">Service</th>
                <th className="pb-3">Time</th>
                <th className="pb-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-darkBorder/30">
              {incidents.map((inc) => (
                <tr key={inc.id} className="text-sm hover:bg-slate-900/10 transition-all group">
                  <td className="py-3.5 pr-3 font-semibold text-slate-200">
                    <div>
                      <p className="font-semibold text-slate-200 group-hover:text-brandPurple transition-colors">{inc.title}</p>
                      <p className="text-xs text-slate-500 font-normal line-clamp-1 mt-0.5">{inc.summary}</p>
                    </div>
                  </td>
                  <td className="py-3.5 pr-3">
                    <span className={`inline-flex items-center text-xs font-semibold px-2 py-0.5 rounded-full border ${getSeverityColor(inc.severity)}`}>
                      {inc.severity}
                    </span>
                  </td>
                  <td className="py-3.5 pr-3">
                    <span className={`inline-flex items-center text-xs font-semibold px-2 py-0.5 rounded-full border ${getStatusColor(inc.status)}`}>
                      {inc.status}
                    </span>
                  </td>
                  <td className="py-3.5 pr-3 text-slate-400 font-medium text-xs">{inc.service}</td>
                  <td className="py-3.5 pr-3 text-slate-500 text-xs">
                    <div className="flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5" />
                      <span>{formatFullDate(inc.triggeredAt)}</span>
                    </div>
                  </td>
                  <td className="py-3.5 text-right">
                    <Link
                      href={`/incidents/${inc.id}`}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-darkBorder hover:border-brandPurple/40 bg-slate-950/40 hover:bg-brandPurple/10 text-xs font-semibold text-slate-300 hover:text-brandPurple transition-all"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      Investigate
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
