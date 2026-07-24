"use client";
import { useEffect, useRef } from "react";
import { css } from "@/lib/style";
import AgentAvatar from "@/components/agents/AgentAvatar";
import type { ChatMessageView } from "@/lib/chat/types";
import type { AgentView } from "@/lib/agents/types";

export default function ChatThread({ messages, agents }: { messages: ChatMessageView[]; agents: AgentView[] }) {
  const bottomRef = useRef<HTMLDivElement>(null);
  const agentsById = new Map(agents.map((a) => [a.id, a]));

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages.length]);

  return (
    <div
      style={css(
        "flex:1;min-height:0;overflow-y:auto;display:flex;flex-direction:column;gap:14px;background:#003734;border-radius:16px;padding:20px"
      )}
    >
      {messages.length === 0 && (
        <p style={css("font-size:13px;color:#bbc7c6;margin:0")}>
          Say hi to your team — try &quot;@Research find me some fitness brands.&quot;
        </p>
      )}

      {messages.map((m) => {
        if (m.who === "me") {
          return (
            <div
              key={m.id}
              style={css(
                "align-self:flex-end;max-width:72%;background:#00c2b8;border-radius:14px 14px 2px 14px;padding:10px 14px"
              )}
            >
              <p style={css("font-size:13.5px;color:#012624;line-height:1.5;margin:0;white-space:pre-wrap")}>{m.text}</p>
            </div>
          );
        }

        const agent = m.agentId ? agentsById.get(m.agentId) : null;
        return (
          <div key={m.id} style={css("align-self:flex-start;max-width:80%;display:flex;gap:10px")}>
            {agent ? (
              <AgentAvatar agent={agent} size={30} />
            ) : (
              <div style={css("width:30px;height:30px;border-radius:50%;background:#012624;flex:none")} />
            )}
            <div style={css("display:flex;flex-direction:column;gap:4px;min-width:0")}>
              <span style={css("font-size:11.5px;font-weight:500;color:#bbc7c6")}>{agent?.name ?? "Team"}</span>
              <div style={css("background:#012624;border-radius:2px 14px 14px 14px;padding:10px 14px")}>
                <p style={css("font-size:13.5px;color:#edfffe;line-height:1.5;margin:0;white-space:pre-wrap")}>{m.text}</p>
              </div>
            </div>
          </div>
        );
      })}
      <div ref={bottomRef} />
    </div>
  );
}
