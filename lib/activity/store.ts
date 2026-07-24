import "server-only";
import { desc, eq } from "drizzle-orm";
import { getDb, isDbConfigured } from "@/lib/db";
import { activity } from "@/lib/db/schema";
import type { ActivityType } from "./types";

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

export async function listActivity(userId: string, limit = 50) {
  if (!isDbConfigured()) return [];
  const db = getDb()!;
  return db.select().from(activity).where(eq(activity.userId, userId)).orderBy(desc(activity.createdAt)).limit(limit);
}
