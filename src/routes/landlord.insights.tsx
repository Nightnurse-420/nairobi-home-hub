import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { BarChart3, Eye, TrendingUp } from "lucide-react";
import { useAuth } from "@/lib/auth";
import { supabase } from "@/integrations/supabase/client";
import { formatKES } from "@/lib/properties";

export const Route = createFileRoute("/landlord/insights")({
  head: () => ({ meta: [{ title: "Insights · Landlord" }] }),
  component: LandlordInsights,
});

function LandlordInsights() {
  const { user } = useAuth();
  const [stats, setStats] = useState({ total: 0, vacant: 0, rented: 0, gross: 0 });

  useEffect(() => {
    if (!user) return;
    supabase.from("listings").select("rent, vacant, published").eq("owner_id", user.id).then(({ data }) => {
      const rows = data ?? [];
      setStats({
        total: rows.length,
        vacant: rows.filter(r => r.vacant).length,
        rented: rows.filter(r => !r.vacant).length,
        gross: rows.filter(r => !r.vacant).reduce((s, r) => s + (r.rent ?? 0), 0),
      });
    });
  }, [user]);

  const occ = stats.total ? Math.round((stats.rented / stats.total) * 100) : 0;

  return (
    <div className="px-5 pb-6 pt-6">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-2xl gradient-primary text-primary-foreground shadow-elegant"><BarChart3 className="h-5 w-5" /></div>
        <div>
          <h1 className="font-display text-xl font-extrabold">Portfolio insights</h1>
          <p className="text-xs text-muted-foreground">Performance across your buildings</p>
        </div>
      </div>

      <div className="mt-6 grid grid-cols-2 gap-3">
        <Stat label="Units" value={stats.total} />
        <Stat label="Occupancy" value={`${occ}%`} />
        <Stat label="Vacant" value={stats.vacant} />
        <Stat label="Rented" value={stats.rented} />
      </div>

      <div className="mt-4 rounded-3xl bg-card p-5 shadow-card">
        <TrendingUp className="h-4 w-4 text-primary" />
        <p className="mt-2 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">Gross monthly</p>
        <p className="mt-1 font-display text-3xl font-extrabold">{formatKES(stats.gross)}</p>
      </div>

      <div className="mt-4 rounded-3xl bg-card p-5 shadow-card">
        <Eye className="h-4 w-4 text-primary" />
        <p className="mt-2 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">Listing views</p>
        <p className="mt-1 text-sm text-muted-foreground">View tracking coming soon.</p>
      </div>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="rounded-2xl bg-card p-4 shadow-card">
      <p className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">{label}</p>
      <p className="mt-1 font-display text-2xl font-extrabold">{value}</p>
    </div>
  );
}
