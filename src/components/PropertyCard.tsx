import { Link } from "@tanstack/react-router";
import { Heart, BedDouble, Bath, MapPin, Sparkles, ShieldCheck, Droplets, CheckCircle2 } from "lucide-react";
import { type Property, formatKES } from "@/lib/properties";
import { useSaved } from "@/lib/saved";
import { cn } from "@/lib/utils";

export function PropertyCard({ property }: { property: Property }) {
  const { isSaved, toggle } = useSaved();
  const saved = isSaved(property.id);

  return (
    <Link
      to="/property/$id"
      params={{ id: property.id }}
      className="group block animate-fade-up"
    >
      <article className="overflow-hidden rounded-3xl bg-card shadow-card transition-all duration-300 hover:-translate-y-0.5 hover:shadow-elegant">
        <div className="relative aspect-[4/3] overflow-hidden">
          <img
            src={property.images[0]}
            alt={property.title}
            loading="lazy"
            width={1024}
            height={768}
            className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />

          {/* Top badges */}
          <div className="absolute left-3 right-3 top-3 flex items-start justify-between">
            <div className="flex flex-wrap gap-1.5">
              {property.premium && (
                <span className="flex items-center gap-1 rounded-full bg-gold px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wide text-gold-foreground shadow-card">
                  <Sparkles className="h-3 w-3" /> Premium
                </span>
              )}
              {property.verified === "today" && (
                <span className="flex items-center gap-1 rounded-full bg-primary/95 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wide text-primary-foreground shadow-card">
                  <CheckCircle2 className="h-3 w-3" /> Verified today
                </span>
              )}
              {property.noAgentFee && (
                <span className="rounded-full glass px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wide text-foreground">
                  No agent fee
                </span>
              )}
            </div>
            <button
              onClick={(e) => { e.preventDefault(); toggle(property.id); }}
              aria-label={saved ? "Unsave" : "Save"}
              className="flex h-9 w-9 items-center justify-center rounded-full glass transition hover:scale-110"
            >
              <Heart className={cn("h-4 w-4", saved ? "fill-destructive text-destructive" : "text-foreground")} />
            </button>
          </div>

          {/* Bottom price + location */}
          <div className="absolute inset-x-3 bottom-3 flex items-end justify-between text-white">
            <div>
              <div className="flex items-center gap-1 text-[11px] font-medium opacity-90">
                <MapPin className="h-3 w-3" /> {property.neighborhood}
              </div>
              <h3 className="font-display text-base font-bold leading-tight">
                {property.title}
              </h3>
            </div>
            <div className="rounded-2xl bg-white/95 px-3 py-1.5 text-right shadow-card backdrop-blur">
              <div className="font-display text-sm font-bold text-foreground">{formatKES(property.rent)}</div>
              <div className="text-[10px] font-medium text-muted-foreground">per month</div>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between px-4 py-3 text-xs">
          <div className="flex items-center gap-3 text-muted-foreground">
            <span className="flex items-center gap-1"><BedDouble className="h-3.5 w-3.5" /> {property.beds}</span>
            <span className="flex items-center gap-1"><Bath className="h-3.5 w-3.5" /> {property.baths}</span>
            <span className="text-muted-foreground/70">{property.sqm} m²</span>
          </div>
          <div className="flex items-center gap-2.5 text-[11px]">
            <span className="flex items-center gap-1 text-primary"><Droplets className="h-3 w-3" /> {property.scores.water}</span>
            <span className="flex items-center gap-1 text-primary"><ShieldCheck className="h-3 w-3" /> {property.scores.security}</span>
          </div>
        </div>
      </article>
    </Link>
  );
}
