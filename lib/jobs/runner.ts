import "server-only";
import { and, asc, eq, inArray } from "drizzle-orm";
import { getDb, isDbConfigured } from "@/lib/db";
import { jobs, leads, outreachDrafts } from "@/lib/db/schema";
import { currentUser } from "@/lib/auth/currentUser";
import { getCreatorProfile, profileSummary, creatorDisplayName } from "@/lib/profile/store";
import { getAgent } from "@/lib/agents/store";
import { toLeadView } from "@/lib/leads/store";
import { logActivity } from "@/lib/activity/store";
import { draftOutreach } from "@/lib/ai/outreach";
import { draftResearch } from "@/lib/ai/research";
import type { ActingAgent } from "@/lib/ai/types";

const HANDLED_KINDS = ["outreach", "research"] as const;
const BATCH_SIZE = 5;
const CONCURRENCY = 4;

async function mapWithConcurrency<T>(items: T[], limit: number, fn: (item: T) => Promise<void>) {
  let i = 0;
  async function worker() {
    while (i < items.length) {
      const item = items[i++];
      await fn(item);
    }
  }
  await Promise.all(Array.from({ length: Math.max(1, Math.min(limit, items.length)) }, worker));
}

async function processJob(
  db: NonNullable<ReturnType<typeof getDb>>,
  job: typeof jobs.$inferSelect,
  creatorContext: string,
  creatorName: string
) {
  try {
    const params = job.params as { leadId: string };
    const [leadRow] = await db
      .select()
      .from(leads)
      .where(and(eq(leads.userId, job.userId), eq(leads.id, params.leadId)))
      .limit(1);
    if (!leadRow) throw new Error("Lead not found");
    const lead = toLeadView(leadRow);

    const agentView = job.agentId ? await getAgent(job.userId, job.agentId) : null;
    const actingAgent: ActingAgent = agentView
      ? { name: agentView.name, role: agentView.role, goal: agentView.goal }
      : { name: "Agent", role: "Helper", goal: "Help close the deal." };

    if (job.kind === "outreach") {
      const result = await draftOutreach(actingAgent, lead, creatorContext, creatorName);
      const [draft] = await db
        .insert(outreachDrafts)
        .values({
          userId: job.userId,
          agentId: job.agentId,
          leadId: lead.id,
          subject: result.subject,
          body: result.body,
          rationale: result.rationale,
          status: "draft",
        })
        .returning();

      await db.update(leads).set({ status: "pitched", updatedAt: new Date() }).where(eq(leads.id, lead.id));
      await logActivity({
        userId: job.userId,
        agentId: job.agentId,
        type: "email_drafted",
        leadId: lead.id,
        text: `Drafted a pitch for ${lead.company || lead.name}`,
      });
      await db.update(jobs).set({ status: "done", finishedAt: new Date(), result: { draftId: draft.id } }).where(eq(jobs.id, job.id));
    } else if (job.kind === "research") {
      const result = await draftResearch(actingAgent, lead, creatorContext);
      await db.update(leads).set({ research: result, updatedAt: new Date() }).where(eq(leads.id, lead.id));
      await logActivity({
        userId: job.userId,
        agentId: job.agentId,
        type: "lead_researched",
        leadId: lead.id,
        text: `Wrote a research brief for ${lead.company || lead.name}`,
      });
      await db.update(jobs).set({ status: "done", finishedAt: new Date(), result: { ok: true } }).where(eq(jobs.id, job.id));
    }
  } catch (err) {
    await db
      .update(jobs)
      .set({ status: "failed", finishedAt: new Date(), error: String((err as Error)?.message ?? err) })
      .where(eq(jobs.id, job.id));
  }
}

export async function runJobsBatch(userId: string): Promise<{ processed: number; remaining: boolean }> {
  if (!isDbConfigured()) return { processed: 0, remaining: false };
  const db = getDb()!;

  const candidates = await db
    .select({ id: jobs.id })
    .from(jobs)
    .where(and(eq(jobs.userId, userId), eq(jobs.status, "queued"), inArray(jobs.kind, [...HANDLED_KINDS])))
    .orderBy(asc(jobs.createdAt))
    .limit(BATCH_SIZE);

  const claimed: (typeof jobs.$inferSelect)[] = [];
  for (const c of candidates) {
    const [row] = await db
      .update(jobs)
      .set({ status: "running", startedAt: new Date() })
      .where(and(eq(jobs.id, c.id), eq(jobs.status, "queued")))
      .returning();
    if (row) claimed.push(row);
  }

  if (claimed.length) {
    const user = await currentUser();
    const profile = await getCreatorProfile(userId);
    const creatorContext = profileSummary(profile);
    const creatorName = creatorDisplayName(user);

    await mapWithConcurrency(claimed, CONCURRENCY, (job) => processJob(db, job, creatorContext, creatorName));
  }

  const stillQueued = await db
    .select({ id: jobs.id })
    .from(jobs)
    .where(and(eq(jobs.userId, userId), eq(jobs.status, "queued"), inArray(jobs.kind, [...HANDLED_KINDS])))
    .limit(1);

  return { processed: claimed.length, remaining: stillQueued.length > 0 };
}
