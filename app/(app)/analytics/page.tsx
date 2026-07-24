import { auth } from "@clerk/nextjs/server";
import { getAnalytics } from "@/lib/dashboard/store";
import { listAgents } from "@/lib/agents/store";
import AnalyticsBoard from "@/components/analytics/AnalyticsBoard";

export default async function AnalyticsPage() {
  const { userId } = await auth();
  const [data, agents] = userId
    ? await Promise.all([getAnalytics(userId), listAgents(userId)])
    : [
        { kpis: { pitchesDrafted: 0, followUpsSent: 0, proposalsDrafted: 0, brandsWorked: 0, callsBooked: 0 }, dailyCounts: [], agentRanking: [] },
        [],
      ];

  return <AnalyticsBoard data={data} agents={agents} />;
}
