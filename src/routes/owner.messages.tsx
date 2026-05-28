import { createFileRoute } from "@tanstack/react-router";
import { MessageSquare } from "lucide-react";

export const Route = createFileRoute("/owner/messages")({
  head: () => ({ meta: [{ title: "Messages · Owner" }] }),
  component: OwnerMessages,
});

function OwnerMessages() {
  return (
    <div className="px-5 pb-6 pt-6">
      <h1 className="font-display text-2xl font-extrabold">Messages</h1>
      <p className="text-sm text-muted-foreground">Conversations with tenants</p>
      <div className="mt-8 rounded-3xl border border-dashed border-border bg-surface p-10 text-center">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10">
          <MessageSquare className="h-6 w-6 text-primary" />
        </div>
        <p className="mt-4 font-display text-base font-bold">Inbox coming soon</p>
        <p className="mt-1 text-sm text-muted-foreground">Tenant inquiries will land here. For now, share your WhatsApp on listings.</p>
      </div>
    </div>
  );
}
