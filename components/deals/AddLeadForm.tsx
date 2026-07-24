"use client";
import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { css } from "@/lib/style";
import { addLead } from "@/lib/leads/actions";
import type { AgentView } from "@/lib/agents/types";

const inputStyle =
  "background:#012624;border:1px solid rgba(255,255,255,.14);border-radius:6px;padding:9px 12px;font-size:13px;color:#edfffe;outline:none;width:100%";
const labelStyle = "font-size:12px;font-weight:500;letter-spacing:.04em;color:#bbc7c6;margin-bottom:6px;display:block";

export default function AddLeadForm({ agents, onClose }: { agents: AgentView[]; onClose: () => void }) {
  const router = useRouter();
  const [form, setForm] = useState({ name: "", company: "", email: "", platform: "", agentId: "" });
  const [isPending, startTransition] = useTransition();

  function set(key: keyof typeof form, value: string) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  function submit() {
    if (!form.name.trim()) return;
    startTransition(async () => {
      await addLead({
        name: form.name,
        company: form.company || undefined,
        email: form.email || undefined,
        platform: form.platform || undefined,
        agentId: form.agentId || null,
      });
      router.refresh();
      onClose();
    });
  }

  return (
    <div style={css("background:#003734;border-radius:16px;padding:24px;display:flex;flex-direction:column;gap:14px;max-width:520px")}>
      <div style={css("font-size:15px;font-weight:500;color:#ffffff")}>Add a brand</div>

      <div style={css("display:grid;grid-template-columns:1fr 1fr;gap:12px")}>
        <div>
          <label style={css(labelStyle)}>Name</label>
          <input autoFocus style={css(inputStyle)} value={form.name} onChange={(e) => set("name", e.target.value)} placeholder="Contact or brand name" />
        </div>
        <div>
          <label style={css(labelStyle)}>Company</label>
          <input style={css(inputStyle)} value={form.company} onChange={(e) => set("company", e.target.value)} placeholder="e.g. Northwind Coffee" />
        </div>
        <div>
          <label style={css(labelStyle)}>Email</label>
          <input style={css(inputStyle)} value={form.email} onChange={(e) => set("email", e.target.value)} placeholder="hello@brand.com" />
        </div>
        <div>
          <label style={css(labelStyle)}>Platform</label>
          <input style={css(inputStyle)} value={form.platform} onChange={(e) => set("platform", e.target.value)} placeholder="e.g. Instagram" />
        </div>
      </div>

      <div>
        <label style={css(labelStyle)}>Assign to</label>
        <select value={form.agentId} onChange={(e) => set("agentId", e.target.value)} style={css(inputStyle)}>
          <option value="">Unassigned</option>
          {agents.map((a) => (
            <option key={a.id} value={a.id}>
              {a.name} — {a.role}
            </option>
          ))}
        </select>
      </div>

      <div style={css("display:flex;gap:10px")}>
        <button
          onClick={submit}
          disabled={isPending}
          style={css(
            "background:#00c2b8;border:none;border-radius:6px;padding:10px 20px;font-size:13px;font-weight:500;color:#012624;cursor:pointer;" +
              (isPending ? "opacity:.6" : "")
          )}
        >
          {isPending ? "Adding…" : "Add brand"}
        </button>
        <button onClick={onClose} style={css("background:none;border:none;font-size:13px;color:#bbc7c6;cursor:pointer;padding:10px 4px")}>
          Cancel
        </button>
      </div>
    </div>
  );
}
