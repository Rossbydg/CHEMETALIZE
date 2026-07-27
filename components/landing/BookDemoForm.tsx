"use client";
import { useState, useTransition } from "react";
import { css } from "@/lib/style";
import { bookDemo } from "@/lib/demo/actions";

const inputStyle =
  "background:#003734;border:1px solid rgba(255,255,255,.14);border-radius:6px;padding:11px 14px;font-size:14px;color:#edfffe;outline:none;width:100%";
const labelStyle = "font-size:12px;font-weight:500;letter-spacing:.04em;color:#bbc7c6;margin-bottom:6px;display:block";

function defaultDate(): string {
  const d = new Date();
  d.setDate(d.getDate() + 1);
  return d.toISOString().slice(0, 10);
}

export default function BookDemoForm() {
  const [form, setForm] = useState({ name: "", email: "", date: defaultDate(), time: "10:00", notes: "" });
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);
  const [isPending, startTransition] = useTransition();

  function set<K extends keyof typeof form>(key: K, value: string) {
    setForm((f) => ({ ...f, [key]: value }));
    setError(null);
  }

  function submit() {
    setError(null);
    startTransition(async () => {
      const res = await bookDemo(form);
      if (res.ok) {
        setDone(true);
      } else {
        setError(res.error || "Something went wrong — please try again.");
      }
    });
  }

  if (done) {
    return (
      <div style={css("background:#003734;border-radius:16px;padding:32px;text-align:center;display:flex;flex-direction:column;gap:8px")}>
        <div style={css("font-family:var(--font-matter);font-size:20px;font-weight:500;color:#ffffff")}>You&apos;re booked.</div>
        <p style={css("font-size:14px;color:#bbc7c6;margin:0")}>
          Confirmed for {new Date(`${form.date}T${form.time}`).toLocaleString("en-US", { weekday: "long", month: "long", day: "numeric", hour: "numeric", minute: "2-digit" })}. See you then.
        </p>
      </div>
    );
  }

  return (
    <div style={css("background:#003734;border-radius:16px;padding:28px;display:flex;flex-direction:column;gap:16px")}>
      <div className="form-grid-2" style={css("display:grid;grid-template-columns:1fr 1fr;gap:14px")}>
        <div>
          <label style={css(labelStyle)}>Name</label>
          <input autoFocus style={css(inputStyle)} value={form.name} onChange={(e) => set("name", e.target.value)} placeholder="Your name" />
        </div>
        <div>
          <label style={css(labelStyle)}>Email</label>
          <input type="email" style={css(inputStyle)} value={form.email} onChange={(e) => set("email", e.target.value)} placeholder="you@email.com" />
        </div>
      </div>

      <div className="form-grid-2" style={css("display:grid;grid-template-columns:1fr 1fr;gap:14px")}>
        <div>
          <label style={css(labelStyle)}>Date</label>
          <input type="date" style={css(inputStyle)} value={form.date} onChange={(e) => set("date", e.target.value)} />
        </div>
        <div>
          <label style={css(labelStyle)}>Time</label>
          <input type="time" style={css(inputStyle)} value={form.time} onChange={(e) => set("time", e.target.value)} />
        </div>
      </div>

      <div>
        <label style={css(labelStyle)}>Anything you want covered? (optional)</label>
        <textarea
          style={css(inputStyle + ";min-height:70px;font-family:inherit;resize:vertical")}
          value={form.notes}
          onChange={(e) => set("notes", e.target.value)}
          placeholder="e.g. What I want to see in the demo"
        />
      </div>

      {error && (
        <div style={css("font-size:13px;color:#ffb4b4;background:rgba(255,90,90,.08);border:1px solid rgba(255,90,90,.25);border-radius:10px;padding:10px 14px")}>
          {error}
        </div>
      )}

      <button
        onClick={submit}
        disabled={isPending}
        style={css(
          "align-self:flex-start;font-size:13px;font-weight:500;letter-spacing:.04em;text-transform:uppercase;color:#1a1a1a;background:linear-gradient(90deg,#cbfffc 0%,#edfffe 26%,#fffdfa 48%,#fad1ff 89%);border:none;border-radius:6px;padding:12px 26px;cursor:pointer;" +
            (isPending ? "opacity:.7" : "")
        )}
      >
        {isPending ? "Booking…" : "Book the demo"}
      </button>
    </div>
  );
}
