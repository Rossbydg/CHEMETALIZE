import type { AgentView } from "@/lib/agents/types";

// Matches "@Research", "@Otis", etc. against an agent's first name or role word — no server
// dependency, so this can run on either side if ever needed.
export function findMentionedAgent(text: string, agents: AgentView[]): AgentView | null {
  const match = text.match(/@([A-Za-z][\w'-]*)/);
  if (!match) return null;

  const mention = match[1].toLowerCase();
  return (
    agents.find((a) => a.name.split(" ")[0].toLowerCase() === mention) ??
    agents.find((a) => a.role.split(" ")[0].toLowerCase() === mention) ??
    agents.find((a) => a.name.toLowerCase().includes(mention) || a.role.toLowerCase().includes(mention)) ??
    null
  );
}
