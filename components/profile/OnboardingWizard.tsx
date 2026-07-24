"use client";
import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { css } from "@/lib/style";
import { saveCreatorProfile } from "@/lib/profile/actions";
import PlatformsEditor from "./PlatformsEditor";
import type { ProfileInput } from "@/lib/profile/types";

const inputStyle =
  "background:#003734;border:1px solid rgba(255,255,255,.14);border-radius:6px;padding:10px 13px;font-size:14px;color:#edfffe;outline:none;width:100%";
const labelStyle = "font-size:12px;font-weight:500;letter-spacing:.04em;color:#bbc7c6;margin-bottom:6px;display:block";

const STEPS = ["You", "Platforms", "Audience", "Rates"] as const;

export default function OnboardingWizard({ initial }: { initial: ProfileInput }) {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [form, setForm] = useState<ProfileInput>(initial);
  const [isPending, startTransition] = useTransition();

  function set<K extends keyof ProfileInput>(key: K, value: ProfileInput[K]) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  const canAdvance =
    step === 0 ? form.niche.trim().length > 0 : step === 1 ? form.platforms.some((p) => p.platform.trim()) : true;
  const canFinish = form.niche.trim().length > 0 && form.platforms.some((p) => p.platform.trim()) && form.rateFloor != null;

  function finish() {
    startTransition(async () => {
      await saveCreatorProfile(form);
      router.push("/dashboard");
      router.refresh();
    });
  }

  return (
    <div style={css("min-height:100dvh;display:flex;align-items:center;justify-content:center;padding:40px 20px")}>
      <div style={css("width:100%;max-width:560px;display:flex;flex-direction:column;gap:28px")}>
        <div>
          <div style={css("font-family:var(--font-matter);font-weight:500;font-size:24px;color:#ffffff")}>Let&apos;s set up your Media Kit</div>
          <p style={css("font-size:14px;color:#bbc7c6;margin:8px 0 0;line-height:1.5")}>
            A couple of minutes now makes every pitch your agents write sound like you.
          </p>
        </div>

        <div style={css("display:flex;gap:6px")}>
          {STEPS.map((label, i) => (
            <div
              key={label}
              style={css(
                "flex:1;height:4px;border-radius:99px;background:" + (i <= step ? "#00c2b8" : "rgba(255,255,255,.12)")
              )}
            />
          ))}
        </div>

        <div style={css("background:#003734;border-radius:16px;padding:28px;display:flex;flex-direction:column;gap:16px")}>
          {step === 0 && (
            <>
              <div>
                <label style={css(labelStyle)}>Your niche</label>
                <input
                  autoFocus
                  style={css(inputStyle)}
                  value={form.niche}
                  onChange={(e) => set("niche", e.target.value)}
                  placeholder="e.g. Fitness & wellness"
                />
              </div>
              <div>
                <label style={css(labelStyle)}>Bio (optional)</label>
                <textarea
                  style={css(inputStyle + ";min-height:70px;font-family:inherit;resize:vertical")}
                  value={form.bio}
                  onChange={(e) => set("bio", e.target.value)}
                  placeholder="A couple of sentences about you and your content."
                />
              </div>
              <div>
                <label style={css(labelStyle)}>Tone / vibe (optional)</label>
                <input
                  style={css(inputStyle)}
                  value={form.tone}
                  onChange={(e) => set("tone", e.target.value)}
                  placeholder="e.g. Warm, funny, straight-talking"
                />
              </div>
            </>
          )}

          {step === 1 && (
            <>
              <label style={css(labelStyle)}>Your platforms</label>
              <p style={css("font-size:13px;color:#bbc7c6;margin:-8px 0 0;line-height:1.5")}>Add at least one, with your follower count.</p>
              <PlatformsEditor platforms={form.platforms} onChange={(platforms) => set("platforms", platforms)} />
            </>
          )}

          {step === 2 && (
            <>
              <label style={css(labelStyle)}>Audience (optional)</label>
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
              <div>
                <label style={css(labelStyle + ";margin-top:8px")}>Past deals (optional)</label>
                <textarea
                  style={css(inputStyle + ";min-height:70px;font-family:inherit;resize:vertical")}
                  value={form.pastDeals}
                  onChange={(e) => set("pastDeals", e.target.value)}
                  placeholder="Brands you've worked with before, if any."
                />
              </div>
            </>
          )}

          {step === 3 && (
            <>
              <label style={css(labelStyle)}>Your rate floor</label>
              <p style={css("font-size:13px;color:#bbc7c6;margin:-8px 0 0;line-height:1.5")}>
                The minimum you&apos;ll take for a sponsored post — proposals never price below this.
              </p>
              <input
                style={css(inputStyle)}
                type="number"
                min={0}
                value={form.rateFloor ?? ""}
                onChange={(e) => set("rateFloor", e.target.value === "" ? null : Number(e.target.value))}
                placeholder="e.g. 500"
              />
            </>
          )}
        </div>

        <div style={css("display:flex;justify-content:space-between;align-items:center")}>
          <button
            onClick={() => setStep((s) => Math.max(0, s - 1))}
            disabled={step === 0}
            style={css(
              "background:none;border:none;font-size:13px;color:#bbc7c6;cursor:pointer;" + (step === 0 ? "opacity:.4" : "")
            )}
          >
            Back
          </button>

          {step < STEPS.length - 1 ? (
            <button
              onClick={() => canAdvance && setStep((s) => s + 1)}
              disabled={!canAdvance}
              style={css(
                "background:#00c2b8;border:none;border-radius:6px;padding:11px 24px;font-size:13px;font-weight:500;color:#012624;cursor:pointer;" +
                  (!canAdvance ? "opacity:.5" : "")
              )}
            >
              Next
            </button>
          ) : (
            <button
              onClick={finish}
              disabled={!canFinish || isPending}
              style={css(
                "background:#00c2b8;border:none;border-radius:6px;padding:11px 24px;font-size:13px;font-weight:500;color:#012624;cursor:pointer;" +
                  (!canFinish || isPending ? "opacity:.5" : "")
              )}
            >
              {isPending ? "Saving…" : "Finish setup"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
