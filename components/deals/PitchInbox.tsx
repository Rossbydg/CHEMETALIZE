import { css } from "@/lib/style";
import DraftCard from "./DraftCard";
import type { OutreachDraftView } from "@/lib/outreach/types";
import type { LeadView } from "@/lib/leads/types";

export default function PitchInbox({ drafts, leadsById }: { drafts: OutreachDraftView[]; leadsById: Map<string, LeadView> }) {
  if (!drafts.length) {
    return (
      <div style={css("background:#003734;border-radius:16px;padding:24px")}>
        <p style={css("font-size:13px;color:#bbc7c6;margin:0;line-height:1.5")}>
          Drafted pitches will show up here, ready to open in your mail app or copy.
        </p>
      </div>
    );
  }

  return (
    <div style={css("display:grid;grid-template-columns:repeat(auto-fill,minmax(320px,1fr));gap:14px")}>
      {drafts.map((d) => {
        const lead = leadsById.get(d.leadId);
        return (
          <DraftCard
            key={d.id}
            draft={d}
            leadId={d.leadId}
            leadEmail={lead?.email ?? null}
            brandLabel={lead ? lead.company || lead.name : "Unknown brand"}
          />
        );
      })}
    </div>
  );
}
