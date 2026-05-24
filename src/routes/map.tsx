import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import mapboxgl from "mapbox-gl";
import { MapPin, X, BedDouble, Bath, ChevronRight, KeyRound, ExternalLink } from "lucide-react";
import { PROPERTIES, formatKES, type Property } from "@/lib/properties";
import { getMapboxToken, setMapboxToken } from "@/lib/mapbox-token";
import { Logo } from "@/components/Logo";

export const Route = createFileRoute("/map")({
  head: () => ({
    meta: [
      { title: "Map · NyumbaSearch — Explore Nairobi rentals" },
      { name: "description", content: "Interactive Nairobi rental map. Tap pins to see prices, scores, and verified homes near you." },
    ],
  }),
  component: MapPage,
});

function MapPage() {
  const [token, setToken] = useState<string | null>(null);
  const [tokenInput, setTokenInput] = useState("");
  useEffect(() => {
    setToken(getMapboxToken());
    const sync = () => setToken(getMapboxToken());
    window.addEventListener("ns:mapbox-token-changed", sync);
    return () => window.removeEventListener("ns:mapbox-token-changed", sync);
  }, []);

  if (!token) {
    return (
      <div className="flex min-h-screen flex-col">
        <header className="flex items-center justify-between px-5 pb-3 pt-6">
          <Logo />
        </header>
        <div className="flex flex-1 items-center justify-center px-5">
          <div className="w-full max-w-sm animate-fade-up rounded-3xl bg-card p-6 shadow-card">
            <div className="gradient-primary mx-auto flex h-12 w-12 items-center justify-center rounded-2xl text-primary-foreground shadow-elegant">
              <KeyRound className="h-5 w-5" />
            </div>
            <h1 className="mt-4 text-center font-display text-xl font-bold">Connect Mapbox</h1>
            <p className="mt-2 text-center text-sm text-muted-foreground">
              Paste your free Mapbox public token to enable the live map. Stored only on this device.
            </p>
            <input
              value={tokenInput}
              onChange={(e) => setTokenInput(e.target.value)}
              placeholder="pk.eyJ1Ijoi…"
              className="mt-5 w-full rounded-2xl border border-input bg-background px-4 py-3 text-sm outline-none focus:border-primary"
            />
            <button
              onClick={() => tokenInput.startsWith("pk.") && setMapboxToken(tokenInput)}
              disabled={!tokenInput.startsWith("pk.")}
              className="mt-3 w-full rounded-2xl gradient-primary py-3 text-sm font-semibold text-primary-foreground shadow-elegant disabled:opacity-50"
            >
              Save token
            </button>
            <a
              href="https://account.mapbox.com/access-tokens/"
              target="_blank" rel="noreferrer"
              className="mt-3 flex items-center justify-center gap-1 text-xs font-medium text-primary"
            >
              Get a free token <ExternalLink className="h-3 w-3" />
            </a>
          </div>
        </div>
      </div>
    );
  }

  return <MapView token={token} />;
}

function MapView({ token }: { token: string }) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<mapboxgl.Map | null>(null);
  const [selected, setSelected] = useState<Property | null>(null);

  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;
    mapboxgl.accessToken = token;
    const map = new mapboxgl.Map({
      container: containerRef.current,
      style: "mapbox://styles/mapbox/light-v11",
      center: [36.8219, -1.2921],
      zoom: 11.2,
      attributionControl: false,
    });
    mapRef.current = map;
    map.addControl(new mapboxgl.NavigationControl({ showCompass: false }), "top-right");

    PROPERTIES.forEach((p) => {
      const el = document.createElement("div");
      el.className = "mb-price-pin" + (p.premium ? " gold" : "");
      el.textContent = "KES " + Math.round(p.rent / 1000) + "K";
      el.addEventListener("click", (e) => {
        e.stopPropagation();
        setSelected(p);
        map.flyTo({ center: [p.lng, p.lat], zoom: 14, duration: 800 });
      });
      new mapboxgl.Marker({ element: el }).setLngLat([p.lng, p.lat]).addTo(map);
    });

    return () => { map.remove(); mapRef.current = null; };
  }, [token]);

  return (
    <div className="fixed inset-0 mx-auto max-w-md">
      <div ref={containerRef} className="absolute inset-0" />

      {/* Top overlay */}
      <div className="pointer-events-none absolute inset-x-0 top-0 z-10 p-4">
        <div className="pointer-events-auto flex items-center justify-between rounded-2xl glass px-3 py-2 shadow-card">
          <Logo />
          <div className="flex items-center gap-1.5 rounded-full bg-primary/15 px-2.5 py-1 text-[11px] font-semibold text-primary">
            <MapPin className="h-3 w-3" /> {PROPERTIES.length} homes
          </div>
        </div>
      </div>

      {/* Bottom sheet */}
      <div className="pointer-events-none absolute inset-x-0 bottom-0 z-10 p-4 safe-bottom">
        {selected ? (
          <div className="pointer-events-auto animate-fade-up rounded-3xl bg-card p-3 shadow-elegant">
            <Link to="/property/$id" params={{ id: selected.id }} className="flex gap-3">
              <img src={selected.images[0]} alt="" loading="lazy" width={120} height={120} className="h-24 w-24 flex-shrink-0 rounded-2xl object-cover" />
              <div className="min-w-0 flex-1">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <p className="truncate text-[11px] font-semibold uppercase tracking-wide text-primary">{selected.neighborhood} · {selected.type}</p>
                    <h3 className="truncate font-display text-sm font-bold">{selected.title}</h3>
                  </div>
                  <button onClick={(e) => { e.preventDefault(); setSelected(null); }} className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full bg-muted">
                    <X className="h-3.5 w-3.5" />
                  </button>
                </div>
                <div className="mt-1 flex items-center gap-3 text-[11px] text-muted-foreground">
                  <span className="flex items-center gap-1"><BedDouble className="h-3 w-3" />{selected.beds}</span>
                  <span className="flex items-center gap-1"><Bath className="h-3 w-3" />{selected.baths}</span>
                  <span>{selected.sqm} m²</span>
                </div>
                <div className="mt-2 flex items-center justify-between">
                  <div className="font-display text-base font-bold">{formatKES(selected.rent)}<span className="text-[11px] font-medium text-muted-foreground">/mo</span></div>
                  <span className="flex items-center gap-1 text-xs font-semibold text-primary">View <ChevronRight className="h-3 w-3" /></span>
                </div>
              </div>
            </Link>
          </div>
        ) : (
          <div className="pointer-events-auto rounded-2xl glass px-4 py-3 text-center text-xs font-medium text-foreground shadow-card">
            Tap a price pin to preview a home
          </div>
        )}
      </div>
    </div>
  );
}
