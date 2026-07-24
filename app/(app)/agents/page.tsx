import { auth } from "@clerk/nextjs/server";
import { listAgents } from "@/lib/agents/store";
import { listTeams } from "@/lib/teams/store";
import AgentsBoard from "@/components/agents/AgentsBoard";

export default async function AgentsPage() {
  const { userId } = await auth();
  const [agents, teams] = userId ? await Promise.all([listAgents(userId), listTeams(userId)]) : [[], []];

  return <AgentsBoard agents={agents} teams={teams} />;
}
