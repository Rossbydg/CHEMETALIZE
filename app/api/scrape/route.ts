import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { runDiscovery } from "@/lib/discovery/run";

export const runtime = "nodejs";
export const maxDuration = 60;

export async function POST() {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const result = await runDiscovery(userId);
  return NextResponse.json(result);
}
