export interface TeamView {
  id: string;
  name: string;
  icon: string;
  iconBg: string;
  description: string;
  goal: string;
  members: string[];
  isPreset: boolean;
}

export interface CreateTeamInput {
  name: string;
  description: string;
  goal: string;
  members: string[];
}

export interface UpdateTeamInput {
  name?: string;
  description?: string;
  goal?: string;
  members?: string[];
}
