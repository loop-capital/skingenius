"use client";

import { useEffect, useState, useCallback } from "react";
import { User, Session } from "@supabase/supabase-js";
import { createClient } from "@/utils/supabase/client";

interface AuthState {
  user: User | null;
  session: Session | null;
  isLoading: boolean;
  isAuthenticated: boolean;
}

export function useAuth(): AuthState & {
  signOut: () => Promise<void>;
  refreshUser: () => Promise<void>;
} {
  const supabase = createClient();
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const refreshUser = useCallback(async () => {
    try {
      const {
        data: { session: currentSession },
      } = await supabase.auth.getSession();
      setSession(currentSession);
      setUser(currentSession?.user ?? null);
    } catch {
      setSession(null);
      setUser(null);
    }
  }, [supabase]);

  useEffect(() => {
    let mounted = true;
    setIsLoading(true);

    supabase.auth
      .getSession()
      .then(({ data: { session: initialSession } }) => {
        if (!mounted) return;
        setSession(initialSession);
        setUser(initialSession?.user ?? null);
        setIsLoading(false);
      })
      .catch(() => {
        if (!mounted) return;
        setSession(null);
        setUser(null);
        setIsLoading(false);
      });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, newSession) => {
      if (!mounted) return;
      setSession(newSession);
      setUser(newSession?.user ?? null);
      setIsLoading(false);
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, [supabase]);

  const signOut = useCallback(async () => {
    await supabase.auth.signOut();
    setUser(null);
    setSession(null);
  }, [supabase]);

  return {
    user,
    session,
    isLoading,
    isAuthenticated: !!user,
    signOut,
    refreshUser,
  };
}
