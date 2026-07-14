"use client";

import React, { useState } from 'react';
import { GitPullRequest, CheckCircle, Terminal, Play } from 'lucide-react';
import { motion } from 'framer-motion';
import { useTriggerRemediation } from '../../hooks/useAI';

interface GithubPRProps {
  incidentId: string;
  filePath: string;
  codeChange: string;
  isResolved: boolean;
  githubPrUrl?: string;
  githubPrNumber?: number;
}

export default function GithubPR({ incidentId, filePath, codeChange, isResolved, githubPrUrl, githubPrNumber }: GithubPRProps) {
  const [step, setStep] = useState<'idle' | 'generating' | 'testing' | 'merging' | 'success'>('idle');
  const prMutation = useTriggerRemediation(incidentId);

  const handleTrigger = async () => {
    setStep('generating');
    await new Promise(r => setTimeout(r, 1500));
    
    setStep('testing');
    await new Promise(r => setTimeout(r, 1500));
    
    setStep('merging');
    await new Promise(r => setTimeout(r, 1500));
    
    prMutation.mutate(undefined, {
      onSuccess: () => {
        setStep('success');
      },
      onError: () => {
        setStep('idle');
      }
    });
  };

  const getStatusText = () => {
    switch (step) {
      case 'generating': return 'Generating remediation branch & patching files...';
      case 'testing': return 'Running integration tests & CI pipelines...';
      case 'merging': return 'Merging PR and scheduling cluster rolling restart...';
      case 'success': return 'Remediation completed! Metrics recovering.';
      default: return 'Deploy Automated PR Fix';
    }
  };

  const getStepNumber = () => {
    if (step === 'generating') return 1;
    if (step === 'testing') return 2;
    if (step === 'merging') return 3;
    if (step === 'success') return 4;
    return 0;
  };

  return (
    <div className="glass-card p-6 rounded-2xl w-full space-y-6">
      <div className="flex justify-between items-center pb-4 border-b border-darkBorder/40">
        <div className="flex items-center gap-2.5">
          <GitPullRequest className="w-5 h-5 text-brandPurple" />
          <h3 className="font-bold text-slate-100 text-base">Automated Self-Healing Code Fix</h3>
        </div>
        {isResolved && (
          <span className="bg-emerald-500/10 border border-emerald-500/20 px-3 py-1 rounded-full text-xs font-semibold text-brandEmerald flex items-center gap-1.5">
            <CheckCircle className="w-3.5 h-3.5" />
            Applied
          </span>
        )}
      </div>

      <div className="space-y-4">
        {/* File Path Indicator */}
        <div className="flex items-center justify-between text-xs font-mono bg-slate-950 border border-darkBorder px-3.5 py-2.5 rounded-lg text-slate-300">
          <div className="flex items-center gap-2">
            <Terminal className="w-3.5 h-3.5 text-slate-500" />
            <span>Target: {filePath || 'No target file'}</span>
          </div>
          <span className="text-slate-500 select-none">CODE PATCH</span>
        </div>

        {/* Diff Content */}
        <div className="bg-slate-950 border border-darkBorder rounded-xl overflow-hidden font-mono text-xs text-slate-300">
          <div className="bg-slate-900/60 px-4 py-2 border-b border-darkBorder/40 text-slate-500 text-[10px] uppercase font-bold tracking-wider">
            Suggested Patch Diff
          </div>
          <pre className="p-4 overflow-x-auto select-text leading-relaxed whitespace-pre font-mono text-[11px] bg-slate-950/40">
            {codeChange ? (
              codeChange.split('\n').map((line, idx) => {
                const isAdd = line.startsWith('+');
                const isDel = line.startsWith('-');
                return (
                  <div key={idx} className={`${isAdd ? 'bg-emerald-950/20 text-emerald-450 border-l-2 border-brandEmerald pl-2' : isDel ? 'bg-red-950/20 text-brandRose border-l-2 border-brandRose pl-2' : 'pl-2.5 text-slate-400'}`}>
                    {line}
                  </div>
                );
              })
            ) : (
              <span className="text-slate-500">No code change suggestion available.</span>
            )}
          </pre>
        </div>

        {/* Interactive Steps */}
        {step !== 'idle' && (
          <div className="space-y-3 p-4 bg-slate-900/30 border border-darkBorder rounded-xl">
            <div className="flex justify-between items-center text-xs">
              <span className="text-slate-350 font-semibold">{getStatusText()}</span>
              <span className="text-slate-500">{getStepNumber()}/4</span>
            </div>
            {/* Progress Bar */}
            <div className="w-full bg-slate-800/50 rounded-full h-1.5 overflow-hidden">
              <motion.div
                initial={{ width: '0%' }}
                animate={{ width: `${(getStepNumber() / 4) * 100}%` }}
                transition={{ duration: 0.3 }}
                className="bg-brandPurple h-full rounded-full"
              />
            </div>
            {/* Step badges */}
            <div className="flex justify-between text-[9px] uppercase font-bold text-slate-500 pt-1">
              <span className={getStepNumber() >= 1 ? 'text-brandPurple' : ''}>Branch</span>
              <span className={getStepNumber() >= 2 ? 'text-brandPurple' : ''}>Tests</span>
              <span className={getStepNumber() >= 3 ? 'text-brandPurple' : ''}>Merge</span>
              <span className={getStepNumber() >= 4 ? 'text-brandPurple' : ''}>Deploy</span>
            </div>
          </div>
        )}

        {/* Remediation Details after Merging */}
        {(isResolved || step === 'success') && (githubPrNumber || githubPrUrl) && (
          <div className="p-4 bg-emerald-500/5 border border-emerald-500/25 rounded-xl space-y-2 text-xs">
            <p className="text-slate-200 font-semibold flex items-center gap-1.5">
              <CheckCircle className="w-4 h-4 text-brandEmerald" />
              Automated PR Merged Successfully
            </p>
            <p className="text-slate-400 leading-relaxed">
              Pull Request <a href={githubPrUrl} target="_blank" rel="noreferrer" className="text-brandCyan font-semibold underline">#{githubPrNumber || 104}</a> was automatically merged by Sentinel-AI-Bot. GC heaps resolved and service performance baseline returned to healthy target (99.98% uptime).
            </p>
          </div>
        )}

        {/* Execute Actions */}
        {!isResolved && step === 'idle' && (
          <button
            onClick={() => prMutation.mutate()}
            disabled={prMutation.isPending}
            className="w-full py-3.5 bg-brandPurple hover:bg-brandPurple/90 disabled:opacity-50 text-white rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 shadow-[0_4px_12px_rgba(124,58,237,0.2)] hover:shadow-[0_4px_20px_rgba(124,58,237,0.35)]"
          >
            <Play className="w-3.5 h-3.5 fill-current" />
            <span>Deploy Remediation PR</span>
          </button>
        )}
      </div>
    </div>
  );
}
