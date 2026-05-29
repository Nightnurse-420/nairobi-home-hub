import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import {
  Plus, Building2, Loader2, LayoutDashboard, Inbox, BarChart3,
  CheckCircle2, Clock, TrendingUp, Wallet, ArrowUpRight,
} from "lucide-react";
import { useAuth } from "@/lib/auth";
import { supabase } from "@/integrations/supabase/client";
import { formatKES } from "@/lib/properties";

export const Route = createFileRoute("/landlord")({
  head: () => ({ meta: [{ title: "Portfolio · Landlord" }] }),
  component: LandlordDashboard,
});

type Row = {
  id: string;
  title: string;
  neighborhood: string;
  rent: number;
  property_type: string;
  building_name: string | null;
  vacant: boolean;
  published: boolean;
  created_at: string;
};

function LandlordDashboard() {
  const { user, profile, isLandlord, isLoading } = useAuth();
  const navigate = useNavigate();
  const [rows, setRows] = useState<Row[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isLoading) return;
    if (!user) { navigate({ to: "/auth" }); return; }
    if (!isLandlord) { navigate({ to: "/profile" }); return; }
    supabase.from("listings")
      .select("id, title, neighborhood, rent, property_type, building_name, vacant, published, created_at")
      .eq("owner_id", user.id)
      .order("created_at", { ascending: false })
      .then(({ data }) => { setRows((data ?? []) as Row[]); setLoading(false); });
  }, [user, isLandlord, isLoading, navigate]);

  const stats = useMemo(() => {
    const buildings = new Set(rows.map(r => r.building_name || r.neighborhood)).size;
    const vacant = rows.filter(r => r.vacant).length;
    const occupied = rows.filter(r => !r.vacant).length;
    const live = rows.filter(r => r.published).length;
    const monthly = rows.filter(r => !r.vacant).reduce((s, r) => s + (r.rent || 0), 0);
    const occupancy = rows.length ? Math.round((occupied / rows.length) * 100) : 0;
    return { buildings, vacant, occupied, live, monthly, occupancy, total: rows.length };
  }, [rows]);

  const recent = rows.slice(0, 4);
  const firstName = (profile?.full_name ?? "").split(" ")[0] || "there";

  if (loading) {
    return <div className="flex min-h-[60vh] items-center justify-center"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>;
  }

  return (
    <div className="px-5 pb-8 pt-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-wider text-primary">Portfolio</p>
          <h1 className="font-display text-2xl font-extrabold">Hi {firstName}</h1>
        </div>
        <Link to="/landlord/new" className="flex items-center gap-1.5 rounded-2xl gradient-primary px-3.5 py-2 text-xs font-semibold text-primary-foreground shadow-elegant">
          <Plus className="h-3.5 w-3.5" /> New
        </Link>
      </div>

      {/* Hero KPI */}
      <section className="mt-5 overflow-hidden rounded-3xl gradient-primary p-5 text-primary-foreground shadow-elegant">
        <div className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wider opacity-80">
          <Wallet className="h-3.5 w-3.5" /> Monthly potential
        </div>
        <p className="mt-1 font-display text-3xl font-extrabold">{formatKES(stats.monthly)}</p>
        <div className="mt-3 flex items-center justify-between text-xs opacity-90">
          <span className="flex items-center gap-1"><TrendingUp className="h-3.5 w-3.5" /> {stats.occupancy}% occupancy</span>
          <span>{stats.occupied} of {stats.total} units rented</span>
        </div>
      </section>

      {/* KPI grid */}
      <section className="mt-4 grid grid-cols-2 gap-3">
        <Stat icon={Building2} label="Buildings" value={stats.buildings} />
        <Stat icon={LayoutDashboard} label="Total units" value={stats.total} />
        <Stat icon={CheckCircle2} label="Live" value={stats.live} accent />
        <Stat icon={Clock} label="Vacant" value={stats.vacant} />
      </section>

      {/* Quick actions */}
      <section className="mt-5">
        <h2 className="px-1 font-display text-sm font-bold">Quick actions</h2>
        <div className="mt-2 grid grid-cols-3 gap-2.5">
          <QuickAction to="/landlord/listings" icon={Building2} label="Buildings" />
          <QuickAction to="/landlord/inquiries" icon={Inbox} label="Inquiries" />
          <QuickAction to="/landlord/insights" icon={BarChart3} label="Insights" />
        </div>
      </section>

      {/* Recent units */}
      <section className="mt-6">
        <div className="flex items-center justify-between px-1">
          <h2 className="font-display text-sm font-bold">Recent units</h2>
          <Link to="/landlord/listings" className="flex items-center gap-0.5 text-xs font-semibold text-primary">
            View all <ArrowUpRight className="h-3 w-3" />
          </Link>
        </div>

        {recent.length === 0 ? (
          <div className="mt-3 rounded-3xl border border-dashed border-border bg-surface p-8 text-center">
            <Building2 className="mx-auto h-7 w-7 text-primary" />
            <p className="mt-3 font-display text-sm font-bold">No listings yet</p>
            <p className="mt-1 text-xs text-muted-foreground">Add your first building to start filling vacancies.</p>
            <Link to="/landlord/new" className="mt-4 inline-flex items-center gap-1.5 rounded-2xl gradient-primary px-4 py-2 text-xs font-semibold text-primary-foreground shadow-elegant">
              <Plus className="h-3.5 w-3.5" /> List a property
            </Link>
          </div>
        ) : (
          <div className="mt-3 space-y-2">
            {recent.map(l => (
              <article key={l.id} className="flex items-center justify-between rounded-2xl bg-card p-3 shadow-card">
                <div className="min-w-0">
                  <p className="truncate text-sm font-bold">{l.title}</p>
                  <p className="mt-0.5 text-[11px] text-muted-foreground">{l.building_name || l.neighborhood} · {l.property_type}</p>
                </div>
                <div className="text-right">
                  <p className="font-display text-sm font-bold text-primary">{formatKES(l.rent)}</p>
                  <span className={`mt-0.5 inline-block rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase ${l.vacant ? "bg-primary/15 text-primary" : "bg-muted text-muted-foreground"}`}>
                    {l.vacant ? "Vacant" : "Rented"}
                  </span>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

function Stat({ icon: Icon, label, value, accent }: { icon: React.ComponentType<{ className?: string }>; label: string; value: number; accent?: boolean }) {
  return (
    <div className="rounded-2xl bg-card p-3.5 shadow-card">
      <div className={`flex h-8 w-8 items-center justify-center rounded-xl ${accent ? "gradient-primary text-primary-foreground" : "bg-primary/10 text-primary"}`}>
        <Icon className="h-4 w-4" />
      </div>
      <p className="mt-2 font-display text-xl font-extrabold">{value}</p>
      <p className="text-[11px] text-muted-foreground">{label}</p>
    </div>
  );
}

function QuickAction({ to, icon: Icon, label }: { to: string; icon: React.ComponentType<{ className?: string }>; label: string }) {
  return (
    <Link to={to} className="flex flex-col items-center gap-1.5 rounded-2xl bg-card px-2 py-3 text-center shadow-card transition hover:bg-muted/40">
      <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/10 text-primary">
        <Icon className="h-4 w-4" />
      </div>
      <span className="text-[11px] font-semibold">{label}</span>
    </Link>
  );
}
