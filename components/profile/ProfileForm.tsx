"use client";
import { useState, useTransition } from "react";
import { css } from "@/lib/style";
import { saveCreatorProfile } from "@/lib/profile/actions";
import PlatformsEditor from "./PlatformsEditor";
import type { ProfileInput } from "@/lib/profile/types";

const inputStyle =
  "background:#003734;border:1px solid rgba(255,255,255,.14);border-radius:6px;padding:9px 12px;font-size:13px;color:#edfffe;outline:none;width:100%";
const labelStyle = "font-size:12px;font-weight:500;letter-spacing:.04em;color:#bbc7c6;margin-bottom:6px;display:block";
const cardStyle = "background:#003734;border-radius:16px;padding:24px;display:flex;flex-direction:column;gap:16px";

export default function ProfileForm({ initial }: { initial: ProfileInput }) {
  const [form, setForm] = useState<ProfileInput>(initial);
  const [isPending, startTransition] = useTransition();
  const [saved, setSaved] = useState(false);

  function set<K extends keyof ProfileInput>(key: K, value: ProfileInput[K]) {
    setForm((f) => ({ ...f, [key]: value }));
    setSaved(false);
  }

  function save() {
    startTransition(async () => {
      await saveCreatorProfile(form);
      setSaved(true);
    });
  }

  return (
    <div style={css("display:flex;flex-direction:column;gap:20px;max-width:680px")}>
      <div style={css(cardStyle)}>
        <div>
          <label style={css(labelStyle)}>Niche</label>
          <input style={css(inputStyle)} value={form.niche} onChange={(e) => set("niche", e.target.value)} placeholder="e.g. Fitness & wellness" />
        </div>
        <div>
          <label style={css(labelStyle)}>Bio</label>
          <textarea
            style={css(inputStyle + ";min-height:70px;font-family:inherit;resize:vertical")}
            value={form.bio}
            onChange={(e) => set("bio", e.target.value)}
            placeholder="A couple of sentences about you and your content."
          />
        </div>
        <div>
          <label style={css(labelStyle)}>Tone / vibe</label>
          <input
            style={css(inputStyle)}
            value={form.tone}
            onChange={(e) => set("tone", e.target.value)}
            placeholder="e.g. Warm, funny, straight-talking"
          />
        </div>
      </div>

      <div style={css(cardStyle)}>
        <label style={css(labelStyle)}>Platforms</label>
        <PlatformsEditor platforms={form.platforms} onChange={(platforms) => set("platforms", platforms)} />
      </div>

      <div style={css(cardStyle)}>
        <label style={css(labelStyle)}>Audience</label>
        <div style={css("display:grid;grid-template-columns:1fr 1fr 1fr;gap:10px")}>
          <input
            style={css(inputStyle)}
            placeholder="Age range"
            value={form.audience.age ?? ""}
            onChange={(e) => set("audience", { ...form.audience, age: e.target.value })}
          />
          <input
            style={css(inputStyle)}
            placeholder="Geography"
            value={form.audience.geo ?? ""}
            onChange={(e) => set("audience", { ...form.audience, geo: e.target.value })}
          />
          <input
            style={css(inputStyle)}
            placeholder="Gender split"
            value={form.audience.gender ?? ""}
            onChange={(e) => set("audience", { ...form.audience, gender: e.target.value })}
          />
        </div>
      </div>

      <div style={css(cardStyle)}>
        <div>
          <label style={css(labelStyle)}>Past deals</label>
          <textarea
            style={css(inputStyle + ";min-height:70px;font-family:inherit;resize:vertical")}
            value={form.pastDeals}
            onChange={(e) => set("pastDeals", e.target.value)}
            placeholder="Brands you've worked with before, if any."
          />
        </div>
        <div>
          <label style={css(labelStyle)}>Rate floor ($)</label>
          <input
            style={css(inputStyle)}
            type="number"
            min={0}
            value={form.rateFloor ?? ""}
            onChange={(e) => set("rateFloor", e.target.value === "" ? null : Number(e.target.value))}
            placeholder="e.g. 500"
          />
        </div>
      </div>

      <div style={css("display:flex;align-items:center;gap:14px")}>
        <button
          onClick={save}
          disabled={isPending}
          style={css(
            "background:#00c2b8;border:none;border-radius:6px;padding:11px 22px;font-size:13px;font-weight:500;color:#012624;cursor:pointer;" +
              (isPending ? "opacity:.6" : "")
          )}
        >
          {isPending ? "Saving…" : "Save Media Kit"}
        </button>
        {saved && !isPending && <span style={css("font-size:13px;color:#00e5d0")}>Saved</span>}
      </div>
    </div>
  );
}
