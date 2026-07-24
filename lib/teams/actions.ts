"use server";
import { auth } from "@clerk/nextjs/server";
import { and, eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { getDb, isDbConfigured } from "@/lib/db";
import { teams, teamMembers } from "@/lib/db/schema";
import { TEAM_TEMPLATES } from "@/lib/agentTypes";
import type { CreateTeamInput, UpdateTeamInput } from "./types";

function newTeamId(name: string) {
  const base = name.trim().toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "") || "team";
  return `${base}-${Math.random().toString(36).slice(2, 7)}`;
}

export async function createTeam(input: CreateTeamInput) {
  const { userId } = await auth();
  if (!userId || !isDbConfigured()) return;

  const db = getDb()!;
  await db.insert(teams).values({
    userId,
    id: newTeamId(input.name),
    name: input.name,
    icon: input.name[0]?.toUpperCase() ?? "T",
    iconBg: "#00b8ac",
    description: input.description,
    goal: input.goal,
    members: input.members,
  });

  revalidatePath("/agents");
  revalidatePath("/dashboard");
}

// A preset team's name/description/goal are static code — only its member list can be
// overridden (via teamMembers), same layering pattern as agentConfig for agents.
export async function updateTeam(id: string, input: UpdateTeamInput) {
  const { userId } = await auth();
  if (!userId || !isDbConfigured()) return;

  const db = getDb()!;
  const isPreset = TEAM_TEMPLATES.some((t) => t.id === id);

  if (isPreset) {
    if (input.members) {
      await db
        .insert(teamMembers)
        .values({ userId, teamId: id, members: input.members })
        .onConflictDoUpdate({ target: [teamMembers.userId, teamMembers.teamId], set: { members: input.members } });
    }
  } else {
    await db.update(teams).set(input).where(and(eq(teams.userId, userId), eq(teams.id, id)));
  }

  revalidatePath("/agents");
  revalidatePath("/dashboard");
}
