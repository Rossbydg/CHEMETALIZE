import "server-only";
import { and, desc, eq } from "drizzle-orm";
import { getDb, isDbConfigured } from "@/lib/db";
import { activity } from "@/lib/db/schema";
import type { ActivityType, ActivityView } from "./types";

export async function logActivity(params: {
  userId: string;
  agentId?: string | null;
  type: ActivityType;
  leadId?: string | null;
  text: string;
}) {
  if (!isDbConfigured()) return;
  const db = getDb()!;
  await db.insert(activity).values({
    userId: params.userId,
    agentId: params.agentId ?? null,
    type: params.type,
    leadId: params.leadId ?? null,
    text: params.text,
  });
}

function toView(row: typeof activity.$inferSelect): ActivityView {
  return {
    id: row.id,
    agentId: row.agentId,
    type: row.type as ActivityType,
    leadId: row.leadId,
    text: row.text,
    createdAt: row.createdAt.toISOString(),
  };
}

export async function listActivity(userId: string, limit = 50): Promise<ActivityView[]> {
  if (!isDbConfigured()) return [];
  const db = getDb()!;
  const rows = await db.select().from(activity).where(eq(activity.userId, userId)).orderBy(desc(activity.createdAt)).limit(limit);
  return rows.map(toView);
}

// Feeds the notifications bell — dismissing hides from here only, never from analytics/dashboard.
export async function listUndismissedActivity(userId: string, limit = 20): Promise<ActivityView[]> {
  if (!isDbConfigured()) return [];
  const db = getDb()!;
  const rows = await db
    .select()
    .from(activity)
    .where(and(eq(activity.userId, userId), eq(activity.dismissed, false)))
    .orderBy(desc(activity.createdAt))
    .limit(limit);
  return rows.map(toView);
}
