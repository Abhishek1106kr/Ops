"use client";

import React from 'react';
import { BrainCircuit, CheckCircle2, ChevronRight, BarChart } from 'lucide-react';
import { motion } from 'framer-motion';
import Typewriter from '@/components/ui/Typewriter';

interface AIReasoningProps {
  rootCause: string;
  confidenceScore: number;
  reasoningSteps: string[];
  possibleTriggers: string[];
}

export default function AIReasoning({ rootCause, confidenceScore, reasoningSteps, possibleTriggers }: AIReasoningProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="glass-card p-6 rounded-2xl space-y-6 w-full"
    >
      {/* Console Header */}
      <div className="flex justify-between items-center pb-4 border-b border-darkBorder/40">
        <div className="flex items-center gap-2.5">
          <BrainCircuit className="w-5 h-5 text-brandPurple" />
          <h3 className="font-bold text-slate-100 text-base">AI Diagnostics Console</h3>
        </div>
        <div className="flex items-center gap-2 bg-brandPurple/10 border border-brandPurple/20 px-3 py-1 rounded-full text-xs font-semibold text-brandPurple">
          <span>Confidence:</span>
          <span>{confidenceScore}%</span>
        </div>
      </div>

      {/* Root Cause Card with Typewriter Effect */}
      <div className="p-4 bg-slate-950 border border-darkBorder rounded-xl space-y-2">
        <span className="text-[10px] text-slate-500 uppercase font-extrabold tracking-wider block">Isolated Root Cause</span>
        <p className="text-md font-bold text-slate-100 tracking-tight min-h-[24px]">
          <Typewriter text={rootCause || "Analyzing systems..."} delay={35} />
        </p>
      </div>

      {/* Logic Path */}
      <div className="space-y-4">
        <div>
          <h4 className="text-xs font-semibold uppercase text-slate-500 tracking-wider mb-3">Investigation Logic Path</h4>
          <div className="space-y-3">
            {reasoningSteps.map((step, idx) => (
              <motion.div
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.15 + 0.5 }}
                key={idx}
                className="flex items-start gap-2.5 text-sm text-slate-350"
              >
                <ChevronRight className="w-4 h-4 text-brandPurple shrink-0 mt-0.5" />
                <span className="leading-relaxed">{step}</span>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Triggers */}
        <div className="pt-4 border-t border-darkBorder/30">
          <h4 className="text-xs font-semibold uppercase text-slate-500 tracking-wider mb-3">Primary Trigger Factors</h4>
          <ul className="space-y-2.5">
            {possibleTriggers.map((trig, idx) => (
              <motion.li
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: idx * 0.1 + 1.2 }}
                key={idx}
                className="flex items-center gap-2.5 text-sm text-slate-300"
              >
                <CheckCircle2 className="w-4 h-4 text-brandCyan shrink-0" />
                <span>{trig}</span>
              </motion.li>
            ))}
          </ul>
        </div>
      </div>
    </motion.div>
  );
}
