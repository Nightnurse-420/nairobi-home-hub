import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { ArrowLeft, Send, MapPin, Loader2, Trash2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";
import { toast } from "sonner";
import { formatDistanceToNow } from "date-fns";

export const Route = createFileRoute("/community/$id")({
  head: () => ({ meta: [{ title: "Discussion · NyumbaSearch" }] }),
  component: PostPage,
});

type Post = {
  id: string;
  user_id: string;
  neighborhood: string | null;
  title: string;
  body: string;
  created_at: string;
  author?: { full_name: string | null };
};

type Comment = {
  id: string;
  user_id: string;
  body: string;
  created_at: string;
  author?: { full_name: string | null };
};

function PostPage() {
  const { id } = Route.useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [post, setPost] = useState<Post | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [body, setBody] = useState("");
  const [loading, setLoading] = useState(true);
  const [posting, setPosting] = useState(false);

  const load = async () => {
    const [{ data: pData }, { data: cData }] = await Promise.all([
      supabase.from("community_posts").select("*").eq("id", id).maybeSingle(),
      supabase.from("community_comments").select("*").eq("post_id", id).order("created_at"),
    ]);
    if (!pData) { setLoading(false); return; }
    const p = pData as Post;
    const cs = (cData ?? []) as Comment[];
    const uids = Array.from(new Set([p.user_id, ...cs.map(c => c.user_id)]));
    const { data: profs } = await supabase.from("profiles").select("user_id, full_name").in("user_id", uids);
    const pmap = new Map((profs ?? []).map((x: { user_id: string; full_name: string | null }) => [x.user_id, x]));
    p.author = pmap.get(p.user_id);
    for (const c of cs) c.author = pmap.get(c.user_id);
    setPost(p);
    setComments(cs);
    setLoading(false);
  };

  useEffect(() => { load(); /* eslint-disable-next-line react-hooks/exhaustive-deps */ }, [id]);

  const reply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) { navigate({ to: "/auth" }); return; }
    if (!body.trim()) return;
    setPosting(true);
    const { error } = await supabase.from("community_comments").insert({ post_id: id, user_id: user.id, body });
    setPosting(false);
    if (error) toast.error(error.message);
    else { setBody(""); load(); }
  };

  const removeComment = async (cid: string) => {
    const { error } = await supabase.from("community_comments").delete().eq("id", cid);
    if (error) toast.error(error.message);
    else setComments(arr => arr.filter(c => c.id !== cid));
  };

  if (loading) return <div className="flex min-h-[60vh] items-center justify-center"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>;
  if (!post) return (
    <div className="p-10 text-center">
      <p className="font-display text-lg font-bold">Post not found</p>
      <Link to="/community" className="mt-4 inline-flex rounded-2xl gradient-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground">Back to community</Link>
    </div>
  );

  return (
    <div className="px-5 pb-32 pt-6">
      <Link to="/community" className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-card shadow-card">
        <ArrowLeft className="h-4 w-4" />
      </Link>

      <article className="mt-5 rounded-3xl bg-card p-5 shadow-card">
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <div className="gradient-primary flex h-7 w-7 items-center justify-center rounded-full text-[11px] font-bold text-primary-foreground">
            {(post.author?.full_name ?? "U").charAt(0).toUpperCase()}
          </div>
          <span className="font-medium text-foreground">{post.author?.full_name ?? "Anonymous"}</span>
          <span>·</span>
          <span>{formatDistanceToNow(new Date(post.created_at), { addSuffix: true })}</span>
          {post.neighborhood && <span className="ml-auto flex items-center gap-1 text-primary"><MapPin className="h-3 w-3" /> {post.neighborhood}</span>}
        </div>
        <h1 className="mt-3 font-display text-xl font-extrabold">{post.title}</h1>
        <p className="mt-3 whitespace-pre-wrap text-sm leading-relaxed">{post.body}</p>
      </article>

      <h2 className="mt-6 px-1 font-display text-sm font-bold uppercase tracking-wide text-muted-foreground">
        {comments.length} {comments.length === 1 ? "reply" : "replies"}
      </h2>

      <div className="mt-3 space-y-3">
        {comments.map(c => (
          <div key={c.id} className="rounded-2xl bg-card p-4 shadow-card">
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <div className="gradient-primary flex h-6 w-6 items-center justify-center rounded-full text-[10px] font-bold text-primary-foreground">
                {(c.author?.full_name ?? "U").charAt(0).toUpperCase()}
              </div>
              <span className="font-medium text-foreground">{c.author?.full_name ?? "Anonymous"}</span>
              <span>·</span>
              <span>{formatDistanceToNow(new Date(c.created_at), { addSuffix: true })}</span>
              {user?.id === c.user_id && (
                <button onClick={() => removeComment(c.id)} className="ml-auto text-destructive">
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              )}
            </div>
            <p className="mt-2 whitespace-pre-wrap text-sm">{c.body}</p>
          </div>
        ))}
      </div>

      <form onSubmit={reply} className="fixed inset-x-0 bottom-0 z-30 mx-auto max-w-md p-4 safe-bottom">
        <div className="flex items-center gap-2 rounded-3xl border border-border bg-card p-2 shadow-elegant">
          <input value={body} onChange={e => setBody(e.target.value)} placeholder={user ? "Write a reply…" : "Sign in to reply"} className="flex-1 bg-transparent px-3 py-2 text-sm outline-none placeholder:text-muted-foreground" />
          <button type="submit" disabled={posting || !body.trim()} className="flex h-9 w-9 items-center justify-center rounded-2xl gradient-primary text-primary-foreground shadow-elegant disabled:opacity-50">
            <Send className="h-4 w-4" />
          </button>
        </div>
      </form>
    </div>
  );
}
