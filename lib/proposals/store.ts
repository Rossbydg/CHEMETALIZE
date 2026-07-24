import "server-only";
import { and, desc, eq } from "drizzle-orm";
import { getDb, isDbConfigured } from "@/lib/db";
import { proposals } from "@/lib/db/schema";
import type { ProposalView } from "./types";

function toView(row: typeof proposals.$inferSelect): ProposalView {
  return {
    id: row.id,
    leadId: row.leadId,
    agentId: row.agentId,
    title: row.title,
    body: row.body,
    packages: row.products,
    status: row.status,
    createdAt: row.createdAt.toISOString(),
  };
}

export async function listProposalsForLead(userId: string, leadId: string): Promise<ProposalView[]> {
  if (!isDbConfigured()) return [];
  const db = getDb()!;
  const rows = await db
    .select()
    .from(proposals)
    .where(and(eq(proposals.userId, userId), eq(proposals.leadId, leadId)))
    .orderBy(desc(proposals.createdAt));
  return rows.map(toView);
}
