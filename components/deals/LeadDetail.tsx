"use client";
import { useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { css } from "@/lib/style";
import { LEAD_STAGES } from "@/lib/leads/types";
import { updateLeadStage, updateLeadAgent } from "@/lib/leads/actions";
import { enqueueJob } from "@/lib/jobs/actions";
import JobActionButton from "./JobActionButton";
import DraftCard from "./DraftCard";
import ProposalCard from "./ProposalCard";
import BookMeetingForm from "@/components/calendar/BookMeetingForm";
import type { LeadView } from "@/lib/leads/types";
import type { AgentView } from "@/lib/agents/types";
import type { CapabilityId } from "@/lib/agentTypes";
import type { OutreachDraftView } from "@/lib/outreach/types";
import type { ProposalView } from "@/lib/proposals/types";
import type { MeetingView } from "@/lib/meetings/types";

const selectStyle =
  "background:#012624;border:1px solid rgba(255,255,255,.14);border-radius:6px;padding:8px 10px;font-size:12.5px;color:#edfffe;outline:none";
const cardStyle = "display:flex;flex-direction:column;gap:14px;background:#003734;border-radius:16px;padding:22px";

function agentFor(agents: AgentView[], capability: CapabilityId, preferredId: string | null): AgentView | null {
  const preferred = agents.find((a) => a.id === preferredId);
  if (preferred?.capabilities.includes(capability)) return preferred;
  return agents.find((a) => a.capabilities.includes(capability)) ?? null;
}

export default function LeadDetail({
  lead,
  agents,
  drafts,
  proposals,
  meetings,
}: {
  lead: LeadView;
  agents: AgentView[];
  drafts: OutreachDraftView[];
  proposals: ProposalView[];
  meetings: MeetingView[];
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

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

  const outreachAgent = agentFor(agents, "outreach", lead.agentId);
  const researchAgent = agentFor(agents, "research", lead.agentId);
  const proposalAgent = agentFor(agents, "proposal", lead.agentId);
  const followupAgent = agentFor(agents, "follow-up", lead.agentId);
  const schedulerAgent = agentFor(agents, "book-meeting", lead.agentId);

  return (
    <div style={css("padding:clamp(16px,4vw,36px) clamp(16px,5vw,40px);display:flex;flex-direction:column;gap:28px;max-width:680px")}>
      <div>
        <Link href="/deals" style={css("font-size:12px;color:#bbc7c6")}>
          ← Back to pipeline
        </Link>
        <h1 style={css("font-family:var(--font-matter);font-weight:500;font-size:26px;color:#ffffff;margin:10px 0 0")}>{lead.name}</h1>
        <div style={css("font-size:13px;color:#bbc7c6;margin-top:4px")}>
          {[lead.company, lead.platform, lead.email].filter(Boolean).join(" · ") || "No details yet"}
        </div>
      </div>

      <div style={css("display:flex;gap:24px;flex-wrap:wrap;" + (isPending ? "opacity:.7" : ""))}>
        <div>
          <div style={css("font-size:11px;font-weight:500;letter-spacing:.06em;text-transform:uppercase;color:#bbc7c6;margin-bottom:6px")}>
            Stage
          </div>
          <select value={lead.status} onChange={(e) => moveTo(e.target.value as LeadView["status"])} style={css(selectStyle)}>
            {LEAD_STAGES.map((s) => (
              <option key={s.id} value={s.id}>
                {s.label}
              </option>
            ))}
          </select>
        </div>
        <div>
          <div style={css("font-size:11px;font-weight:500;letter-spacing:.06em;text-transform:uppercase;color:#bbc7c6;margin-bottom:6px")}>
            Agent
          </div>
          <select value={lead.agentId ?? ""} onChange={(e) => assignTo(e.target.value)} style={css(selectStyle)}>
            <option value="">Unassigned</option>
            {agents.map((a) => (
              <option key={a.id} value={a.id}>
                {a.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div style={css(cardStyle)}>
        <div style={css("display:flex;align-items:center;justify-content:space-between;gap:12px")}>
          <div style={css("font-size:14px;font-weight:500;color:#ffffff")}>Research brief</div>
          <JobActionButton
            label="Write brief"
            pendingLabel="Researching…"
            enqueue={() => enqueueJob("research", { leadId: lead.id, agentId: researchAgent?.id ?? null })}
          />
        </div>
        {lead.research ? (
          <div style={css("display:flex;flex-direction:column;gap:12px")}>
            <p style={css("font-size:13.5px;color:#edfffe;line-height:1.6;margin:0")}>{lead.research.summary}</p>
            {lead.research.priorities.length > 0 && (
              <div>
                <div
                  style={css("font-size:11px;font-weight:500;letter-spacing:.06em;text-transform:uppercase;color:#bbc7c6;margin-bottom:6px")}
                >
                  Priorities
                </div>
                <ul style={css("margin:0;padding-left:18px;font-size:13px;color:#bbc7c6;line-height:1.6")}>
                  {lead.research.priorities.map((p, i) => (
                    <li key={i}>{p}</li>
                  ))}
                </ul>
              </div>
            )}
            {lead.research.hooks.length > 0 && (
              <div>
                <div
                  style={css("font-size:11px;font-weight:500;letter-spacing:.06em;text-transform:uppercase;color:#bbc7c6;margin-bottom:6px")}
                >
                  Hooks
                </div>
                <ul style={css("margin:0;padding-left:18px;font-size:13px;color:#bbc7c6;line-height:1.6")}>
                  {lead.research.hooks.map((h, i) => (
                    <li key={i}>{h}</li>
                  ))}
                </ul>
              </div>
            )}
            {lead.research.angle && (
              <div>
                <div
                  style={css("font-size:11px;font-weight:500;letter-spacing:.06em;text-transform:uppercase;color:#bbc7c6;margin-bottom:6px")}
                >
                  Angle
                </div>
                <p style={css("font-size:13px;color:#edfffe;line-height:1.6;margin:0")}>{lead.research.angle}</p>
              </div>
            )}
          </div>
        ) : (
          <p style={css("font-size:13px;color:#bbc7c6;margin:0;line-height:1.5")}>No brief yet — write one to sharpen the pitch.</p>
        )}
      </div>

      <div style={css("display:flex;flex-direction:column;gap:14px")}>
        <div style={css("display:flex;align-items:center;justify-content:space-between;gap:12px;flex-wrap:wrap")}>
          <div style={css("font-size:14px;font-weight:500;color:#ffffff")}>Pitches</div>
          <div style={css("display:flex;gap:8px")}>
            <JobActionButton
              label="Follow up"
              pendingLabel="Following up…"
              enqueue={() => enqueueJob("follow-up", { leadId: lead.id, agentId: followupAgent?.id ?? null })}
            />
            <JobActionButton
              label="Draft pitch"
              pendingLabel="Drafting…"
              enqueue={() => enqueueJob("outreach", { leadId: lead.id, agentId: outreachAgent?.id ?? null })}
            />
          </div>
        </div>
        {drafts.length ? (
          <div style={css("display:flex;flex-direction:column;gap:12px")}>
            {drafts.map((d) => (
              <DraftCard key={d.id} draft={d} leadId={lead.id} leadEmail={lead.email} brandLabel={lead.company || lead.name} />
            ))}
          </div>
        ) : (
          <p style={css("font-size:13px;color:#bbc7c6;margin:0;line-height:1.5")}>No pitch drafted yet.</p>
        )}
      </div>

      <div style={css("display:flex;flex-direction:column;gap:14px")}>
        <div style={css("display:flex;align-items:center;justify-content:space-between;gap:12px")}>
          <div style={css("font-size:14px;font-weight:500;color:#ffffff")}>Proposals</div>
          <JobActionButton
            label="Draft proposal"
            pendingLabel="Drafting…"
            enqueue={() => enqueueJob("proposal", { leadId: lead.id, agentId: proposalAgent?.id ?? null })}
          />
        </div>
        {proposals.length ? (
          <div style={css("display:flex;flex-direction:column;gap:12px")}>
            {proposals.map((p) => (
              <ProposalCard key={p.id} proposal={p} leadEmail={lead.email} />
            ))}
          </div>
        ) : (
          <p style={css("font-size:13px;color:#bbc7c6;margin:0;line-height:1.5")}>No proposal drafted yet.</p>
        )}
      </div>

      <div style={css(cardStyle)}>
        <div style={css("font-size:14px;font-weight:500;color:#ffffff")}>Book a call</div>
        {meetings.length > 0 && (
          <div style={css("display:flex;flex-direction:column;gap:8px")}>
            {meetings.map((m) => (
              <div key={m.id} style={css("display:flex;align-items:center;justify-content:space-between;background:#012624;border-radius:8px;padding:10px 14px")}>
                <span style={css("font-size:13px;font-weight:500;color:#ffffff")}>{m.title}</span>
                <span style={css("font-size:12px;color:#bbc7c6")}>
                  {m.whenLabel || new Date(m.whenAt).toLocaleString("en-US", { weekday: "short", month: "short", day: "numeric", hour: "numeric", minute: "2-digit" })}
                </span>
              </div>
            ))}
          </div>
        )}
        <BookMeetingForm
          defaultTitle={`Call with ${lead.company || lead.name}`}
          leadId={lead.id}
          agentId={schedulerAgent?.id ?? null}
          onBooked={() => router.refresh()}
        />
      </div>
    </div>
  );
}
