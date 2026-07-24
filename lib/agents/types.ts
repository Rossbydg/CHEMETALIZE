import type { StatusKey } from "@/lib/data";
import type { CapabilityId } from "@/lib/agentTypes";

export interface AgentView {
  id: string;
  name: string;
  initials: string;
  role: string;
  color: string;
  avatarUrl: string | null;
  status: StatusKey;
  task: string;
  goal: string;
  capabilities: CapabilityId[];
  type: string;
  isPreset: boolean;
  paused: boolean;
}

export interface CreateAgentInput {
  name: string;
  role: string;
  goal: string;
  color: string;
  avatarUrl?: string | null;
  capabilities: CapabilityId[];
}

export interface UpdateAgentInput {
  name?: string;
  role?: string;
  goal?: string;
  color?: string;
  avatarUrl?: string | null;
  capabilities?: CapabilityId[];
}

export const AGENT_COLOR_PALETTE = ["#00b8ac", "#22c2c9", "#6fa8c7", "#c08ce0", "#e28fd0", "#f43f7e", "#0ea5e9", "#7c3aed"];
