"use server";
import { auth } from "@clerk/nextjs/server";
import { and, eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { getDb, isDbConfigured } from "@/lib/db";
import { agents, agentConfig, agentStates } from "@/lib/db/schema";
import { AGENT_TYPES } from "@/lib/agentTypes";
import type { CreateAgentInput, UpdateAgentInput } from "./types";

function newAgentId(name: string) {
  const base = name.trim().toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "") || "agent";
  return `${base}-${Math.random().toString(36).slice(2, 7)}`;
}

function initialsFor(name: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  const initials = parts.map((w) => w[0]).join("").slice(0, 2).toUpperCase();
  return initials || "AI";
}

export async function createAgent(input: CreateAgentInput) {
  const { userId } = await auth();
  if (!userId || !isDbConfigured()) return;

  const db = getDb()!;
  await db.insert(agents).values({
    userId,
    id: newAgentId(input.name),
    name: input.name,
    initials: initialsFor(input.name),
    role: input.role,
    color: input.color,
    avatarUrl: input.avatarUrl?.trim() || null,
    status: "waiting",
    task: "",
    goal: input.goal,
    type: "custom",
    capabilities: input.capabilities,
  });

  revalidatePath("/agents");
  revalidatePath("/dashboard");
}

// Presets can't be edited directly (they're static code) — identity/role/goal changes for
// them land in agentConfig as an override, merged back in at read time.
export async function updateAgent(id: string, input: UpdateAgentInput) {
  const { userId } = await auth();
  if (!userId || !isDbConfigured()) return;

  const db = getDb()!;
  const isPreset = AGENT_TYPES.some((a) => a.id === id);

  const avatarUrl = input.avatarUrl !== undefined ? input.avatarUrl?.trim() || null : undefined;

  if (isPreset) {
    const patch = {
      name: input.name,
      initials: input.name ? initialsFor(input.name) : undefined,
      color: input.color,
      avatarUrl,
      role: input.role,
      goal: input.goal,
    };
    await db
      .insert(agentConfig)
      .values({ userId, agentId: id, ...patch })
      .onConflictDoUpdate({ target: [agentConfig.userId, agentConfig.agentId], set: patch });
  } else {
    const patch = { ...input, avatarUrl, ...(input.name ? { initials: initialsFor(input.name) } : {}) };
    await db.update(agents).set(patch).where(and(eq(agents.userId, userId), eq(agents.id, id)));
  }

  revalidatePath("/agents");
  revalidatePath(`/agents/${id}`);
  revalidatePath("/dashboard");
}

export async function setAgentPaused(id: string, paused: boolean) {
  const { userId } = await auth();
  if (!userId || !isDbConfigured()) return;

  const db = getDb()!;
  await db
    .insert(agentStates)
    .values({ userId, agentId: id, paused })
    .onConflictDoUpdate({ target: [agentStates.userId, agentStates.agentId], set: { paused } });

  revalidatePath("/agents");
  revalidatePath(`/agents/${id}`);
  revalidatePath("/dashboard");
}

export async function removeAgent(id: string) {
  const { userId } = await auth();
  if (!userId || !isDbConfigured()) return;

  const db = getDb()!;
  await db
    .insert(agentStates)
    .values({ userId, agentId: id, removed: true })
    .onConflictDoUpdate({ target: [agentStates.userId, agentStates.agentId], set: { removed: true } });

  revalidatePath("/agents");
  revalidatePath("/dashboard");
}
