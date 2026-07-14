"use client";

import React, { useState, useEffect } from 'react';
import { LucideIcon } from 'lucide-react';
import { motion } from 'framer-motion';

interface MetricCardProps {
  title: string;
  value: string | number;
  change: string;
  icon: LucideIcon;
  color: 'purple' | 'cyan' | 'emerald' | 'rose' | 'amber';
  isAlert?: boolean;
}

function AnimatedNumber({ value }: { value: string | number }) {
  const str = String(value);
  const numericMatch = str.match(/^([\d.]+)(.*)$/);
  
  const [displayValue, setDisplayValue] = useState(0);
  const suffix = numericMatch ? numericMatch[2] : '';
  const targetNum = numericMatch ? parseFloat(numericMatch[1]) : 0;

  useEffect(() => {
    let startTimestamp: number | null = null;
    const duration = 1000;
    
    const step = (timestamp: number) => {
      if (!startTimestamp) startTimestamp = timestamp;
      const progress = Math.min((timestamp - startTimestamp) / duration, 1);
      const easeProgress = progress * (2 - progress); // easeOutQuad
      setDisplayValue(easeProgress * targetNum);
      
      if (progress < 1) {
        window.requestAnimationFrame(step);
      }
    };
    
    window.requestAnimationFrame(step);
  }, [targetNum]);

  const isFloat = str.includes('.');
  const formatted = isFloat ? displayValue.toFixed(1) : Math.floor(displayValue).toString();

  return <span>{formatted}{suffix}</span>;
}

export default function MetricCard({ title, value, change, icon: Icon, color, isAlert = false }: MetricCardProps) {
  const colorMap = {
    purple: 'text-brandPurple bg-brandPurple/15 border-brandPurple/30',
    cyan: 'text-brandCyan bg-brandCyan/15 border-brandCyan/30',
    emerald: 'text-brandEmerald bg-brandEmerald/15 border-brandEmerald/30',
    rose: 'text-brandRose bg-brandRose/15 border-brandRose/30',
    amber: 'text-brandAmber bg-brandAmber/15 border-brandAmber/30',
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -3 }}
      transition={{ duration: 0.3 }}
      className={`glass-card p-5 rounded-2xl flex flex-col justify-between h-36 relative overflow-hidden ${
        isAlert ? 'border-brandRose/50 shadow-[0_0_20px_rgba(239,68,68,0.15)] animate-pulse-glow' : ''
      }`}
    >
      {isAlert && (
        <div className="absolute top-0 right-0 w-16 h-16 bg-brandRose/10 blur-2xl rounded-full" />
      )}
      <div className="flex justify-between items-start">
        <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">{title}</span>
        <div className={`p-2 rounded-xl border ${colorMap[color]}`}>
          <Icon className="w-5 h-5" />
        </div>
      </div>
      <div>
        <h3 className="text-2xl font-bold tracking-tight text-slate-100">
          <AnimatedNumber value={value} />
        </h3>
        <p className={`text-xs font-medium mt-1 ${isAlert ? 'text-brandRose' : 'text-slate-400'}`}>
          {change}
        </p>
      </div>
    </motion.div>
  );
}
