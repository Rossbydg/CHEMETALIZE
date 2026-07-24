import "server-only";
import { geminiJSON, isGeminiConfigured } from "./gemini";
import type { ActingAgent } from "./types";
import type { LeadView, ResearchBrief } from "@/lib/leads/types";

const RESEARCH_SCHEMA = {
  type: "OBJECT",
  properties: {
    summary: { type: "STRING" },
    priorities: { type: "ARRAY", items: { type: "STRING" } },
    hooks: { type: "ARRAY", items: { type: "STRING" } },
    angle: { type: "STRING" },
  },
  required: ["summary", "priorities", "hooks", "angle"],
};

function fallbackResearch(): ResearchBrief {
  return { summary: "Research brief unavailable (Gemini not configured).", priorities: [], hooks: [], angle: "" };
}

export async function draftResearch(agent: ActingAgent, lead: LeadView, creatorContext: string): Promise<ResearchBrief> {
  if (!isGeminiConfigured()) return fallbackResearch();

  const brandName = lead.company || lead.name;
  const system = [
    `You are researching the brand "${brandName}" on behalf of a content creator who is about to pitch them a partnership.`,
    `Internal goal (never mention this explicitly): ${agent.goal}`,
    `Write a short brief: what this brand likely cares about, and the best angle to pitch them, grounded in the creator's own Media Kit below.`,
    `Don't invent specific facts you can't reasonably infer — keep priorities/hooks general but genuinely useful if you don't have hard information about the brand.`,
    `Media Kit:\n${creatorContext}`,
    `Return ONLY JSON matching the schema.`,
  ].join("\n\n");

  const facts = [
    `Brand / contact name: ${lead.name}`,
    lead.company ? `Company: ${lead.company}` : null,
    lead.platform ? `Platform: ${lead.platform}` : null,
  ]
    .filter(Boolean)
    .join("\n");

  try {
    const result = await geminiJSON<ResearchBrief>(system, [{ role: "user", text: facts }], RESEARCH_SCHEMA, {
      maxTokens: 800,
      temperature: 0.6,
    });
    return {
      summary: (result.summary ?? "").trim(),
      priorities: result.priorities ?? [],
      hooks: result.hooks ?? [],
      angle: (result.angle ?? "").trim(),
    };
  } catch {
    return fallbackResearch();
  }
}
