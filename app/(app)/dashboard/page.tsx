import HomeClient from "@/app/HomeClient";
import { currentUser } from "@/lib/auth/currentUser";
import { css } from "@/lib/style";
import { listAgents } from "@/lib/agents/store";
import { listTeams } from "@/lib/teams/store";
import { getWorkspaceStats, getRecentActivityItems } from "@/lib/dashboard/store";

export default async function DashboardPage() {
  const user = await currentUser();
  const rawName = (user && "name" in user && user.name) || "";
  const firstName = rawName ? rawName.split(" ")[0] : "there";

  const userId = user?.id;
  const [agents, teams, stats, acts] = userId
    ? await Promise.all([listAgents(userId), listTeams(userId), getWorkspaceStats(userId), getRecentActivityItems(userId)])
    : [undefined, undefined, undefined, undefined];

  return (
    <div style={css("padding:24px 28px;display:flex;flex-direction:column;gap:16px")}>
      <div style={css("font-family:var(--font-matter);font-size:18px;font-weight:500;color:#ffffff")}>
        Welcome back, {firstName}
      </div>
      <HomeClient agents={agents} teams={teams} initialStats={stats} initialActs={acts} live />
    </div>
  );
}
