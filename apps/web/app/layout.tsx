import type { Metadata } from "next";
import "./globals.css";
import Providers from "./providers";
import Link from "next/link";
import { Terminal, Shield, AlertTriangle, Cpu, Settings, Activity, Bot } from "lucide-react";

export const metadata: Metadata = {
  title: "Sentinel AI | Incident Ops",
  description: "AI-Driven Incident Investigation & Automated Mitigation Dashboard",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased min-h-screen flex bg-darkBg text-slate-100">
        <Providers>
          {/* Main Container */}
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
                    <h1 className="font-bold text-lg leading-tight tracking-tight gradient-text">Sentinel AI</h1>
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

              {/* Status and Footer */}
              <div className="space-y-4">
                <div className="p-3.5 bg-slate-900/50 border border-darkBorder rounded-lg flex items-center gap-3">
                  <span className="w-2.5 h-2.5 rounded-full bg-brandEmerald animate-pulse shrink-0"></span>
                  <div>
                    <p className="text-xs font-semibold text-slate-200">Simulation Active</p>
                    <p className="text-[10px] text-slate-500">API Port: 8000</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 text-slate-600 text-[10px] font-medium px-2">
                  <Terminal className="w-3.5 h-3.5" />
                  <span>v2.0.0 (Event-Driven)</span>
                </div>
              </div>
            </aside>

            {/* Primary Main View */}
            <main className="flex-1 flex flex-col overflow-y-auto bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-slate-900/50 via-darkBg to-darkBg">
              {children}
            </main>
          </div>
        </Providers>
      </body>
    </html>
  );
}
