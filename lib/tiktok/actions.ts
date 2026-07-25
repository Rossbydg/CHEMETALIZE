"use server";
import { auth } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";
import { clearTikTokConnection } from "./store";

export async function disconnectTikTok() {
  const { userId } = await auth();
  if (!userId) return;

  await clearTikTokConnection(userId);

  revalidatePath("/settings");
  revalidatePath("/profile");
  revalidatePath("/dashboard");
}
