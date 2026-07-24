import type { StatusKey } from "@/lib/data";

export type CapabilityId = "scrape" | "research" | "outreach" | "proposal" | "follow-up" | "book-meeting";

export interface Capability {
  id: CapabilityId;
  label: string;
  jobKind: string;
}

export const CAPABILITIES: Capability[] = [
  { id: "scrape", label: "Research", jobKind: "scrape" },
  { id: "research", label: "Brand brief", jobKind: "research" },
  { id: "outreach", label: "Initial outreach", jobKind: "outreach" },
  { id: "proposal", label: "Proposals", jobKind: "proposal" },
  { id: "follow-up", label: "Follow-ups", jobKind: "follow-up" },
  { id: "book-meeting", label: "Scheduling", jobKind: "book-meeting" },
];

export interface AgentType {
  id: string;
  name: string;
  initials: string;
  role: string;
  color: string;
  capabilities: CapabilityId[];
  status: StatusKey;
  task: string;
  goal: string;
}

export const AGENT_TYPES: AgentType[] = [
  {
    id: "discovery",
    name: "Remy Rivera",
    initials: "RR",
    role: "Research",
    color: "#00b8ac",
    capabilities: ["scrape", "research"],
    status: "working",
    task: "Scanning the web for brands sponsoring creators in your niche…",
    goal: "Keep the pipeline full of brands that actually fit you.",
  },
  {
    id: "outreach",
    name: "Otis Vance",
    initials: "OV",
    role: "Initial Outreach",
    color: "#22c2c9",
    capabilities: ["outreach"],
    status: "working",
    task: "Drafting a partnership pitch for Northwind Coffee…",
    goal: "Get a personalized first pitch in front of every new brand.",
  },
  {
    id: "proposal",
    name: "Priya Shah",
    initials: "PS",
    role: "Proposal",
    color: "#6fa8c7",
    capabilities: ["proposal"],
    status: "working",
    task: "Pricing a 3-post package for Solstice Skincare…",
    goal: "Turn brand interest into a scoped, priced deal.",
  },
  {
    id: "followup",
    name: "Faye Cole",
    initials: "FC",
    role: "Follow-up",
    color: "#c08ce0",
    capabilities: ["follow-up"],
    status: "waiting",
    task: "Watching for brands that have gone quiet…",
    goal: "Re-engage brands that stopped replying.",
  },
  {
    id: "scheduler",
    name: "Sam Okafor",
    initials: "SO",
    role: "Scheduler",
    color: "#e28fd0",
    capabilities: ["book-meeting"],
    status: "working",
    task: "Booking a call with Northwind Coffee for Thursday…",
    goal: "Get every interested brand on the calendar.",
  },
];

export interface TeamTemplate {
  id: string;
  name: string;
  members: string[];
}

export const TEAM_TEMPLATES: TeamTemplate[] = [
  { id: "deal-team", name: "Deal Team", members: AGENT_TYPES.map((a) => a.id) },
];
