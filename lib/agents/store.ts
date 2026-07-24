import "server-only";
import { eq } from "drizzle-orm";
import { getDb, isDbConfigured } from "@/lib/db";
import { agents, agentConfig, agentStates } from "@/lib/db/schema";
import { AGENT_TYPES } from "@/lib/agentTypes";
import type { CapabilityId } from "@/lib/agentTypes";
import type { StatusKey } from "@/lib/data";
import type { AgentView } from "./types";

export async function listAgents(userId: string): Promise<AgentView[]> {
  const presets: AgentView[] = AGENT_TYPES.map((a) => ({
    id: a.id,
    name: a.name,
    initials: a.initials,
    role: a.role,
    color: a.color,
    avatarUrl: null,
    status: a.status,
    task: a.task,
    goal: a.goal,
    capabilities: a.capabilities,
    type: a.id,
    isPreset: true,
    paused: false,
  }));

  if (!isDbConfigured()) return presets;
  const db = getDb()!;

  const [customRows, configRows, stateRows] = await Promise.all([
    db.select().from(agents).where(eq(agents.userId, userId)),
    db.select().from(agentConfig).where(eq(agentConfig.userId, userId)),
    db.select().from(agentStates).where(eq(agentStates.userId, userId)),
  ]);

  const configById = new Map(configRows.map((c) => [c.agentId, c]));
  const stateById = new Map(stateRows.map((s) => [s.agentId, s]));

  const custom: AgentView[] = customRows.map((a) => ({
    id: a.id,
    name: a.name,
    initials: a.initials,
    role: a.role,
    color: a.color,
    avatarUrl: a.avatarUrl,
    status: a.status as StatusKey,
    task: a.task ?? "",
    goal: a.goal ?? "",
    capabilities: a.capabilities as CapabilityId[],
    type: a.type,
    isPreset: false,
    paused: false,
  }));

  return [...presets, ...custom]
    .map((a) => {
      const cfg = configById.get(a.id);
      const st = stateById.get(a.id);
      return {
        ...a,
        name: cfg?.name ?? a.name,
        initials: cfg?.initials ?? a.initials,
        color: cfg?.color ?? a.color,
        avatarUrl: cfg?.avatarUrl ?? a.avatarUrl,
        role: cfg?.role ?? a.role,
        goal: cfg?.goal ?? a.goal,
        paused: st?.paused ?? false,
      };
    })
    .filter((a) => !stateById.get(a.id)?.removed);
}

export async function getAgent(userId: string, id: string): Promise<AgentView | null> {
  const list = await listAgents(userId);
  return list.find((a) => a.id === id) ?? null;
}
