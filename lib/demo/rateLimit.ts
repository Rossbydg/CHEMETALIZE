import "server-only";
import { and, eq, gt, lt } from "drizzle-orm";
import { getDb, isDbConfigured } from "@/lib/db";
import { demoBookingAttempts } from "@/lib/db/schema";

const WINDOW_MINUTES = 30;
const MAX_ATTEMPTS = 5;

export function clientIp(h: Headers): string {
  const fwd = h.get("x-forwarded-for");
  if (fwd) return fwd.split(",")[0].trim();
  return h.get("x-real-ip") || "unknown";
}

export interface RateLimitResult {
  ok: boolean;
  retryAfterMinutes?: number;
}

// Checks the window AND records this attempt in one call, so a request that never gets past
// this check still counts against the limit — otherwise a spammer just sends garbage forever.
export async function checkAndRecordAttempt(ip: string): Promise<RateLimitResult> {
  if (!isDbConfigured()) return { ok: true };
  const db = getDb()!;
  const windowStart = new Date(Date.now() - WINDOW_MINUTES * 60 * 1000);

  const recent = await db
    .select({ createdAt: demoBookingAttempts.createdAt })
    .from(demoBookingAttempts)
    .where(and(eq(demoBookingAttempts.ip, ip), gt(demoBookingAttempts.createdAt, windowStart)));

  if (recent.length >= MAX_ATTEMPTS) {
    const oldest = recent.reduce((a, b) => (a.createdAt < b.createdAt ? a : b));
    const retryAfterMs = oldest.createdAt.getTime() + WINDOW_MINUTES * 60 * 1000 - Date.now();
    return { ok: false, retryAfterMinutes: Math.max(1, Math.ceil(retryAfterMs / 60000)) };
  }

  await db.insert(demoBookingAttempts).values({ ip });

  // Opportunistic cleanup so this table doesn't grow forever — no separate cron needed.
  const cutoff = new Date(Date.now() - 24 * 60 * 60 * 1000);
  await db.delete(demoBookingAttempts).where(lt(demoBookingAttempts.createdAt, cutoff));

  return { ok: true };
}
