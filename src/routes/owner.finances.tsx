import { createFileRoute } from "@tanstack/react-router";
import { Wallet, TrendingUp, Receipt } from "lucide-react";
import { useAuth } from "@/lib/auth";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { formatKES } from "@/lib/properties";

export const Route = createFileRoute("/owner/finances")({
  head: () => ({ meta: [{ title: "Finances · Owner" }] }),
  component: OwnerFinances,
});

function OwnerFinances() {
  const { user } = useAuth();
  const [totals, setTotals] = useState({ rented: 0, units: 0, projected: 0 });

  useEffect(() => {
    if (!user) return;
    supabase.from("listings").select("rent, vacant").eq("owner_id", user.id).then(({ data }) => {
      const rows = data ?? [];
      const rented = rows.filter(r => !r.vacant).reduce((s, r) => s + (r.rent ?? 0), 0);
      setTotals({ rented, units: rows.length, projected: rented * 12 });
    });
  }, [user]);

  return (
    <div className="px-5 pb-6 pt-6">
      <h1 className="font-display text-2xl font-extrabold">Finances</h1>
      <p className="text-sm text-muted-foreground">Track rent across your units</p>

      <div className="mt-6 rounded-3xl gradient-primary p-6 text-primary-foreground shadow-elegant">
        <Wallet className="h-6 w-6 opacity-90" />
        <p className="mt-3 text-xs font-semibold uppercase tracking-widest opacity-80">Monthly rent</p>
        <p className="mt-1 font-display text-3xl font-extrabold">{formatKES(totals.rented)}</p>
        <p className="mt-1 text-xs opacity-80">across {totals.units} unit{totals.units === 1 ? "" : "s"}</p>
      </div>

      <div className="mt-4 grid grid-cols-2 gap-3">
        <Card icon={TrendingUp} label="Projected annual" value={formatKES(totals.projected)} />
        <Card icon={Receipt} label="Service charge" value="—" sub="Coming soon" />
      </div>

      <div className="mt-6 rounded-3xl border border-dashed border-border bg-surface p-8 text-center">
        <p className="font-display text-sm font-semibold">Statements & payouts</p>
        <p className="mt-1 text-xs text-muted-foreground">M-Pesa & bank reconciliation coming soon.</p>
      </div>
    </div>
  );
}

function Card({ icon: Icon, label, value, sub }: { icon: React.ComponentType<{ className?: string }>; label: string; value: string; sub?: string }) {
  return (
    <div className="rounded-2xl bg-card p-4 shadow-card">
      <Icon className="h-4 w-4 text-primary" />
      <p className="mt-2 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">{label}</p>
      <p className="mt-1 font-display text-lg font-bold">{value}</p>
      {sub && <p className="text-[10px] text-muted-foreground">{sub}</p>}
    </div>
  );
}
