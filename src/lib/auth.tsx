import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import type { Session, User } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";

type Profile = {
  user_id: string;
  full_name: string | null;
  phone: string | null;
  avatar_url: string | null;
};

export type AppRole = "tenant" | "landlord" | "apartment_owner" | "admin";

type AuthCtx = {
  user: User | null;
  session: Session | null;
  profile: Profile | null;
  roles: AppRole[];
  isLoading: boolean;
  /** Highest-privilege "shell" role for nav/theme. Order: admin > landlord > apartment_owner > tenant */
  primaryRole: AppRole;
  isAdmin: boolean;
  isLandlord: boolean;
  isOwner: boolean;
  isTenant: boolean;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
};

const Ctx = createContext<AuthCtx | null>(null);

function pickPrimary(roles: AppRole[]): AppRole {
  if (roles.includes("admin")) return "admin";
  if (roles.includes("landlord")) return "landlord";
  if (roles.includes("apartment_owner")) return "apartment_owner";
  return "tenant";
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [roles, setRoles] = useState<AppRole[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [rolesLoaded, setRolesLoaded] = useState(false);

  const loadProfile = async (uid: string) => {
    const [{ data: prof }, { data: roleRows }] = await Promise.all([
      supabase.from("profiles").select("user_id, full_name, phone, avatar_url").eq("user_id", uid).maybeSingle(),
      supabase.from("user_roles").select("role").eq("user_id", uid),
    ]);
    setProfile(prof as Profile | null);
    setRoles((roleRows ?? []).map((r: { role: string }) => r.role as AppRole));
    setRolesLoaded(true);
  };

  useEffect(() => {
    const { data: sub } = supabase.auth.onAuthStateChange((_evt, s) => {
      setSession(s);
      setUser(s?.user ?? null);
      if (s?.user) {
        setRolesLoaded(false);
        setTimeout(() => loadProfile(s.user.id), 0);
      } else {
        setProfile(null);
        setRoles([]);
        setRolesLoaded(true);
      }
    });
    supabase.auth.getSession().then(async ({ data }) => {
      setSession(data.session);
      setUser(data.session?.user ?? null);
      if (data.session?.user) {
        await loadProfile(data.session.user.id);
      } else {
        setRolesLoaded(true);
      }
      setIsLoading(false);
    });
    return () => sub.subscription.unsubscribe();
  }, []);

  const primaryRole = pickPrimary(roles);

  const value: AuthCtx = {
    user,
    session,
    profile,
    roles,
    isLoading: isLoading || (!!user && !rolesLoaded),
    primaryRole,
    isAdmin: roles.includes("admin"),
    isLandlord: roles.includes("landlord") || roles.includes("admin"),
    isOwner: roles.includes("apartment_owner"),
    isTenant: primaryRole === "tenant",
    signOut: async () => {
      await supabase.auth.signOut();
    },
    refreshProfile: async () => {
      if (user) await loadProfile(user.id);
    },
  };

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useAuth() {
  const v = useContext(Ctx);
  if (!v) throw new Error("useAuth must be used inside AuthProvider");
  return v;
}
