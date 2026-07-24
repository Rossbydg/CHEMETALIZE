export interface ProposalView {
  id: string;
  leadId: string;
  agentId: string | null;
  title: string;
  body: string;
  packages: string[];
  status: "draft" | "sent";
  createdAt: string;
}
