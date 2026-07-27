"use client";
import { useState } from "react";
import { css } from "@/lib/style";
import { LEAD_STAGES } from "@/lib/leads/types";
import LeadCard from "./LeadCard";
import AddLeadForm from "./AddLeadForm";
import CsvImportPanel from "./CsvImportPanel";
import PendingReview from "./PendingReview";
import PitchInbox from "./PitchInbox";
import DiscoverBrandsButton from "./DiscoverBrandsButton";
import type { LeadView } from "@/lib/leads/types";
import type { AgentView } from "@/lib/agents/types";
import type { OutreachDraftView } from "@/lib/outreach/types";

export default function DealsBoard({
  leads,
  agents,
  drafts,
}: {
  leads: LeadView[];
  agents: AgentView[];
  drafts: OutreachDraftView[];
}) {
  const [panel, setPanel] = useState<"none" | "add" | "import">("none");

  const accepted = leads.filter((l) => l.review === "accepted");
  const pending = leads.filter((l) => l.review === "pending");
  const leadsById = new Map(leads.map((l) => [l.id, l]));

  return (
    <div style={css("padding:clamp(16px,4vw,36px) clamp(16px,5vw,40px);display:flex;flex-direction:column;gap:40px")}>
      <section style={css("display:flex;flex-direction:column;gap:20px")}>
        <div style={css("display:flex;align-items:center;justify-content:space-between")}>
          <div>
            <div style={css("font-size:12px;font-weight:500;letter-spacing:.12em;text-transform:uppercase;color:#bbc7c6")}>Deals</div>
            <h1 style={css("font-family:var(--font-matter);font-weight:500;font-size:24px;color:#ffffff;margin:8px 0 0")}>Pipeline</h1>
          </div>
          <div style={css("display:flex;gap:10px")}>
            <button
              onClick={() => setPanel(panel === "import" ? "none" : "import")}
              style={css(
                "background:none;border:1px solid rgba(255,255,255,.14);border-radius:6px;padding:10px 16px;font-size:13px;color:#edfffe;cursor:pointer"
              )}
            >
              {panel === "import" ? "Close" : "Import CSV"}
            </button>
            <button
              onClick={() => setPanel(panel === "add" ? "none" : "add")}
              style={css(
                "background:#00c2b8;border:none;border-radius:6px;padding:10px 18px;font-size:13px;font-weight:500;color:#012624;cursor:pointer"
              )}
            >
              {panel === "add" ? "Close" : "+ Add brand"}
            </button>
          </div>
        </div>

        {panel === "add" && <AddLeadForm agents={agents} onClose={() => setPanel("none")} />}
        {panel === "import" && <CsvImportPanel onClose={() => setPanel("none")} />}

        <div style={css("display:grid;grid-template-columns:repeat(5,minmax(220px,1fr));gap:14px;overflow-x:auto")}>
          {LEAD_STAGES.map((stage) => {
            const stageLeads = accepted.filter((l) => l.status === stage.id);
            return (
              <div key={stage.id} style={css("display:flex;flex-direction:column;gap:12px;min-width:220px")}>
                <div style={css("display:flex;align-items:center;justify-content:space-between")}>
                  <span style={css("font-size:12px;font-weight:500;letter-spacing:.06em;text-transform:uppercase;color:#bbc7c6")}>
                    {stage.label}
                  </span>
                  <span
                    style={css(
                      "font-size:11px;font-weight:500;color:#bbc7c6;background:rgba(255,255,255,.06);border-radius:99px;padding:2px 8px"
                    )}
                  >
                    {stageLeads.length}
                  </span>
                </div>
                <div style={css("display:flex;flex-direction:column;gap:10px;min-height:60px")}>
                  {stageLeads.map((lead) => (
                    <LeadCard key={lead.id} lead={lead} agents={agents} />
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </section>

      <section style={css("display:flex;flex-direction:column;gap:20px")}>
        <div style={css("display:flex;align-items:center;justify-content:space-between")}>
          <div>
            <div style={css("font-size:12px;font-weight:500;letter-spacing:.12em;text-transform:uppercase;color:#bbc7c6")}>Pending review</div>
            <h1 style={css("font-family:var(--font-matter);font-weight:500;font-size:24px;color:#ffffff;margin:8px 0 0")}>
              Brands waiting for you
            </h1>
          </div>
          <DiscoverBrandsButton />
        </div>
        <PendingReview leads={pending} />
      </section>

      <section style={css("display:flex;flex-direction:column;gap:20px")}>
        <div>
          <div style={css("font-size:12px;font-weight:500;letter-spacing:.12em;text-transform:uppercase;color:#bbc7c6")}>Pitch inbox</div>
          <h1 style={css("font-family:var(--font-matter);font-weight:500;font-size:24px;color:#ffffff;margin:8px 0 0")}>Drafted pitches</h1>
        </div>
        <PitchInbox drafts={drafts} leadsById={leadsById} />
      </section>
    </div>
  );
}
