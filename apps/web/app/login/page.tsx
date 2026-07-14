"use client";

import React, { useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { motion } from "framer-motion";
import { Shield, Key, Mail, ArrowRight, Play } from "lucide-react";
import { supabase } from "../../lib/supabase";

export default function LoginPage() {
  const { loginAsDeveloper } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) return;
    setLoading(true);
    setErrorMsg(null);

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (error) {
        setErrorMsg(error.message);
      }
    } catch (err: any) {
      setErrorMsg("An unexpected connection error occurred.");
    } finally {
      setLoading(false);
    }
  };

  const handleSignUp = async () => {
    if (!email || !password) return;
    setLoading(true);
    setErrorMsg(null);

    try {
      const { error } = await supabase.auth.signUp({
        email,
        password,
      });
      if (error) {
        setErrorMsg(error.message);
      } else {
        setErrorMsg("Verification email sent! Check your inbox.");
      }
    } catch (err: any) {
      setErrorMsg("An unexpected signup error occurred.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full bg-slate-950 flex items-center justify-center relative overflow-hidden font-sans">
      {/* Background Glows */}
      <div className="absolute top-1/4 left-1/4 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-brandPurple/15 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 translate-x-1/2 translate-y-1/2 w-96 h-96 bg-brandCyan/10 rounded-full blur-[120px] pointer-events-none" />

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md p-8 glass-card border border-darkBorder/40 rounded-2xl space-y-8 z-10 mx-4"
      >
        {/* Brand Logo & Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex p-3 bg-brandPurple/10 border border-brandPurple/30 rounded-xl mb-2 text-brandPurple animate-pulse">
            <Shield className="w-8 h-8" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-100">AtomOps Incident Engine</h1>
          <p className="text-xs text-slate-400">
            Real-time infrastructure observability, AI diagnostics, and ChatOps controls.
          </p>
        </div>

        {/* Error Alert Box */}
        {errorMsg && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="p-3 bg-red-950/40 border border-red-500/30 rounded-xl text-[11px] text-red-200"
          >
            {errorMsg}
          </motion.div>
        )}

        {/* Login Form */}
        <form onSubmit={handleSignIn} className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">Email Address</label>
            <div className="relative">
              <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
              <input
                type="email"
                required
                placeholder="you@company.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-slate-900/60 border border-darkBorder/60 rounded-xl pl-10 pr-4 py-2.5 text-xs text-slate-200 placeholder:text-slate-600 focus:outline-none focus:border-brandPurple focus:bg-slate-900 transition-all"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">Password</label>
            <div className="relative">
              <Key className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
              <input
                type="password"
                required
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-slate-900/60 border border-darkBorder/60 rounded-xl pl-10 pr-4 py-2.5 text-xs text-slate-200 placeholder:text-slate-600 focus:outline-none focus:border-brandPurple focus:bg-slate-900 transition-all"
              />
            </div>
          </div>

          {/* Action Buttons */}
          <div className="grid grid-cols-2 gap-3 pt-2">
            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 bg-brandPurple hover:bg-brandPurple/90 disabled:opacity-50 text-white text-xs font-bold rounded-xl transition-all shadow-[0_4px_12px_rgba(79,70,229,0.25)] flex items-center justify-center gap-1.5"
            >
              Sign In
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={handleSignUp}
              disabled={loading}
              className="w-full py-2.5 bg-slate-900 hover:bg-slate-800 border border-darkBorder/80 text-slate-200 text-xs font-bold rounded-xl transition-all flex items-center justify-center"
            >
              Sign Up
            </button>
          </div>
        </form>

        {/* Divider */}
        <div className="relative flex py-2 items-center">
          <div className="flex-grow border-t border-darkBorder/40"></div>
          <span className="flex-shrink mx-4 text-[10px] text-slate-600 uppercase font-bold tracking-widest">or</span>
          <div className="flex-grow border-t border-darkBorder/40"></div>
        </div>

        {/* Guest Bypass Mode */}
        <div className="space-y-3">
          <button
            type="button"
            onClick={loginAsDeveloper}
            className="w-full py-3 bg-gradient-to-r from-brandPurple/10 to-brandCyan/10 hover:from-brandPurple/20 hover:to-brandCyan/20 border border-brandPurple/30 hover:border-brandPurple/50 text-slate-200 text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-2"
          >
            <Play className="w-4 h-4 text-brandCyan fill-brandCyan" />
            Continue as Guest / Developer Bypass
          </button>
          <p className="text-[10px] text-center text-slate-500 leading-relaxed">
            Guest mode runs in local simulator state. Set up `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` in env variables for production.
          </p>
        </div>
      </motion.div>
    </div>
  );
}
