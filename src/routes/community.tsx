import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { MessageCircle, Plus, Users, MapPin, Loader2, X } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";
import { NEIGHBORHOODS } from "@/lib/properties";
import { toast } from "sonner";
import { formatDistanceToNow } from "date-fns";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/community")({
  head: () => ({ meta: [{ title: "Community · NyumbaSearch" }, { name: "description", content: "Tenant community discussions across Nairobi neighborhoods." }] }),
  component: CommunityPage,
});

type Post = {
  id: string;
  user_id: string;
  neighborhood: string | null;
  title: string;
  body: string;
  created_at: string;
  author?: { full_name: string | null };
  comment_count?: number;
};

function CommunityPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [composing, setComposing] = useState(false);
  const [hood, setHood] = useState<string | null>(null);
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [postHood, setPostHood] = useState("Kilimani");
  const [submitting, setSubmitting] = useState(false);

  const load = async () => {
    setLoading(true);
    let query = supabase.from("community_posts").select("id, user_id, neighborhood, title, body, created_at").order("created_at", { ascending: false }).limit(50);
    if (hood) query = query.eq("neighborhood", hood);
    const { data, error } = await query;
    if (error) { toast.error(error.message); setLoading(false); return; }
    const rows = (data ?? []) as Post[];
    if (rows.length) {
      const uids = Array.from(new Set(rows.map(r => r.user_id)));
      const [{ data: profs }, { data: comments }] = await Promise.all([
        supabase.from("profiles").select("user_id, full_name").in("user_id", uids),
        supabase.from("community_comments").select("post_id").in("post_id", rows.map(r => r.id)),
      ]);
      const pmap = new Map((profs ?? []).map((p: { user_id: string; full_name: string | null }) => [p.user_id, p]));
      const cmap = new Map<string, number>();
      for (const c of (comments ?? []) as { post_id: string }[]) cmap.set(c.post_id, (cmap.get(c.post_id) ?? 0) + 1);
      for (const r of rows) { r.author = pmap.get(r.user_id); r.comment_count = cmap.get(r.id) ?? 0; }
    }
    setPosts(rows);
    setLoading(false);
  };

  useEffect(() => { load(); /* eslint-disable-next-line react-hooks/exhaustive-deps */ }, [hood]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) { navigate({ to: "/auth" }); return; }
    setSubmitting(true);
    const { error } = await supabase.from("community_posts").insert({
      user_id: user.id, title, body, neighborhood: postHood,
    });
    setSubmitting(false);
    if (error) toast.error(error.message);
    else {
      toast.success("Posted!");
      setTitle(""); setBody(""); setComposing(false);
      load();
    }
  };

  return (
    <div className="px-5 pb-4 pt-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-extrabold">Community</h1>
          <p className="text-sm text-muted-foreground">Tips, warnings, and Q&A from Nairobi tenants</p>
        </div>
        <button onClick={() => user ? setComposing(true) : navigate({ to: "/auth" })} className="flex h-10 w-10 items-center justify-center rounded-2xl gradient-primary text-primary-foreground shadow-elegant">
          <Plus className="h-4 w-4" />
        </button>
      </div>

      <div className="no-scrollbar mt-4 flex gap-2 overflow-x-auto pb-2">
        <Chip active={hood === null} onClick={() => setHood(null)}>All areas</Chip>
        {NEIGHBORHOODS.map(n => (
          <Chip key={n} active={hood === n} onClick={() => setHood(n)}>{n}</Chip>
        ))}
      </div>

      {loading ? (
        <div className="flex justify-center py-20"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>
      ) : posts.length === 0 ? (
        <div className="mt-8 rounded-3xl border border-dashed border-border bg-surface p-10 text-center">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10">
            <Users className="h-6 w-6 text-primary" />
          </div>
          <p className="mt-4 font-display text-base font-bold">No posts yet</p>
          <p className="mt-1 text-sm text-muted-foreground">Be the first to share a tip or ask a question{hood ? ` about ${hood}` : ""}.</p>
        </div>
      ) : (
        <div className="mt-3 space-y-3">
          {posts.map(p => (
            <Link key={p.id} to="/community/$id" params={{ id: p.id }} className="block">
              <article className="rounded-3xl bg-card p-4 shadow-card transition hover:-translate-y-0.5 hover:shadow-elegant">
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <div className="gradient-primary flex h-6 w-6 items-center justify-center rounded-full text-[10px] font-bold text-primary-foreground">
                    {(p.author?.full_name ?? "U").charAt(0).toUpperCase()}
                  </div>
                  <span className="font-medium text-foreground">{p.author?.full_name ?? "Anonymous"}</span>
                  <span>·</span>
                  <span>{formatDistanceToNow(new Date(p.created_at), { addSuffix: true })}</span>
                  {p.neighborhood && <span className="ml-auto flex items-center gap-1 text-primary"><MapPin className="h-3 w-3" /> {p.neighborhood}</span>}
                </div>
                <h3 className="mt-2 font-display text-base font-bold">{p.title}</h3>
                <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">{p.body}</p>
                <div className="mt-3 flex items-center gap-1 text-xs text-muted-foreground">
                  <MessageCircle className="h-3.5 w-3.5" /> {p.comment_count} {p.comment_count === 1 ? "reply" : "replies"}
                </div>
              </article>
            </Link>
          ))}
        </div>
      )}

      {composing && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 backdrop-blur-sm" onClick={() => setComposing(false)}>
          <div className="mx-auto w-full max-w-md rounded-t-3xl bg-background p-5 shadow-elegant" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between">
              <h2 className="font-display text-lg font-bold">New post</h2>
              <button onClick={() => setComposing(false)} className="flex h-8 w-8 items-center justify-center rounded-full bg-muted">
                <X className="h-4 w-4" />
              </button>
            </div>
            <form onSubmit={submit} className="mt-4 space-y-3">
              <select value={postHood} onChange={e => setPostHood(e.target.value)} className="w-full rounded-2xl border border-border bg-card px-4 py-3 text-sm shadow-card outline-none focus:border-primary">
                {NEIGHBORHOODS.map(n => <option key={n}>{n}</option>)}
              </select>
              <input required value={title} onChange={e => setTitle(e.target.value)} placeholder="Title" className="w-full rounded-2xl border border-border bg-card px-4 py-3 text-sm shadow-card outline-none focus:border-primary" />
              <textarea required value={body} onChange={e => setBody(e.target.value)} rows={5} placeholder="Share your tip, question, or experience…" className="w-full resize-none rounded-2xl border border-border bg-card px-4 py-3 text-sm shadow-card outline-none focus:border-primary" />
              <button disabled={submitting} className="flex w-full items-center justify-center gap-2 rounded-2xl gradient-primary py-3 text-sm font-semibold text-primary-foreground shadow-elegant disabled:opacity-60">
                {submitting && <Loader2 className="h-4 w-4 animate-spin" />} Post
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

function Chip({ children, active, onClick }: { children: React.ReactNode; active: boolean; onClick: () => void }) {
  return (
    <button onClick={onClick} className={cn(
      "flex-shrink-0 rounded-full border px-4 py-1.5 text-xs font-semibold transition",
      active ? "border-primary bg-primary text-primary-foreground shadow-elegant" : "border-border bg-card text-muted-foreground"
    )}>{children}</button>
  );
}
