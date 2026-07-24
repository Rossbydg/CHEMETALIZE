import "server-only";
import { eq } from "drizzle-orm";
import { getDb, isDbConfigured } from "@/lib/db";
import { creatorProfile, type CreatorProfile } from "@/lib/db/schema";
import type { PlatformStat } from "./types";

export async function getCreatorProfile(userId: string): Promise<CreatorProfile | null> {
  if (!isDbConfigured()) return null;
  const db = getDb()!;
  const rows = await db.select().from(creatorProfile).where(eq(creatorProfile.userId, userId)).limit(1);
  return rows[0] ?? null;
}

// The essentials that gate onboarding — everything else in the Media Kit is optional polish.
export function isProfileComplete(profile: CreatorProfile | null): boolean {
  if (!profile) return false;
  const platforms = (profile.platforms ?? []) as PlatformStat[];
  return Boolean(profile.niche) && platforms.length > 0 && profile.rateFloor != null;
}

// The "creatorContext" text block every AI engine grounds its output in (Milestone 8+).
export function profileSummary(profile: CreatorProfile | null): string {
  if (!profile) return "No creator profile filled in yet.";
  const platforms = (profile.platforms ?? []) as PlatformStat[];
  const lines: string[] = [];

  if (profile.niche) lines.push(`Niche: ${profile.niche}`);
  if (profile.bio) lines.push(`Bio: ${profile.bio}`);
  if (platforms.length) {
    lines.push(
      "Platforms: " +
        platforms
          .map((p) => `${p.platform} @${p.handle} (${p.followers.toLocaleString()} followers, ${p.engagementRate}% engagement)`)
          .join("; ")
    );
  }
  const audience = profile.audience as Record<string, string | undefined> | null;
  const audienceParts = audience ? Object.entries(audience).filter(([, v]) => v) : [];
  if (audienceParts.length) {
    lines.push("Audience: " + audienceParts.map(([k, v]) => `${k}: ${v}`).join(", "));
  }
  if (profile.tone) lines.push(`Tone/voice: ${profile.tone}`);
  if (profile.pastDeals) lines.push(`Past deals: ${profile.pastDeals}`);
  if (profile.rateFloor != null) lines.push(`Rate floor: $${profile.rateFloor}`);

  return lines.join("\n");
}

// The name AI-written pitches/proposals sign off as.
export function creatorDisplayName(user: { name?: string | null; email?: string | null } | null): string {
  if (!user) return "there";
  return user.name || user.email?.split("@")[0] || "there";
}
