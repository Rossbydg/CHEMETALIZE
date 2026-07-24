import { css } from "@/lib/style";
import AgentAvatar from "@/components/agents/AgentAvatar";
import type { AnalyticsData } from "@/lib/dashboard/types";
import type { AgentView } from "@/lib/agents/types";

const kpiStyle = "display:flex;flex-direction:column;gap:6px;background:#003734;border-radius:16px;padding:20px";
const kpiLabel = "font-size:11px;font-weight:500;letter-spacing:.06em;text-transform:uppercase;color:#bbc7c6";
const kpiValue = "font-family:var(--font-matter);font-size:28px;font-weight:500;color:#ffffff";

export default function AnalyticsBoard({ data, agents }: { data: AnalyticsData; agents: AgentView[] }) {
  const agentsById = new Map(agents.map((a) => [a.id, a]));
  const maxDaily = Math.max(1, ...data.dailyCounts.map((d) => d.count));
  const maxRank = Math.max(1, ...data.agentRanking.map((r) => r.count));

  const kpiTiles: { label: string; value: number }[] = [
    { label: "Pitches drafted", value: data.kpis.pitchesDrafted },
    { label: "Proposals drafted", value: data.kpis.proposalsDrafted },
    { label: "Follow-ups sent", value: data.kpis.followUpsSent },
    { label: "Brands worked", value: data.kpis.brandsWorked },
    { label: "Calls booked", value: data.kpis.callsBooked },
  ];

  return (
    <div style={css("padding:36px 40px;display:flex;flex-direction:column;gap:32px")}>
      <div>
        <div style={css("font-size:12px;font-weight:500;letter-spacing:.12em;text-transform:uppercase;color:#bbc7c6")}>Analytics</div>
        <h1 style={css("font-family:var(--font-matter);font-weight:500;font-size:24px;color:#ffffff;margin:8px 0 0")}>Your real results</h1>
      </div>

      <div style={css("display:grid;grid-template-columns:repeat(auto-fit,minmax(160px,1fr));gap:14px")}>
        {kpiTiles.map((k) => (
          <div key={k.label} style={css(kpiStyle)}>
            <div style={css(kpiValue)}>{k.value}</div>
            <div style={css(kpiLabel)}>{k.label}</div>
          </div>
        ))}
      </div>

      <div style={css("display:flex;flex-direction:column;gap:16px;background:#003734;border-radius:16px;padding:24px")}>
        <div style={css("font-size:14px;font-weight:500;color:#ffffff")}>Activity, last 14 days</div>
        <div style={css("display:flex;align-items:flex-end;gap:6px;height:120px")}>
          {data.dailyCounts.map((d) => (
            <div key={d.date} style={css("flex:1;display:flex;flex-direction:column;align-items:center;gap:6px;height:100%;justify-content:flex-end")}>
              <div
                title={`${d.date}: ${d.count}`}
                style={css(
                  `width:100%;min-height:2px;height:${Math.round((d.count / maxDaily) * 100)}%;border-radius:3px;background:linear-gradient(180deg,#00c2b8,#00827c)`
                )}
              />
              <span style={css("font-size:9.5px;color:#707777")}>
                {new Date(d.date + "T00:00:00Z").toLocaleDateString("en-US", { day: "numeric" })}
              </span>
            </div>
          ))}
        </div>
      </div>

      <div style={css("display:flex;flex-direction:column;gap:14px;background:#003734;border-radius:16px;padding:24px")}>
        <div style={css("font-size:14px;font-weight:500;color:#ffffff")}>Output by agent</div>
        {data.agentRanking.length ? (
          <div style={css("display:flex;flex-direction:column;gap:12px")}>
            {data.agentRanking.map((r) => {
              const agent = agentsById.get(r.agentId);
              return (
                <div key={r.agentId} style={css("display:flex;align-items:center;gap:12px")}>
                  {agent ? (
                    <AgentAvatar agent={agent} size={30} />
                  ) : (
                    <div style={css("width:30px;height:30px;border-radius:50%;background:#012624;flex:none")} />
                  )}
                  <div style={css("flex:1;min-width:0;display:flex;flex-direction:column;gap:4px")}>
                    <span style={css("font-size:12.5px;font-weight:500;color:#ffffff")}>{agent?.name ?? "Unknown agent"}</span>
                    <div style={css("width:100%;height:5px;border-radius:3px;background:rgba(255,255,255,.08);overflow:hidden")}>
                      <div
                        style={css(
                          `width:${Math.round((r.count / maxRank) * 100)}%;height:100%;border-radius:3px;background:linear-gradient(90deg,${agent?.color ?? "#00c2b8"},#cbfffc)`
                        )}
                      />
                    </div>
                  </div>
                  <span style={css("font-size:12.5px;color:#bbc7c6;flex:none")}>{r.count}</span>
                </div>
              );
            })}
          </div>
        ) : (
          <p style={css("font-size:13px;color:#bbc7c6;margin:0")}>No activity yet — draft a pitch or run a search to get started.</p>
        )}
      </div>
    </div>
  );
}
