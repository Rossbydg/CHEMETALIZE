"use server";
import { auth } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";
import { getDb, isDbConfigured } from "@/lib/db";
import { messages } from "@/lib/db/schema";
import { listAgents } from "@/lib/agents/store";
import { findMentionedAgent } from "./mention";
import { runIntent } from "./router";
import type { NowParts } from "@/lib/ai/meetingTime";

export async function sendChatMessage(text: string, now: NowParts) {
  const { userId } = await auth();
  if (!userId || !isDbConfigured() || !text.trim()) return;

  const db = getDb()!;
  await db.insert(messages).values({ userId, agentId: null, who: "me", text: text.trim() });

  const agentsList = await listAgents(userId);
  const mentioned = findMentionedAgent(text, agentsList);

  if (!mentioned) {
    await db.insert(messages).values({
      userId,
      agentId: null,
      who: "ai",
      text: 'Mention a teammate with @ to ask them to do something — e.g. "@Research find me some fitness brands."',
    });
  } else {
    const reply = await runIntent(userId, mentioned, agentsList, text, now);
    await db.insert(messages).values({ userId, agentId: reply.agentId, who: "ai", text: reply.text });
  }

  revalidatePath("/chat");
}
