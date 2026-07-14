"use client";

import React from 'react';
import { Info, AlertTriangle, XCircle, CheckCircle2, GitCommit, Search, ShieldAlert } from 'lucide-react';
import { motion } from 'framer-motion';

interface TimelineEvent {
  time: string;
  event: string;
  description: string;
  level: 'info' | 'warn' | 'error' | 'success' | 'alert';
}

interface TimelineProps {
  incidentId: string;
  isResolved: boolean;
}

export default function Timeline({ incidentId, isResolved }: TimelineProps) {
  // Build the chronological timeline records from the user requirement
  const getTimelineEvents = (): TimelineEvent[] => {
    let events: TimelineEvent[] = [];

    if (incidentId === 'INC-104') {
      events = [
        { time: "11:23 AM", event: "Deployment", description: "V1.4.2 checkout transaction patch released.", level: 'info' },
        { time: "11:24 AM", event: "CPU Spike", description: "Database transaction pool connections saturated.", level: 'warn' },
        { time: "11:25 AM", event: "Errors", description: "HTTP 504 Gateway Timeouts spiked to 14.5%.", level: 'error' },
        { time: "11:26 AM", event: "AI Investigation", description: "Sentinel isolated trace logs & SQL table lock checks.", level: 'alert' },
        { time: "11:27 AM", event: "Root Cause Identified", description: "Missing DB composite index on customer status schema.", level: 'success' }
      ];
    } else {
      // General fallbacks
      events = [
        { time: "11:23 AM", event: "System Startup", description: "Monitoring endpoints registered.", level: 'info' },
        { time: "11:24 AM", event: "Anomalous Load", description: "Unusual traffic volume peak on API clusters.", level: 'warn' },
        { time: "11:25 AM", event: "Elevated Errors", description: "Auth verify endpoint response drop.", level: 'error' }
      ];
    }

    if (isResolved) {
      events.push({
        time: "11:29 AM",
        event: "Remediation Applied",
        description: "Pull request merged & composite index initialized.",
        level: 'success'
      });
    }

    return events;
  };

  const events = getTimelineEvents();

  const getIcon = (level: string) => {
    switch (level) {
      case 'info': return <GitCommit className="w-3.5 h-3.5 text-brandCyan" />;
      case 'warn': return <AlertTriangle className="w-3.5 h-3.5 text-brandAmber" />;
      case 'error': return <XCircle className="w-3.5 h-3.5 text-brandRose" />;
      case 'alert': return <Search className="w-3.5 h-3.5 text-brandPurple" />;
      case 'success': return <CheckCircle2 className="w-3.5 h-3.5 text-brandEmerald" />;
      default: return null;
    }
  };

  const getBgColor = (level: string) => {
    switch (level) {
      case 'info': return 'bg-brandCyan/10 border-brandCyan/20';
      case 'warn': return 'bg-brandAmber/10 border-brandAmber/20';
      case 'error': return 'bg-brandRose/10 border-brandRose/20';
      case 'alert': return 'bg-brandPurple/10 border-brandPurple/20';
      case 'success': return 'bg-brandEmerald/10 border-brandEmerald/20';
      default: return 'bg-slate-900 border-darkBorder';
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="glass-card p-6 rounded-2xl w-full"
    >
      <div className="flex justify-between items-center pb-4 border-b border-darkBorder/40 mb-6">
        <h3 className="font-bold text-slate-100 text-base">Investigation Timeline</h3>
        <span className="text-[10px] text-slate-500 uppercase tracking-widest font-extrabold">Trace logs</span>
      </div>

      <div className="relative pl-8 ml-2">
        {/* Draw Line animation */}
        <div className="absolute left-[3px] top-1.5 bottom-1.5 w-[2px] bg-darkBorder">
          <motion.div
            initial={{ height: '0%' }}
            animate={{ height: '100%' }}
            transition={{ duration: 1.5, ease: "easeInOut" }}
            className="w-full bg-brandPurple shadow-[0_0_8px_#4F46E5]"
          />
        </div>

        <div className="space-y-6">
          {events.map((evt, idx) => (
            <motion.div
              initial={{ opacity: 0, x: -15 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: idx * 0.3 + 0.5, duration: 0.4 }}
              key={idx}
              className="relative"
            >
              {/* Dot Icon Indicator */}
              <span className={`absolute -left-[38px] top-0.5 p-1 rounded-full border ${getBgColor(evt.level)} z-10 bg-darkBg`}>
                {getIcon(evt.level)}
              </span>
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] text-slate-500 font-bold">{evt.time}</span>
                  <span className="text-[10px] bg-slate-900 border border-darkBorder px-2 py-0.5 rounded font-semibold text-slate-350">{evt.event}</span>
                </div>
                <p className="text-xs text-slate-350 leading-relaxed font-medium">{evt.description}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </motion.div>
  );
}
