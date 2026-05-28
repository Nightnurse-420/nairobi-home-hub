import { createFileRoute } from "@tanstack/react-router";
import { Hammer } from "lucide-react";

export const Route = createFileRoute("/owner/maintenance")({
  head: () => ({ meta: [{ title: "Maintenance · Owner" }] }),
  component: OwnerMaintenance,
});

function OwnerMaintenance() {
  return (
    <div className="px-5 pb-6 pt-6">
      <h1 className="font-display text-2xl font-extrabold">Maintenance</h1>
      <p className="text-sm text-muted-foreground">Repairs & fixes for your unit</p>
      <div className="mt-8 rounded-3xl border border-dashed border-border bg-surface p-10 text-center">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10">
          <Hammer className="h-6 w-6 text-primary" />
        </div>
        <p className="mt-4 font-display text-base font-bold">No open tickets</p>
        <p className="mt-1 text-sm text-muted-foreground">Maintenance requests from your tenants will appear here.</p>
      </div>
    </div>
  );
}
