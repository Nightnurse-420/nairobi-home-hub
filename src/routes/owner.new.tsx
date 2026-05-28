import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { ArrowLeft, Upload, Loader2, X } from "lucide-react";
import { useAuth } from "@/lib/auth";
import { supabase } from "@/integrations/supabase/client";
import { NEIGHBORHOODS, AMENITY_FILTERS } from "@/lib/properties";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

const TYPES = ["Bedsitter", "Studio", "1BR", "2BR", "3BR", "Penthouse"];

export const Route = createFileRoute("/owner/new")({
  head: () => ({ meta: [{ title: "List my unit · Apartment Owner" }] }),
  component: NewUnitPage,
});

function NewUnitPage() {
  const { user, isOwner, isAdmin, isLoading } = useAuth();
  const navigate = useNavigate();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [neighborhood, setNeighborhood] = useState("Kilimani");
  const [buildingName, setBuildingName] = useState("");
  const [unitNumber, setUnitNumber] = useState("");
  const [propertyType, setPropertyType] = useState("1BR");
  const [rent, setRent] = useState("");
  const [beds, setBeds] = useState("1");
  const [baths, setBaths] = useState("1");
  const [sqm, setSqm] = useState("");
  const [whatsapp, setWhatsapp] = useState("");
  const [amenities, setAmenities] = useState<string[]>([]);
  const [files, setFiles] = useState<File[]>([]);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (isLoading) return;
    if (!user) navigate({ to: "/auth" });
    else if (!isOwner && !isAdmin) navigate({ to: "/onboarding/role" });
  }, [user, isOwner, isAdmin, isLoading, navigate]);

  const toggleAmenity = (a: string) => {
    setAmenities(prev => prev.includes(a) ? prev.filter(x => x !== a) : [...prev, a]);
  };

  const handleFiles = (fl: FileList | null) => {
    if (!fl) return;
    const arr = Array.from(fl).slice(0, 8 - files.length);
    setFiles(prev => [...prev, ...arr]);
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setSubmitting(true);
    try {
      const { data: listing, error } = await supabase.from("listings").insert({
        owner_id: user.id,
        title, description,
        neighborhood, property_type: propertyType,
        building_name: buildingName || null,
        unit_number: unitNumber || null,
        rent: parseInt(rent), beds: parseInt(beds), baths: parseInt(baths),
        sqm: sqm ? parseInt(sqm) : null,
        amenities, whatsapp: whatsapp || null,
        vacant: true, published: true,
      }).select("id").single();
      if (error) throw error;

      for (let i = 0; i < files.length; i++) {
        const f = files[i];
        const path = `${user.id}/${listing.id}/${Date.now()}-${i}-${f.name.replace(/[^a-zA-Z0-9.]/g, "_")}`;
        const { error: upErr } = await supabase.storage.from("listing-photos").upload(path, f);
        if (upErr) { toast.error(`Image ${i + 1} failed: ${upErr.message}`); continue; }
        const { data: pub } = supabase.storage.from("listing-photos").getPublicUrl(path);
        await supabase.from("listing_images").insert({ listing_id: listing.id, url: pub.publicUrl, position: i });
      }

      toast.success("Your unit is live!");
      navigate({ to: "/owner" });
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : "Failed to create listing");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="px-5 pb-10 pt-6">
      <Link to="/owner" className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-card shadow-card">
        <ArrowLeft className="h-4 w-4" />
      </Link>
      <h1 className="mt-5 font-display text-2xl font-extrabold">List my unit</h1>
      <p className="text-sm text-muted-foreground">Single-unit owners — share what makes your home special.</p>

      <form onSubmit={submit} className="mt-6 space-y-5">
        <Field label="Listing title">
          <input required value={title} onChange={e => setTitle(e.target.value)} placeholder="Cozy 1BR with city view" className={inputCls} />
        </Field>

        <div className="grid grid-cols-2 gap-3">
          <Field label="Building name">
            <input value={buildingName} onChange={e => setBuildingName(e.target.value)} placeholder="Greenfield Apts" className={inputCls} />
          </Field>
          <Field label="Unit #">
            <input value={unitNumber} onChange={e => setUnitNumber(e.target.value)} placeholder="3B" className={inputCls} />
          </Field>
        </div>

        <Field label="Description">
          <textarea required value={description} onChange={e => setDescription(e.target.value)} rows={4} placeholder="What makes your unit special?" className={cn(inputCls, "resize-none")} />
        </Field>

        <div className="grid grid-cols-2 gap-3">
          <Field label="Neighborhood">
            <select value={neighborhood} onChange={e => setNeighborhood(e.target.value)} className={inputCls}>
              {NEIGHBORHOODS.map(n => <option key={n}>{n}</option>)}
            </select>
          </Field>
          <Field label="Type">
            <select value={propertyType} onChange={e => setPropertyType(e.target.value)} className={inputCls}>
              {TYPES.map(t => <option key={t}>{t}</option>)}
            </select>
          </Field>
        </div>

        <Field label="Monthly rent (KES)">
          <input required type="number" min="1000" value={rent} onChange={e => setRent(e.target.value)} placeholder="35000" className={inputCls} />
        </Field>

        <div className="grid grid-cols-3 gap-3">
          <Field label="Beds"><input required type="number" min="0" value={beds} onChange={e => setBeds(e.target.value)} className={inputCls} /></Field>
          <Field label="Baths"><input required type="number" min="1" value={baths} onChange={e => setBaths(e.target.value)} className={inputCls} /></Field>
          <Field label="Size (m²)"><input type="number" min="10" value={sqm} onChange={e => setSqm(e.target.value)} className={inputCls} /></Field>
        </div>

        <Field label="WhatsApp" sub="Tenants will message you here">
          <input value={whatsapp} onChange={e => setWhatsapp(e.target.value)} placeholder="+254712345678" className={inputCls} />
        </Field>

        <Field label="Amenities">
          <div className="flex flex-wrap gap-2">
            {AMENITY_FILTERS.map(a => (
              <button type="button" key={a} onClick={() => toggleAmenity(a)} className={cn(
                "rounded-full border px-3 py-1.5 text-xs font-semibold transition",
                amenities.includes(a) ? "border-primary bg-primary text-primary-foreground" : "border-border bg-card text-muted-foreground"
              )}>{a}</button>
            ))}
          </div>
        </Field>

        <Field label="Photos" sub="Up to 8 photos">
          <label className="flex flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-border bg-card py-8 text-sm text-muted-foreground transition hover:border-primary/40 cursor-pointer">
            <Upload className="h-5 w-5" />
            Tap to upload photos
            <input type="file" accept="image/*" multiple className="hidden" onChange={e => handleFiles(e.target.files)} />
          </label>
          {files.length > 0 && (
            <div className="mt-3 grid grid-cols-4 gap-2">
              {files.map((f, i) => (
                <div key={i} className="relative aspect-square overflow-hidden rounded-xl bg-muted">
                  <img src={URL.createObjectURL(f)} alt="" className="h-full w-full object-cover" />
                  <button type="button" onClick={() => setFiles(prev => prev.filter((_, x) => x !== i))} className="absolute right-1 top-1 flex h-5 w-5 items-center justify-center rounded-full bg-black/60 text-white">
                    <X className="h-3 w-3" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </Field>

        <button type="submit" disabled={submitting} className="flex w-full items-center justify-center gap-2 rounded-2xl gradient-primary py-3.5 text-sm font-semibold text-primary-foreground shadow-elegant disabled:opacity-60">
          {submitting && <Loader2 className="h-4 w-4 animate-spin" />}
          Publish unit
        </button>
      </form>
    </div>
  );
}

const inputCls = "w-full rounded-2xl border border-border bg-card px-4 py-3 text-sm shadow-card outline-none focus:border-primary";

function Field({ label, sub, children }: { label: string; sub?: string; children: React.ReactNode }) {
  return (
    <div>
      <div className="mb-1.5 flex items-baseline justify-between">
        <label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">{label}</label>
        {sub && <span className="text-[10px] text-muted-foreground">{sub}</span>}
      </div>
      {children}
    </div>
  );
}
