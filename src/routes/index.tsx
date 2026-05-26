import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Search, SlidersHorizontal, Sparkles, MapPin, TrendingUp } from "lucide-react";
import { Logo } from "@/components/Logo";
import { PropertyCard } from "@/components/PropertyCard";
import { NEIGHBORHOODS, type Property } from "@/lib/properties";
import { useAllProperties } from "@/lib/use-listings";
import { cn } from "@/lib/utils";
import heroImg from "@/assets/nairobi-hero.jpg";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "NyumbaSearch — Find Verified Homes in Nairobi" },
      { name: "description", content: "Browse verified vacant homes in Nairobi neighborhoods. No agent fees, real vacancy data, trusted landlords." },
    ],
  }),
  component: HomePage,
});

const TYPES = ["All", "Bedsitter", "Studio", "1BR", "2BR", "3BR", "Penthouse"] as const;
const BUDGETS = [
  { label: "Any", min: 0, max: Infinity },
  { label: "<20K", min: 0, max: 20000 },
  { label: "20–50K", min: 20000, max: 50000 },
  { label: "50–100K", min: 50000, max: 100000 },
  { label: "100K+", min: 100000, max: Infinity },
];

function HomePage() {
  const [q, setQ] = useState("");
  const [type, setType] = useState<(typeof TYPES)[number]>("All");
  const [budget, setBudget] = useState(0);
  const [hood, setHood] = useState<string | null>(null);
  const { properties } = useAllProperties();

  const filtered = useMemo(() => {
    const ql = q.trim().toLowerCase();
    const b = BUDGETS[budget];
    return properties.filter((p: Property) => {
      if (type !== "All" && p.type !== type) return false;
      if (p.rent < b.min || p.rent > b.max) return false;
      if (hood && p.neighborhood !== hood) return false;
      if (ql && !(`${p.title} ${p.neighborhood} ${p.type}`.toLowerCase().includes(ql))) return false;
      return true;
    });
  }, [q, type, budget, hood, properties]);

  const verifiedToday = properties.filter((p: Property) => p.verified === "today").slice(0, 6);

  return (
    <div className="pb-4">
      {/* Hero */}
      <header className="relative overflow-hidden">
        <div className="absolute inset-0">
          <img src={heroImg} alt="" width={1280} height={896} className="h-full w-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/40 to-background" />
        </div>
        <div className="relative px-5 pb-8 pt-6 text-white">
          <div className="flex items-center justify-between">
            <Logo className="[&_span]:text-white [&_.text-primary]:text-primary-glow" />
            <button className="flex h-9 w-9 items-center justify-center rounded-full glass">
              <MapPin className="h-4 w-4" />
            </button>
          </div>
          <div className="mt-7 animate-fade-up">
            <p className="text-xs font-semibold uppercase tracking-widest text-primary-glow">
              <Sparkles className="mr-1 inline h-3 w-3" /> Nairobi · live
            </p>
            <h1 className="mt-2 font-display text-3xl font-extrabold leading-tight">
              Find verified homes,<br />smarter.
            </h1>
            <p className="mt-2 text-sm text-white/80">
              Real vacancies. Real landlords. No agent runarounds.
            </p>
          </div>

          {/* Search bar */}
          <div className="mt-5 flex items-center gap-2 rounded-2xl bg-card p-1.5 shadow-elegant">
            <div className="flex flex-1 items-center gap-2 px-3">
              <Search className="h-4 w-4 text-muted-foreground" />
              <input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Search Kilimani, Westlands…"
                className="w-full bg-transparent py-2.5 text-sm text-foreground outline-none placeholder:text-muted-foreground"
              />
            </div>
            <button className="flex h-10 w-10 items-center justify-center rounded-xl gradient-primary text-primary-foreground shadow-elegant">
              <SlidersHorizontal className="h-4 w-4" />
            </button>
          </div>

          {/* Stats */}
          <div className="mt-4 grid grid-cols-3 gap-2 text-center">
            {[
              { v: PROPERTIES.length + "+", l: "Listings" },
              { v: NEIGHBORHOODS.length, l: "Areas" },
              { v: "100%", l: "Verified" },
            ].map((s) => (
              <div key={s.l} className="rounded-2xl glass px-3 py-2">
                <div className="font-display text-base font-bold">{s.v}</div>
                <div className="text-[10px] uppercase tracking-wide text-white/70">{s.l}</div>
              </div>
            ))}
          </div>
        </div>
      </header>

      {/* Filter chips */}
      <section className="-mt-2 px-1 pt-3">
        <div className="no-scrollbar flex gap-2 overflow-x-auto px-4 pb-3">
          {TYPES.map((t) => (
            <Chip key={t} active={type === t} onClick={() => setType(t)}>{t}</Chip>
          ))}
        </div>
        <div className="no-scrollbar flex gap-2 overflow-x-auto px-4 pb-2">
          {BUDGETS.map((b, i) => (
            <Chip key={b.label} active={budget === i} onClick={() => setBudget(i)} variant="muted">
              {b.label}
            </Chip>
          ))}
        </div>
      </section>

      {/* Verified today carousel */}
      {!q && type === "All" && budget === 0 && !hood && (
        <section className="mt-4">
          <SectionHeader title="Verified today" icon={Sparkles} subtitle="Fresh listings, just confirmed vacant" />
          <div className="no-scrollbar flex gap-3 overflow-x-auto px-5 pb-2 pt-3 [&>*]:w-[78%] [&>*]:flex-shrink-0">
            {verifiedToday.map((p) => <PropertyCard key={p.id} property={p} />)}
          </div>
        </section>
      )}

      {/* Neighborhoods */}
      {!q && (
        <section className="mt-4">
          <SectionHeader title="Popular areas" icon={TrendingUp} />
          <div className="no-scrollbar flex gap-2 overflow-x-auto px-4 py-3">
            {NEIGHBORHOODS.slice(0, 9).map((n) => (
              <button
                key={n}
                onClick={() => setHood(hood === n ? null : n)}
                className={cn(
                  "flex-shrink-0 rounded-2xl border px-4 py-2 text-xs font-medium transition",
                  hood === n
                    ? "border-primary bg-primary text-primary-foreground shadow-elegant"
                    : "border-border bg-card text-foreground hover:border-primary/40",
                )}
              >
                {n}
              </button>
            ))}
          </div>
        </section>
      )}

      {/* Main feed */}
      <section className="mt-4 px-4">
        <div className="flex items-end justify-between pb-3">
          <h2 className="font-display text-lg font-bold">
            {hood ? `Homes in ${hood}` : "All vacancies"}
          </h2>
          <span className="text-xs text-muted-foreground">{filtered.length} found</span>
        </div>
        {filtered.length === 0 ? (
          <EmptyState />
        ) : (
          <div className="grid grid-cols-1 gap-4">
            {filtered.map((p: Property) => <PropertyCard key={p.id} property={p} />)}
          </div>
        )}
      </section>
    </div>
  );
}

function Chip({ children, active, onClick, variant = "primary" }: {
  children: React.ReactNode; active: boolean; onClick: () => void; variant?: "primary" | "muted";
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "flex-shrink-0 rounded-full border px-4 py-2 text-xs font-semibold transition",
        active
          ? variant === "primary"
            ? "border-primary bg-primary text-primary-foreground shadow-elegant"
            : "border-foreground bg-foreground text-background"
          : "border-border bg-card text-muted-foreground hover:text-foreground",
      )}
    >
      {children}
    </button>
  );
}

function SectionHeader({ title, subtitle, icon: Icon }: { title: string; subtitle?: string; icon: React.ComponentType<{ className?: string }> }) {
  return (
    <div className="flex items-center justify-between px-5">
      <div>
        <h2 className="flex items-center gap-2 font-display text-lg font-bold">
          <Icon className="h-4 w-4 text-primary" /> {title}
        </h2>
        {subtitle && <p className="text-xs text-muted-foreground">{subtitle}</p>}
      </div>
    </div>
  );
}

function EmptyState() {
  return (
    <div className="rounded-3xl border border-dashed border-border bg-surface p-10 text-center">
      <p className="font-display text-base font-semibold">No matches</p>
      <p className="mt-1 text-sm text-muted-foreground">Try adjusting your filters or search a different area.</p>
    </div>
  );
}
