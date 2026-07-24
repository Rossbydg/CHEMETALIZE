"use server";
import { auth } from "@clerk/nextjs/server";
import { getLiveWork } from "./store";
import type { LiveWork } from "./types";

export async function fetchLiveWork(): Promise<LiveWork[]> {
  const { userId } = await auth();
  if (!userId) return [];
  return getLiveWork(userId);
}
