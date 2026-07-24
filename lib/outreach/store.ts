import "server-only";
import { and, desc, eq } from "drizzle-orm";
import { getDb, isDbConfigured } from "@/lib/db";
import { outreachDrafts } from "@/lib/db/schema";
import type { OutreachDraftView } from "./types";

function toView(row: typeof outreachDrafts.$inferSelect): OutreachDraftView {
  return {
    id: row.id,
    leadId: row.leadId,
    agentId: row.agentId,
    subject: row.subject,
    body: row.body,
    rationale: row.rationale,
    status: row.status,
    createdAt: row.createdAt.toISOString(),
  };
}

export async function listDraftsForLead(userId: string, leadId: string): Promise<OutreachDraftView[]> {
  if (!isDbConfigured()) return [];
  const db = getDb()!;
  const rows = await db
    .select()
    .from(outreachDrafts)
    .where(and(eq(outreachDrafts.userId, userId), eq(outreachDrafts.leadId, leadId), eq(outreachDrafts.dismissed, false)))
    .orderBy(desc(outreachDrafts.createdAt));
  return rows.map(toView);
}

export async function listAllDrafts(userId: string): Promise<OutreachDraftView[]> {
  if (!isDbConfigured()) return [];
  const db = getDb()!;
  const rows = await db
    .select()
    .from(outreachDrafts)
    .where(and(eq(outreachDrafts.userId, userId), eq(outreachDrafts.dismissed, false)))
    .orderBy(desc(outreachDrafts.createdAt));
  return rows.map(toView);
}
