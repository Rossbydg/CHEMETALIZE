import "server-only";
import { asc, eq } from "drizzle-orm";
import { getDb, isDbConfigured } from "@/lib/db";
import { messages } from "@/lib/db/schema";
import type { ChatMessageView } from "./types";

export async function listMessages(userId: string, limit = 150): Promise<ChatMessageView[]> {
  if (!isDbConfigured()) return [];
  const db = getDb()!;
  const rows = await db.select().from(messages).where(eq(messages.userId, userId)).orderBy(asc(messages.id)).limit(limit);
  return rows.map((r) => ({ id: r.id, agentId: r.agentId, who: r.who, text: r.text, createdAt: r.createdAt.toISOString() }));
}
