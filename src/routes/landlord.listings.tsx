import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
// Landlord "Buildings" view — alias of the portfolio list, grouped visually.
import { useEffect, useState } from "react";
import { Plus, Building2, MapPin, Loader2 } from "lucide-react";
import { useAuth } from "@/lib/auth";
import { supabase } from "@/integrations/supabase/client";
import { formatKES } from "@/lib/properties";

export const Route = createFileRoute("/landlord/listings")({
  head: () => ({ meta: [{ title: "Buildings · Landlord" }] }),
  component: BuildingsPage,
});

type Row = { id: string; title: string; neighborhood: string; rent: number; property_type: string; building_name: string | null; vacant: boolean; published: boolean };

function BuildingsPage() {
  const { user, isLandlord, isLoading } = useAuth();
  const navigate = useNavigate();
  const [rows, setRows] = useState<Row[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isLoading) return;
    if (!user) { navigate({ to: "/auth" }); return; }
    if (!isLandlord) { navigate({ to: "/profile" }); return; }
    supabase.from("listings")
      .select("id, title, neighborhood, rent, property_type, building_name, vacant, published")
      .eq("owner_id", user.id)
      .order("created_at", { ascending: false })
      .then(({ data }) => { setRows((data ?? []) as Row[]); setLoading(false); });
  }, [user, isLandlord, isLoading, navigate]);

  const grouped = rows.reduce<Record<string, Row[]>>((acc, r) => {
    const k = r.building_name || r.neighborhood;
    (acc[k] ||= []).push(r);
    return acc;
  }, {});

  return (
    <div className="px-5 pb-6 pt-6">
      <div className="flex items-center justify-between">
        <h1 className="font-display text-2xl font-extrabold">Buildings</h1>
        <Link to="/landlord/new" className="flex items-center gap-1.5 rounded-2xl gradient-primary px-3.5 py-2 text-xs font-semibold text-primary-foreground shadow-elegant">
          <Plus className="h-3.5 w-3.5" /> New
        </Link>
      </div>

      {loading ? (
        <div className="flex justify-center py-20"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>
      ) : rows.length === 0 ? (
        <div className="mt-6 rounded-3xl border border-dashed border-border bg-surface p-10 text-center">
          <Building2 className="mx-auto h-8 w-8 text-primary" />
          <p className="mt-3 font-display text-base font-bold">No buildings yet</p>
          <p className="mt-1 text-sm text-muted-foreground">Add your first building to populate this view.</p>
        </div>
      ) : (
        <div className="mt-5 space-y-5">
          {Object.entries(grouped).map(([k, list]) => (
            <section key={k}>
              <div className="flex items-center justify-between px-1">
                <h2 className="flex items-center gap-2 font-display text-base font-bold"><Building2 className="h-4 w-4 text-primary" /> {k}</h2>
                <span className="text-[11px] text-muted-foreground">{list.length} unit{list.length === 1 ? "" : "s"}</span>
              </div>
              <div className="mt-2 space-y-2">
                {list.map(l => (
                  <article key={l.id} className="flex items-center justify-between rounded-2xl bg-card p-3 shadow-card">
                    <div className="min-w-0">
                      <p className="truncate text-sm font-bold">{l.title}</p>
                      <p className="mt-0.5 flex items-center gap-1 text-[11px] text-muted-foreground"><MapPin className="h-3 w-3" /> {l.neighborhood} · {l.property_type}</p>
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
            </section>
          ))}
        </div>
      )}
    </div>
  );
}
