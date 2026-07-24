"use client";
import { useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { css } from "@/lib/style";
import { LEAD_STAGES } from "@/lib/leads/types";
import { updateLeadStage, updateLeadAgent } from "@/lib/leads/actions";
import type { LeadView } from "@/lib/leads/types";
import type { AgentView } from "@/lib/agents/types";

const selectStyle =
  "background:#012624;border:1px solid rgba(255,255,255,.14);border-radius:6px;padding:6px 8px;font-size:11.5px;color:#edfffe;outline:none;width:100%";

export default function LeadCard({ lead, agents }: { lead: LeadView; agents: AgentView[] }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const agent = agents.find((a) => a.id === lead.agentId);

  function moveTo(status: LeadView["status"]) {
    startTransition(async () => {
      await updateLeadStage(lead.id, status);
      router.refresh();
    });
  }

  function assignTo(agentId: string) {
    startTransition(async () => {
      await updateLeadAgent(lead.id, agentId || null);
      router.refresh();
    });
  }

  return (
    <div style={css("display:flex;flex-direction:column;gap:10px;background:#003734;border-radius:12px;padding:14px;" + (isPending ? "opacity:.6" : ""))}>
      <div>
        <Link href={`/deals/${lead.id}`} style={css("font-size:13px;font-weight:500;color:#ffffff;display:block")}>
          {lead.name}
        </Link>
        <div style={css("font-size:11.5px;color:#bbc7c6;margin-top:2px")}>
          {[lead.company, lead.platform].filter(Boolean).join(" · ") || "—"}
        </div>
      </div>

      {agent && (
        <div style={css("display:flex;align-items:center;gap:6px")}>
          <span
            style={css(
              "width:16px;height:16px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:7.5px;font-weight:500;color:#012624;flex:none;background:" +
                agent.color
            )}
          >
            {agent.initials}
          </span>
          <span style={css("font-size:11px;color:#bbc7c6")}>{agent.name}</span>
        </div>
      )}

      <select value={lead.status} onChange={(e) => moveTo(e.target.value as LeadView["status"])} style={css(selectStyle)}>
        {LEAD_STAGES.map((s) => (
          <option key={s.id} value={s.id}>
            {s.label}
          </option>
        ))}
      </select>

      <select value={lead.agentId ?? ""} onChange={(e) => assignTo(e.target.value)} style={css(selectStyle)}>
        <option value="">Unassigned</option>
        {agents.map((a) => (
          <option key={a.id} value={a.id}>
            {a.name}
          </option>
        ))}
      </select>
    </div>
  );
}
