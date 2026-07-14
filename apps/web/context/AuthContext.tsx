"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { supabase } from "../lib/supabase";
import { Session, User } from "@supabase/supabase-js";

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  loginAsDeveloper: () => void;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthContextProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    // 1. Check if guest developer bypass is cached in localStorage
    const guestUser = localStorage.getItem("atom_guest_user");
    if (guestUser) {
      try {
        const parsed = JSON.parse(guestUser);
        setUser(parsed.user);
        setSession(parsed.session);
        setLoading(false);
        return;
      } catch (err) {
        localStorage.removeItem("atom_guest_user");
      }
    }

    // 2. Fetch real Supabase session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  // Route Guard redirects
  useEffect(() => {
    if (loading) return;

    const isLoggedIn = !!user;
    const isLoginPage = pathname === "/login";

    if (!isLoggedIn && !isLoginPage) {
      router.replace("/login");
    } else if (isLoggedIn && isLoginPage) {
      router.replace("/dashboard");
    }
  }, [user, loading, pathname, router]);

  const loginAsDeveloper = () => {
    const mockUser = {
      id: "dev-guest-uuid",
      email: "developer@sentinel.local",
      user_metadata: { name: "Guest Developer" },
      aud: "authenticated",
      role: "authenticated",
      created_at: new Date().toISOString(),
    } as any;

    const mockSession = {
      access_token: "mock-jwt-token-12345",
      token_type: "bearer",
      expires_in: 3600,
      refresh_token: "mock-refresh-token",
      user: mockUser,
    } as any;

    localStorage.setItem("atom_guest_user", JSON.stringify({ user: mockUser, session: mockSession }));
    setUser(mockUser);
    setSession(mockSession);
    router.replace("/dashboard");
  };

  const signOut = async () => {
    localStorage.removeItem("atom_guest_user");
    setUser(null);
    setSession(null);
    
    // Attempt Supabase sign out if it wasn't a mock guest
    try {
      await supabase.auth.signOut();
    } catch (e) {
      console.warn("Supabase client sign-out skipped (guest session active).");
    }
    router.replace("/login");
  };

  return (
    <AuthContext.Provider value={{ user, session, loading, loginAsDeveloper, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthContextProvider");
  }
  return context;
}
