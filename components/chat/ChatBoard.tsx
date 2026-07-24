import { css } from "@/lib/style";
import ChatThread from "./ChatThread";
import ChatComposer from "./ChatComposer";
import AgentAvatar from "@/components/agents/AgentAvatar";
import type { ChatMessageView } from "@/lib/chat/types";
import type { AgentView } from "@/lib/agents/types";

export default function ChatBoard({ messages, agents }: { messages: ChatMessageView[]; agents: AgentView[] }) {
  return (
    <div style={css("padding:36px 40px;display:flex;gap:24px;height:calc(100dvh - 64px)")}>
      <div style={css("flex:1;min-width:0;display:flex;flex-direction:column;gap:16px")}>
        <div>
          <div style={css("font-size:12px;font-weight:500;letter-spacing:.12em;text-transform:uppercase;color:#bbc7c6")}>Chat</div>
          <h1 style={css("font-family:var(--font-matter);font-weight:500;font-size:24px;color:#ffffff;margin:8px 0 0")}>Your team</h1>
        </div>
        <ChatThread messages={messages} agents={agents} />
        <ChatComposer />
      </div>

      <div style={css("width:220px;flex:none;display:flex;flex-direction:column;gap:14px")}>
        <div style={css("font-size:12px;font-weight:500;letter-spacing:.08em;text-transform:uppercase;color:#bbc7c6")}>Mention</div>
        {agents.map((a) => (
          <div key={a.id} style={css("display:flex;align-items:center;gap:10px")}>
            <AgentAvatar agent={a} size={30} />
            <div style={css("min-width:0")}>
              <div style={css("font-size:12.5px;font-weight:500;color:#ffffff;white-space:nowrap;overflow:hidden;text-overflow:ellipsis")}>
                @{a.name.split(" ")[0]}
              </div>
              <div style={css("font-size:11px;color:#bbc7c6")}>{a.role}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
