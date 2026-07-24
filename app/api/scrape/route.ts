import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { getDb, isDbConfigured } from "@/lib/db";
import { leads } from "@/lib/db/schema";
import { getCreatorProfile } from "@/lib/profile/store";
import { isFirecrawlConfigured, searchBrands } from "@/lib/discovery/firecrawl";
import { extractBrandCandidates } from "@/lib/ai/discovery";
import { CANNED_BRAND_CANDIDATES } from "@/lib/discovery/canned";
import { isGeminiConfigured } from "@/lib/ai/gemini";
import { logActivity } from "@/lib/activity/store";
import type { BrandCandidate } from "@/lib/discovery/types";

export const runtime = "nodejs";
export const maxDuration = 60;

export async function POST() {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  if (!isDbConfigured()) return NextResponse.json({ inserted: 0 });

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
    .returning({ id: leads.id });

  await logActivity({
    userId,
    type: "lead_imported",
    text: `Research found ${inserted.length} brand${inserted.length === 1 ? "" : "s"} for you to review`,
  });

  return NextResponse.json({ inserted: inserted.length });
}
