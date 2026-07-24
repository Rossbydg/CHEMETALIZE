import "server-only";
import { geminiJSON, isGeminiConfigured } from "./gemini";
import { PITCH_GUARDRAILS } from "./guardrails";
import type { ActingAgent } from "./types";
import type { LeadView } from "@/lib/leads/types";

export interface FollowupResult {
  subject: string;
  body: string;
  rationale: string;
}

const FOLLOWUP_SCHEMA = {
  type: "OBJECT",
  properties: {
    subject: { type: "STRING" },
    body: { type: "STRING" },
    rationale: { type: "STRING" },
  },
  required: ["subject", "body", "rationale"],
};

function fallbackFollowup(lead: LeadView, creatorName: string): FollowupResult {
  const brandName = lead.company || lead.name;
  const hasEmail = !!lead.email;
  return {
    subject: hasEmail ? `Circling back — ${brandName}` : "",
    body: hasEmail
      ? `Hi again,\n\nJust wanted to circle back on my last note — still love the idea of working together and happy to answer any questions.\n\nBest,\n${creatorName}`
      : `Hi! Just circling back on my last message — still up for chatting about a collaboration whenever you have a minute.`,
    rationale: "Fallback follow-up (Gemini not configured).",
  };
}

// Re-engages a brand that went quiet — grounded in the prior pitch, so the nudge builds on
// what was already said rather than repeating the first pitch from scratch.
export async function draftFollowup(
  agent: ActingAgent,
  lead: LeadView,
  priorDraft: { subject: string | null; body: string } | null,
  creatorContext: string,
  creatorName: string
): Promise<FollowupResult> {
  if (!isGeminiConfigured()) return fallbackFollowup(lead, creatorName);

  const channel = lead.email ? `a short follow-up email to ${lead.email}` : `a short DM${lead.platform ? ` on ${lead.platform}` : ""}`;

  const system = [
    `You ARE ${creatorName} — a real creator following up on your OWN earlier outreach to a brand that's gone quiet. Write in first person: I / my / me.`,
    `Internal goal (never mention this explicitly): ${agent.goal}`,
    `Write ${channel} — short, warm, and polite, not pushy. 2-4 sentences. Build on what you already said in your prior message below rather than repeating it from scratch.`,
    PITCH_GUARDRAILS,
    `Here is the creator's Media Kit:\n${creatorContext}`,
    `Return ONLY JSON matching the schema.`,
  ].join("\n\n");

  const facts = [
    `Brand / contact name: ${lead.name}`,
    lead.company ? `Company: ${lead.company}` : null,
    priorDraft
      ? `Your prior message to this brand:\nSubject: ${priorDraft.subject ?? "(none)"}\nBody: ${priorDraft.body}`
      : "No prior pitch on file — write a general warm re-engagement note.",
  ]
    .filter(Boolean)
    .join("\n");

  try {
    const result = await geminiJSON<FollowupResult>(system, [{ role: "user", text: facts }], FOLLOWUP_SCHEMA, {
      maxTokens: 800,
      temperature: 0.6,
    });
    return {
      subject: (result.subject ?? "").trim(),
      body: (result.body ?? "").trim(),
      rationale: (result.rationale ?? "").trim(),
    };
  } catch {
    return fallbackFollowup(lead, creatorName);
  }
}
