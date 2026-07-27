"use client";
import { css } from "@/lib/style";
import type { PlatformStat } from "@/lib/profile/types";

const inputStyle =
  "background:#003734;border:1px solid rgba(255,255,255,.14);border-radius:6px;padding:9px 12px;font-size:13px;color:#edfffe;outline:none;width:100%";

export default function PlatformsEditor({
  platforms,
  onChange,
}: {
  platforms: PlatformStat[];
  onChange: (next: PlatformStat[]) => void;
}) {
  function updateRow(i: number, patch: Partial<PlatformStat>) {
    onChange(platforms.map((p, idx) => (idx === i ? { ...p, ...patch } : p)));
  }

  function addRow() {
    onChange([...platforms, { platform: "", handle: "", followers: 0, engagementRate: 0 }]);
  }

  function removeRow(i: number) {
    onChange(platforms.filter((_, idx) => idx !== i));
  }

  return (
    <div style={css("display:flex;flex-direction:column;gap:10px")}>
      {platforms.map((p, i) => (
        <div key={i} className="platform-row" style={css("display:grid;grid-template-columns:1.1fr 1.1fr 1fr 1fr auto;gap:8px;align-items:center")}>
          <input
            style={css(inputStyle)}
            placeholder="Platform (e.g. TikTok)"
            value={p.platform}
            onChange={(e) => updateRow(i, { platform: e.target.value })}
          />
          <input
            style={css(inputStyle)}
            placeholder="@handle"
            value={p.handle}
            onChange={(e) => updateRow(i, { handle: e.target.value })}
          />
          <input
            style={css(inputStyle)}
            placeholder="Followers"
            type="number"
            min={0}
            value={p.followers || ""}
            onChange={(e) => updateRow(i, { followers: Number(e.target.value) || 0 })}
          />
          <input
            style={css(inputStyle)}
            placeholder="Engagement %"
            type="number"
            min={0}
            step="0.1"
            value={p.engagementRate || ""}
            onChange={(e) => updateRow(i, { engagementRate: Number(e.target.value) || 0 })}
          />
          <button
            onClick={() => removeRow(i)}
            aria-label="Remove platform"
            style={css(
              "background:none;border:1px solid rgba(255,255,255,.14);border-radius:6px;color:#bbc7c6;width:34px;height:34px;cursor:pointer;font-size:14px"
            )}
          >
            ✕
          </button>
        </div>
      ))}
      <button
        onClick={addRow}
        style={css(
          "align-self:flex-start;background:none;border:1px dashed rgba(255,255,255,.24);border-radius:6px;padding:8px 14px;font-size:13px;color:#00e5d0;cursor:pointer"
        )}
      >
        + Add platform
      </button>
    </div>
  );
}
