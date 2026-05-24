import { createFileRoute, Link } from "@tanstack/react-router";
import { Heart } from "lucide-react";
import { PropertyCard } from "@/components/PropertyCard";
import { PROPERTIES } from "@/lib/properties";
import { useSaved } from "@/lib/saved";

export const Route = createFileRoute("/saved")({
  head: () => ({ meta: [{ title: "Saved · NyumbaSearch" }, { name: "description", content: "Your saved Nairobi listings." }] }),
  component: SavedPage,
});

function SavedPage() {
  const { ids } = useSaved();
  const saved = PROPERTIES.filter((p) => ids.includes(p.id));
  return (
    <div className="px-5 pb-4 pt-6">
      <h1 className="font-display text-2xl font-extrabold">Saved homes</h1>
      <p className="text-sm text-muted-foreground">{saved.length} {saved.length === 1 ? "home" : "homes"} bookmarked</p>

      {saved.length === 0 ? (
        <div className="mt-10 rounded-3xl border border-dashed border-border bg-surface p-10 text-center">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-muted">
            <Heart className="h-6 w-6 text-muted-foreground" />
          </div>
          <p className="mt-4 font-display text-base font-bold">No saves yet</p>
          <p className="mt-1 text-sm text-muted-foreground">Tap the heart on any listing to bookmark it for later.</p>
          <Link to="/" className="mt-5 inline-flex rounded-2xl gradient-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground shadow-elegant">
            Browse homes
          </Link>
        </div>
      ) : (
        <div className="mt-5 grid grid-cols-1 gap-4">
          {saved.map((p) => <PropertyCard key={p.id} property={p} />)}
        </div>
      )}
    </div>
  );
}
