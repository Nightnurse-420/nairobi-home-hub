import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { Bell, ShieldCheck, HelpCircle, Settings, LogIn, LogOut, Sparkles, Building2, Heart, Loader2 } from "lucide-react";
import { Logo } from "@/components/Logo";
import { useAuth } from "@/lib/auth";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useState } from "react";

export const Route = createFileRoute("/profile")({
  head: () => ({ meta: [{ title: "Profile · NyumbaSearch" }, { name: "description", content: "Account, notifications and preferences." }] }),
  component: ProfilePage,
});

function ProfilePage() {
  const { user, profile, isLoading, isLandlord, signOut, refreshProfile } = useAuth();
  const navigate = useNavigate();
  const [becoming, setBecoming] = useState(false);

  const becomeLandlord = async () => {
    if (!user) return;
    setBecoming(true);
    const { error } = await supabase.from("user_roles").insert({ user_id: user.id, role: "landlord" });
    if (error && !error.message.includes("duplicate")) {
      toast.error(error.message);
    } else {
      toast.success("You're now a landlord — list your first property!");
      await refreshProfile();
      navigate({ to: "/landlord" });
    }
    setBecoming(false);
  };

  if (isLoading) {
    return <div className="flex min-h-[60vh] items-center justify-center"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>;
  }

  return (
    <div className="px-5 pb-4 pt-6">
      <div className="flex items-center justify-between">
        <Logo />
      </div>

      {!user ? (
        <section className="mt-6 overflow-hidden rounded-3xl gradient-primary p-5 text-primary-foreground shadow-elegant">
          <Sparkles className="h-5 w-5 opacity-90" />
          <h2 className="mt-3 font-display text-xl font-extrabold">Welcome, House-Hunter</h2>
          <p className="mt-1 text-sm opacity-90">Sign in to sync saves, get vacancy alerts, list properties, and message landlords.</p>
          <Link to="/auth" className="mt-4 inline-flex items-center gap-2 rounded-2xl bg-white px-4 py-2.5 text-sm font-semibold text-foreground shadow-card">
            <LogIn className="h-4 w-4" /> Sign in / Create account
          </Link>
        </section>
      ) : (
        <section className="mt-6 rounded-3xl bg-card p-5 shadow-card">
          <div className="flex items-center gap-4">
            <div className="gradient-primary flex h-14 w-14 items-center justify-center rounded-2xl font-display text-xl font-bold text-primary-foreground">
              {(profile?.full_name ?? user.email ?? "U").charAt(0).toUpperCase()}
            </div>
            <div className="flex-1">
              <p className="font-display text-lg font-bold">{profile?.full_name ?? "House-Hunter"}</p>
              <p className="text-xs text-muted-foreground">{user.email}</p>
              {isLandlord && (
                <span className="mt-1 inline-flex items-center gap-1 rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-primary">
                  <Building2 className="h-3 w-3" /> Landlord
                </span>
              )}
            </div>
          </div>
        </section>
      )}

      <section className="mt-6">
        <h3 className="px-1 font-display text-sm font-bold uppercase tracking-wide text-muted-foreground">Account</h3>
        <div className="mt-2 divide-y divide-border overflow-hidden rounded-3xl bg-card shadow-card">
          {user && isLandlord ? (
            <Row to="/landlord" icon={Building2} label="My listings" sub="Manage your properties" />
          ) : user ? (
            <button onClick={becomeLandlord} disabled={becoming} className="flex w-full items-center gap-3 px-4 py-3.5 text-left transition hover:bg-muted/50 disabled:opacity-60">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
                {becoming ? <Loader2 className="h-4 w-4 animate-spin" /> : <Building2 className="h-4 w-4" />}
              </div>
              <div className="flex-1">
                <p className="text-sm font-semibold">List your property</p>
                <p className="text-xs text-muted-foreground">Become a landlord on NyumbaSearch</p>
              </div>
              <span className="text-muted-foreground">›</span>
            </button>
          ) : null}
          <Row to="/saved" icon={Heart} label="Saved homes" />
          <RowStatic icon={Bell} label="Vacancy alerts" sub="Get notified when matching homes go vacant" />
          <RowStatic icon={ShieldCheck} label="Verification" sub="Verify ID to unlock trusted features" />
          <RowStatic icon={Settings} label="Preferences" />
          <RowStatic icon={HelpCircle} label="Help & support" />
        </div>
      </section>

      {user && (
        <button
          onClick={async () => { await signOut(); toast.success("Signed out"); }}
          className="mt-6 flex w-full items-center justify-center gap-2 rounded-2xl border border-border bg-card py-3 text-sm font-semibold text-destructive shadow-card"
        >
          <LogOut className="h-4 w-4" /> Sign out
        </button>
      )}

      <p className="mt-8 text-center text-xs text-muted-foreground">
        NyumbaSearch · Find Verified Homes Smarter.
      </p>
    </div>
  );
}

function Row({ to, icon: Icon, label, sub }: {
  to: string; icon: React.ComponentType<{ className?: string }>; label: string; sub?: string;
}) {
  return (
    <Link to={to} className="flex w-full items-center gap-3 px-4 py-3.5 text-left transition hover:bg-muted/50">
      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
        <Icon className="h-4 w-4" />
      </div>
      <div className="flex-1">
        <p className="text-sm font-semibold">{label}</p>
        {sub && <p className="text-xs text-muted-foreground">{sub}</p>}
      </div>
      <span className="text-muted-foreground">›</span>
    </Link>
  );
}

function RowStatic({ icon: Icon, label, sub }: {
  icon: React.ComponentType<{ className?: string }>; label: string; sub?: string;
}) {
  return (
    <button className="flex w-full items-center gap-3 px-4 py-3.5 text-left transition hover:bg-muted/50">
      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
        <Icon className="h-4 w-4" />
      </div>
      <div className="flex-1">
        <p className="text-sm font-semibold">{label}</p>
        {sub && <p className="text-xs text-muted-foreground">{sub}</p>}
      </div>
      <span className="text-muted-foreground">›</span>
    </button>
  );
}
