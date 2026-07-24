import { auth } from "@clerk/nextjs/server";
import { listLeads } from "@/lib/leads/store";
import { listAgents } from "@/lib/agents/store";
import { listAllDrafts } from "@/lib/outreach/store";
import DealsBoard from "@/components/deals/DealsBoard";

export default async function DealsPage() {
  const { userId } = await auth();
  const [leads, agents, drafts] = userId ? await Promise.all([listLeads(userId), listAgents(userId), listAllDrafts(userId)]) : [[], [], []];

  return <DealsBoard leads={leads} agents={agents} drafts={drafts} />;
}
