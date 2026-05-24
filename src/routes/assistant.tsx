import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { Send, Sparkles, Loader2 } from "lucide-react";
import { useServerFn } from "@tanstack/react-start";
import { chatWithAssistant } from "@/lib/ai.functions";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

export const Route = createFileRoute("/assistant")({
  head: () => ({ meta: [{ title: "AI Assistant · NyumbaSearch" }, { name: "description", content: "Ask the NyumbaSearch AI for neighborhood guidance, budgeting tips, and scam alerts." }] }),
  component: AssistantPage,
});

type Msg = { role: "user" | "assistant"; content: string };

const SUGGESTIONS = [
  "Best areas under 30K with fast internet",
  "Is Ruaka safe for a single woman?",
  "How do I spot a rental scam?",
  "Kilimani vs Kileleshwa for a family",
];

function AssistantPage() {
  const chat = useServerFn(chatWithAssistant);
  const [messages, setMessages] = useState<Msg[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, loading]);

  const send = async (text: string) => {
    const trimmed = text.trim();
    if (!trimmed || loading) return;
    const next: Msg[] = [...messages, { role: "user", content: trimmed }];
    setMessages(next);
    setInput("");
    setLoading(true);
    try {
      const res = await chat({ data: { messages: next } });
      if (res.error) {
        toast.error(res.error);
        setMessages(prev => [...prev, { role: "assistant", content: "Sorry — " + res.error }]);
      } else {
        setMessages(prev => [...prev, { role: "assistant", content: res.content }]);
      }
    } catch (e) {
      console.error(e);
      toast.error("Failed to reach AI");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex h-screen flex-col">
      <header className="px-5 pb-3 pt-6">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl gradient-primary text-primary-foreground shadow-elegant">
            <Sparkles className="h-5 w-5" />
          </div>
          <div>
            <h1 className="font-display text-xl font-extrabold">NyumbaSearch AI</h1>
            <p className="text-xs text-muted-foreground">Nairobi housing assistant</p>
          </div>
        </div>
      </header>

      <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 pb-2">
        {messages.length === 0 ? (
          <div className="mt-4 space-y-4">
            <div className="rounded-3xl bg-card p-5 shadow-card">
              <p className="text-sm">👋 Hi! I help Nairobi tenants find the right home, evaluate neighborhoods, spot scams, and plan budgets. Ask me anything.</p>
            </div>
            <div className="space-y-2">
              <p className="px-1 text-xs font-semibold uppercase tracking-wide text-muted-foreground">Try asking</p>
              {SUGGESTIONS.map(s => (
                <button key={s} onClick={() => send(s)} className="block w-full rounded-2xl border border-border bg-card px-4 py-3 text-left text-sm shadow-card transition hover:border-primary/40">
                  {s}
                </button>
              ))}
            </div>
          </div>
        ) : (
          <div className="space-y-3 pt-2">
            {messages.map((m, i) => (
              <div key={i} className={cn("flex", m.role === "user" ? "justify-end" : "justify-start")}>
                <div className={cn(
                  "max-w-[85%] whitespace-pre-wrap rounded-2xl px-4 py-2.5 text-sm leading-relaxed shadow-card",
                  m.role === "user" ? "gradient-primary text-primary-foreground" : "bg-card text-foreground",
                )}>
                  {m.content}
                </div>
              </div>
            ))}
            {loading && (
              <div className="flex justify-start">
                <div className="flex items-center gap-2 rounded-2xl bg-card px-4 py-3 shadow-card">
                  <Loader2 className="h-4 w-4 animate-spin text-primary" />
                  <span className="text-xs text-muted-foreground">Thinking…</span>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      <form
        onSubmit={(e) => { e.preventDefault(); send(input); }}
        className="border-t border-border bg-card/80 px-3 pb-24 pt-3 backdrop-blur"
      >
        <div className="flex items-center gap-2 rounded-2xl border border-border bg-background px-3 py-1.5 shadow-card focus-within:border-primary">
          <input
            value={input}
            onChange={e => setInput(e.target.value)}
            placeholder="Ask about neighborhoods, prices, scams…"
            className="flex-1 bg-transparent py-2 text-sm outline-none placeholder:text-muted-foreground"
          />
          <button type="submit" disabled={loading || !input.trim()} className="flex h-9 w-9 items-center justify-center rounded-xl gradient-primary text-primary-foreground shadow-elegant disabled:opacity-50">
            <Send className="h-4 w-4" />
          </button>
        </div>
      </form>
    </div>
  );
}
