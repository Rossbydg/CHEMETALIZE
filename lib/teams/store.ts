import "server-only";
import { eq } from "drizzle-orm";
import { getDb, isDbConfigured } from "@/lib/db";
import { teams, teamMembers } from "@/lib/db/schema";
import { TEAM_TEMPLATES } from "@/lib/agentTypes";
import type { TeamView } from "./types";

export async function listTeams(userId: string): Promise<TeamView[]> {
  const presets: TeamView[] = TEAM_TEMPLATES.map((t) => ({
    id: t.id,
    name: t.name,
    icon: t.name[0] ?? "T",
    iconBg: "#00b8ac",
    description: "Your ready-made deal team — one agent per stage of the funnel: find, pitch, propose, follow up, book.",
    goal: "Cover a brand deal end to end.",
    members: t.members,
    isPreset: true,
  }));

  if (!isDbConfigured()) return presets;
  const db = getDb()!;

  const [customRows, memberRows] = await Promise.all([
    db.select().from(teams).where(eq(teams.userId, userId)),
    db.select().from(teamMembers).where(eq(teamMembers.userId, userId)),
  ]);

  const membersById = new Map(memberRows.map((m) => [m.teamId, m.members]));

  const custom: TeamView[] = customRows.map((t) => ({
    id: t.id,
    name: t.name,
    icon: t.icon ?? t.name[0] ?? "T",
    iconBg: t.iconBg ?? "#00b8ac",
    description: t.description ?? "",
    goal: t.goal ?? "",
    members: t.members,
    isPreset: false,
  }));

  return [...presets, ...custom].map((t) => ({ ...t, members: membersById.get(t.id) ?? t.members }));
}

export async function getTeam(userId: string, id: string): Promise<TeamView | null> {
  const list = await listTeams(userId);
  return list.find((t) => t.id === id) ?? null;
}
