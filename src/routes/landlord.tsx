import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Plus, Building2, Eye, EyeOff, Trash2, Loader2, ArrowLeft, MapPin } from "lucide-react";
import { useAuth } from "@/lib/auth";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { formatKES } from "@/lib/properties";

export const Route = createFileRoute("/landlord")({
  head: () => ({ meta: [{ title: "My listings · NyumbaSearch" }] }),
  component: LandlordPage,
});

type DbListing = {
  id: string;
  title: string;
  neighborhood: string;
  rent: number;
  property_type: string;
  vacant: boolean;
  published: boolean;
  created_at: string;
};

function LandlordPage() {
  const { user, isLandlord, isLoading } = useAuth();
  const navigate = useNavigate();
  const [listings, setListings] = useState<DbListing[]>([]);
  const [coverByListing, setCoverByListing] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isLoading) return;
    if (!user) { navigate({ to: "/auth" }); return; }
    if (!isLandlord) { navigate({ to: "/profile" }); return; }

    (async () => {
      const { data, error } = await supabase
        .from("listings")
        .select("id, title, neighborhood, rent, property_type, vacant, published, created_at")
        .eq("owner_id", user.id)
        .order("created_at", { ascending: false });
      if (error) toast.error(error.message);
      else {
        const rows = (data ?? []) as DbListing[];
        setListings(rows);
        if (rows.length) {
          const { data: imgs } = await supabase
            .from("listing_images")
            .select("listing_id, url, position")
            .in("listing_id", rows.map(r => r.id))
            .order("position");
          const cover: Record<string, string> = {};
          for (const im of (imgs ?? []) as { listing_id: string; url: string }[]) {
            if (!cover[im.listing_id]) cover[im.listing_id] = im.url;
          }
          setCoverByListing(cover);
        }
      }
      setLoading(false);
    })();
  }, [user, isLandlord, isLoading, navigate]);

  const remove = async (id: string) => {
    if (!confirm("Delete this listing?")) return;
    const { error } = await supabase.from("listings").delete().eq("id", id);
    if (error) toast.error(error.message);
    else {
      setListings(l => l.filter(x => x.id !== id));
      toast.success("Listing removed");
    }
  };

  const togglePublished = async (l: DbListing) => {
    const { error } = await supabase.from("listings").update({ published: !l.published }).eq("id", l.id);
    if (error) toast.error(error.message);
    else setListings(arr => arr.map(x => x.id === l.id ? { ...x, published: !x.published } : x));
  };

  return (
    <div className="px-5 pb-4 pt-6">
      <div className="flex items-center justify-between">
        <Link to="/profile" className="flex h-10 w-10 items-center justify-center rounded-full bg-card shadow-card">
          <ArrowLeft className="h-4 w-4" />
        </Link>
        <Link to="/landlord/new" className="flex items-center gap-2 rounded-2xl gradient-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground shadow-elegant">
          <Plus className="h-4 w-4" /> New listing
        </Link>
      </div>

      <h1 className="mt-5 font-display text-2xl font-extrabold">My listings</h1>
      <p className="text-sm text-muted-foreground">Manage and verify your properties</p>

      {loading ? (
        <div className="flex justify-center py-20"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>
      ) : listings.length === 0 ? (
        <div className="mt-8 rounded-3xl border border-dashed border-border bg-surface p-10 text-center">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10">
            <Building2 className="h-6 w-6 text-primary" />
          </div>
          <p className="mt-4 font-display text-base font-bold">No listings yet</p>
          <p className="mt-1 text-sm text-muted-foreground">Add your first vacant property to reach tenants directly — no agents.</p>
          <Link to="/landlord/new" className="mt-5 inline-flex items-center gap-2 rounded-2xl gradient-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground shadow-elegant">
            <Plus className="h-4 w-4" /> List a property
          </Link>
        </div>
      ) : (
        <div className="mt-5 space-y-3">
          {listings.map(l => (
            <article key={l.id} className="overflow-hidden rounded-3xl bg-card shadow-card">
              <div className="flex gap-3 p-3">
                {coverByListing[l.id] ? (
                  <img src={coverByListing[l.id]} alt="" className="h-20 w-20 flex-shrink-0 rounded-2xl object-cover" />
                ) : (
                  <div className="flex h-20 w-20 flex-shrink-0 items-center justify-center rounded-2xl bg-muted">
                    <Building2 className="h-6 w-6 text-muted-foreground" />
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <p className="line-clamp-1 font-display text-sm font-bold">{l.title}</p>
                  <p className="mt-0.5 flex items-center gap-1 text-xs text-muted-foreground">
                    <MapPin className="h-3 w-3" /> {l.neighborhood} · {l.property_type}
                  </p>
                  <p className="mt-1 font-display text-sm font-bold text-primary">{formatKES(l.rent)}<span className="text-[10px] font-medium text-muted-foreground">/mo</span></p>
                  <div className="mt-1.5 flex gap-1.5 text-[10px] font-semibold uppercase tracking-wide">
                    {l.vacant ? <span className="rounded-full bg-primary/10 px-2 py-0.5 text-primary">Vacant</span> : <span className="rounded-full bg-muted px-2 py-0.5 text-muted-foreground">Occupied</span>}
                    {l.published ? <span className="rounded-full bg-primary/10 px-2 py-0.5 text-primary">Live</span> : <span className="rounded-full bg-muted px-2 py-0.5 text-muted-foreground">Draft</span>}
                  </div>
                </div>
              </div>
              <div className="flex divide-x divide-border border-t border-border text-xs font-semibold">
                <button onClick={() => togglePublished(l)} className="flex flex-1 items-center justify-center gap-1.5 py-2.5 hover:bg-muted/50">
                  {l.published ? <><EyeOff className="h-3.5 w-3.5" /> Unpublish</> : <><Eye className="h-3.5 w-3.5" /> Publish</>}
                </button>
                <button onClick={() => remove(l.id)} className="flex flex-1 items-center justify-center gap-1.5 py-2.5 text-destructive hover:bg-destructive/10">
                  <Trash2 className="h-3.5 w-3.5" /> Delete
                </button>
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
