import Link from "next/link";
import { css } from "@/lib/style";
import { statusMeta } from "@/lib/data";
import { CAPABILITIES } from "@/lib/agentTypes";
import AgentAvatar from "./AgentAvatar";
import type { AgentView } from "@/lib/agents/types";

export default function AgentCard({ agent }: { agent: AgentView }) {
  const meta = statusMeta(agent.paused ? "offline" : agent.status);
  const capLabels = agent.capabilities.map((id) => CAPABILITIES.find((c) => c.id === id)?.label ?? id);

  return (
    <Link
      href={`/agents/${agent.id}`}
      style={css(
        "display:flex;flex-direction:column;gap:14px;background:#003734;border-radius:16px;padding:20px;transition:background .12s"
      )}
    >
      <div style={css("display:flex;align-items:center;gap:12px")}>
        <AgentAvatar agent={agent} size={42} />
        <div style={css("min-width:0")}>
          <div style={css("font-size:14px;font-weight:500;color:#ffffff;white-space:nowrap;overflow:hidden;text-overflow:ellipsis")}>
            {agent.name}
          </div>
          <div style={css("font-size:12px;color:#bbc7c6;margin-top:2px")}>{agent.role}</div>
        </div>
      </div>

      <div style={css("display:flex;align-items:center;gap:6px")}>
        <span style={css("width:7px;height:7px;border-radius:50%;background:" + meta.dot + ";flex:none")} />
        <span style={css("font-size:11px;font-weight:500;letter-spacing:.04em;color:" + meta.color + ";text-transform:uppercase")}>
          {agent.paused ? "Paused" : meta.label}
        </span>
      </div>

      <div style={css("display:flex;flex-wrap:wrap;gap:6px")}>
        {capLabels.map((label) => (
          <span
            key={label}
            style={css(
              "font-size:10.5px;font-weight:500;color:#bbc7c6;background:rgba(255,255,255,.06);border:1px solid rgba(255,255,255,.1);border-radius:99px;padding:3px 10px"
            )}
          >
            {label}
          </span>
        ))}
      </div>
    </Link>
  );
}
