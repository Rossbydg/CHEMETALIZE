import "server-only";
import { eq } from "drizzle-orm";
import { getDb, isDbConfigured } from "@/lib/db";
import { creatorProfile } from "@/lib/db/schema";
import type { PlatformStat } from "@/lib/profile/types";
import type { TikTokUserInfo, TikTokTokenResult } from "./types";

export async function saveTikTokConnection(userId: string, info: TikTokUserInfo, token: TikTokTokenResult) {
  if (!isDbConfigured()) return;
  const db = getDb()!;

  const rows = await db.select({ platforms: creatorProfile.platforms }).from(creatorProfile).where(eq(creatorProfile.userId, userId)).limit(1);
  const existingPlatforms = (rows[0]?.platforms ?? []) as PlatformStat[];
  const prevTikTok = existingPlatforms.find((p) => p.platform === "TikTok");
  const nextPlatforms: PlatformStat[] = [
    ...existingPlatforms.filter((p) => p.platform !== "TikTok"),
    { platform: "TikTok", handle: info.displayName, followers: info.followerCount, engagementRate: prevTikTok?.engagementRate ?? 0 },
  ];

  const values = {
    platforms: nextPlatforms,
    tiktokOpenId: info.openId,
    tiktokDisplayName: info.displayName,
    tiktokAvatarUrl: info.avatarUrl,
    tiktokFollowerCount: info.followerCount,
    tiktokFollowingCount: info.followingCount,
    tiktokLikesCount: info.likesCount,
    tiktokVideoCount: info.videoCount,
    tiktokAccessToken: token.accessToken,
    tiktokRefreshToken: token.refreshToken,
    tiktokTokenExpiresAt: token.expiresAt,
    tiktokConnectedAt: new Date(),
    updatedAt: new Date(),
  };

  await db
    .insert(creatorProfile)
    .values({ userId, ...values })
    .onConflictDoUpdate({ target: creatorProfile.userId, set: values });
}

export async function clearTikTokConnection(userId: string) {
  if (!isDbConfigured()) return;
  const db = getDb()!;

  const rows = await db.select({ platforms: creatorProfile.platforms }).from(creatorProfile).where(eq(creatorProfile.userId, userId)).limit(1);
  const existingPlatforms = (rows[0]?.platforms ?? []) as PlatformStat[];
  const nextPlatforms = existingPlatforms.filter((p) => p.platform !== "TikTok");

  await db
    .update(creatorProfile)
    .set({
      platforms: nextPlatforms,
      tiktokOpenId: null,
      tiktokDisplayName: null,
      tiktokAvatarUrl: null,
      tiktokFollowerCount: null,
      tiktokFollowingCount: null,
      tiktokLikesCount: null,
      tiktokVideoCount: null,
      tiktokAccessToken: null,
      tiktokRefreshToken: null,
      tiktokTokenExpiresAt: null,
      tiktokConnectedAt: null,
      updatedAt: new Date(),
    })
    .where(eq(creatorProfile.userId, userId));
}
