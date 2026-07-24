export type ActivityType =
  | "lead_added"
  | "lead_imported"
  | "lead_accepted"
  | "lead_rejected"
  | "lead_stage_changed"
  | "lead_researched"
  | "email_drafted"
  | "proposal_drafted"
  | "follow_up_drafted"
  | "meeting_booked";

export interface ActivityView {
  id: string;
  agentId: string | null;
  type: ActivityType;
  leadId: string | null;
  text: string;
  createdAt: string;
}
