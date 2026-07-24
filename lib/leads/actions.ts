"use server";
import { auth } from "@clerk/nextjs/server";
import { and, eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { getDb, isDbConfigured } from "@/lib/db";
import { leads } from "@/lib/db/schema";
import { logActivity } from "@/lib/activity/store";
import { parseLeadsCsv } from "./csv";
import type { CreateLeadInput, CsvImportResult, LeadStatus } from "./types";

export async function addLead(input: CreateLeadInput) {
  const { userId } = await auth();
  if (!userId || !isDbConfigured() || !input.name.trim()) return;

  const db = getDb()!;
  const [row] = await db
    .insert(leads)
    .values({
      userId,
      agentId: input.agentId ?? null,
      name: input.name.trim(),
      title: input.title || null,
      company: input.company || null,
      email: input.email || null,
      platform: input.platform || null,
      source: "manual",
      review: "accepted",
    })
    .returning();

  await logActivity({ userId, agentId: row.agentId, type: "lead_added", leadId: row.id, text: `${row.name} added to the pipeline` });

  revalidatePath("/deals");
  revalidatePath("/dashboard");
}

export async function importLeadsCsv(csvText: string): Promise<CsvImportResult> {
  const { userId } = await auth();
  if (!userId || !isDbConfigured()) return { imported: 0, skipped: 0 };

  const parsed = parseLeadsCsv(csvText);
  if (!parsed.length) return { imported: 0, skipped: 0 };

  const db = getDb()!;
  const inserted = await db
    .insert(leads)
    .values(
      parsed.map((p) => ({
        userId,
        name: p.name,
        company: p.company ?? null,
        email: p.email ?? null,
        platform: p.platform ?? null,
        source: "manual" as const,
        review: "accepted" as const,
      }))
    )
    .returning({ id: leads.id });

  await logActivity({
    userId,
    type: "lead_imported",
    text: `Imported ${inserted.length} brand${inserted.length === 1 ? "" : "s"} from CSV`,
  });

  revalidatePath("/deals");
  revalidatePath("/dashboard");
  return { imported: inserted.length, skipped: 0 };
}

export async function updateLeadStage(id: string, status: LeadStatus) {
  const { userId } = await auth();
  if (!userId || !isDbConfigured()) return;

  const db = getDb()!;
  await db.update(leads).set({ status, updatedAt: new Date() }).where(and(eq(leads.userId, userId), eq(leads.id, id)));

  revalidatePath("/deals");
  revalidatePath("/dashboard");
}

export async function updateLeadAgent(id: string, agentId: string | null) {
  const { userId } = await auth();
  if (!userId || !isDbConfigured()) return;

  const db = getDb()!;
  await db.update(leads).set({ agentId, updatedAt: new Date() }).where(and(eq(leads.userId, userId), eq(leads.id, id)));

  revalidatePath("/deals");
}

export async function acceptLead(id: string) {
  const { userId } = await auth();
  if (!userId || !isDbConfigured()) return;

  const db = getDb()!;
  const [row] = await db
    .update(leads)
    .set({ review: "accepted", updatedAt: new Date() })
    .where(and(eq(leads.userId, userId), eq(leads.id, id)))
    .returning();

  if (row) {
    await logActivity({ userId, agentId: row.agentId, type: "lead_accepted", leadId: row.id, text: `${row.name} accepted into the pipeline` });
  }

  revalidatePath("/deals");
  revalidatePath("/dashboard");
}

// No "rejected" status exists in the pipeline — a rejected pending brand is simply discarded.
export async function rejectLead(id: string) {
  const { userId } = await auth();
  if (!userId || !isDbConfigured()) return;

  const db = getDb()!;
  const [row] = await db
    .delete(leads)
    .where(and(eq(leads.userId, userId), eq(leads.id, id)))
    .returning();

  if (row) {
    await logActivity({ userId, type: "lead_rejected", text: `${row.name} rejected` });
  }

  revalidatePath("/deals");
}
