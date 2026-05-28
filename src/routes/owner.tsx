import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Plus, KeyRound, Eye, EyeOff, Loader2, MapPin, TrendingUp, Wallet, BedDouble } from "lucide-react";
import { useAuth } from "@/lib/auth";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { formatKES } from "@/lib/properties";

export const Route = createFileRoute("/owner")({
  head: () => ({ meta: [{ title: "My Unit · Apartment Owner" }] }),
  component: OwnerHome,
});

type Unit = {
  id: string;
  title: string;
  neighborhood: string;
  building_name: string | null;
  unit_number: string | null;
  rent: number;
  beds: number;
  property_type: string;
  vacant: boolean;
  published: boolean;
};

function OwnerHome() {
  const { user, profile, isOwner, isAdmin, isLoading } = useAuth();
  const navigate = useNavigate();
  const [units, setUnits] = useState<Unit[]>([]);
  const [covers, setCovers] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isLoading) return;
    if (!user) { navigate({ to: "/auth" }); return; }
    if (!isOwner && !isAdmin) { navigate({ to: "/onboarding/role" }); return; }
    (async () => {
      const { data, error } = await supabase
        .from("listings")
        .select("id, title, neighborhood, building_name, unit_number, rent, beds, property_type, vacant, published")
        .eq("owner_id", user.id)
        .order("created_at", { ascending: false });
      if (error) toast.error(error.message);
      else {
        const rows = (data ?? []) as Unit[];
        setUnits(rows);
        if (rows.length) {
          const { data: imgs } = await supabase
            .from("listing_images")
            .select("listing_id, url, position")
            .in("listing_id", rows.map(r => r.id))
            .order("position");
          const c: Record<string, string> = {};
          for (const im of (imgs ?? []) as { listing_id: string; url: string }[]) {
            if (!c[im.listing_id]) c[im.listing_id] = im.url;
          }
          setCovers(c);
        }
      }
      setLoading(false);
    })();
  }, [user, isOwner, isAdmin, isLoading, navigate]);

  const togglePublished = async (u: Unit) => {
    const { error } = await supabase.from("listings").update({ published: !u.published }).eq("id", u.id);
    if (error) toast.error(error.message);
    else setUnits(arr => arr.map(x => x.id === u.id ? { ...x, published: !x.published } : x));
  };

  const totalRent = units.filter(u => !u.vacant).reduce((s, u) => s + u.rent, 0);
  const occupancy = units.length ? Math.round((units.filter(u => !u.vacant).length / units.length) * 100) : 0;

  return (
    <div className="pb-4">
      {/* Hero */}
      <header className="rounded-b-[2.5rem] gradient-primary px-5 pb-7 pt-8 text-primary-foreground shadow-elegant">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-widest opacity-80">Apartment Owner</p>
            <h1 className="mt-1 font-display text-2xl font-extrabold">
              Karibu, {(profile?.full_name ?? "Owner").split(" ")[0]}
            </h1>
          </div>
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/15 backdrop-blur">
            <KeyRound className="h-5 w-5" />
          </div>
        </div>

        <div className="mt-6 grid grid-cols-3 gap-2">
          <Stat label="My units" value={units.length} />
          <Stat label="Occupied" value={`${occupancy}%`} />
          <Stat label="Monthly" value={units.length ? `${Math.round(totalRent / 1000)}K` : "—"} />
        </div>
      </header>

      <div className="px-5">
        <div className="-mt-5 grid grid-cols-2 gap-3">
          <ActionCard to="/owner/new" icon={Plus} label="List a unit" />
          <ActionCard to="/owner/finances" icon={Wallet} label="Finances" />
        </div>

        <section className="mt-7">
          <div className="flex items-center justify-between pb-3">
            <h2 className="font-display text-lg font-bold">My units</h2>
            <Link to="/owner/new" className="flex items-center gap-1 text-xs font-semibold text-primary">
              <Plus className="h-3.5 w-3.5" /> Add
            </Link>
          </div>

          {loading ? (
            <div className="flex justify-center py-16"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>
          ) : units.length === 0 ? (
            <div className="rounded-3xl border border-dashed border-border bg-surface p-10 text-center">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10">
                <KeyRound className="h-6 w-6 text-primary" />
              </div>
              <p className="mt-4 font-display text-base font-bold">No units yet</p>
              <p className="mt-1 text-sm text-muted-foreground">List your unit to start receiving inquiries from tenants.</p>
              <Link to="/owner/new" className="mt-5 inline-flex items-center gap-2 rounded-2xl gradient-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground shadow-elegant">
                <Plus className="h-4 w-4" /> List my unit
              </Link>
            </div>
          ) : (
            <div className="space-y-3">
              {units.map(u => (
                <article key={u.id} className="overflow-hidden rounded-3xl bg-card shadow-card">
                  <div className="flex gap-3 p-3">
                    {covers[u.id] ? (
                      <img src={covers[u.id]} alt="" className="h-24 w-24 flex-shrink-0 rounded-2xl object-cover" />
                    ) : (
                      <div className="flex h-24 w-24 flex-shrink-0 items-center justify-center rounded-2xl bg-muted">
                        <KeyRound className="h-6 w-6 text-muted-foreground" />
                      </div>
                    )}
                    <div className="min-w-0 flex-1">
                      <p className="line-clamp-1 font-display text-sm font-bold">{u.title}</p>
                      {u.building_name && (
                        <p className="mt-0.5 text-[11px] font-semibold uppercase tracking-wide text-primary">
                          {u.building_name}{u.unit_number ? ` · Unit ${u.unit_number}` : ""}
                        </p>
                      )}
                      <p className="mt-0.5 flex items-center gap-1 text-xs text-muted-foreground">
                        <MapPin className="h-3 w-3" /> {u.neighborhood}
                        <span className="mx-1">·</span>
                        <BedDouble className="h-3 w-3" /> {u.beds} · {u.property_type}
                      </p>
                      <p className="mt-1 font-display text-base font-bold text-primary">{formatKES(u.rent)}<span className="text-[10px] font-medium text-muted-foreground">/mo</span></p>
                      <div className="mt-1 flex gap-1.5 text-[10px] font-semibold uppercase tracking-wide">
                        {u.vacant ? <span className="rounded-full bg-primary/10 px-2 py-0.5 text-primary">Vacant</span> : <span className="rounded-full bg-muted px-2 py-0.5 text-muted-foreground">Rented</span>}
                        {u.published ? <span className="rounded-full bg-primary/10 px-2 py-0.5 text-primary">Live</span> : <span className="rounded-full bg-muted px-2 py-0.5 text-muted-foreground">Draft</span>}
                      </div>
                    </div>
                  </div>
                  <button onClick={() => togglePublished(u)} className="flex w-full items-center justify-center gap-1.5 border-t border-border py-2.5 text-xs font-semibold hover:bg-muted/50">
                    {u.published ? <><EyeOff className="h-3.5 w-3.5" /> Unpublish</> : <><Eye className="h-3.5 w-3.5" /> Publish</>}
                  </button>
                </article>
              ))}
            </div>
          )}
        </section>

        <section className="mt-7 rounded-3xl bg-card p-5 shadow-card">
          <div className="flex items-center gap-2 text-primary">
            <TrendingUp className="h-4 w-4" />
            <p className="text-xs font-bold uppercase tracking-wide">This month</p>
          </div>
          <p className="mt-2 font-display text-2xl font-extrabold">{formatKES(totalRent)}</p>
          <p className="text-xs text-muted-foreground">Projected rent across rented units</p>
        </section>
      </div>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="rounded-2xl bg-white/15 px-3 py-2.5 text-center backdrop-blur">
      <p className="font-display text-lg font-bold leading-tight">{value}</p>
      <p className="text-[10px] uppercase tracking-wide opacity-80">{label}</p>
    </div>
  );
}

function ActionCard({ to, icon: Icon, label }: { to: string; icon: React.ComponentType<{ className?: string }>; label: string }) {
  return (
    <Link to={to} className="flex items-center gap-3 rounded-2xl bg-card p-4 shadow-card transition hover:shadow-elegant">
      <div className="flex h-10 w-10 items-center justify-center rounded-xl gradient-primary text-primary-foreground">
        <Icon className="h-4 w-4" />
      </div>
      <span className="text-sm font-semibold">{label}</span>
    </Link>
  );
}
