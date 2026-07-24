import { auth } from "@clerk/nextjs/server";
import { listMessages } from "@/lib/chat/store";
import { listAgents } from "@/lib/agents/store";
import ChatBoard from "@/components/chat/ChatBoard";

// Server Action duration is governed by the invoking route, not the action file itself — routing
// + running a capability (a job, a discovery search) can take a few seconds.
export const maxDuration = 60;

export default async function ChatPage() {
  const { userId } = await auth();
  const [messages, agents] = userId ? await Promise.all([listMessages(userId), listAgents(userId)]) : [[], []];

  return <ChatBoard messages={messages} agents={agents} />;
}
