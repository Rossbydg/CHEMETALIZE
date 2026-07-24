import "server-only";
import { getDb, isDbConfigured } from "@/lib/db";
import { leads } from "@/lib/db/schema";
import { getCreatorProfile } from "@/lib/profile/store";
import { isFirecrawlConfigured, searchBrands } from "./firecrawl";
import { extractBrandCandidates } from "@/lib/ai/discovery";
import { CANNED_BRAND_CANDIDATES } from "./canned";
import { isGeminiConfigured } from "@/lib/ai/gemini";
import { logActivity } from "@/lib/activity/store";
import type { BrandCandidate } from "./types";

export interface DiscoveryResult {
  inserted: number;
  names: string[];
}

// Shared by the "Discover brands" button (app/api/scrape/route.ts) and team chat's @Research routing.
export async function runDiscovery(userId: string): Promise<DiscoveryResult> {
  if (!isDbConfigured()) return { inserted: 0, names: [] };

  const profile = await getCreatorProfile(userId);
  const niche = profile?.niche?.trim() || "content creators";

  let candidates: BrandCandidate[];
  if (isFirecrawlConfigured() && isGeminiConfigured()) {
    const results = await searchBrands(`brands that sponsor ${niche} creators on social media`, 8);
    candidates = await extractBrandCandidates(niche, results);
    if (!candidates.length) candidates = CANNED_BRAND_CANDIDATES;
  } else {
    candidates = CANNED_BRAND_CANDIDATES;
  }

  const db = getDb()!;
  const inserted = await db
    .insert(leads)
    .values(
      candidates.map((c) => ({
        userId,
        name: c.name,
        company: c.name,
        profileUrl: c.sourceUrl,
        source: "scrape" as const,
        review: "pending" as const,
        research: c.reason ? { summary: c.reason, priorities: [], hooks: [], angle: "" } : null,
      }))
    )
    .returning({ id: leads.id, name: leads.name });

  await logActivity({
    userId,
    type: "lead_imported",
    text: `Research found ${inserted.length} brand${inserted.length === 1 ? "" : "s"} for you to review`,
  });

  return { inserted: inserted.length, names: inserted.map((r) => r.name) };
}
