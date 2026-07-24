import { css } from "@/lib/style";
import { hubIcon, CAPABILITY_ICON_TYPE } from "@/lib/visuals";
import type { CapabilityId } from "@/lib/agentTypes";

// A photo (if set) or a colored initials circle, plus a small capability-icon badge, so two
// agents never look the same even if their colors are close — the same icon language as the dashboard orbit.
export default function AgentAvatar({
  agent,
  size = 42,
}: {
  agent: { initials: string; color: string; avatarUrl?: string | null; capabilities: CapabilityId[] };
  size?: number;
}) {
  const iconType = CAPABILITY_ICON_TYPE[agent.capabilities?.[0] ?? ""] || "writing";
  const badgeSize = Math.max(14, Math.round(size * 0.42));

  return (
    <div style={css(`position:relative;flex:none;width:${size}px;height:${size}px`)}>
      {agent.avatarUrl ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={agent.avatarUrl}
          alt={agent.initials}
          style={css(`width:${size}px;height:${size}px;border-radius:50%;object-fit:cover;display:block;background:` + agent.color)}
        />
      ) : (
        <div
          style={css(
            `width:${size}px;height:${size}px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:${Math.round(
              size * 0.32
            )}px;font-weight:500;color:#012624;background:` + agent.color
          )}
        >
          {agent.initials}
        </div>
      )}
      <div
        style={css(
          `position:absolute;top:-4px;right:-6px;width:${badgeSize}px;height:${badgeSize}px;border-radius:50%;background:#edfffe;display:flex;align-items:center;justify-content:center;box-shadow:0 2px 6px rgba(0,0,0,.35)`
        )}
      >
        <span style={css(hubIcon(iconType, "#012624", Math.round(badgeSize * 0.58)))} />
      </div>
    </div>
  );
}
