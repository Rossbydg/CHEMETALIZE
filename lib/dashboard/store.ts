import "server-only";
import { and, desc, eq, gte, inArray } from "drizzle-orm";
import { getDb, isDbConfigured } from "@/lib/db";
import { activity, jobs, leads, outreachDrafts, proposals, meetings } from "@/lib/db/schema";
import type { WorkspaceStats, ActivityItem } from "@/lib/demoData";
import type { LiveWork, AnalyticsData } from "./types";

function startOfMonth(): Date {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth(), 1);
}

// Real numbers for the orbit dashboard's center hub — this month, matching the demo shape exactly.
export async function getWorkspaceStats(userId: string): Promise<WorkspaceStats> {
  const empty: WorkspaceStats = { activeAgents: 0, tasksRunning: 0, leadsWorked: 0, perAgent: [] };
  if (!isDbConfigured()) return empty;
  const db = getDb()!;
  const monthStart = startOfMonth();

  const [activityRows, runningJobs, queuedJobs] = await Promise.all([
    db
      .select({ agentId: activity.agentId, leadId: activity.leadId })
      .from(activity)
      .where(and(eq(activity.userId, userId), gte(activity.createdAt, monthStart))),
    db.select({ agentId: jobs.agentId }).from(jobs).where(and(eq(jobs.userId, userId), eq(jobs.status, "running"))),
    db.select({ id: jobs.id }).from(jobs).where(and(eq(jobs.userId, userId), eq(jobs.status, "queued"))),
  ]);

  const distinctLeadIds = new Set(activityRows.filter((r) => r.leadId).map((r) => r.leadId));
  const perAgentMap = new Map<string, Set<string>>();
  for (const r of activityRows) {
    if (!r.agentId || !r.leadId) continue;
    if (!perAgentMap.has(r.agentId)) perAgentMap.set(r.agentId, new Set());
    perAgentMap.get(r.agentId)!.add(r.leadId);
  }

  return {
    activeAgents: new Set(runningJobs.filter((r) => r.agentId).map((r) => r.agentId)).size,
    tasksRunning: runningJobs.length + queuedJobs.length,
    leadsWorked: distinctLeadIds.size,
    perAgent: Array.from(perAgentMap.entries()).map(([agentId, leadIds]) => ({ agentId, leadsWorked: leadIds.size })),
  };
}

export async function getRecentActivityItems(userId: string, limit = 8): Promise<ActivityItem[]> {
  if (!isDbConfigured()) return [];
  const db = getDb()!;
  const rows = await db
    .select({ agentId: activity.agentId, text: activity.text })
    .from(activity)
    .where(eq(activity.userId, userId))
    .orderBy(desc(activity.createdAt))
    .limit(limit);
  return rows.filter((r): r is { agentId: string; text: string } => !!r.agentId);
}

// Which agent is working on which brand *right now* — drives the pulsing dots. Not part of the
// jobs/run batch runner's own concern; this just reads its current state.
export async function getLiveWork(userId: string): Promise<LiveWork[]> {
  if (!isDbConfigured()) return [];
  const db = getDb()!;

  const running = await db
    .select({ agentId: jobs.agentId, params: jobs.params })
    .from(jobs)
    .where(and(eq(jobs.userId, userId), eq(jobs.status, "running")));

  const withLead = running
    .map((r) => ({ agentId: r.agentId, leadId: (r.params as { leadId?: string } | null)?.leadId }))
    .filter((r): r is { agentId: string; leadId: string } => !!r.agentId && !!r.leadId);

  if (!withLead.length) return [];

  const leadRows = await db
    .select({ id: leads.id, name: leads.name, company: leads.company })
    .from(leads)
    .where(and(eq(leads.userId, userId), inArray(leads.id, withLead.map((r) => r.leadId))));
  const leadById = new Map(leadRows.map((l) => [l.id, l]));

  return withLead.map((r) => {
    const lead = leadById.get(r.leadId);
    return { agentId: r.agentId, leadId: r.leadId, brandLabel: lead ? lead.company || lead.name : "a brand" };
  });
}

export async function getAnalytics(userId: string): Promise<AnalyticsData> {
  const empty: AnalyticsData = {
    kpis: { pitchesDrafted: 0, followUpsSent: 0, proposalsDrafted: 0, brandsWorked: 0, callsBooked: 0 },
    dailyCounts: [],
    agentRanking: [],
  };
  if (!isDbConfigured()) return empty;
  const db = getDb()!;

  const [outreachRows, proposalRows, meetingRows, activityRows] = await Promise.all([
    db.select({ kind: outreachDrafts.kind }).from(outreachDrafts).where(eq(outreachDrafts.userId, userId)),
    db.select({ id: proposals.id }).from(proposals).where(eq(proposals.userId, userId)),
    db.select({ id: meetings.id }).from(meetings).where(eq(meetings.userId, userId)),
    db
      .select({ agentId: activity.agentId, leadId: activity.leadId, createdAt: activity.createdAt })
      .from(activity)
      .where(eq(activity.userId, userId)),
  ]);

  const kpis = {
    pitchesDrafted: outreachRows.filter((r) => r.kind === "outreach").length,
    followUpsSent: outreachRows.filter((r) => r.kind === "follow-up").length,
    proposalsDrafted: proposalRows.length,
    brandsWorked: new Set(activityRows.filter((r) => r.leadId).map((r) => r.leadId)).size,
    callsBooked: meetingRows.length,
  };

  const dayKeyOf = (d: Date) => d.toISOString().slice(0, 10);
  const dailyCountsByKey = new Map<string, number>();
  for (const r of activityRows) {
    const key = dayKeyOf(r.createdAt);
    dailyCountsByKey.set(key, (dailyCountsByKey.get(key) ?? 0) + 1);
  }
  const today = new Date();
  const dailyCounts = Array.from({ length: 14 }, (_, i) => {
    const d = new Date(today.getFullYear(), today.getMonth(), today.getDate() - (13 - i));
    const key = dayKeyOf(d);
    return { date: key, count: dailyCountsByKey.get(key) ?? 0 };
  });

  const rankMap = new Map<string, number>();
  for (const r of activityRows) {
    if (!r.agentId) continue;
    rankMap.set(r.agentId, (rankMap.get(r.agentId) ?? 0) + 1);
  }
  const agentRanking = Array.from(rankMap.entries())
    .map(([agentId, count]) => ({ agentId, count }))
    .sort((a, b) => b.count - a.count);

  return { kpis, dailyCounts, agentRanking };
}
