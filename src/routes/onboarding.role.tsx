import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { ArrowLeft, Building2, KeyRound, Loader2, ShieldCheck, Clock, CheckCircle2, XCircle, Phone, IdCard, Mail } from "lucide-react";
import { useAuth } from "@/lib/auth";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/onboarding/role")({
  head: () => ({ meta: [{ title: "Become a host · NyumbaSearch" }] }),
  component: RoleOnboardingPage,
});

type Choice = "landlord" | "apartment_owner";

type RequestRow = {
  id: string;
  requested_role: Choice;
  status: "pending" | "approved" | "denied";
  note: string | null;
  phone: string | null;
  national_id: string | null;
  business_name: string | null;
  created_at: string;
};

function RoleOnboardingPage() {
  const { user, isLoading, isLandlord, isOwner, refreshProfile } = useAuth();
  const navigate = useNavigate();
  const [choice, setChoice] = useState<Choice>("apartment_owner");
  const [note, setNote] = useState("");
  const [phone, setPhone] = useState("");
  const [nationalId, setNationalId] = useState("");
  const [businessName, setBusinessName] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [requests, setRequests] = useState<RequestRow[]>([]);
  const [loadingReq, setLoadingReq] = useState(true);

  useEffect(() => {
    if (isLoading) return;
    if (!user) { navigate({ to: "/auth", search: { intent: "host" } }); return; }
    (async () => {
      const { data } = await supabase
        .from("role_requests")
        .select("id, requested_role, status, note, phone, national_id, business_name, created_at")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });
      setRequests((data ?? []) as RequestRow[]);
      setLoadingReq(false);
    })();
  }, [user, isLoading, navigate]);

  const submit = async () => {
    if (!user) return;
    if (!phone.trim() || phone.trim().length < 7) { toast.error("Enter a valid phone number"); return; }
    if (!nationalId.trim() || nationalId.trim().length < 5) { toast.error("Enter your national ID"); return; }
    setSubmitting(true);
    const { data, error } = await supabase
      .from("role_requests")
      .insert({
        user_id: user.id,
        requested_role: choice,
        status: "pending",
        note: note.trim() || null,
        phone: phone.trim(),
        national_id: nationalId.trim(),
        business_name: businessName.trim() || null,
      })
      .select("id, requested_role, status, note, phone, national_id, business_name, created_at")
      .single();
    setSubmitting(false);
    if (error) { toast.error(error.message); return; }
    setRequests(r => [data as RequestRow, ...r]);
    setNote(""); setBusinessName("");
    toast.success("Submitted — an admin will verify your details shortly.");
    await refreshProfile();
  };

  const pending = requests.find(r => r.status === "pending");
  const approved = requests.find(r => r.status === "approved");
  const locked = !!pending || !!approved;
  const emailVerified = !!user?.email_confirmed_at;

  return (
    <div className="px-5 pb-10 pt-6">
      <Link to="/host" className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-card shadow-card">
        <ArrowLeft className="h-4 w-4" />
      </Link>

      <h1 className="mt-5 font-display text-2xl font-extrabold">Register as a host</h1>
      <p className="text-sm text-muted-foreground">Choose your host type and submit verification. An admin reviews every request before host features unlock.</p>

      {(isLandlord || isOwner) ? (
        <div className="mt-6 rounded-3xl bg-card p-5 shadow-card">
          <ShieldCheck className="h-6 w-6 text-primary" />
          <p className="mt-3 font-display text-base font-bold">You're already a verified host</p>
          <p className="mt-1 text-sm text-muted-foreground">Head to your dashboard to manage properties.</p>
          <Link to={isLandlord ? "/landlord" : "/owner"} className="mt-4 inline-flex rounded-2xl gradient-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground shadow-elegant">
            Open dashboard
          </Link>
        </div>
      ) : (
        <>
          <div className="mt-6 grid gap-3">
            <RoleCard
              active={choice === "apartment_owner"}
              onClick={() => setChoice("apartment_owner")}
              icon={KeyRound}
              title="Apartment Owner"
              desc="You own one or a few individual units inside someone else's building."
            />
            <RoleCard
              active={choice === "landlord"}
              onClick={() => setChoice("landlord")}
              icon={Building2}
              title="Landlord"
              desc="You own and manage entire buildings or apartment blocks."
            />
          </div>

          <div className="mt-6 space-y-3">
            <h2 className="px-1 font-display text-xs font-bold uppercase tracking-wide text-muted-foreground">Verification</h2>

            <div className="flex items-center gap-3 rounded-2xl bg-card p-3 shadow-card">
              <div className={cn("flex h-9 w-9 items-center justify-center rounded-xl", emailVerified ? "bg-primary/15 text-primary" : "bg-muted text-muted-foreground")}>
                {emailVerified ? <CheckCircle2 className="h-4 w-4" /> : <Mail className="h-4 w-4" />}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold">{user?.email}</p>
                <p className="text-xs text-muted-foreground">{emailVerified ? "Email verified" : "Confirm via the link we emailed you"}</p>
              </div>
            </div>

            <Field icon={Phone} value={phone} onChange={setPhone} placeholder="Phone number (e.g. +254 7…)" type="tel" disabled={locked} />
            <Field icon={IdCard} value={nationalId} onChange={setNationalId} placeholder="National ID number" type="text" disabled={locked} />
            <Field icon={Building2} value={businessName} onChange={setBusinessName} placeholder={choice === "landlord" ? "Building / business name" : "Building you own a unit in"} type="text" disabled={locked} />

            <textarea
              value={note} onChange={e => setNote(e.target.value)} rows={3}
              disabled={locked}
              placeholder="Anything else we should know? (optional)"
              className="w-full resize-none rounded-2xl border border-border bg-card px-4 py-3 text-sm shadow-card outline-none focus:border-primary disabled:opacity-60"
            />
          </div>

          <button
            onClick={submit}
            disabled={submitting || locked}
            className="mt-5 flex w-full items-center justify-center gap-2 rounded-2xl gradient-primary py-3.5 text-sm font-semibold text-primary-foreground shadow-elegant disabled:opacity-60"
          >
            {submitting && <Loader2 className="h-4 w-4 animate-spin" />}
            {pending ? "Request pending review" : approved ? "Already approved" : "Submit for verification"}
          </button>
        </>
      )}

      <section className="mt-8">
        <h2 className="px-1 font-display text-sm font-bold uppercase tracking-wide text-muted-foreground">My requests</h2>
        {loadingReq ? (
          <div className="mt-3 flex justify-center py-6"><Loader2 className="h-5 w-5 animate-spin text-primary" /></div>
        ) : requests.length === 0 ? (
          <p className="mt-3 text-sm text-muted-foreground">No requests yet.</p>
        ) : (
          <div className="mt-3 space-y-2">
            {requests.map(r => (
              <div key={r.id} className="flex items-center gap-3 rounded-2xl bg-card p-3 shadow-card">
                <StatusIcon status={r.status} />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold capitalize">
                    {r.requested_role.replace("_", " ")} · <span className="font-normal text-muted-foreground capitalize">{r.status}</span>
                  </p>
                  {r.business_name && <p className="line-clamp-1 text-xs text-muted-foreground">{r.business_name}</p>}
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

function Field({ icon: Icon, value, onChange, placeholder, type, disabled }: {
  icon: React.ComponentType<{ className?: string }>;
  value: string; onChange: (v: string) => void; placeholder: string; type: string; disabled?: boolean;
}) {
  return (
    <label className={cn("flex items-center gap-3 rounded-2xl border border-border bg-card px-4 py-3 shadow-card focus-within:border-primary", disabled && "opacity-60")}>
      <Icon className="h-4 w-4 text-muted-foreground" />
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        type={type}
        disabled={disabled}
        className="w-full bg-transparent text-sm outline-none placeholder:text-muted-foreground"
      />
    </label>
  );
}

function RoleCard({ active, onClick, icon: Icon, title, desc }: {
  active: boolean; onClick: () => void;
  icon: React.ComponentType<{ className?: string }>; title: string; desc: string;
}) {
  return (
    <button onClick={onClick} className={cn(
      "flex items-start gap-4 rounded-3xl border-2 bg-card p-4 text-left shadow-card transition",
      active ? "border-primary" : "border-transparent hover:border-border",
    )}>
      <div className={cn("flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-2xl", active ? "gradient-primary text-primary-foreground" : "bg-muted text-muted-foreground")}>
        <Icon className="h-5 w-5" />
      </div>
      <div>
        <p className="font-display text-base font-bold">{title}</p>
        <p className="mt-0.5 text-xs text-muted-foreground">{desc}</p>
      </div>
    </button>
  );
}

function StatusIcon({ status }: { status: RequestRow["status"] }) {
  if (status === "approved") return <CheckCircle2 className="h-5 w-5 text-primary" />;
  if (status === "denied") return <XCircle className="h-5 w-5 text-destructive" />;
  return <Clock className="h-5 w-5 text-muted-foreground" />;
}
