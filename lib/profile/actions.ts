"use server";
import { auth } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";
import { getDb, isDbConfigured } from "@/lib/db";
import { creatorProfile } from "@/lib/db/schema";
import type { ProfileInput } from "./types";

export async function saveCreatorProfile(input: ProfileInput) {
  const { userId } = await auth();
  if (!userId || !isDbConfigured()) return;

  const db = getDb()!;
  await db
    .insert(creatorProfile)
    .values({ userId, ...input, updatedAt: new Date() })
    .onConflictDoUpdate({
      target: creatorProfile.userId,
      set: { ...input, updatedAt: new Date() },
    });

  revalidatePath("/profile");
  revalidatePath("/onboarding");
  revalidatePath("/dashboard");
}
