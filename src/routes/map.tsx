import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { MapPin, X, BedDouble, Bath, ChevronRight } from "lucide-react";
import { formatKES, type Property } from "@/lib/properties";
import { useAllProperties } from "@/lib/use-listings";
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

declare global {
  interface Window {
    google: any;
    __nsInitMap?: () => void;
    __nsMapReady?: boolean;
  }
}

const SCRIPT_ID = "ns-google-maps";

function loadGoogleMaps(): Promise<void> {
  return new Promise((resolve, reject) => {
    if (typeof window === "undefined") return reject(new Error("no window"));
    if (window.__nsMapReady && window.google?.maps) return resolve();

    const existing = document.getElementById(SCRIPT_ID) as HTMLScriptElement | null;
    const prevCb = window.__nsInitMap;
    window.__nsInitMap = () => {
      window.__nsMapReady = true;
      prevCb?.();
      resolve();
    };
    if (existing) return; // callback will fire

    const key = import.meta.env.VITE_LOVABLE_CONNECTOR_GOOGLE_MAPS_BROWSER_KEY;
    const channel = import.meta.env.VITE_LOVABLE_CONNECTOR_GOOGLE_MAPS_TRACKING_ID;
    if (!key) return reject(new Error("Missing Google Maps key"));

    const s = document.createElement("script");
    s.id = SCRIPT_ID;
    s.async = true;
    s.defer = true;
    s.src = `https://maps.googleapis.com/maps/api/js?key=${key}&loading=async&callback=__nsInitMap${channel ? `&channel=${channel}` : ""}`;
    s.onerror = () => reject(new Error("Failed to load Google Maps"));
    document.head.appendChild(s);
  });
}

function MapPage() {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<any>(null);
  const markersRef = useRef<any[]>([]);
  const [ready, setReady] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selected, setSelected] = useState<Property | null>(null);
  const { properties } = useAllProperties();
  const mapped = properties.filter((p) => p.lat && p.lng);

  useEffect(() => {
    loadGoogleMaps().then(() => setReady(true)).catch((e) => setError(e.message));
  }, []);

  useEffect(() => {
    if (!ready || !containerRef.current || mapRef.current) return;
    mapRef.current = new window.google.maps.Map(containerRef.current, {
      center: { lat: -1.2921, lng: 36.8219 },
      zoom: 12,
      disableDefaultUI: true,
      zoomControl: true,
      gestureHandling: "greedy",
      styles: [
        { elementType: "geometry", stylers: [{ color: "#f5f7f6" }] },
        { elementType: "labels.text.fill", stylers: [{ color: "#5a6b66" }] },
        { elementType: "labels.text.stroke", stylers: [{ color: "#ffffff" }] },
        { featureType: "poi", stylers: [{ visibility: "off" }] },
        { featureType: "road", elementType: "geometry", stylers: [{ color: "#ffffff" }] },
        { featureType: "water", elementType: "geometry", stylers: [{ color: "#cfe9e0" }] },
        { featureType: "landscape.natural", stylers: [{ color: "#eaf3ee" }] },
      ],
    });
  }, [ready]);

  useEffect(() => {
    if (!ready || !mapRef.current) return;
    markersRef.current.forEach((m) => m.setMap(null));
    markersRef.current = [];

    mapped.forEach((p) => {
      const label = "KES " + Math.round(p.rent / 1000) + "K";
      const color = p.premium ? "#c9a84c" : "#10B981";
      const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="86" height="34"><rect x="0.5" y="0.5" rx="14" ry="14" width="85" height="29" fill="${color}" stroke="white" stroke-width="2"/><text x="43" y="20" font-family="Inter, sans-serif" font-size="12" font-weight="700" text-anchor="middle" fill="white">${label}</text></svg>`;
      const marker = new window.google.maps.Marker({
        position: { lat: p.lat, lng: p.lng },
        map: mapRef.current,
        title: p.title,
        icon: {
          url: "data:image/svg+xml;charset=UTF-8," + encodeURIComponent(svg),
          scaledSize: new window.google.maps.Size(86, 34),
          anchor: new window.google.maps.Point(43, 17),
        },
      });
      marker.addListener("click", () => {
        setSelected(p);
        mapRef.current.panTo({ lat: p.lat, lng: p.lng });
      });
      markersRef.current.push(marker);
    });
  }, [ready, mapped]);

  return (
    <div className="fixed inset-0 mx-auto max-w-md">
      <div ref={containerRef} className="absolute inset-0 bg-muted" />

      {!ready && !error && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="rounded-2xl glass px-4 py-3 text-xs font-medium shadow-card">Loading map…</div>
        </div>
      )}
      {error && (
        <div className="absolute inset-0 flex items-center justify-center p-5">
          <div className="rounded-2xl bg-card p-5 text-sm shadow-card">Couldn’t load map: {error}</div>
        </div>
      )}

      <div className="pointer-events-none absolute inset-x-0 top-0 z-10 p-4">
        <div className="pointer-events-auto flex items-center justify-between rounded-2xl glass px-3 py-2 shadow-card">
          <Logo />
          <div className="flex items-center gap-1.5 rounded-full bg-primary/15 px-2.5 py-1 text-[11px] font-semibold text-primary">
            <MapPin className="h-3 w-3" /> {mapped.length} homes
          </div>
        </div>
      </div>

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
