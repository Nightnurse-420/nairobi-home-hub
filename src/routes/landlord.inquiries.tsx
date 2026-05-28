import { createFileRoute, Link } from "@tanstack/react-router";
import { Inbox } from "lucide-react";

export const Route = createFileRoute("/landlord/inquiries")({
  head: () => ({ meta: [{ title: "Inquiries · Landlord" }] }),
  component: () => (
    <div className="px-5 pb-6 pt-6">
      <h1 className="font-display text-2xl font-extrabold">Inquiries</h1>
      <p className="text-sm text-muted-foreground">Tenant messages across your buildings</p>
      <div className="mt-8 rounded-3xl border border-dashed border-border bg-surface p-10 text-center">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/15"><Inbox className="h-6 w-6 text-primary" /></div>
        <p className="mt-4 font-display text-base font-bold">Inbox coming soon</p>
        <p className="mt-1 text-sm text-muted-foreground">For now, tenants reach you via the WhatsApp number on each listing.</p>
        <Link to="/landlord" className="mt-5 inline-flex rounded-2xl gradient-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground shadow-elegant">Back to portfolio</Link>
      </div>
    </div>
  ),
});
