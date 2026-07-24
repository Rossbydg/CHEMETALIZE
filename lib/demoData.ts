export interface AgentOutput {
  agentId: string;
  leadsWorked: number;
}

export interface WorkspaceStats {
  activeAgents: number;
  tasksRunning: number;
  leadsWorked: number;
  perAgent: AgentOutput[];
}

export interface ActivityItem {
  agentId: string;
  text: string;
}

export const DEMO_STATS: WorkspaceStats = {
  activeAgents: 4,
  tasksRunning: 6,
  leadsWorked: 18,
  perAgent: [
    { agentId: "discovery", leadsWorked: 9 },
    { agentId: "outreach", leadsWorked: 12 },
    { agentId: "proposal", leadsWorked: 5 },
    { agentId: "followup", leadsWorked: 3 },
    { agentId: "scheduler", leadsWorked: 4 },
  ],
};

export const DEMO_ACTIVITY: ActivityItem[] = [
  { agentId: "scheduler", text: "booked a call with Northwind Coffee for Thursday at 2pm" },
  { agentId: "outreach", text: "drafted a pitch for Solstice Skincare" },
  { agentId: "discovery", text: "found 3 new brands sponsoring creators in your niche" },
  { agentId: "proposal", text: "priced a 3-post package for Northwind Coffee" },
];
