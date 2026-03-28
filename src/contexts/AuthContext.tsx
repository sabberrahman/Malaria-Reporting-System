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

const DEFAULT_PUBLIC_EMAIL = "sk1@test.com";
const DEFAULT_PUBLIC_PASSWORD = "123456";

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
    const [profileRes, roleRes] = await Promise.all([
      supabase.from("profiles").select("full_name, email").eq("user_id", userId).maybeSingle(),
      supabase.from("user_roles").select("role").eq("user_id", userId).maybeSingle(),
    ]);

    if (profileRes.error) {
      throw profileRes.error;
    }

    if (roleRes.error) {
      throw roleRes.error;
    }

    setProfile(profileRes.data ?? null);
    setRole((roleRes.data?.role as AppRole) ?? null);
  };

  useEffect(() => {
    let mounted = true;

    const syncSession = async (session: Session | null) => {
      if (!mounted) return;

      if (!session?.user) {
        clearUserData();
        return;
      }

      setUser(session.user);
      await fetchUserData(session.user.id);
    };

    const ensureDefaultSession = async () => {
      const {
        data: { session },
        error,
      } = await supabase.auth.getSession();

      if (error) {
        throw error;
      }

      if (session?.user) {
        await syncSession(session);
        return;
      }

      const { data, error: signInError } = await supabase.auth.signInWithPassword({
        email: DEFAULT_PUBLIC_EMAIL,
        password: DEFAULT_PUBLIC_PASSWORD,
      });

      if (signInError) {
        throw signInError;
      }

      await syncSession(data.session ?? null);
    };

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!mounted) return;

      void (async () => {
        try {
          await syncSession(session);
        } catch (error) {
          console.error("auth state sync error:", error);
          if (!mounted) return;
          clearUserData();
        } finally {
          if (mounted) setLoading(false);
        }
      })();
    });

    void (async () => {
      try {
        await ensureDefaultSession();
      } catch (error) {
        console.error("public auto sign-in error:", error);
        if (!mounted) return;
        clearUserData();
      } finally {
        if (mounted) setLoading(false);
      }
    })();

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

  const value: AuthContextType = {
    user,
    profile,
    role,
    loading,
    signIn,
    signOut,
  };

  return (
    <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
};
