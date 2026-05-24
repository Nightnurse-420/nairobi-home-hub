import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useState } from "react";
import {
  ArrowLeft, Heart, Share2, MapPin, BedDouble, Bath, Maximize2, Phone,
  MessageCircle, ShieldCheck, Droplets, Wifi, Zap, CheckCircle2, Star, Flag,
} from "lucide-react";
import { getProperty, formatKES, PROPERTIES } from "@/lib/properties";
import { useSaved } from "@/lib/saved";
import { cn } from "@/lib/utils";
import { ReviewsSection } from "@/components/ReviewsSection";

export const Route = createFileRoute("/property/$id")({
  head: ({ params }) => {
    const p = getProperty(params.id);
    return {
      meta: [
        { title: p ? `${p.title} — ${p.neighborhood} · NyumbaSearch` : "Property · NyumbaSearch" },
        { name: "description", content: p?.description.slice(0, 155) ?? "" },
        ...(p ? [{ property: "og:image", content: p.images[0] }] : []),
      ],
    };
  },
  loader: ({ params }) => {
    const p = getProperty(params.id);
    if (!p) throw notFound();
    return p;
  },
  notFoundComponent: () => (
    <div className="flex min-h-screen items-center justify-center px-4 text-center">
      <div>
        <h1 className="font-display text-2xl font-bold">Listing not found</h1>
        <Link to="/" className="mt-4 inline-flex rounded-2xl gradient-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground">Back home</Link>
      </div>
    </div>
  ),
  component: PropertyPage,
});

function PropertyPage() {
  const p = Route.useLoaderData();
  const [active, setActive] = useState(0);
  const { isSaved, toggle } = useSaved();
  const saved = isSaved(p.id);

  const phone = p.landlord.phone.replace(/\D/g, "");

  return (
    <div className="pb-32">
      {/* Gallery */}
      <div className="relative aspect-[4/3] w-full overflow-hidden bg-muted">
        <img src={p.images[active]} alt={p.title} width={1024} height={768} className="h-full w-full object-cover animate-scale-in" key={active} />
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-black/40 via-transparent to-transparent" />

        {/* Top bar */}
        <div className="absolute inset-x-0 top-0 flex items-center justify-between px-4 pt-5">
          <Link to="/" className="flex h-10 w-10 items-center justify-center rounded-full glass">
            <ArrowLeft className="h-4 w-4" />
          </Link>
          <div className="flex gap-2">
            <button className="flex h-10 w-10 items-center justify-center rounded-full glass">
              <Share2 className="h-4 w-4" />
            </button>
            <button onClick={() => toggle(p.id)} className="flex h-10 w-10 items-center justify-center rounded-full glass">
              <Heart className={cn("h-4 w-4", saved && "fill-destructive text-destructive")} />
            </button>
          </div>
        </div>

        {/* Thumbnails */}
        {p.images.length > 1 && (
          <div className="absolute inset-x-0 bottom-3 flex justify-center gap-1.5">
            {p.images.map((_: string, i: number) => (
              <button key={i} onClick={() => setActive(i)} className={cn("h-1.5 rounded-full transition-all", i === active ? "w-6 bg-white" : "w-1.5 bg-white/60")} />
            ))}
          </div>
        )}
      </div>

      {/* Header */}
      <section className="px-5 pt-5">
        <div className="flex flex-wrap gap-1.5">
          {p.verified === "today" && (
            <Badge tone="primary"><CheckCircle2 className="h-3 w-3" /> Verified today</Badge>
          )}
          {p.premium && <Badge tone="gold">Premium</Badge>}
          {p.noAgentFee && <Badge tone="muted">No agent fee</Badge>}
          {p.landlord.trusted && <Badge tone="muted"><ShieldCheck className="h-3 w-3" /> Trusted landlord</Badge>}
        </div>
        <h1 className="mt-3 font-display text-2xl font-extrabold leading-tight">{p.title}</h1>
        <div className="mt-1 flex items-center gap-3 text-sm text-muted-foreground">
          <span className="flex items-center gap-1"><MapPin className="h-3.5 w-3.5" /> {p.neighborhood}, Nairobi</span>
          <span className="flex items-center gap-1 text-foreground"><Star className="h-3.5 w-3.5 fill-gold text-gold" /> {p.rating} <span className="text-muted-foreground">({p.reviews})</span></span>
        </div>

        {/* Stats row */}
        <div className="mt-5 grid grid-cols-3 overflow-hidden rounded-3xl border border-border bg-card">
          <Stat icon={BedDouble} label="Bedrooms" value={p.beds.toString()} />
          <Stat icon={Bath} label="Bathrooms" value={p.baths.toString()} divider />
          <Stat icon={Maximize2} label="Area" value={`${p.sqm} m²`} divider />
        </div>
      </section>

      {/* Price */}
      <section className="mt-5 px-5">
        <div className="flex items-center justify-between rounded-3xl gradient-primary p-5 text-primary-foreground shadow-elegant">
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest opacity-90">Monthly rent</p>
            <p className="font-display text-2xl font-extrabold">{formatKES(p.rent)}</p>
          </div>
          <div className="text-right text-xs opacity-90">
            <p>Posted {p.postedDays}d ago</p>
            <p className="font-semibold">Available now</p>
          </div>
        </div>
      </section>

      {/* Scores */}
      <section className="mt-6 px-5">
        <h2 className="font-display text-base font-bold">Neighborhood scores</h2>
        <p className="text-xs text-muted-foreground">Based on resident reports</p>
        <div className="mt-3 grid grid-cols-2 gap-2.5">
          <ScoreCard icon={Droplets} label="Water" score={p.scores.water} />
          <ScoreCard icon={ShieldCheck} label="Security" score={p.scores.security} />
          <ScoreCard icon={Wifi} label="Internet" score={p.scores.internet} />
          <ScoreCard icon={Zap} label="Power" score={p.scores.power} />
        </div>
      </section>

      {/* Amenities */}
      <section className="mt-6 px-5">
        <h2 className="font-display text-base font-bold">Amenities</h2>
        <div className="mt-3 flex flex-wrap gap-2">
          {p.amenities.map((a: string) => (
            <span key={a} className="rounded-full border border-border bg-card px-3 py-1.5 text-xs font-medium">{a}</span>
          ))}
        </div>
      </section>

      {/* About */}
      <section className="mt-6 px-5">
        <h2 className="font-display text-base font-bold">About this home</h2>
        <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{p.description}</p>
      </section>

      {/* Landlord */}
      <section className="mt-6 px-5">
        <div className="rounded-3xl bg-card p-4 shadow-card">
          <div className="flex items-center gap-3">
            <div className="gradient-primary flex h-12 w-12 items-center justify-center rounded-full font-display text-base font-bold text-primary-foreground">
              {p.landlord.name.charAt(0)}
            </div>
            <div className="flex-1">
              <p className="font-semibold">{p.landlord.name}</p>
              <p className="text-xs text-muted-foreground">
                {p.landlord.trusted ? "Trusted landlord · ID verified" : "Landlord"}
              </p>
            </div>
          </div>
        </div>
      </section>

      <ReviewsSection listingId={p.id} />

      <section className="mt-6 px-5">
        <button className="flex w-full items-center justify-center gap-2 rounded-2xl border border-border bg-card py-3 text-xs font-semibold text-muted-foreground">
          <Flag className="h-3.5 w-3.5" /> Report this listing
        </button>
      </section>

      {/* Similar */}
      <section className="mt-8">
        <h2 className="px-5 font-display text-base font-bold">More in {p.neighborhood}</h2>
        <div className="no-scrollbar flex gap-3 overflow-x-auto px-5 pb-2 pt-3">
          {PROPERTIES.filter((x) => x.neighborhood === p.neighborhood && x.id !== p.id).slice(0, 4).map((s) => (
            <Link key={s.id} to="/property/$id" params={{ id: s.id }} className="w-40 flex-shrink-0">
              <img src={s.images[0]} alt={s.title} loading="lazy" width={300} height={300} className="h-28 w-full rounded-2xl object-cover" />
              <p className="mt-2 line-clamp-1 text-xs font-semibold">{s.title}</p>
              <p className="text-[11px] text-muted-foreground">{formatKES(s.rent)}/mo</p>
            </Link>
          ))}
        </div>
      </section>

      {/* Sticky CTAs */}
      <div className="fixed inset-x-0 bottom-0 z-30 mx-auto max-w-md p-4 safe-bottom">
        <div className="flex gap-2 rounded-3xl bg-card p-2 shadow-elegant">
          <a
            href={`tel:${phone}`}
            className="flex flex-1 items-center justify-center gap-2 rounded-2xl border border-border bg-background py-3 text-sm font-semibold"
          >
            <Phone className="h-4 w-4" /> Call
          </a>
          <a
            href={`https://wa.me/${phone}?text=${encodeURIComponent("Hi, I'm interested in your listing on NyumbaSearch: " + p.title)}`}
            target="_blank" rel="noreferrer"
            className="flex flex-[1.6] items-center justify-center gap-2 rounded-2xl gradient-primary py-3 text-sm font-semibold text-primary-foreground shadow-elegant"
          >
            <MessageCircle className="h-4 w-4" /> WhatsApp landlord
          </a>
        </div>
      </div>
    </div>
  );
}

function Badge({ children, tone }: { children: React.ReactNode; tone: "primary" | "gold" | "muted" }) {
  const styles =
    tone === "primary" ? "bg-primary text-primary-foreground"
    : tone === "gold" ? "bg-gold text-gold-foreground"
    : "bg-muted text-foreground";
  return (
    <span className={cn("inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wide", styles)}>
      {children}
    </span>
  );
}

function Stat({ icon: Icon, label, value, divider }: {
  icon: React.ComponentType<{ className?: string }>; label: string; value: string; divider?: boolean;
}) {
  return (
    <div className={cn("px-4 py-3 text-center", divider && "border-l border-border")}>
      <Icon className="mx-auto h-4 w-4 text-primary" />
      <p className="mt-1 font-display text-sm font-bold">{value}</p>
      <p className="text-[10px] uppercase tracking-wide text-muted-foreground">{label}</p>
    </div>
  );
}

function ScoreCard({ icon: Icon, label, score }: {
  icon: React.ComponentType<{ className?: string }>; label: string; score: number;
}) {
  const color = score >= 90 ? "text-primary" : score >= 75 ? "text-foreground" : "text-destructive";
  return (
    <div className="rounded-2xl border border-border bg-card p-3">
      <div className="flex items-center justify-between">
        <span className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
          <Icon className="h-3.5 w-3.5" /> {label}
        </span>
        <span className={cn("font-display text-sm font-bold", color)}>{score}</span>
      </div>
      <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-muted">
        <div className="h-full gradient-primary" style={{ width: `${score}%` }} />
      </div>
    </div>
  );
}
