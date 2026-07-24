import "server-only";
import { and, asc, eq } from "drizzle-orm";
import { getDb, isDbConfigured } from "@/lib/db";
import { meetings } from "@/lib/db/schema";
import type { MeetingView } from "./types";

function toView(row: typeof meetings.$inferSelect): MeetingView {
  return {
    id: row.id,
    leadId: row.leadId,
    agentId: row.agentId,
    title: row.title,
    kind: row.kind,
    whenAt: row.whenAt.toISOString(),
    whenLabel: row.whenLabel,
    createdAt: row.createdAt.toISOString(),
  };
}

export async function listMeetings(userId: string): Promise<MeetingView[]> {
  if (!isDbConfigured()) return [];
  const db = getDb()!;
  const rows = await db.select().from(meetings).where(eq(meetings.userId, userId)).orderBy(asc(meetings.whenAt));
  return rows.map(toView);
}

export async function listMeetingsForLead(userId: string, leadId: string): Promise<MeetingView[]> {
  if (!isDbConfigured()) return [];
  const db = getDb()!;
  const rows = await db
    .select()
    .from(meetings)
    .where(and(eq(meetings.userId, userId), eq(meetings.leadId, leadId)))
    .orderBy(asc(meetings.whenAt));
  return rows.map(toView);
}
