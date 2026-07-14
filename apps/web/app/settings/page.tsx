"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Settings, Key, Database, MessageSquare, Send, 
  HelpCircle, CheckCircle, RefreshCw, AlertTriangle
} from "lucide-react";

interface SettingsState {
  GITHUB_TOKEN: string;
  GITHUB_OWNER: string;
  GITHUB_REPO: string;
  GITHUB_WEBHOOK_SECRET: string;
  GROQ_API_KEY: string;
  DATABASE_URL: string;
  SLACK_BOT_TOKEN: string;
  JIRA_URL: string;
  JIRA_EMAIL: string;
  JIRA_API_TOKEN: string;
  VECTOR_DB_TYPE: string;
  VECTOR_DB_URL: string;
  VECTOR_DB_API_KEY: string;
}

interface ChatMessage {
  sender: "user" | "assistant";
  text: string;
}

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

export default function SettingsPage() {
  // Settings Form State
  const [settings, setSettings] = useState<SettingsState>({
    GITHUB_TOKEN: "",
    GITHUB_OWNER: "",
    GITHUB_REPO: "",
    GITHUB_WEBHOOK_SECRET: "",
    GROQ_API_KEY: "",
    DATABASE_URL: "",
    SLACK_BOT_TOKEN: "",
    JIRA_URL: "",
    JIRA_EMAIL: "",
    JIRA_API_TOKEN: "",
    VECTOR_DB_TYPE: "chromadb",
    VECTOR_DB_URL: "",
    VECTOR_DB_API_KEY: "",
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState<"idle" | "success" | "error">("idle");

  // Chat State
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([
    {
      sender: "assistant",
      text: "Hello! I am your Intelligent Ops Assistant. Ask me anything about incident statuses, recent code commits, or agent health. (If vector databases are linked, I'll scan the context automatically!)",
    },
  ]);
  const [userInput, setUserInput] = useState("");
  const [sendingMsg, setSendingMsg] = useState(false);

  // Load Settings on Mount
  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/api/settings/`);
      if (res.ok) {
        const data = await res.json();
        setSettings((prev) => ({ ...prev, ...data }));
      }
    } catch (e) {
      console.error("Failed to fetch settings config:", e);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setSaveStatus("idle");
    try {
      const res = await fetch(`${API_BASE}/api/settings/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(settings),
      });
      if (res.ok) {
        setSaveStatus("success");
        setTimeout(() => setSaveStatus("idle"), 3000);
      } else {
        setSaveStatus("error");
      }
    } catch (err) {
      setSaveStatus("error");
    } finally {
      setSaving(false);
    }
  };

  const handleChatSend = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!userInput.trim() || sendingMsg) return;

    const userMsg = userInput.trim();
    setChatMessages((prev) => [...prev, { sender: "user", text: userMsg }]);
    setUserInput("");
    setSendingMsg(true);

    try {
      const res = await fetch(`${API_BASE}/api/chat/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: userMsg }),
      });
      
      if (res.ok) {
        const data = await res.json();
        setChatMessages((prev) => [...prev, { sender: "assistant", text: data.reply }]);
      } else {
        setChatMessages((prev) => [
          ...prev, 
          { sender: "assistant", text: "⚠️ Failed to fetch response. Please verify that the API is running and your API keys are correct." }
        ]);
      }
    } catch (err) {
      setChatMessages((prev) => [
        ...prev, 
        { sender: "assistant", text: "❌ Connection error. Failed to reach the chatbot engine service." }
      ]);
    } finally {
      setSendingMsg(false);
    }
  };

  const handleQuickQuestion = (q: string) => {
    setUserInput(q);
  };

  return (
    <div className="p-8 space-y-8 flex-1 relative overflow-hidden">
      {/* Header */}
      <header className="border-b border-darkBorder/40 pb-4">
        <div className="flex items-center gap-2.5 mb-1">
          <Settings className="w-6 h-6 text-brandPurple" />
          <h2 className="text-2xl font-bold tracking-tight text-slate-100 font-sans">Ops Control Settings</h2>
        </div>
        <p className="text-sm text-slate-400">
          Configure Slack integration keys and Jira tickets settings to trigger AI Agent pipelines.
        </p>
      </header>

      {loading ? (
        <div className="flex items-center justify-center py-40 gap-3">
          <RefreshCw className="w-6 h-6 text-brandPurple animate-spin" />
          <p className="text-sm text-slate-400">Loading system settings...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 xl:grid-cols-12 gap-8 items-start">
          
          {/* LEFT: System Configuration Forms (7 Cols) */}
          <div className="xl:col-span-7 space-y-8">
            <form onSubmit={handleSave} className="glass-card p-6 rounded-2xl border border-darkBorder/40 space-y-6">
              
              {/* Slack app configuration */}
              <div className="space-y-4">
                <div className="flex items-center gap-2 pb-2 border-b border-darkBorder/30">
                  <Key className="w-4 h-4 text-brandCyan" />
                  <h3 className="text-sm font-bold text-slate-100 uppercase tracking-wider">Slack Configuration</h3>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[11px] text-slate-400 uppercase font-bold">Slack App Bot Token</label>
                  <input
                    type="password"
                    placeholder="xoxb-xxxxxxxxxxxx"
                    value={settings.SLACK_BOT_TOKEN}
                    onChange={(e) => setSettings({ ...settings, SLACK_BOT_TOKEN: e.target.value })}
                    className="w-full bg-slate-950/80 border border-darkBorder/60 rounded-xl px-3.5 py-2.5 text-xs text-slate-200 focus:outline-none focus:border-brandPurple transition-colors"
                  />
                </div>
              </div>

              {/* Jira Integration Section */}
              <div className="space-y-4">
                <div className="flex items-center gap-2 pb-2 border-b border-darkBorder/30">
                  <Database className="w-4 h-4 text-blue-400" />
                  <h3 className="text-sm font-bold text-slate-100 uppercase tracking-wider">Jira Cloud Settings</h3>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-[11px] text-slate-400 uppercase font-bold">Jira Instance URL</label>
                    <input
                      type="text"
                      placeholder="https://company.atlassian.net"
                      value={settings.JIRA_URL}
                      onChange={(e) => setSettings({ ...settings, JIRA_URL: e.target.value })}
                      className="w-full bg-slate-950/80 border border-darkBorder/60 rounded-xl px-3.5 py-2.5 text-xs text-slate-200 focus:outline-none focus:border-brandPurple transition-colors"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[11px] text-slate-400 uppercase font-bold">User email</label>
                    <input
                      type="email"
                      placeholder="developer@org.com"
                      value={settings.JIRA_EMAIL}
                      onChange={(e) => setSettings({ ...settings, JIRA_EMAIL: e.target.value })}
                      className="w-full bg-slate-950/80 border border-darkBorder/60 rounded-xl px-3.5 py-2.5 text-xs text-slate-200 focus:outline-none focus:border-brandPurple transition-colors"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[11px] text-slate-400 uppercase font-bold">API Token</label>
                    <input
                      type="password"
                      placeholder="Jira API key"
                      value={settings.JIRA_API_TOKEN}
                      onChange={(e) => setSettings({ ...settings, JIRA_API_TOKEN: e.target.value })}
                      className="w-full bg-slate-950/80 border border-darkBorder/60 rounded-xl px-3.5 py-2.5 text-xs text-slate-200 focus:outline-none focus:border-brandPurple transition-colors"
                    />
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-between pt-4">
                <div>
                  {saveStatus === "success" && (
                    <span className="text-xs text-brandEmerald flex items-center gap-1.5">
                      <CheckCircle className="w-4 h-4" />
                      Configurations updated successfully
                    </span>
                  )}
                  {saveStatus === "error" && (
                    <span className="text-xs text-brandRose flex items-center gap-1.5">
                      <AlertTriangle className="w-4 h-4" />
                      Failed to save config parameters
                    </span>
                  )}
                </div>

                <button
                  type="submit"
                  disabled={saving}
                  className="px-6 py-2.5 bg-brandPurple hover:bg-brandPurple/90 disabled:opacity-50 text-white text-xs font-bold rounded-xl transition-all shadow-[0_4px_12px_rgba(79,70,229,0.25)] flex items-center gap-2"
                >
                  {saving ? (
                    <>
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    "Save Configurations"
                  )}
                </button>
              </div>
            </form>

            {/* Vector DB Guide Cards */}
            <div className="glass-card p-6 rounded-2xl border border-darkBorder/40 space-y-4">
              <div className="flex items-center gap-2 border-b border-darkBorder/30 pb-2">
                <HelpCircle className="w-4 h-4 text-indigo-400" />
                <h4 className="text-xs font-bold text-slate-200 uppercase tracking-wider">How to Configure Vector DB for RAG</h4>
              </div>
              <p className="text-xs text-slate-400 leading-relaxed">
                A Vector Database allows indexing operational manuals, historical log files, and runbook solutions. 
                When a developer queries the chat assistant, semantic embeddings are queried to extract contextual runs.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-[10px] text-slate-400">
                <div className="p-3 bg-slate-950/40 border border-darkBorder/40 rounded-xl space-y-1">
                  <span className="font-bold text-slate-200 block">1. Embedding Generation</span>
                  <span>Use HuggingFace or OpenAI embeddings to convert system manuals into vectors.</span>
                </div>
                <div className="p-3 bg-slate-950/40 border border-darkBorder/40 rounded-xl space-y-1">
                  <span className="font-bold text-slate-200 block">2. Ingest Records</span>
                  <span>Push vector documents into the collections (e.g. `op_runs` index) in Chroma/PGVector.</span>
                </div>
                <div className="p-3 bg-slate-950/40 border border-darkBorder/40 rounded-xl space-y-1">
                  <span className="font-bold text-slate-200 block">3. Query Integration</span>
                  <span>Our Chat Service will send semantic queries to extract relevant documentation matches.</span>
                </div>
              </div>
            </div>
          </div>

          {/* RIGHT: Operations Chat Console (5 Cols) */}
          <div className="xl:col-span-5 flex flex-col glass-card border border-darkBorder/40 rounded-2xl overflow-hidden h-[700px]">
            <div className="p-4 border-b border-darkBorder/40 bg-slate-950/20 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <MessageSquare className="w-4 h-4 text-brandPurple" />
                <h3 className="text-xs font-bold text-slate-100 uppercase tracking-wider">Operations Assistant</h3>
              </div>
              <span className="h-2 w-2 rounded-full bg-brandEmerald animate-pulse"></span>
            </div>

            {/* Quick Suggestions */}
            <div className="p-3 bg-slate-950/40 border-b border-darkBorder/30 flex flex-wrap gap-1.5">
              <button 
                onClick={() => handleQuickQuestion("Which commit increased CPU latency?")}
                className="text-[9px] px-2 py-1 bg-slate-900 border border-darkBorder/60 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-all"
              >
                "Which commit increased latency?"
              </button>
              <button 
                onClick={() => handleQuickQuestion("What active incidents are tracked?")}
                className="text-[9px] px-2 py-1 bg-slate-900 border border-darkBorder/60 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-all"
              >
                "What active incidents are tracked?"
              </button>
              <button 
                onClick={() => handleQuickQuestion("Is Checkout API healthy?")}
                className="text-[9px] px-2 py-1 bg-slate-900 border border-darkBorder/60 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-all"
              >
                "Is Checkout API healthy?"
              </button>
            </div>

            {/* Messages Scroll Area */}
            <div className="flex-1 p-4 overflow-y-auto space-y-4 scrollbar-thin bg-slate-950/10">
              <AnimatePresence initial={false}>
                {chatMessages.map((msg, idx) => (
                  <motion.div
                    key={idx}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`flex ${msg.sender === "user" ? "justify-end" : "justify-start"}`}
                  >
                    <div className={`max-w-[85%] rounded-2xl p-3 text-xs leading-relaxed whitespace-pre-wrap ${
                      msg.sender === "user"
                        ? "bg-brandPurple text-white rounded-br-none"
                        : "bg-slate-900 border border-darkBorder/40 text-slate-200 rounded-bl-none font-sans"
                    }`}>
                      {msg.text}
                    </div>
                  </motion.div>
                ))}
                {sendingMsg && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="flex justify-start"
                  >
                    <div className="bg-slate-900 border border-darkBorder/40 rounded-2xl rounded-bl-none p-3 flex items-center gap-2">
                      <LoaderDot delay={0} />
                      <LoaderDot delay={0.2} />
                      <LoaderDot delay={0.4} />
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Chat Input form */}
            <form onSubmit={handleChatSend} className="p-3 border-t border-darkBorder/40 bg-slate-950/20 flex gap-2">
              <input
                type="text"
                placeholder="Ask assistant about system status..."
                value={userInput}
                onChange={(e) => setUserInput(e.target.value)}
                className="flex-1 bg-slate-950 border border-darkBorder/60 rounded-xl px-3.5 py-2.5 text-xs text-slate-200 focus:outline-none focus:border-brandPurple transition-colors"
              />
              <button
                type="submit"
                disabled={sendingMsg || !userInput.trim()}
                className="p-2.5 bg-brandPurple hover:bg-brandPurple/90 disabled:opacity-40 text-white rounded-xl transition-all shrink-0"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>
          </div>

        </div>
      )}
    </div>
  );
}

function LoaderDot({ delay }: { delay: number }) {
  return (
    <motion.span
      animate={{ y: [0, -5, 0] }}
      transition={{ repeat: Infinity, duration: 0.6, delay }}
      className="w-1.5 h-1.5 rounded-full bg-brandPurple block"
    />
  );
}
