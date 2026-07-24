import "server-only";
import { and, desc, eq } from "drizzle-orm";
import { getDb, isDbConfigured } from "@/lib/db";
import { leads } from "@/lib/db/schema";
import type { LeadView } from "./types";

export function toLeadView(row: typeof leads.$inferSelect): LeadView {
  return {
    id: row.id,
    agentId: row.agentId,
    name: row.name,
    title: row.title,
    company: row.company,
    email: row.email,
    status: row.status,
    score: row.score,
    source: row.source,
    review: row.review,
    profileUrl: row.profileUrl,
    platform: row.platform,
    research: row.research,
    createdAt: row.createdAt.toISOString(),
  };
}

export async function listLeads(userId: string): Promise<LeadView[]> {
  if (!isDbConfigured()) return [];
  const db = getDb()!;
  const rows = await db.select().from(leads).where(eq(leads.userId, userId)).orderBy(desc(leads.createdAt));
  return rows.map(toLeadView);
}

export async function listLeadsByAgent(userId: string, agentId: string): Promise<LeadView[]> {
  if (!isDbConfigured()) return [];
  const db = getDb()!;
  const rows = await db
    .select()
    .from(leads)
    .where(and(eq(leads.userId, userId), eq(leads.agentId, agentId)))
    .orderBy(desc(leads.createdAt));
  return rows.map(toLeadView);
}

export async function getLead(userId: string, id: string): Promise<LeadView | null> {
  if (!isDbConfigured()) return null;
  const db = getDb()!;
  const rows = await db
    .select()
    .from(leads)
    .where(and(eq(leads.userId, userId), eq(leads.id, id)))
    .limit(1);
  return rows[0] ? toLeadView(rows[0]) : null;
}
