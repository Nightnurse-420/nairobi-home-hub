import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft, Building2, KeyRound, BarChart3, ShieldCheck, Inbox, Sparkles } from "lucide-react";
import { useAuth } from "@/lib/auth";

export const Route = createFileRoute("/host")({
  head: () => ({
    meta: [
      { title: "List your property · NyumbaSearch for Hosts" },
      { name: "description", content: "Reach verified tenants. Manage your buildings, units, and inquiries from one professional dashboard." },
    ],
  }),
  component: HostLanding,
});

function HostLanding() {
  const { user, isLandlord, isOwner } = useAuth();
  const verifiedHost = isLandlord || isOwner;

  const ctaTo = !user ? "/auth" : verifiedHost ? (isLandlord ? "/landlord" : "/owner") : "/onboarding/role";
  const ctaLabel = !user ? "Create host account" : verifiedHost ? "Open dashboard" : "Apply to list properties";

  return (
    <div className="min-h-screen bg-background pb-16">
      <div className="relative overflow-hidden bg-gradient-to-br from-indigo-950 via-indigo-900 to-slate-900 px-5 pb-12 pt-6 text-white">
        <Link to="/" className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-white/10 backdrop-blur">
          <ArrowLeft className="h-4 w-4" />
        </Link>

        <p className="mt-7 text-[11px] font-semibold uppercase tracking-[0.2em] text-indigo-200">
          <Sparkles className="mr-1 inline h-3 w-3" /> NyumbaSearch for Hosts
        </p>
        <h1 className="mt-2 font-display text-3xl font-extrabold leading-tight">
          List your property.<br />Reach verified tenants.
        </h1>
        <p className="mt-3 text-sm text-white/80">
          A dedicated dashboard for landlords and apartment owners — manage units, vacancies, inquiries, and performance in one place.
        </p>

        <Link
          to={ctaTo}
          search={!user ? { intent: "host" } : undefined}
          className="mt-6 inline-flex items-center justify-center rounded-2xl bg-white px-6 py-3 text-sm font-semibold text-indigo-950 shadow-lg"
        >
          {ctaLabel}
        </Link>
        {!user && (
          <Link to="/auth" search={{ intent: "host" }} className="ml-3 inline-flex items-center justify-center rounded-2xl border border-white/30 px-6 py-3 text-sm font-semibold text-white">
            Sign in
          </Link>
        )}
      </div>

      <section className="px-5 pt-8">
        <h2 className="font-display text-xs font-bold uppercase tracking-wide text-muted-foreground">What you get</h2>
        <div className="mt-3 grid gap-3">
          <Feature icon={Building2} title="Multi-building portfolio" desc="Manage entire blocks or just one unit — your dashboard scales with you." />
          <Feature icon={BarChart3} title="Live performance insights" desc="See views, saves, calls, and inquiries on every listing in real time." />
          <Feature icon={Inbox} title="Lead inbox" desc="All tenant inquiries in one CRM-style inbox with follow-up tracking." />
          <Feature icon={ShieldCheck} title="Verified host badge" desc="Verified hosts get higher placement and more tenant trust." />
        </div>
      </section>

      <section className="mt-8 px-5">
        <h2 className="font-display text-xs font-bold uppercase tracking-wide text-muted-foreground">Two host types</h2>
        <div className="mt-3 grid gap-3">
          <TypeCard
            icon={Building2}
            title="Landlord"
            desc="You own entire buildings or apartment blocks and manage many units."
          />
          <TypeCard
            icon={KeyRound}
            title="Apartment Owner"
            desc="You own one or a few units inside someone else's building."
          />
        </div>
        <p className="mt-4 px-1 text-xs text-muted-foreground">
          All host accounts go through admin verification (phone, email, national ID) before listings go live.
        </p>
      </section>

      <div className="mt-10 px-5">
        <Link
          to={ctaTo}
          search={!user ? { intent: "host" } : undefined}
          className="flex w-full items-center justify-center rounded-2xl bg-indigo-600 py-3.5 text-sm font-semibold text-white shadow-lg"
        >
          {ctaLabel}
        </Link>
      </div>
    </div>
  );
}

function Feature({ icon: Icon, title, desc }: { icon: React.ComponentType<{ className?: string }>; title: string; desc: string }) {
  return (
    <div className="flex items-start gap-3 rounded-2xl bg-card p-4 shadow-card">
      <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl bg-indigo-100 text-indigo-700">
        <Icon className="h-5 w-5" />
      </div>
      <div>
        <p className="font-display text-sm font-bold">{title}</p>
        <p className="mt-0.5 text-xs text-muted-foreground">{desc}</p>
      </div>
    </div>
  );
}

function TypeCard({ icon: Icon, title, desc }: { icon: React.ComponentType<{ className?: string }>; title: string; desc: string }) {
  return (
    <div className="flex items-start gap-3 rounded-3xl border border-border bg-card p-4 shadow-card">
      <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-600 to-indigo-800 text-white">
        <Icon className="h-5 w-5" />
      </div>
      <div>
        <p className="font-display text-base font-bold">{title}</p>
        <p className="mt-0.5 text-xs text-muted-foreground">{desc}</p>
      </div>
    </div>
  );
}
