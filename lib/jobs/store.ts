import "server-only";
import { and, eq } from "drizzle-orm";
import { getDb, isDbConfigured } from "@/lib/db";
import { jobs } from "@/lib/db/schema";

export async function getJob(userId: string, id: string) {
  if (!isDbConfigured()) return null;
  const db = getDb()!;
  const rows = await db
    .select()
    .from(jobs)
    .where(and(eq(jobs.userId, userId), eq(jobs.id, id)))
    .limit(1);
  return rows[0] ?? null;
}
