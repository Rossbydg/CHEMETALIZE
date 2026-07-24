export interface OutreachDraftView {
  id: string;
  leadId: string;
  agentId: string | null;
  subject: string | null;
  body: string;
  rationale: string | null;
  status: "draft" | "sent";
  createdAt: string;
}
