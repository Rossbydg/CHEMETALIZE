import type { BrandCandidate } from "./types";

// The offline safety net — used when Firecrawl/Gemini aren't configured, so the flow still completes.
export const CANNED_BRAND_CANDIDATES: BrandCandidate[] = [
  { name: "Northwind Coffee", reason: "A creator-friendly coffee brand that regularly runs small-batch sponsorships.", sourceUrl: null },
  { name: "Solstice Skincare", reason: "An indie skincare brand known for working with niche creators over big-name influencers.", sourceUrl: null },
  { name: "Aurora Fitness Co.", reason: "A fitness apparel brand that leans on creator partnerships for product launches.", sourceUrl: null },
];
