import "server-only";
import { geminiJSON, isGeminiConfigured } from "./gemini";

export type ChatCapability = "scrape" | "research" | "outreach" | "proposal" | "follow-up" | "book-meeting" | "chat";

export interface ChatIntent {
  capability: ChatCapability;
  leadId: string | null;
  meetingPhrase: string | null;
  clarification: string | null;
}

const SCHEMA = {
  type: "OBJECT",
  properties: {
    capability: {
      type: "STRING",
      enum: ["scrape", "research", "outreach", "proposal", "follow-up", "book-meeting", "chat"],
    },
    leadId: { type: "STRING", nullable: true },
    meetingPhrase: { type: "STRING", nullable: true },
    clarification: { type: "STRING", nullable: true },
  },
  required: ["capability"],
};

// Without Gemini, chat can't understand free-form requests — the caller shows a plain notice.
export async function routeChatMessage(
  message: string,
  knownLeads: { id: string; name: string; company: string | null }[]
): Promise<ChatIntent> {
  if (!isGeminiConfigured()) {
    return {
      capability: "chat",
      leadId: null,
      meetingPhrase: null,
      clarification: "I can't understand free-form requests yet — the AI key isn't set up.",
    };
  }

  const system = [
    `You route a creator's chat message to the right capability for their AI sales team.`,
    `The message may start with "@Name" — that is only who they're talking to, NOT a hint about which capability to use. Decide the capability purely from what's being asked.`,
    `Capabilities:`,
    `- scrape: go find and bring in brand-new real brands from the web that are NOT in the pipeline yet. Use this for any request to find, discover, search for, or bring in new/more brands (e.g. "find me some fitness brands", "go find new brands", "search for brands in my niche"). Never needs a leadId.`,
    `- research: write a short brief (priorities/hooks/angle) on ONE brand that is ALREADY in the pipeline below. Only use this if a specific existing brand is named.`,
    `- outreach: draft a first pitch to ONE existing brand in the pipeline below.`,
    `- proposal: draft a priced proposal for ONE existing brand in the pipeline below.`,
    `- follow-up: nudge ONE existing brand in the pipeline below that's gone quiet.`,
    `- book-meeting: book a call — needs a natural-language time phrase.`,
    `- chat: anything else, small talk, or an unclear request.`,
    `For research/outreach/proposal/follow-up you MUST resolve which existing brand they mean and return its id from the list below in leadId — leave leadId null if none is named or none matches well enough.`,
    `For book-meeting, extract the natural-language time phrase (e.g. "next Tuesday at 2pm") into meetingPhrase, and still try to resolve a brand into leadId if one is named.`,
    `If capability is "chat", or a required brand couldn't be resolved, write a short, first-person, in-character clarification or reply in the "clarification" field.`,
    `Known brands already in the pipeline (id: name):\n${knownLeads.map((l) => `${l.id}: ${l.company || l.name}`).join("\n") || "(none yet)"}`,
    `Return ONLY JSON matching the schema.`,
  ].join("\n\n");

  try {
    return await geminiJSON<ChatIntent>(system, [{ role: "user", text: message }], SCHEMA, { maxTokens: 600, temperature: 0.3 });
  } catch {
    return { capability: "chat", leadId: null, meetingPhrase: null, clarification: null };
  }
}
