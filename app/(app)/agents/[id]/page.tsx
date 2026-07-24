import { auth } from "@clerk/nextjs/server";
import { notFound } from "next/navigation";
import { getAgent } from "@/lib/agents/store";
import AgentDetail from "@/components/agents/AgentDetail";

export default async function AgentDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { userId } = await auth();
  const agent = userId ? await getAgent(userId, id) : null;

  if (!agent) notFound();

  return <AgentDetail agent={agent} />;
}
