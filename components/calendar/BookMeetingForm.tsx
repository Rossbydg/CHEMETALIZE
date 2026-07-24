"use client";
import { useState, useTransition } from "react";
import { css } from "@/lib/style";
import { parseMeetingPhrase, bookMeeting } from "@/lib/meetings/actions";
import type { NowParts } from "@/lib/ai/meetingTime";

const inputStyle =
  "background:#012624;border:1px solid rgba(255,255,255,.14);border-radius:6px;padding:9px 12px;font-size:13px;color:#edfffe;outline:none;width:100%";
const labelStyle = "font-size:11px;font-weight:500;letter-spacing:.06em;text-transform:uppercase;color:#bbc7c6;margin-bottom:6px;display:block";

function nowParts(): NowParts {
  const now = new Date();
  return {
    year: now.getFullYear(),
    month: now.getMonth() + 1,
    day: now.getDate(),
    hour: now.getHours(),
    minute: now.getMinutes(),
    weekday: now.toLocaleDateString("en-US", { weekday: "long" }),
  };
}

export default function BookMeetingForm({
  defaultTitle,
  leadId,
  agentId,
  onBooked,
}: {
  defaultTitle: string;
  leadId?: string | null;
  agentId?: string | null;
  onBooked?: () => void;
}) {
  const [title, setTitle] = useState(defaultTitle);
  const [phrase, setPhrase] = useState("");
  const [manualDate, setManualDate] = useState("");
  const [manualTime, setManualTime] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [needsManual, setNeedsManual] = useState(false);
  const [isPending, startTransition] = useTransition();

  function submit() {
    if (!title.trim()) return;
    setMessage(null);

    startTransition(async () => {
      let whenAt: string | null = null;
      let whenLabel: string | undefined;

      if (phrase.trim()) {
        const parsed = await parseMeetingPhrase(phrase, nowParts());
        if (parsed) {
          const d = new Date(parsed.year, parsed.month - 1, parsed.day, parsed.hour, parsed.minute);
          whenAt = d.toISOString();
          whenLabel = parsed.label;
        }
      }

      if (!whenAt && manualDate && manualTime) {
        const d = new Date(`${manualDate}T${manualTime}`);
        if (!isNaN(d.getTime())) whenAt = d.toISOString();
      }

      if (!whenAt) {
        setNeedsManual(true);
        setMessage(phrase.trim() ? "Couldn't quite parse that — pick a date and time below." : "Pick a date and time.");
        return;
      }

      await bookMeeting({ title, whenAt, whenLabel, leadId, agentId });
      setPhrase("");
      setManualDate("");
      setManualTime("");
      setNeedsManual(false);
      setMessage("Booked.");
      onBooked?.();
    });
  }

  return (
    <div style={css("display:flex;flex-direction:column;gap:12px")}>
      <div>
        <label style={css(labelStyle)}>Title</label>
        <input style={css(inputStyle)} value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g. Call with Acme" />
      </div>

      <div>
        <label style={css(labelStyle)}>When (plain English)</label>
        <input
          style={css(inputStyle)}
          value={phrase}
          onChange={(e) => setPhrase(e.target.value)}
          placeholder="e.g. next Tuesday at 2pm"
        />
      </div>

      {(needsManual || !phrase.trim()) && (
        <div>
          <label style={css(labelStyle)}>Or pick a date and time</label>
          <div style={css("display:flex;gap:8px")}>
            <input type="date" style={css(inputStyle)} value={manualDate} onChange={(e) => setManualDate(e.target.value)} />
            <input type="time" style={css(inputStyle)} value={manualTime} onChange={(e) => setManualTime(e.target.value)} />
          </div>
        </div>
      )}

      <div style={css("display:flex;align-items:center;gap:12px")}>
        <button
          onClick={submit}
          disabled={isPending}
          style={css(
            "background:#00c2b8;border:none;border-radius:6px;padding:10px 20px;font-size:13px;font-weight:500;color:#012624;cursor:pointer;" +
              (isPending ? "opacity:.6" : "")
          )}
        >
          {isPending ? "Booking…" : "Book call"}
        </button>
        {message && <span style={css("font-size:12px;color:#bbc7c6")}>{message}</span>}
      </div>
    </div>
  );
}
