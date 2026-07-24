export type LeadStatus = "new" | "pitched" | "negotiating" | "replied" | "booked";
export type LeadSource = "manual" | "scrape";
export type LeadReview = "accepted" | "pending";

export interface ResearchBrief {
  summary: string;
  priorities: string[];
  hooks: string[];
  angle: string;
}

export const LEAD_STAGES: { id: LeadStatus; label: string }[] = [
  { id: "new", label: "New" },
  { id: "pitched", label: "Pitched" },
  { id: "negotiating", label: "Negotiating" },
  { id: "replied", label: "Replied" },
  { id: "booked", label: "Booked" },
];

export interface LeadView {
  id: string;
  agentId: string | null;
  name: string;
  title: string | null;
  company: string | null;
  email: string | null;
  status: LeadStatus;
  score: number | null;
  source: LeadSource;
  review: LeadReview;
  profileUrl: string | null;
  platform: string | null;
  research: ResearchBrief | null;
  createdAt: string;
}

export interface CreateLeadInput {
  name: string;
  title?: string;
  company?: string;
  email?: string;
  platform?: string;
  agentId?: string | null;
}

export interface CsvImportResult {
  imported: number;
  skipped: number;
}
