"use client";
import { useEffect, useState } from "react";
import { statusMeta } from "@/lib/data";
import { av, hubIcon, CAPABILITY_ICON_TYPE } from "@/lib/visuals";
import { css, Box } from "@/components/primitives";
import { AGENT_TYPES, TEAM_TEMPLATES, type AgentType, type TeamTemplate } from "@/lib/agentTypes";
import { DEMO_STATS, DEMO_ACTIVITY, type WorkspaceStats, type ActivityItem } from "@/lib/demoData";
import { fetchLiveWork } from "@/lib/dashboard/actions";
import type { LiveWork } from "@/lib/dashboard/types";

const LIVE_POLL_MS = 3000;

// [animation, tint] per activity type — the glyph itself comes from hubIcon().
const hubIcons: Record<string, [string, string]> = {
  email: ["iconFly 2.6s ease-in-out infinite", "#00c2b8"],
  call: ["iconRing 1.6s ease-in-out infinite", "#00e5d0"],
  research: ["iconSwing 2.4s ease-in-out infinite", "#6fa8c7"],
  writing: ["iconPop 2.4s ease-in-out infinite", "#c08ce0"],
  meeting: ["iconPop 2.8s ease-in-out infinite", "#e28fd0"],
  analytics: ["iconPop 3s ease-in-out infinite", "#bbc7c6"],
  idle: ["breathe 3s ease-in-out infinite", "#707777"],
  alert: ["iconPop 1.8s ease-in-out infinite", "#fde9ff"],
};


interface HomeClientProps {
  agents?: AgentType[];
  teams?: TeamTemplate[];
  initialStats?: WorkspaceStats;
  initialActs?: ActivityItem[];
  avatarUrl?: string | null;
  live?: boolean;
}

export default function HomeClient({
  agents = AGENT_TYPES,
  teams = TEAM_TEMPLATES,
  initialStats = DEMO_STATS,
  initialActs = DEMO_ACTIVITY,
  avatarUrl = null,
  live = false,
}: HomeClientProps) {
  const byId = (id: string) => agents.find((a) => a.id === id);

  const [hubTeam, setHubTeam] = useState("all");
  const [dims, setDims] = useState({ w: 1280, h: 800 });
  const [reduced, setReduced] = useState(false);
  const [liveWork, setLiveWork] = useState<LiveWork[] | null>(null);
  const ws = initialStats;
  const acts = initialActs;
  const paMap = new Map((ws?.perAgent ?? []).map((p) => [p.agentId, p]));
  const maxOut = Math.max(1, ...(ws?.perAgent ?? []).map((p) => p.leadsWorked));

  useEffect(() => {
    const on = () => setDims({ w: window.innerWidth, h: window.innerHeight });
    on();
    window.addEventListener("resize", on);
    return () => window.removeEventListener("resize", on);
  }, []);
  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const on = () => setReduced(mq.matches);
    on();
    mq.addEventListener("change", on);
    return () => mq.removeEventListener("change", on);
  }, []);
  const [tick, setTick] = useState(0);
  useEffect(() => {
    const hub = setInterval(() => setTick((t) => t + 1), 3200);
    return () => clearInterval(hub);
  }, []);

  // Which agent is working on which brand right now — polled so the pulse reflects reality
  // while this page is open, not just whatever was true at the last full page load.
  useEffect(() => {
    if (!live) return;
    let cancelled = false;
    async function poll() {
      const work = await fetchLiveWork();
      if (!cancelled) setLiveWork(work);
    }
    poll();
    const interval = setInterval(poll, LIVE_POLL_MS);
    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, [live]);

  const hubMembers = (
    hubTeam === "all" ? agents.slice(0, 8) : (teams.find((t) => t.id === hubTeam) || teams[0])?.members.map((id) => byId(id))
  ).filter(Boolean) as AgentType[];
  const HN = Math.max(hubMembers.length, 1);
  const nodes = hubMembers.map((a, i) => {
    const ang = ((-90 + (i * 360) / HN) * Math.PI) / 180;
    const x = Math.round(380 + Math.cos(ang) * 272);
    const y = Math.round(262 + Math.sin(ang) * 186);
    const type = CAPABILITY_ICON_TYPE[a.capabilities?.[0] ?? ""] || "writing";
    const ic = hubIcons[type];
    const liveEntry = liveWork?.find((w) => w.agentId === a.id) ?? null;
    const working = Boolean(liveEntry) || a.status === "working";
    const m = statusMeta(working ? "working" : a.status);
    const latest = acts.find((f) => f.agentId === a.id);
    const badge = liveEntry ? `Working on ${liveEntry.brandLabel}` : latest ? latest.text.slice(0, 40) : working ? "Working…" : "Idle";
    return { a, i, x, y, m, ic, type, badge, working };
  });
  const collabs = HN >= 5 ? [[0, 2], [1, 4]] : [];

  const hubWorking = live && liveWork !== null ? new Set(liveWork.map((w) => w.agentId)).size : ws?.activeAgents ?? 0;
  const leadsWorked = ws?.leadsWorked ?? 0;
  const tasksRunning = ws?.tasksRunning ?? 0;
  const monthLabel = new Date().toLocaleString("en-US", { month: "long" }).toUpperCase();

  const actLine = (f?: ActivityItem) => (f ? (byId(f.agentId)?.name ?? "Agent") + " " + f.text : "");
  const hubLive = actLine(acts[0]).slice(0, 90);
  const hubLive2 = actLine(acts[1]).slice(0, 90);

  const hubCardW = dims.w - 52 - 2;
  const hubScale = Math.max(0.7, Math.min((dims.h - 250) / 524, (hubCardW - 40) / 760, 1.45));
  const teamPills = [{ id: "all", label: "Everyone" }].concat(teams.map((t) => ({ id: t.id, label: t.name })));

  return (
    <div style={css("position:relative;background:radial-gradient(900px 520px at 50% 38%,#003734,#011d1c 75%);border:1px solid rgba(255,255,255,.08);border-radius:16px;height:calc(100dvh - 178px);min-height:540px;overflow:hidden")}>
      <div style={css("position:absolute;top:16px;left:20px;right:150px;display:flex;gap:8px;z-index:3;flex-wrap:wrap")}>
        {teamPills.map((p) => (
          <Box
            key={p.id}
            onClick={() => setHubTeam(p.id)}
            style={
              "font-size:11.5px;font-weight:500;letter-spacing:.04em;text-transform:uppercase;border-radius:99px;padding:5px 13px;cursor:pointer;transition:all .12s;backdrop-filter:blur(6px);" +
              (hubTeam === p.id ? "background:#fff;color:#012624;border:1px solid #fff" : "background:rgba(255,255,255,.06);color:#bbc7c6;border:1px solid rgba(255,255,255,.14)")
            }
            styleHover="border-color:#cbfffc"
          >
            {p.label}
          </Box>
        ))}
      </div>
      {hubWorking > 0 && (
        <div style={css("position:absolute;top:16px;right:20px;display:flex;align-items:center;gap:6px;font-size:11px;font-weight:500;letter-spacing:.04em;text-transform:uppercase;color:#00e5d0;background:rgba(0,194,184,.14);border:1px solid rgba(0,229,208,.3);border-radius:99px;padding:4px 12px;z-index:3;backdrop-filter:blur(6px)")}>
          <span style={css("width:6px;height:6px;border-radius:50%;background:#00e5d0;animation:pulse 2s infinite")} />
          Working now
        </div>
      )}

      <div style={css("position:absolute;left:50%;top:50%;transform:translate(-50%,-50%) scale(" + hubScale.toFixed(3) + ");width:760px;height:524px")}>
        <div style={css("position:absolute;left:380px;top:262px;width:560px;height:380px;transform:translate(-50%,-50%);border:1px solid rgba(255,255,255,.06);border-radius:50%")} />
        <div style={css("position:absolute;left:380px;top:262px;width:400px;height:270px;transform:translate(-50%,-50%);border:1px solid rgba(255,255,255,.06);border-radius:50%")} />

        <svg width="760" height="524" viewBox="0 0 760 524" style={{ position: "absolute", left: 0, top: 0 }}>
          {nodes.map((n) => (
            <line key={"l" + n.i} x1="380" y1="262" x2={n.x} y2={n.y} stroke="rgba(0,130,124,.5)" strokeWidth="1.5" strokeDasharray="3 7" style={{ animation: "dashMove 1.8s linear infinite" }} />
          ))}
          {!reduced &&
            nodes.map((n) => (
              <circle key={"p" + n.i} r="2.6" fill="#cbfffc" opacity="0.9">
                <animateMotion dur={2.4 + (n.i % 4) * 0.6 + "s"} begin={n.i * 0.4 + "s"} repeatCount="indefinite" path={"M" + n.x + " " + n.y + " L380 262"} />
              </circle>
            ))}
          {collabs.map((c, i) => (
            <line key={"c" + i} x1={nodes[c[0]].x} y1={nodes[c[0]].y} x2={nodes[c[1]].x} y2={nodes[c[1]].y} stroke="rgba(250,209,255,.5)" strokeWidth="1.5" strokeDasharray="2 6" style={{ animation: "dashMove 1.2s linear infinite" }} />
          ))}
        </svg>

        {/* center hub */}
        <div style={css("position:absolute;left:380px;top:262px;transform:translate(-50%,-50%);display:flex;flex-direction:column;align-items:center;gap:10px;z-index:2")}>
          <div style={css("position:relative;width:124px;height:124px;display:flex;align-items:center;justify-content:center")}>
            <div style={css("position:absolute;left:0;top:0;right:0;bottom:0;border-radius:50%;border:2px solid rgba(0,194,184,.5);animation:ringPulse 3s ease-out infinite")} />
            <div style={css("position:absolute;left:0;top:0;right:0;bottom:0;border-radius:50%;border:2px solid rgba(250,209,255,.4);animation:ringPulse 3s ease-out 1.5s infinite")} />
            <div style={css("width:124px;height:124px;border-radius:50%;background:conic-gradient(from 0deg,#00827c,#cbfffc,#fad1ff,#00827c);display:flex;align-items:center;justify-content:center;box-shadow:0 0 44px rgba(0,194,184,.35)")}>
              <div style={css("width:106px;height:106px;border-radius:50%;background:#011d1c;display:flex;flex-direction:column;align-items:center;justify-content:center;overflow:hidden")}>
                {avatarUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={avatarUrl} alt="" style={css("width:100%;height:100%;object-fit:cover;border-radius:50%")} />
                ) : (
                  <>
                    <div style={css("font-family:var(--font-matter);font-size:26px;font-weight:500;color:#fde9ff;line-height:1;letter-spacing:-.02em")}>{leadsWorked}</div>
                    <div style={css("font-size:8.5px;font-weight:500;letter-spacing:.12em;color:#bbc7c6;margin-top:4px;text-align:center;line-height:1.4;text-transform:uppercase")}>
                      Brands worked<br />{monthLabel}
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
          <div style={css("display:flex;flex-direction:column;align-items:center;gap:8px")}>
            {avatarUrl && (
              <div style={css("display:inline-flex;align-items:center;gap:5px;font-size:10.5px;font-weight:500;letter-spacing:.03em;color:#fde9ff;background:rgba(255,255,255,.06);border:1px solid rgba(255,255,255,.12);border-radius:99px;padding:4px 11px;backdrop-filter:blur(6px)")}>
                {leadsWorked} brands worked · {monthLabel}
              </div>
            )}
            <div style={css("display:inline-flex;align-items:center;gap:5px;font-size:10.5px;font-weight:500;letter-spacing:.03em;color:#edfffe;background:rgba(255,255,255,.06);border:1px solid rgba(255,255,255,.12);border-radius:99px;padding:4px 11px;backdrop-filter:blur(6px)")}>
              <svg width="11" height="11" viewBox="0 0 24 24" fill="#fde9ff" style={{ flex: "none" }} aria-hidden="true"><path d="M13 2 4 14h6l-1 8 9-12h-6l1-8Z" /></svg>
              {hubWorking} working · {tasksRunning} tasks
            </div>
          </div>
        </div>

        {/* agent nodes */}
        {nodes.map((n) => (
          <Box key={n.a.id} aria-label={n.a.name} noButton style={"position:absolute;left:" + n.x + "px;top:" + n.y + "px;transform:translate(-50%,-50%);width:170px;display:flex;flex-direction:column;align-items:center;z-index:2"}>
            <div style={css("display:flex;flex-direction:column;align-items:center;gap:6px;animation:floaty " + (5 + (n.i % 3)) + "s ease-in-out " + (n.i * 0.45).toFixed(2) + "s infinite")}>
              <div style={css("position:relative")}>
                <div style={css("padding:3px;border-radius:50%;background:#011d1c;box-shadow:0 0 22px " + n.a.color + "66")}>
                  <div style={css(av(n.a, 46) + ";border:2px solid #011d1c")}>{n.a.initials}</div>
                </div>
                <div style={css("position:absolute;top:-8px;right:-10px;width:22px;height:22px;border-radius:50%;background:#edfffe;display:flex;align-items:center;justify-content:center;box-shadow:0 3px 10px rgba(0,0,0,.35);animation:" + n.ic[0])}>
                  <span style={css(hubIcon(n.type, n.ic[1]))} />
                </div>
              </div>
              <div style={css("display:flex;align-items:center;gap:5px;margin-top:2px")}>
                <span style={css("width:7px;height:7px;border-radius:50%;background:" + n.m.dot + ";flex:none;" + (n.working ? "animation:pulse 2s infinite" : ""))} />
                <span style={css("font-size:12px;font-weight:500;color:#ffffff")}>{n.a.name}</span>
              </div>
              <div style={css("width:60px;height:3px;border-radius:2px;background:rgba(255,255,255,.12);overflow:hidden")}>
                <div style={css("width:" + Math.round(((paMap.get(n.a.id)?.leadsWorked ?? 0) / maxOut) * 100) + "%;height:100%;border-radius:2px;background:linear-gradient(90deg," + n.a.color + ",#cbfffc)")} />
              </div>
              <div style={css("display:flex;align-items:center;gap:6px;font-size:10.5px;font-weight:500;color:#edfffe;background:rgba(255,255,255,.06);border:1px solid rgba(255,255,255,.12);backdrop-filter:blur(6px);border-radius:99px;padding:4px 10px;white-space:nowrap;max-width:168px;overflow:hidden;text-overflow:ellipsis;animation:" + (tick % 2 ? "badgePopA" : "badgePopB") + " .4s ease")}>
                <span>{n.badge}</span>
              </div>
            </div>
          </Box>
        ))}
      </div>

      {/* floating particles */}
      <div style={css("position:absolute;left:18%;bottom:30%;width:5px;height:5px;border-radius:50%;background:rgba(0,194,184,.55);animation:rise 7s ease-in-out infinite")} />
      <div style={css("position:absolute;left:72%;bottom:24%;width:4px;height:4px;border-radius:50%;background:rgba(203,255,252,.5);animation:rise 9s ease-in-out 2s infinite")} />
      <div style={css("position:absolute;left:48%;bottom:18%;width:3px;height:3px;border-radius:50%;background:rgba(250,209,255,.5);animation:rise 8s ease-in-out 4s infinite")} />
      <div style={css("position:absolute;left:85%;bottom:55%;width:4px;height:4px;border-radius:50%;background:rgba(237,255,254,.5);animation:rise 10s ease-in-out 1s infinite")} />

      {/* live activity labels */}
      <div style={css("position:absolute;bottom:16px;left:20px;display:flex;flex-direction:column;align-items:flex-start;gap:6px;z-index:3;max-width:70%")}>
        <div style={css("display:flex;align-items:center;gap:7px;font-size:11px;font-weight:500;color:#bbc7c6;background:rgba(255,255,255,.04);border:1px solid rgba(255,255,255,.08);border-radius:99px;padding:5px 13px;backdrop-filter:blur(8px);white-space:nowrap;overflow:hidden;text-overflow:ellipsis;max-width:100%;opacity:.75")}>
          <svg width="11" height="11" viewBox="0 0 24 24" fill="#6fa8c7" style={{ flex: "none" }} aria-hidden="true"><path d="M12 3l1.9 5.8a2 2 0 0 0 1.3 1.3L21 12l-5.8 1.9a2 2 0 0 0-1.3 1.3L12 21l-1.9-5.8a2 2 0 0 0-1.3-1.3L3 12l5.8-1.9a2 2 0 0 0 1.3-1.3L12 3Z" /></svg>
          {hubLive2}
        </div>
        <div style={css("display:flex;align-items:center;gap:7px;font-size:11px;font-weight:500;color:#edfffe;background:rgba(255,255,255,.07);border:1px solid rgba(255,255,255,.12);border-radius:99px;padding:5px 13px;backdrop-filter:blur(8px);white-space:nowrap;overflow:hidden;text-overflow:ellipsis;max-width:100%")}>
          <svg width="11" height="11" viewBox="0 0 24 24" fill="#cbfffc" style={{ flex: "none" }} aria-hidden="true"><path d="M12 3l1.9 5.8a2 2 0 0 0 1.3 1.3L21 12l-5.8 1.9a2 2 0 0 0-1.3 1.3L12 21l-1.9-5.8a2 2 0 0 0-1.3-1.3L3 12l5.8-1.9a2 2 0 0 0 1.3-1.3L12 3Z" /></svg>
          {hubLive}
        </div>
      </div>
    </div>
  );
}
