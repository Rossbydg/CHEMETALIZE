"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { css } from "@/lib/style";
import AgentCard from "./AgentCard";
import TeamCard from "./TeamCard";
import AgentForm from "./AgentForm";
import TeamForm from "./TeamForm";
import { createAgent } from "@/lib/agents/actions";
import { createTeam, updateTeam } from "@/lib/teams/actions";
import type { AgentView } from "@/lib/agents/types";
import type { TeamView } from "@/lib/teams/types";

export default function AgentsBoard({ agents, teams }: { agents: AgentView[]; teams: TeamView[] }) {
  const router = useRouter();
  const [showNewAgent, setShowNewAgent] = useState(false);
  const [showNewTeam, setShowNewTeam] = useState(false);
  const [editingTeam, setEditingTeam] = useState<string | null>(null);

  const agentsById = new Map(agents.map((a) => [a.id, a]));

  return (
    <div style={css("padding:clamp(16px,4vw,36px) clamp(16px,5vw,40px);display:flex;flex-direction:column;gap:40px")}>
      <section style={css("display:flex;flex-direction:column;gap:20px")}>
        <div style={css("display:flex;align-items:center;justify-content:space-between")}>
          <div>
            <div style={css("font-size:12px;font-weight:500;letter-spacing:.12em;text-transform:uppercase;color:#bbc7c6")}>Agents</div>
            <h1 style={css("font-family:var(--font-matter);font-weight:500;font-size:24px;color:#ffffff;margin:8px 0 0")}>Your team</h1>
          </div>
          <button
            onClick={() => setShowNewAgent((s) => !s)}
            style={css(
              "background:#00c2b8;border:none;border-radius:6px;padding:10px 18px;font-size:13px;font-weight:500;color:#012624;cursor:pointer"
            )}
          >
            {showNewAgent ? "Close" : "+ New agent"}
          </button>
        </div>

        {showNewAgent && (
          <AgentForm
            title="New agent"
            capabilitiesLocked={false}
            initial={{ name: "", role: "", goal: "", color: "#00b8ac", avatarUrl: "", capabilities: [] }}
            onSubmit={async (values) => {
              await createAgent(values);
              router.refresh();
            }}
            onClose={() => setShowNewAgent(false)}
          />
        )}

        <div style={css("display:grid;grid-template-columns:repeat(auto-fill,minmax(240px,1fr));gap:16px")}>
          {agents.map((a) => (
            <AgentCard key={a.id} agent={a} />
          ))}
        </div>
      </section>

      <section style={css("display:flex;flex-direction:column;gap:20px")}>
        <div style={css("display:flex;align-items:center;justify-content:space-between")}>
          <div>
            <div style={css("font-size:12px;font-weight:500;letter-spacing:.12em;text-transform:uppercase;color:#bbc7c6")}>Teams</div>
            <h1 style={css("font-family:var(--font-matter);font-weight:500;font-size:24px;color:#ffffff;margin:8px 0 0")}>Your pods</h1>
          </div>
          <button
            onClick={() => setShowNewTeam((s) => !s)}
            style={css(
              "background:#00c2b8;border:none;border-radius:6px;padding:10px 18px;font-size:13px;font-weight:500;color:#012624;cursor:pointer"
            )}
          >
            {showNewTeam ? "Close" : "+ New team"}
          </button>
        </div>

        {showNewTeam && (
          <TeamForm
            title="New team"
            detailsLocked={false}
            allAgents={agents}
            initial={{ name: "", description: "", goal: "", members: [] }}
            onSubmit={async (values) => {
              await createTeam(values);
              router.refresh();
            }}
            onClose={() => setShowNewTeam(false)}
          />
        )}

        <div style={css("display:grid;grid-template-columns:repeat(auto-fill,minmax(280px,1fr));gap:16px")}>
          {teams.map((t) =>
            editingTeam === t.id ? (
              <TeamForm
                key={t.id}
                title={`Edit ${t.name}`}
                detailsLocked={t.isPreset}
                allAgents={agents}
                initial={{ name: t.name, description: t.description, goal: t.goal, members: t.members }}
                onSubmit={async (values) => {
                  await updateTeam(t.id, values);
                  router.refresh();
                }}
                onClose={() => setEditingTeam(null)}
              />
            ) : (
              <TeamCard key={t.id} team={t} agentsById={agentsById} onEdit={() => setEditingTeam(t.id)} />
            )
          )}
        </div>
      </section>
    </div>
  );
}
