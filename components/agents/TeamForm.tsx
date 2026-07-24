"use client";
import { useState, useTransition } from "react";
import { css } from "@/lib/style";
import type { AgentView } from "@/lib/agents/types";

const inputStyle =
  "background:#012624;border:1px solid rgba(255,255,255,.14);border-radius:6px;padding:9px 12px;font-size:13px;color:#edfffe;outline:none;width:100%";
const labelStyle = "font-size:12px;font-weight:500;letter-spacing:.04em;color:#bbc7c6;margin-bottom:6px;display:block";

export interface TeamFormValues {
  name: string;
  description: string;
  goal: string;
  members: string[];
}

export default function TeamForm({
  title,
  initial,
  detailsLocked,
  allAgents,
  onSubmit,
  onClose,
}: {
  title: string;
  initial: TeamFormValues;
  detailsLocked: boolean;
  allAgents: AgentView[];
  onSubmit: (values: TeamFormValues) => Promise<void>;
  onClose: () => void;
}) {
  const [form, setForm] = useState<TeamFormValues>(initial);
  const [isPending, startTransition] = useTransition();

  function set<K extends keyof TeamFormValues>(key: K, value: TeamFormValues[K]) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  function toggleMember(id: string) {
    set("members", form.members.includes(id) ? form.members.filter((m) => m !== id) : [...form.members, id]);
  }

  function submit() {
    if (!detailsLocked && !form.name.trim()) return;
    if (!form.members.length) return;
    startTransition(async () => {
      await onSubmit(form);
      onClose();
    });
  }

  return (
    <div style={css("background:#003734;border-radius:16px;padding:24px;display:flex;flex-direction:column;gap:16px")}>
      <div style={css("font-size:15px;font-weight:500;color:#ffffff")}>{title}</div>

      {!detailsLocked && (
        <>
          <div>
            <label style={css(labelStyle)}>Name</label>
            <input style={css(inputStyle)} value={form.name} onChange={(e) => set("name", e.target.value)} placeholder="e.g. Launch Squad" />
          </div>
          <div>
            <label style={css(labelStyle)}>Description</label>
            <input
              style={css(inputStyle)}
              value={form.description}
              onChange={(e) => set("description", e.target.value)}
              placeholder="What does this team do?"
            />
          </div>
          <div>
            <label style={css(labelStyle)}>Goal</label>
            <input style={css(inputStyle)} value={form.goal} onChange={(e) => set("goal", e.target.value)} placeholder="What is it trying to achieve?" />
          </div>
        </>
      )}

      <div>
        <label style={css(labelStyle)}>Members</label>
        <div style={css("display:flex;flex-wrap:wrap;gap:8px")}>
          {allAgents.map((a) => {
            const active = form.members.includes(a.id);
            return (
              <button
                key={a.id}
                onClick={() => toggleMember(a.id)}
                style={css(
                  "display:flex;align-items:center;gap:7px;font-size:12px;font-weight:500;border-radius:99px;padding:5px 12px 5px 5px;cursor:pointer;border:1px solid " +
                    (active ? "#00c2b8" : "rgba(255,255,255,.14)") +
                    ";background:" +
                    (active ? "rgba(0,194,184,.14)" : "none") +
                    ";color:" +
                    (active ? "#00e5d0" : "#bbc7c6")
                )}
              >
                <span
                  style={css(
                    "width:18px;height:18px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:8px;font-weight:500;color:#012624;background:" +
                      a.color
                  )}
                >
                  {a.initials}
                </span>
                {a.name}
              </button>
            );
          })}
        </div>
      </div>

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
        <button onClick={onClose} style={css("background:none;border:none;font-size:13px;color:#bbc7c6;cursor:pointer;padding:10px 4px")}>
          Cancel
        </button>
      </div>
    </div>
  );
}
