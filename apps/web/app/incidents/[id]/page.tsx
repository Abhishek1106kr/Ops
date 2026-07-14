"use client";

import React from 'react';
import { useIncident } from '@/hooks/useIncidents';
import { useDiagnosis } from '@/hooks/useAI';
import { useParams } from 'next/navigation';
import { ArrowLeft, ShieldAlert } from 'lucide-react';
import Link from 'next/link';
import AIReasoning from '@/components/dashboard/AIReasoning';
import SlackPreview from '@/components/dashboard/SlackPreview';
import GithubPR from '@/components/dashboard/GithubPR';
import Timeline from '@/components/dashboard/Timeline';
import { getStatusColor, getSeverityColor } from '@sentinel-ai/utils';

export default function IncidentDetailPage() {
  const params = useParams();
  const id = params.id as string;

  const { data: incident, isLoading: incidentLoading, error: incidentError } = useIncident(id);
  const { data: diagnosis, isLoading: diagnosisLoading } = useDiagnosis(id);

  if (incidentLoading || diagnosisLoading) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center gap-4 py-20">
        <div className="w-10 h-10 border-4 border-brandPurple/30 border-t-brandPurple rounded-full animate-spin"></div>
        <p className="text-sm font-semibold text-slate-400">Analyzing incident data structures...</p>
      </div>
    );
  }

  if (incidentError || !incident) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center gap-4 py-20 text-center">
        <ShieldAlert className="w-12 h-12 text-brandRose" />
        <h3 className="text-lg font-bold text-slate-200">Incident Details Not Found</h3>
        <p className="text-xs text-slate-500 max-w-sm">The incident ID requested does not exist or has expired.</p>
        <Link href="/dashboard" className="mt-4 px-4 py-2 bg-slate-900 border border-darkBorder rounded-lg text-xs font-semibold text-slate-350 hover:text-slate-100 transition-colors">
          Return to Dashboard
        </Link>
      </div>
    );
  }

  const isResolved = incident.status === 'resolved';

  return (
    <div className="p-8 space-y-8 flex-1">
      {/* Back button and page breadcrumbs */}
      <header className="flex flex-col gap-4 pb-4 border-b border-darkBorder/40">
        <div className="flex items-center gap-3">
          <Link href="/dashboard" className="p-2 border border-darkBorder bg-slate-950/40 hover:bg-slate-900 text-slate-400 hover:text-slate-100 rounded-lg transition-all">
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <span className="text-[10px] text-slate-500 uppercase font-bold tracking-wider">Incident File / {incident.id}</span>
        </div>
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div className="space-y-1.5">
            <h2 className="text-2xl font-bold text-slate-100 tracking-tight">{incident.title}</h2>
            <p className="text-xs text-slate-400 leading-relaxed max-w-3xl">{incident.description}</p>
          </div>
          <div className="flex gap-2 shrink-0">
            <span className={`inline-flex items-center text-[10px] font-bold uppercase tracking-wider px-3 py-1 rounded-full border ${getSeverityColor(incident.severity)}`}>
              Severity: {incident.severity}
            </span>
            <span className={`inline-flex items-center text-[10px] font-bold uppercase tracking-wider px-3 py-1 rounded-full border ${getStatusColor(incident.status)}`}>
              Status: {incident.status}
            </span>
          </div>
        </div>
      </header>

      {/* Grid columns */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-8 items-start">
        {/* Diagnostics & Patch */}
        <div className="space-y-8">
          {diagnosis && (
            <AIReasoning
              rootCause={incident.rootCause}
              confidenceScore={diagnosis.confidenceScore}
              reasoningSteps={diagnosis.reasoningSteps}
              possibleTriggers={diagnosis.possibleTriggers}
            />
          )}
          
          {diagnosis?.suggestedFix && (
            <GithubPR
              incidentId={incident.id}
              filePath={diagnosis.suggestedFix.filePath}
              codeChange={diagnosis.suggestedFix.codeChange}
              isResolved={isResolved}
              githubPrNumber={incident.githubPrNumber}
              githubPrUrl={incident.githubPrUrl}
            />
          )}
        </div>

        {/* Slacks & Timelines */}
        <div className="space-y-8">
          <SlackPreview
            incidentId={incident.id}
            title={incident.title}
            summary={incident.summary}
            severity={incident.severity}
            service={incident.service}
            channel={incident.slackChannel}
          />
          
          <Timeline
            incidentId={incident.id}
            isResolved={isResolved}
          />
        </div>
      </div>
    </div>
  );
}
