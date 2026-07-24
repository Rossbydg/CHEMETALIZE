export interface LiveWork {
  agentId: string;
  leadId: string;
  brandLabel: string;
}

export interface AnalyticsData {
  kpis: {
    pitchesDrafted: number;
    followUpsSent: number;
    proposalsDrafted: number;
    brandsWorked: number;
    callsBooked: number;
  };
  dailyCounts: { date: string; count: number }[];
  agentRanking: { agentId: string; count: number }[];
}
