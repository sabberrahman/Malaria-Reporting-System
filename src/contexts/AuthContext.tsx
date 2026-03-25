import React, { createContext, useContext, useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { Session, User } from "@supabase/supabase-js";

type AppRole = "admin" | "sk";

interface Profile {
  full_name: string;
  email: string;
}

interface AuthContextType {
  user: User | null;
  profile: Profile | null;
  role: AppRole | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [role, setRole] = useState<AppRole | null>(null);
  const [loading, setLoading] = useState(true);

  const clearUserData = () => {
    setUser(null);
    setProfile(null);
    setRole(null);
  };

  const fetchUserData = async (userId: string) => {
    try {
      const [profileRes, roleRes] = await Promise.all([
        supabase.from("profiles").select("full_name, email").eq("user_id", userId).maybeSingle(),
        supabase.from("user_roles").select("role").eq("user_id", userId).maybeSingle(),
      ]);

      // Log errors but don't crash — rows may not exist yet
      if (profileRes.error) console.warn("profiles fetch error:", profileRes.error.message);
      if (roleRes.error) console.warn("user_roles fetch error:", roleRes.error.message);

      setProfile(profileRes.data ?? null);
      setRole((roleRes.data?.role as AppRole) ?? null);
    } catch (err) {
      console.error("fetchUserData unexpected error:", err);
      setProfile(null);
      setRole(null);
    }
  };

  useEffect(() => {
    let mounted = true;

    const syncSession = async (session: Session | null) => {
      if (!mounted) return;

      if (session?.user) {
        setUser(session.user);
        await fetchUserData(session.user.id);
      } else {
        clearUserData();
      }
    };

    const initializeAuth = async () => {
      if (!mounted) return;
      setLoading(true);

      try {
        const {
          data: { session },
          error,
        } = await supabase.auth.getSession();

        if (error) throw error;
        await syncSession(session);
      } catch (err) {
        console.error("auth initialization error:", err);
        if (!mounted) return;
        clearUserData();
      } finally {
        if (mounted) setLoading(false);
      }
    };

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!mounted) return;

      setLoading(true);

      // Avoid async work directly inside the auth callback.
      void (async () => {
        try {
          await syncSession(session);
        } catch (err) {
          console.error("auth state sync error:", err);
          if (!mounted) return;
          clearUserData();
        } finally {
          if (mounted) setLoading(false);
        }
      })();
    });

    void initializeAuth();

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;
  };

  const signOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  };

  return (
    <AuthContext.Provider value={{ user, profile, role, loading, signIn, signOut }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
};
