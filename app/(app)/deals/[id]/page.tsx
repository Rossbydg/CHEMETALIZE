import { auth } from "@clerk/nextjs/server";
import { notFound } from "next/navigation";
import { getLead } from "@/lib/leads/store";
import { listAgents } from "@/lib/agents/store";
import { listDraftsForLead } from "@/lib/outreach/store";
import { listProposalsForLead } from "@/lib/proposals/store";
import { listMeetingsForLead } from "@/lib/meetings/store";
import LeadDetail from "@/components/deals/LeadDetail";

export default async function LeadDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { userId } = await auth();
  const lead = userId ? await getLead(userId, id) : null;

  if (!lead) notFound();

  const [agents, drafts, proposals, meetings] = await Promise.all([
    listAgents(userId!),
    listDraftsForLead(userId!, id),
    listProposalsForLead(userId!, id),
    listMeetingsForLead(userId!, id),
  ]);

  return <LeadDetail lead={lead} agents={agents} drafts={drafts} proposals={proposals} meetings={meetings} />;
}
