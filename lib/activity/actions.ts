"use server";
import { auth } from "@clerk/nextjs/server";
import { and, eq } from "drizzle-orm";
import { getDb, isDbConfigured } from "@/lib/db";
import { activity } from "@/lib/db/schema";
import { listUndismissedActivity } from "./store";

export async function fetchNotifications() {
  const { userId } = await auth();
  if (!userId) return [];
  return listUndismissedActivity(userId);
}

// Dismissing only hides an item from the bell — it never rewrites the raw log, so
// analytics/dashboard totals are unaffected.
export async function dismissNotification(id: string) {
  const { userId } = await auth();
  if (!userId || !isDbConfigured()) return;
  const db = getDb()!;
  await db.update(activity).set({ dismissed: true }).where(and(eq(activity.userId, userId), eq(activity.id, id)));
}

export async function dismissAllNotifications() {
  const { userId } = await auth();
  if (!userId || !isDbConfigured()) return;
  const db = getDb()!;
  await db.update(activity).set({ dismissed: true }).where(and(eq(activity.userId, userId), eq(activity.dismissed, false)));
}
