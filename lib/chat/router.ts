import "server-only";
import { and, eq } from "drizzle-orm";
import { getDb, isDbConfigured } from "@/lib/db";
import { jobs, outreachDrafts, proposals, leads as leadsTable, meetings as meetingsTable } from "@/lib/db/schema";
import { listLeads, getLead } from "@/lib/leads/store";
import { runJobsBatch } from "@/lib/jobs/runner";
import { getJob } from "@/lib/jobs/store";
import { runDiscovery } from "@/lib/discovery/run";
import { routeChatMessage } from "@/lib/ai/chatRouter";
import { parseMeetingTime, type NowParts } from "@/lib/ai/meetingTime";
import { logActivity } from "@/lib/activity/store";
import type { AgentView } from "@/lib/agents/types";
import type { CapabilityId } from "@/lib/agentTypes";

export interface ChatReply {
  agentId: string | null;
  text: string;
}

export async function runIntent(
  userId: string,
  mentioned: AgentView,
  allAgents: AgentView[],
  rawMessage: string,
  now: NowParts
): Promise<ChatReply> {
  if (!isDbConfigured()) {
    return { agentId: mentioned.id, text: "I can't do anything yet — the database isn't connected." };
  }

  const leadsList = await listLeads(userId);
  const intent = await routeChatMessage(
    rawMessage,
    leadsList.map((l) => ({ id: l.id, name: l.name, company: l.company }))
  );

  // Route to a capable teammate if the mentioned agent can't do this themselves.
  let actingAgent = mentioned;
  let handoff = "";
  if (intent.capability !== "chat" && !mentioned.capabilities.includes(intent.capability)) {
    const alt = allAgents.find((a) => a.capabilities.includes(intent.capability as CapabilityId));
    if (alt) {
      actingAgent = alt;
      handoff = `That's not my department, so I looped in ${alt.name} (${alt.role}). `;
    }
  }

  const db = getDb()!;
  let reply: string;

  switch (intent.capability) {
    case "chat": {
      reply =
        intent.clarification ||
        "Try asking me to find brands, write a brief, draft a pitch, price a proposal, follow up, or book a call.";
      break;
    }

    case "scrape": {
      const result = await runDiscovery(userId);
      reply = result.inserted
        ? `Found ${result.inserted} brand${result.inserted === 1 ? "" : "s"} for your niche: ${result.names.join(", ")}. Check Pending review to approve them.`
        : "Didn't find anything new this time — try again in a bit.";
      break;
    }

    case "book-meeting": {
      const phrase = intent.meetingPhrase || rawMessage;
      const parsed = await parseMeetingTime(phrase, now);
      if (!parsed) {
        reply = 'I couldn\'t quite make out a date and time — try something like "next Tuesday at 2pm."';
      } else {
        const lead = intent.leadId ? await getLead(userId, intent.leadId) : null;
        const title = lead ? `Call with ${lead.company || lead.name}` : "Booked call";
        const whenAt = new Date(parsed.year, parsed.month - 1, parsed.day, parsed.hour, parsed.minute);

        await db.insert(meetingsTable).values({
          userId,
          agentId: actingAgent.id,
          leadId: lead?.id ?? null,
          title,
          kind: "call",
          whenAt,
          whenLabel: parsed.label,
        });

        if (lead) {
          await db
            .update(leadsTable)
            .set({ status: "booked", updatedAt: new Date() })
            .where(and(eq(leadsTable.userId, userId), eq(leadsTable.id, lead.id)));
        }

        await logActivity({ userId, agentId: actingAgent.id, type: "meeting_booked", leadId: lead?.id ?? null, text: `Booked ${title}` });
        reply = `Booked — ${title}, ${parsed.label}.`;
      }
      break;
    }

    case "research":
    case "outreach":
    case "proposal":
    case "follow-up": {
      if (!intent.leadId) {
        reply = intent.clarification || "Which brand did you mean? Add it to your pipeline first, or name one that's already there.";
        break;
      }

      const lead = await getLead(userId, intent.leadId);
      if (!lead) {
        reply = "I couldn't find that brand in your pipeline.";
        break;
      }

      const [job] = await db
        .insert(jobs)
        .values({ userId, agentId: actingAgent.id, kind: intent.capability, status: "queued", params: { leadId: lead.id } })
        .returning();
      await runJobsBatch(userId);
      const finished = await getJob(userId, job.id);

      if (finished?.status !== "done") {
        reply = "Something went wrong on that one — try again.";
        break;
      }

      if (intent.capability === "outreach" || intent.capability === "follow-up") {
        const draftId = (finished.result as { draftId?: string } | null)?.draftId;
        const [draft] = draftId ? await db.select().from(outreachDrafts).where(eq(outreachDrafts.id, draftId)).limit(1) : [];
        const label = intent.capability === "follow-up" ? "follow-up" : "pitch";
        reply = draft
          ? `Done — here's the ${label} for ${lead.company || lead.name}:\n\n${draft.subject ? draft.subject + "\n\n" : ""}${draft.body}`
          : `Drafted a ${label} for ${lead.company || lead.name} — check their page.`;
      } else if (intent.capability === "proposal") {
        const proposalId = (finished.result as { proposalId?: string } | null)?.proposalId;
        const [proposal] = proposalId ? await db.select().from(proposals).where(eq(proposals.id, proposalId)).limit(1) : [];
        reply = proposal
          ? `Done — here's the proposal for ${lead.company || lead.name}:\n\n${proposal.title}\n\n${proposal.body}`
          : `Drafted a proposal for ${lead.company || lead.name} — check their page.`;
      } else {
        const updated = await getLead(userId, lead.id);
        reply = updated?.research
          ? `Done — here's the brief on ${lead.company || lead.name}:\n\n${updated.research.summary}`
          : `Wrote a brief for ${lead.company || lead.name} — check their page.`;
      }
      break;
    }

    default: {
      reply = "Not sure how to help with that yet.";
    }
  }

  return { agentId: actingAgent.id, text: handoff + reply };
}
