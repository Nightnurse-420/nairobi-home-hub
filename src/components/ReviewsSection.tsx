import { useEffect, useState } from "react";
import { Star, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";
import { Link } from "@tanstack/react-router";
import { toast } from "sonner";
import { formatDistanceToNow } from "date-fns";
import { cn } from "@/lib/utils";

type Review = {
  id: string;
  user_id: string;
  rating: number;
  comment: string | null;
  created_at: string;
  author?: { full_name: string | null };
};

export function ReviewsSection({ listingId }: { listingId: string }) {
  const { user } = useAuth();
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const load = async () => {
    const { data } = await supabase
      .from("reviews")
      .select("*")
      .eq("listing_id", listingId)
      .order("created_at", { ascending: false });
    const rs = (data ?? []) as Review[];
    if (rs.length) {
      const uids = Array.from(new Set(rs.map(r => r.user_id)));
      const { data: profs } = await supabase.from("profiles").select("user_id, full_name").in("user_id", uids);
      const pmap = new Map((profs ?? []).map((p: { user_id: string; full_name: string | null }) => [p.user_id, p]));
      for (const r of rs) r.author = pmap.get(r.user_id);
    }
    setReviews(rs);
    setLoading(false);
  };

  useEffect(() => { load(); /* eslint-disable-next-line react-hooks/exhaustive-deps */ }, [listingId]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setSubmitting(true);
    const { error } = await supabase.from("reviews").upsert(
      { listing_id: listingId, user_id: user.id, rating, comment: comment || null },
      { onConflict: "listing_id,user_id" },
    );
    setSubmitting(false);
    if (error) toast.error(error.message);
    else { setComment(""); toast.success("Review posted"); load(); }
  };

  return (
    <section className="mt-6 px-5">
      <h2 className="font-display text-base font-bold">Reviews</h2>
      {loading ? (
        <div className="flex justify-center py-6"><Loader2 className="h-5 w-5 animate-spin text-primary" /></div>
      ) : (
        <>
          {user ? (
            <form onSubmit={submit} className="mt-3 rounded-3xl bg-card p-4 shadow-card">
              <div className="flex items-center gap-1">
                {[1, 2, 3, 4, 5].map(n => (
                  <button type="button" key={n} onClick={() => setRating(n)}>
                    <Star className={cn("h-6 w-6", n <= rating ? "fill-gold text-gold" : "text-muted-foreground")} />
                  </button>
                ))}
              </div>
              <textarea value={comment} onChange={e => setComment(e.target.value)} rows={2} placeholder="Share your experience (optional)…" className="mt-2 w-full resize-none rounded-2xl border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary" />
              <button disabled={submitting} className="mt-2 flex items-center gap-2 rounded-2xl gradient-primary px-4 py-2 text-xs font-semibold text-primary-foreground disabled:opacity-60">
                {submitting && <Loader2 className="h-3 w-3 animate-spin" />} Post review
              </button>
            </form>
          ) : (
            <Link to="/auth" className="mt-3 block rounded-2xl border border-dashed border-border bg-card p-4 text-center text-xs text-muted-foreground">
              <span className="font-semibold text-primary">Sign in</span> to leave a review
            </Link>
          )}

          {reviews.length === 0 ? (
            <p className="mt-3 text-xs text-muted-foreground">No reviews yet — be the first.</p>
          ) : (
            <div className="mt-3 space-y-3">
              {reviews.map(r => (
                <div key={r.id} className="rounded-2xl bg-card p-3 shadow-card">
                  <div className="flex items-center gap-2 text-xs">
                    <span className="font-semibold">{r.author?.full_name ?? "Anonymous"}</span>
                    <span className="text-muted-foreground">·</span>
                    <span className="text-muted-foreground">{formatDistanceToNow(new Date(r.created_at), { addSuffix: true })}</span>
                    <span className="ml-auto flex items-center gap-0.5">
                      {[1, 2, 3, 4, 5].map(n => (
                        <Star key={n} className={cn("h-3.5 w-3.5", n <= r.rating ? "fill-gold text-gold" : "text-muted-foreground/40")} />
                      ))}
                    </span>
                  </div>
                  {r.comment && <p className="mt-1.5 text-sm">{r.comment}</p>}
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </section>
  );
}
