import { createFileRoute } from "@tanstack/react-router";
import { Bell, ShieldCheck, HelpCircle, Settings, LogIn, Sparkles, Building2 } from "lucide-react";
import { Logo } from "@/components/Logo";

export const Route = createFileRoute("/profile")({
  head: () => ({ meta: [{ title: "Profile · NyumbaSearch" }, { name: "description", content: "Account, notifications and preferences." }] }),
  component: ProfilePage,
});

function ProfilePage() {
  return (
    <div className="px-5 pb-4 pt-6">
      <div className="flex items-center justify-between">
        <Logo />
      </div>

      <section className="mt-6 overflow-hidden rounded-3xl gradient-primary p-5 text-primary-foreground shadow-elegant">
        <Sparkles className="h-5 w-5 opacity-90" />
        <h2 className="mt-3 font-display text-xl font-extrabold">Welcome, House-Hunter</h2>
        <p className="mt-1 text-sm opacity-90">Sign in to sync saves, get vacancy alerts, and message landlords.</p>
        <button className="mt-4 flex items-center gap-2 rounded-2xl bg-white px-4 py-2.5 text-sm font-semibold text-foreground shadow-card">
          <LogIn className="h-4 w-4" /> Sign in / Create account
        </button>
      </section>

      <section className="mt-6">
        <h3 className="px-1 font-display text-sm font-bold uppercase tracking-wide text-muted-foreground">Account</h3>
        <div className="mt-2 divide-y divide-border overflow-hidden rounded-3xl bg-card shadow-card">
          <Row icon={Building2} label="List your property" sub="For landlords & property managers" />
          <Row icon={Bell} label="Vacancy alerts" sub="Get notified when matching homes go vacant" />
          <Row icon={ShieldCheck} label="Verification" sub="Verify ID to unlock trusted features" />
          <Row icon={Settings} label="Preferences" />
          <Row icon={HelpCircle} label="Help & support" />
        </div>
      </section>

      <p className="mt-8 text-center text-xs text-muted-foreground">
        NyumbaSearch · Find Verified Homes Smarter.
      </p>
    </div>
  );
}

function Row({ icon: Icon, label, sub }: {
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
