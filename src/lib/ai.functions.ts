import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

const MessageSchema = z.object({
  role: z.enum(["user", "assistant", "system"]),
  content: z.string().min(1).max(4000),
});

const InputSchema = z.object({
  messages: z.array(MessageSchema).min(1).max(40),
});

const SYSTEM_PROMPT = `You are NyumbaSearch AI, a friendly housing assistant for Nairobi, Kenya.
You help tenants find verified vacant homes, understand neighborhoods (Kilimani, Westlands, Lavington, Kileleshwa, Karen, Parklands, South B, South C, Ngong Road, Rongai, Ruaka, Roysambu), evaluate landlords, spot rental scams, understand Kenyan tenancy norms, and budget realistically (KES).
Be concise, practical, and warm. When users describe needs, suggest neighborhoods and property types and explain trade-offs (commute, water, security, internet, power).
Always warn tenants about red flags: agents asking large fees up front, landlords refusing physical visits or video tours, "deposit-only" wires before viewing, prices way below market.
Never invent specific listings — point users to browse the app.`;

export const chatWithAssistant = createServerFn({ method: "POST" })
  .inputValidator((input) => InputSchema.parse(input))
  .handler(async ({ data }) => {
    const apiKey = process.env.LOVABLE_API_KEY;
    if (!apiKey) {
      return { error: "AI service is not configured." as string, content: "" };
    }

    try {
      const res = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "google/gemini-3-flash-preview",
          messages: [
            { role: "system", content: SYSTEM_PROMPT },
            ...data.messages,
          ],
        }),
      });

      if (res.status === 429) {
        return { error: "Too many requests right now. Try again in a minute.", content: "" };
      }
      if (res.status === 402) {
        return { error: "AI credits exhausted. Please add credits in workspace settings.", content: "" };
      }
      if (!res.ok) {
        const txt = await res.text();
        console.error("AI gateway error", res.status, txt);
        return { error: "AI request failed. Please try again.", content: "" };
      }

      const json = await res.json() as {
        choices?: { message?: { content?: string } }[];
      };
      const content = json.choices?.[0]?.message?.content ?? "";
      return { error: null, content };
    } catch (e) {
      console.error("AI handler error", e);
      return { error: "AI service unavailable.", content: "" };
    }
  });
