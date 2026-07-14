"use client";

import React, { useState } from 'react';
import { MessageSquare, BellRing, Send, Check } from 'lucide-react';
import { motion } from 'framer-motion';

interface SlackPreviewProps {
  title: string;
  summary: string;
  severity: string;
  service: string;
  channel: string;
  incidentId: string;
}

export default function SlackPreview({ title, summary, severity, service, channel, incidentId }: SlackPreviewProps) {
  const isCritical = severity === 'P1' || severity === 'critical';
  const borderLeftColor = isCritical ? 'bg-brandRose' : 'bg-brandAmber';

  const [draftText, setDraftText] = useState(
    `:warning: *[Sentinel-AI Alert]* *${title}* \n\n*Incident ID:* \`${incidentId}\`\n*Service:* \`${service}\` | *Severity:* \`${severity}\`\n\n*Description:* ${summary}\n\n*Console link:* http://localhost:3000/incidents/${incidentId}`
  );
  
  const [isPublishing, setIsPublishing] = useState(false);
  const [publishSuccess, setPublishSuccess] = useState(false);

  const handlePublish = async () => {
    setIsPublishing(true);
    await new Promise(r => setTimeout(r, 1200));
    setIsPublishing(false);
    setPublishSuccess(true);
    setTimeout(() => setPublishSuccess(false), 2500);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="glass-card p-6 rounded-2xl w-full space-y-4"
    >
      <div className="flex items-center gap-2 pb-4 border-b border-darkBorder/40">
        <MessageSquare className="w-5 h-5 text-brandCyan" />
        <h3 className="font-bold text-slate-100 text-base">ChatOps Slack Draft</h3>
      </div>

      <div className="space-y-4">
        {/* Editor Box */}
        <div className="space-y-1.5">
          <span className="text-[10px] text-slate-500 uppercase font-extrabold tracking-wider block">Slack Message Draft</span>
          <textarea
            value={draftText}
            onChange={(e) => setDraftText(e.target.value)}
            className="w-full h-28 bg-slate-950/60 border border-darkBorder hover:border-darkBorder/80 focus:border-brandPurple focus:ring-1 focus:ring-brandPurple rounded-xl p-3 text-xs font-mono text-slate-300 resize-none outline-none transition-all"
          />
        </div>

        {/* Live Preview Box */}
        <div className="bg-slate-950 border border-darkBorder rounded-xl p-4 font-sans text-[13px] text-slate-350">
          <div className="text-[11px] text-brandCyan font-semibold mb-3 flex items-center gap-1">
            <BellRing className="w-3.5 h-3.5 animate-pulse" />
            <span>Target: {channel || '#alerts'}</span>
          </div>

          <div className="flex gap-3">
            <div className="w-9 h-9 bg-brandPurple/20 text-brandPurple border border-brandPurple/20 flex items-center justify-center rounded font-extrabold text-[12px] uppercase shrink-0 select-none">
              SA
            </div>
            <div className="space-y-1 flex-1">
              <div className="flex items-baseline gap-1.5">
                <span className="font-extrabold text-slate-100">Sentinel-AI-Bot</span>
                <span className="bg-slate-800 text-[10px] text-slate-400 font-semibold px-1 rounded select-none">APP</span>
                <span className="text-[10px] text-slate-500">12:24 PM</span>
              </div>

              {/* Slack Attachment */}
              <div className="flex border border-darkBorder rounded bg-slate-900/50 mt-1">
                <div className={`w-[4px] shrink-0 ${borderLeftColor} rounded-l`} />
                <div className="p-3 space-y-2 flex-1">
                  <div className="text-xs text-slate-300 font-mono whitespace-pre-wrap leading-relaxed">
                    {draftText.replace(/\*(.*?)\*/g, '$1').replace(/_(.*?)_/g, '$1').replace(/`(.*?)`/g, '$1')}
                  </div>
                  
                  <div className="flex gap-2 pt-1">
                    <span className="bg-brandPurple text-white px-2.5 py-1 rounded text-[11px] font-semibold cursor-pointer select-none">
                      Investigate
                    </span>
                    <span className="bg-slate-850 text-slate-300 px-2.5 py-1 rounded border border-darkBorder text-[11px] font-semibold cursor-pointer select-none">
                      Acknowledge
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Publish Action Button */}
        <button
          onClick={handlePublish}
          disabled={isPublishing}
          className="w-full py-2.5 bg-slate-900 border border-darkBorder hover:border-brandPurple/40 text-slate-300 hover:text-slate-100 disabled:opacity-50 text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-2"
        >
          {publishSuccess ? (
            <>
              <Check className="w-4 h-4 text-brandEmerald" />
              <span>Draft Published to channel!</span>
            </>
          ) : (
            <>
              <Send className={`w-3.5 h-3.5 ${isPublishing ? 'animate-bounce' : ''}`} />
              <span>{isPublishing ? 'Publishing Slack Alert...' : 'Publish Draft to Slack'}</span>
            </>
          )}
        </button>
      </div>
    </motion.div>
  );
}
