import "server-only";
import { geminiJSON, isGeminiConfigured } from "./gemini";
import type { SearchResult } from "@/lib/discovery/firecrawl";
import type { BrandCandidate } from "@/lib/discovery/types";

const EXTRACT_SCHEMA = {
  type: "OBJECT",
  properties: {
    brands: {
      type: "ARRAY",
      items: {
        type: "OBJECT",
        properties: { name: { type: "STRING" }, reason: { type: "STRING" } },
        required: ["name", "reason"],
      },
    },
  },
  required: ["brands"],
};

// Turns raw search snippets into deduped, real brand-name candidates worth pitching.
export async function extractBrandCandidates(niche: string, results: SearchResult[]): Promise<BrandCandidate[]> {
  if (!isGeminiConfigured() || !results.length) return [];

  const system = [
    `You are helping a content creator in the "${niche}" niche find real brands worth pitching for sponsorships.`,
    `Below are web search snippets. Extract specific, real brand or company names mentioned that could plausibly sponsor a creator in this niche — not generic phrases, not the article or site itself unless it is itself a brand.`,
    `Dedupe brand names. For each, write one short sentence on why it's a good fit.`,
    `Return at most 8 brands. Return ONLY JSON matching the schema.`,
  ].join("\n\n");

  const facts = results.map((r, i) => `[${i + 1}] ${r.title}\n${r.description}\nSource: ${r.url}`).join("\n\n");

  try {
    const result = await geminiJSON<{ brands: { name: string; reason: string }[] }>(
      system,
      [{ role: "user", text: facts }],
      EXTRACT_SCHEMA,
      { maxTokens: 700, temperature: 0.4 }
    );

    const bestUrlFor = (name: string) =>
      results.find(
        (r) => r.title.toLowerCase().includes(name.toLowerCase()) || r.description.toLowerCase().includes(name.toLowerCase())
      )?.url ?? results[0]?.url ?? null;

    const seen = new Set<string>();
    return (result.brands ?? [])
      .filter((b) => {
        const key = b.name?.trim().toLowerCase();
        if (!key || seen.has(key)) return false;
        seen.add(key);
        return true;
      })
      .map((b) => ({ name: b.name.trim(), reason: (b.reason ?? "").trim(), sourceUrl: bestUrlFor(b.name) }));
  } catch {
    return [];
  }
}
