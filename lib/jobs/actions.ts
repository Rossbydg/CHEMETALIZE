"use server";
import { auth } from "@clerk/nextjs/server";
import { getDb, isDbConfigured } from "@/lib/db";
import { jobs } from "@/lib/db/schema";
import { getJob } from "./store";
import type { JobKind } from "./types";

export async function enqueueJob(kind: JobKind, params: { leadId: string; agentId?: string | null }): Promise<string | null> {
  const { userId } = await auth();
  if (!userId || !isDbConfigured()) return null;

  const db = getDb()!;
  const [row] = await db
    .insert(jobs)
    .values({ userId, agentId: params.agentId ?? null, kind, status: "queued", params: { leadId: params.leadId } })
    .returning({ id: jobs.id });

  return row?.id ?? null;
}

export async function getJobStatus(id: string): Promise<{ status: string; error: string | null } | null> {
  const { userId } = await auth();
  if (!userId) return null;
  const job = await getJob(userId, id);
  return job ? { status: job.status, error: job.error } : null;
}
