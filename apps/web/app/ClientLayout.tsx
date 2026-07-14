"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "../context/AuthContext";
import { Terminal, Shield, AlertTriangle, Cpu, Settings, Activity, Bot, LogOut, User as UserIcon } from "lucide-react";

export default function ClientLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { user, signOut, loading } = useAuth();

  const isLoginPage = pathname === "/login";

  // While loading auth state, show a clean, centered loader
  if (loading) {
    return (
      <div className="min-h-screen w-full bg-slate-950 flex items-center justify-center gap-3">
        <div className="w-5 h-5 border-2 border-brandPurple border-t-transparent rounded-full animate-spin" />
        <span className="text-xs text-slate-400">Authenticating access session...</span>
      </div>
    );
  }

  // Hide sidebar layout elements on the login page
  if (isLoginPage) {
    return <>{children}</>;
  }

  return (
    <div className="flex w-full min-h-screen">
      {/* Sidebar Navigation */}
      <aside className="w-64 border-r border-darkBorder bg-slate-950/80 backdrop-blur-md p-6 flex flex-col justify-between shrink-0">
        <div className="space-y-8">
          {/* Logo */}
          <Link href="/dashboard" className="flex items-center gap-3">
            <div className="p-2 bg-brandPurple/20 border border-brandPurple/30 rounded-lg text-brandPurple">
              <Shield className="w-6 h-6" />
            </div>
            <div>
              <h1 className="font-bold text-lg leading-tight tracking-tight gradient-text font-sans">Sentinel AI</h1>
              <span className="text-[10px] text-slate-500 uppercase tracking-widest font-semibold">Incident Engine</span>
            </div>
          </Link>

          {/* Nav Links */}
          <nav className="space-y-2">
            <span className="text-[10px] uppercase font-bold text-slate-600 tracking-wider block mb-3 px-3">Monitoring</span>
            <Link href="/dashboard" className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-slate-400 hover:text-slate-100 hover:bg-slate-900 transition-colors">
              <Cpu className="w-4 h-4" />
              <span className="text-sm font-medium">Dashboard</span>
            </Link>
            <Link href="/incidents" className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-slate-400 hover:text-slate-100 hover:bg-slate-900 transition-colors">
              <AlertTriangle className="w-4 h-4" />
              <span className="text-sm font-medium">Incidents</span>
            </Link>
            <Link href="/dashboard" className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-slate-400 hover:text-slate-100 hover:bg-slate-900 transition-colors">
              <Activity className="w-4 h-4" />
              <span className="text-sm font-medium">Service Health</span>
            </Link>
            
            <span className="text-[10px] uppercase font-bold text-slate-600 tracking-wider block pt-4 mb-3 px-3">AI Agents</span>
            <Link href="/agents" className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-slate-400 hover:text-slate-100 hover:bg-slate-900 transition-colors">
              <Bot className="w-4 h-4" />
              <span className="text-sm font-medium">Agent Registry</span>
            </Link>

            <span className="text-[10px] uppercase font-bold text-slate-600 tracking-wider block pt-4 mb-3 px-3">Management</span>
            <Link href="/settings" className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-slate-400 hover:text-slate-100 hover:bg-slate-900 transition-colors">
              <Settings className="w-4 h-4" />
              <span className="text-sm font-medium">Settings</span>
            </Link>
          </nav>
        </div>

        {/* User Card & LogOut */}
        <div className="space-y-4">
          {user && (
            <div className="p-3.5 bg-slate-900/50 border border-darkBorder/60 rounded-2xl space-y-2.5">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-full bg-brandPurple/20 border border-brandPurple/30 flex items-center justify-center text-brandPurple shrink-0">
                  <UserIcon className="w-3.5 h-3.5" />
                </div>
                <div className="min-w-0">
                  <p className="text-[10px] font-bold text-slate-200 truncate">
                    {user.user_metadata?.name || user.email?.split("@")[0] || "User"}
                  </p>
                  <p className="text-[8px] text-slate-500 truncate">{user.email}</p>
                </div>
              </div>
              <button 
                onClick={signOut}
                className="w-full py-1.5 bg-slate-950 hover:bg-slate-900 border border-darkBorder/80 text-slate-400 hover:text-slate-200 text-[10px] font-bold rounded-xl transition-all flex items-center justify-center gap-1.5"
              >
                <LogOut className="w-3 h-3 text-brandRose" />
                Sign Out
              </button>
            </div>
          )}

          <div className="p-3 bg-slate-900/30 border border-darkBorder/40 rounded-xl flex items-center gap-3">
            <span className="w-2 h-2 rounded-full bg-brandEmerald animate-pulse shrink-0"></span>
            <div>
              <p className="text-[10px] font-bold text-slate-300">Database Linked</p>
              <p className="text-[8px] text-slate-500">Settings Persisted</p>
            </div>
          </div>
          <div className="flex items-center gap-2 text-slate-600 text-[9px] font-bold px-2">
            <Terminal className="w-3 h-3" />
            <span>v2.0.0 (Event-Driven)</span>
          </div>
        </div>
      </aside>

      {/* Primary Main View */}
      <main className="flex-1 flex flex-col overflow-y-auto bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-slate-900/50 via-darkBg to-darkBg">
        {children}
      </main>
    </div>
  );
}
