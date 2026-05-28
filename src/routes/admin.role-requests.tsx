import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Loader2, CheckCircle2, XCircle, Clock, ShieldCheck, Building2, KeyRound } from "lucide-react";
import { useAuth } from "@/lib/auth";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/admin/role-requests")({
  head: () => ({ meta: [{ title: "Role approvals · Admin" }] }),
  component: AdminRoleRequestsPage,
});

type Row = {
  id: string;
  user_id: string;
  requested_role: "landlord" | "apartment_owner";
  status: "pending" | "approved" | "denied";
  note: string | null;
  created_at: string;
  reviewed_at: string | null;
};

type Tab = "pending" | "approved" | "denied";

function AdminRoleRequestsPage() {
  const { user, isAdmin, isLoading } = useAuth();
  const navigate = useNavigate();
  const [tab, setTab] = useState<Tab>("pending");
  const [rows, setRows] = useState<Row[]>([]);
  const [loading, setLoading] = useState(true);
  const [working, setWorking] = useState<string | null>(null);

  useEffect(() => {
    if (isLoading) return;
    if (!user) { navigate({ to: "/auth" }); return; }
    if (!isAdmin) { navigate({ to: "/profile" }); return; }
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, isAdmin, isLoading, tab]);

  const load = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("role_requests")
      .select("id, user_id, requested_role, status, note, created_at, reviewed_at")
      .eq("status", tab)
      .order("created_at", { ascending: false });
    if (error) toast.error(error.message);
    setRows((data ?? []) as Row[]);
    setLoading(false);
  };

  const decide = async (r: Row, status: "approved" | "denied") => {
    if (!user) return;
    setWorking(r.id);
    const { error } = await supabase
      .from("role_requests")
      .update({ status, reviewed_by: user.id })
      .eq("id", r.id);
    setWorking(null);
    if (error) { toast.error(error.message); return; }
    toast.success(status === "approved" ? "Role granted" : "Request denied");
    setRows(rs => rs.filter(x => x.id !== r.id));
  };

  return (
    <div className="px-5 pb-4 pt-6">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-2xl gradient-primary text-primary-foreground shadow-elegant">
          <ShieldCheck className="h-5 w-5" />
        </div>
        <div>
          <h1 className="font-display text-xl font-extrabold">Role approvals</h1>
          <p className="text-xs text-muted-foreground">Review landlord & apartment owner requests</p>
        </div>
      </div>

      <div className="mt-5 flex gap-2">
        {(["pending", "approved", "denied"] as Tab[]).map(t => (
          <button key={t} onClick={() => setTab(t)} className={cn(
            "flex-1 rounded-2xl border px-3 py-2 text-xs font-semibold capitalize transition",
            tab === t ? "border-primary bg-primary text-primary-foreground" : "border-border bg-card text-muted-foreground",
          )}>{t}</button>
        ))}
      </div>

      {loading ? (
        <div className="flex justify-center py-20"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>
      ) : rows.length === 0 ? (
        <div className="mt-8 rounded-3xl border border-dashed border-border bg-surface p-10 text-center">
          <p className="font-display text-sm font-semibold">No {tab} requests</p>
        </div>
      ) : (
        <div className="mt-5 space-y-3">
          {rows.map(r => (
            <article key={r.id} className="rounded-3xl bg-card p-4 shadow-card">
              <div className="flex items-start gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-primary/15 text-primary">
                  {r.requested_role === "landlord" ? <Building2 className="h-5 w-5" /> : <KeyRound className="h-5 w-5" />}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="font-display text-sm font-bold capitalize">{r.requested_role.replace("_", " ")}</p>
                  <p className="truncate text-[11px] text-muted-foreground font-mono">{r.user_id}</p>
                  {r.note && <p className="mt-1.5 text-sm text-foreground/80">{r.note}</p>}
                  <p className="mt-1 text-[11px] text-muted-foreground">
                    {r.status === "pending" ? <><Clock className="mr-1 inline h-3 w-3" /> Submitted {new Date(r.created_at).toLocaleDateString()}</> :
                      <>Reviewed {r.reviewed_at ? new Date(r.reviewed_at).toLocaleDateString() : ""}</>}
                  </p>
                </div>
              </div>
              {r.status === "pending" && (
                <div className="mt-3 flex gap-2">
                  <button onClick={() => decide(r, "denied")} disabled={working === r.id} className="flex flex-1 items-center justify-center gap-1.5 rounded-2xl border border-border bg-card py-2.5 text-xs font-semibold text-destructive hover:bg-destructive/10 disabled:opacity-60">
                    <XCircle className="h-4 w-4" /> Deny
                  </button>
                  <button onClick={() => decide(r, "approved")} disabled={working === r.id} className="flex flex-1 items-center justify-center gap-1.5 rounded-2xl gradient-primary py-2.5 text-xs font-semibold text-primary-foreground shadow-elegant disabled:opacity-60">
                    {working === r.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle2 className="h-4 w-4" />} Approve
                  </button>
                </div>
              )}
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
