"use client";
import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { css } from "@/lib/style";
import { statusMeta } from "@/lib/data";
import { CAPABILITIES } from "@/lib/agentTypes";
import { updateAgent, setAgentPaused, removeAgent } from "@/lib/agents/actions";
import AgentForm from "./AgentForm";
import AgentAvatar from "./AgentAvatar";
import type { AgentView } from "@/lib/agents/types";

export default function AgentDetail({ agent }: { agent: AgentView }) {
  const router = useRouter();
  const [editing, setEditing] = useState(false);
  const [confirmRemove, setConfirmRemove] = useState(false);
  const [isPending, startTransition] = useTransition();

  const meta = statusMeta(agent.paused ? "offline" : agent.status);
  const capLabels = agent.capabilities.map((id) => CAPABILITIES.find((c) => c.id === id)?.label ?? id);

  function togglePause() {
    startTransition(async () => {
      await setAgentPaused(agent.id, !agent.paused);
      router.refresh();
    });
  }

  function remove() {
    startTransition(async () => {
      await removeAgent(agent.id);
      router.push("/agents");
      router.refresh();
    });
  }

  if (editing) {
    return (
      <div style={css("padding:clamp(16px,4vw,36px) clamp(16px,5vw,40px);max-width:520px")}>
        <AgentForm
          title={`Edit ${agent.name}`}
          capabilitiesLocked={agent.isPreset}
          initial={{
            name: agent.name,
            role: agent.role,
            goal: agent.goal,
            color: agent.color,
            avatarUrl: agent.avatarUrl ?? "",
            capabilities: agent.capabilities,
          }}
          onSubmit={async (values) => {
            await updateAgent(agent.id, values);
            router.refresh();
          }}
          onClose={() => setEditing(false)}
        />
      </div>
    );
  }

  return (
    <div style={css("padding:clamp(16px,4vw,36px) clamp(16px,5vw,40px);display:flex;flex-direction:column;gap:28px;max-width:640px")}>
      <div style={css("display:flex;align-items:center;gap:16px")}>
        <AgentAvatar agent={agent} size={64} />
        <div>
          <h1 style={css("font-family:var(--font-matter);font-weight:500;font-size:24px;color:#ffffff;margin:0")}>{agent.name}</h1>
          <div style={css("font-size:13px;color:#bbc7c6;margin-top:4px")}>{agent.role}</div>
        </div>
      </div>

      <div style={css("display:flex;align-items:center;gap:6px")}>
        <span style={css("width:8px;height:8px;border-radius:50%;background:" + meta.dot)} />
        <span style={css("font-size:12px;font-weight:500;letter-spacing:.04em;color:" + meta.color + ";text-transform:uppercase")}>
          {agent.paused ? "Paused" : meta.label}
        </span>
      </div>

      {agent.goal && (
        <div>
          <div style={css("font-size:12px;font-weight:500;letter-spacing:.08em;text-transform:uppercase;color:#bbc7c6;margin-bottom:6px")}>Goal</div>
          <p style={css("font-size:14px;color:#edfffe;line-height:1.5;margin:0")}>{agent.goal}</p>
        </div>
      )}

      <div>
        <div style={css("font-size:12px;font-weight:500;letter-spacing:.08em;text-transform:uppercase;color:#bbc7c6;margin-bottom:8px")}>
          Capabilities
        </div>
        <div style={css("display:flex;flex-wrap:wrap;gap:6px")}>
          {capLabels.map((label) => (
            <span
              key={label}
              style={css(
                "font-size:11.5px;font-weight:500;color:#bbc7c6;background:rgba(255,255,255,.06);border:1px solid rgba(255,255,255,.1);border-radius:99px;padding:4px 12px"
              )}
            >
              {label}
            </span>
          ))}
        </div>
      </div>

      <div style={css("display:flex;gap:10px")}>
        <button
          onClick={() => setEditing(true)}
          style={css("background:none;border:1px solid rgba(255,255,255,.14);border-radius:6px;padding:9px 16px;font-size:13px;color:#edfffe;cursor:pointer")}
        >
          Edit
        </button>
        <button
          onClick={togglePause}
          disabled={isPending}
          style={css("background:none;border:1px solid rgba(255,255,255,.14);border-radius:6px;padding:9px 16px;font-size:13px;color:#edfffe;cursor:pointer")}
        >
          {agent.paused ? "Resume" : "Pause"}
        </button>
        {!confirmRemove ? (
          <button
            onClick={() => setConfirmRemove(true)}
            style={css("background:none;border:1px solid rgba(253,233,255,.3);border-radius:6px;padding:9px 16px;font-size:13px;color:#fde9ff;cursor:pointer")}
          >
            Remove
          </button>
        ) : (
          <>
            <button
              onClick={remove}
              disabled={isPending}
              style={css("background:rgba(253,233,255,.16);border:1px solid rgba(253,233,255,.3);border-radius:6px;padding:9px 16px;font-size:13px;color:#fde9ff;cursor:pointer")}
            >
              Confirm remove
            </button>
            <button
              onClick={() => setConfirmRemove(false)}
              style={css("background:none;border:none;font-size:13px;color:#bbc7c6;cursor:pointer;padding:9px 4px")}
            >
              Cancel
            </button>
          </>
        )}
      </div>
    </div>
  );
}
