"use server";
import { auth } from "@clerk/nextjs/server";
import { and, eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { getDb, isDbConfigured } from "@/lib/db";
import { meetings, leads } from "@/lib/db/schema";
import { logActivity } from "@/lib/activity/store";
import { parseMeetingTime } from "@/lib/ai/meetingTime";
import type { NowParts, ParsedMeetingTime } from "@/lib/ai/meetingTime";

// Thin proxy so the client can call the (server-only) natural-language time engine.
export async function parseMeetingPhrase(phrase: string, now: NowParts): Promise<ParsedMeetingTime | null> {
  const { userId } = await auth();
  if (!userId) return null;
  return parseMeetingTime(phrase, now);
}

export interface BookMeetingInput {
  title: string;
  whenAt: string; // ISO, resolved client-side in the creator's own local time
  whenLabel?: string;
  leadId?: string | null;
  agentId?: string | null;
}

export async function bookMeeting(input: BookMeetingInput) {
  const { userId } = await auth();
  if (!userId || !isDbConfigured() || !input.title.trim() || !input.whenAt) return;

  const db = getDb()!;
  await db.insert(meetings).values({
    userId,
    agentId: input.agentId ?? null,
    leadId: input.leadId ?? null,
    title: input.title.trim(),
    kind: "call",
    whenAt: new Date(input.whenAt),
    whenLabel: input.whenLabel ?? null,
  });

  if (input.leadId) {
    await db
      .update(leads)
      .set({ status: "booked", updatedAt: new Date() })
      .where(and(eq(leads.userId, userId), eq(leads.id, input.leadId)));
  }

  await logActivity({
    userId,
    agentId: input.agentId,
    type: "meeting_booked",
    leadId: input.leadId ?? null,
    text: `Booked ${input.title}`,
  });

  revalidatePath("/calendar");
  revalidatePath("/deals");
  if (input.leadId) revalidatePath(`/deals/${input.leadId}`);
  revalidatePath("/dashboard");
}
