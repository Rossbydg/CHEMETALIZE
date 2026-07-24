"use client";
import { css } from "@/lib/style";
import AgentAvatar from "./AgentAvatar";
import type { TeamView } from "@/lib/teams/types";
import type { AgentView } from "@/lib/agents/types";

export default function TeamCard({
  team,
  agentsById,
  onEdit,
}: {
  team: TeamView;
  agentsById: Map<string, AgentView>;
  onEdit: () => void;
}) {
  const members = team.members.map((id) => agentsById.get(id)).filter(Boolean) as AgentView[];

  return (
    <div style={css("display:flex;flex-direction:column;gap:14px;background:#003734;border-radius:16px;padding:20px")}>
      <div style={css("display:flex;align-items:center;gap:12px;justify-content:space-between")}>
        <div style={css("display:flex;align-items:center;gap:12px;min-width:0")}>
          <div
            style={css(
              "width:42px;height:42px;border-radius:12px;display:flex;align-items:center;justify-content:center;font-size:15px;font-weight:500;color:#012624;flex:none;background:" +
                team.iconBg
            )}
          >
            {team.icon}
          </div>
          <div style={css("min-width:0")}>
            <div style={css("font-size:14px;font-weight:500;color:#ffffff;white-space:nowrap;overflow:hidden;text-overflow:ellipsis")}>
              {team.name}
            </div>
            <div style={css("font-size:12px;color:#bbc7c6;margin-top:2px")}>{members.length} agent{members.length === 1 ? "" : "s"}</div>
          </div>
        </div>
        <button
          onClick={onEdit}
          style={css(
            "background:none;border:1px solid rgba(255,255,255,.14);border-radius:6px;padding:6px 12px;font-size:12px;color:#bbc7c6;cursor:pointer;flex:none"
          )}
        >
          Edit
        </button>
      </div>

      {team.description && <p style={css("font-size:13px;color:#bbc7c6;line-height:1.5;margin:0")}>{team.description}</p>}

      <div style={css("display:flex")}>
        {members.map((m, i) => (
          <div key={m.id} title={m.name} style={css("margin-left:" + (i === 0 ? "0" : "-8px"))}>
            <AgentAvatar agent={m} size={28} />
          </div>
        ))}
      </div>
    </div>
  );
}
