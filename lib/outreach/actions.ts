"use server";
import { auth } from "@clerk/nextjs/server";
import { and, eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { getDb, isDbConfigured } from "@/lib/db";
import { outreachDrafts } from "@/lib/db/schema";

export async function dismissDraft(id: string, leadId: string) {
  const { userId } = await auth();
  if (!userId || !isDbConfigured()) return;

  const db = getDb()!;
  await db.update(outreachDrafts).set({ dismissed: true }).where(and(eq(outreachDrafts.userId, userId), eq(outreachDrafts.id, id)));

  revalidatePath(`/deals/${leadId}`);
  revalidatePath("/deals");
}
