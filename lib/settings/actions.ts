"use server";
import { auth } from "@clerk/nextjs/server";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { getDb, isDbConfigured } from "@/lib/db";
import { users } from "@/lib/db/schema";

export async function updateNotificationSetting(key: string, value: boolean) {
  const { userId } = await auth();
  if (!userId || !isDbConfigured()) return;

  const db = getDb()!;
  const [row] = await db.select({ notifications: users.notifications }).from(users).where(eq(users.id, userId)).limit(1);
  const next = { ...(row?.notifications ?? {}), [key]: value };

  await db.update(users).set({ notifications: next }).where(eq(users.id, userId));
  revalidatePath("/settings");
}
