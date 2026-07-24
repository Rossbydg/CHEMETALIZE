"use client";
import { useState, useTransition } from "react";
import { css } from "@/lib/style";
import { CAPABILITIES, type CapabilityId } from "@/lib/agentTypes";
import { AGENT_COLOR_PALETTE } from "@/lib/agents/types";
import AgentAvatar from "./AgentAvatar";

const inputStyle =
  "background:#012624;border:1px solid rgba(255,255,255,.14);border-radius:6px;padding:9px 12px;font-size:13px;color:#edfffe;outline:none;width:100%";
const labelStyle = "font-size:12px;font-weight:500;letter-spacing:.04em;color:#bbc7c6;margin-bottom:6px;display:block";

function previewInitials(name: string): string {
  const initials = name.trim().split(/\s+/).filter(Boolean).map((w) => w[0]).join("").slice(0, 2).toUpperCase();
  return initials || "AI";
}

export interface AgentFormValues {
  name: string;
  role: string;
  goal: string;
  color: string;
  avatarUrl: string;
  capabilities: CapabilityId[];
}

export default function AgentForm({
  title,
  initial,
  capabilitiesLocked,
  onSubmit,
  onClose,
}: {
  title: string;
  initial: AgentFormValues;
  capabilitiesLocked: boolean;
  onSubmit: (values: AgentFormValues) => Promise<void>;
  onClose: () => void;
}) {
  const [form, setForm] = useState<AgentFormValues>(initial);
  const [isPending, startTransition] = useTransition();

  function set<K extends keyof AgentFormValues>(key: K, value: AgentFormValues[K]) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  function toggleCapability(id: CapabilityId) {
    set("capabilities", form.capabilities.includes(id) ? form.capabilities.filter((c) => c !== id) : [...form.capabilities, id]);
  }

  function submit() {
    if (!form.name.trim() || !form.role.trim()) return;
    startTransition(async () => {
      await onSubmit(form);
      onClose();
    });
  }

  return (
    <div style={css("background:#003734;border-radius:16px;padding:24px;display:flex;flex-direction:column;gap:16px")}>
      <div style={css("font-size:15px;font-weight:500;color:#ffffff")}>{title}</div>

      <div>
        <label style={css(labelStyle)}>Name</label>
        <input style={css(inputStyle)} value={form.name} onChange={(e) => set("name", e.target.value)} placeholder="e.g. Jordan Lee" />
      </div>

      <div>
        <label style={css(labelStyle)}>Role</label>
        <input style={css(inputStyle)} value={form.role} onChange={(e) => set("role", e.target.value)} placeholder="e.g. Outreach specialist" />
      </div>

      <div>
        <label style={css(labelStyle)}>Goal</label>
        <textarea
          style={css(inputStyle + ";min-height:60px;font-family:inherit;resize:vertical")}
          value={form.goal}
          onChange={(e) => set("goal", e.target.value)}
          placeholder="What is this helper trying to achieve?"
        />
      </div>

      <div>
        <label style={css(labelStyle)}>Color</label>
        <div style={css("display:flex;gap:8px;flex-wrap:wrap")}>
          {AGENT_COLOR_PALETTE.map((c) => (
            <button
              key={c}
              onClick={() => set("color", c)}
              aria-label={c}
              style={css(
                "width:28px;height:28px;border-radius:50%;cursor:pointer;background:" +
                  c +
                  ";border:2px solid " +
                  (form.color === c ? "#ffffff" : "transparent")
              )}
            />
          ))}
        </div>
      </div>

      <div>
        <label style={css(labelStyle)}>Photo (optional)</label>
        <div style={css("display:flex;align-items:center;gap:12px")}>
          <AgentAvatar
            agent={{
              initials: previewInitials(form.name),
              color: form.color,
              avatarUrl: form.avatarUrl,
              capabilities: form.capabilities,
            }}
            size={44}
          />
          <input
            style={css(inputStyle)}
            value={form.avatarUrl}
            onChange={(e) => set("avatarUrl", e.target.value)}
            placeholder="https://… a link to a photo"
          />
        </div>
        <p style={css("font-size:11.5px;color:#707777;margin:6px 0 0")}>Paste a link to an image. Leave blank to use initials instead.</p>
      </div>

      {!capabilitiesLocked && (
        <div>
          <label style={css(labelStyle)}>Capabilities</label>
          <div style={css("display:flex;flex-wrap:wrap;gap:8px")}>
            {CAPABILITIES.map((c) => {
              const active = form.capabilities.includes(c.id);
              return (
                <button
                  key={c.id}
                  onClick={() => toggleCapability(c.id)}
                  style={css(
                    "font-size:12px;font-weight:500;border-radius:99px;padding:6px 14px;cursor:pointer;border:1px solid " +
                      (active ? "#00c2b8" : "rgba(255,255,255,.14)") +
                      ";background:" +
                      (active ? "rgba(0,194,184,.14)" : "none") +
                      ";color:" +
                      (active ? "#00e5d0" : "#bbc7c6")
                  )}
                >
                  {c.label}
                </button>
              );
            })}
          </div>
        </div>
      )}

      <div style={css("display:flex;gap:10px;margin-top:4px")}>
        <button
          onClick={submit}
          disabled={isPending}
          style={css(
            "background:#00c2b8;border:none;border-radius:6px;padding:10px 20px;font-size:13px;font-weight:500;color:#012624;cursor:pointer;" +
              (isPending ? "opacity:.6" : "")
          )}
        >
          {isPending ? "Saving…" : "Save"}
        </button>
        <button
          onClick={onClose}
          style={css("background:none;border:none;font-size:13px;color:#bbc7c6;cursor:pointer;padding:10px 4px")}
        >
          Cancel
        </button>
      </div>
    </div>
  );
}
