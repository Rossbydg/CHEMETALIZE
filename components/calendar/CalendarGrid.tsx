"use client";
import { useState } from "react";
import { css } from "@/lib/style";
import type { MeetingView } from "@/lib/meetings/types";

const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

function dayKey(y: number, m: number, d: number) {
  return `${y}-${m}-${d}`;
}

export default function CalendarGrid({ meetings }: { meetings: MeetingView[] }) {
  const [viewDate, setViewDate] = useState(() => new Date());

  const year = viewDate.getFullYear();
  const month = viewDate.getMonth();
  const firstWeekday = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const today = new Date();
  const isToday = (d: number) => today.getFullYear() === year && today.getMonth() === month && today.getDate() === d;

  const byDay = new Map<string, MeetingView[]>();
  for (const m of meetings) {
    const d = new Date(m.whenAt);
    const key = dayKey(d.getFullYear(), d.getMonth(), d.getDate());
    if (!byDay.has(key)) byDay.set(key, []);
    byDay.get(key)!.push(m);
  }

  const cells: (number | null)[] = [...Array(firstWeekday).fill(null), ...Array.from({ length: daysInMonth }, (_, i) => i + 1)];

  return (
    <div style={css("display:flex;flex-direction:column;gap:16px")}>
      <div style={css("display:flex;align-items:center;justify-content:space-between")}>
        <button
          onClick={() => setViewDate(new Date(year, month - 1, 1))}
          style={css("background:none;border:1px solid rgba(255,255,255,.14);border-radius:6px;padding:7px 12px;color:#edfffe;cursor:pointer;font-size:13px")}
        >
          ← Prev
        </button>
        <div style={css("font-family:var(--font-matter);font-weight:500;font-size:16px;color:#ffffff")}>
          {viewDate.toLocaleDateString("en-US", { month: "long", year: "numeric" })}
        </div>
        <button
          onClick={() => setViewDate(new Date(year, month + 1, 1))}
          style={css("background:none;border:1px solid rgba(255,255,255,.14);border-radius:6px;padding:7px 12px;color:#edfffe;cursor:pointer;font-size:13px")}
        >
          Next →
        </button>
      </div>

      <div style={css("display:grid;grid-template-columns:repeat(7,1fr);gap:6px")}>
        {WEEKDAYS.map((w) => (
          <div key={w} style={css("font-size:11px;font-weight:500;letter-spacing:.06em;text-transform:uppercase;color:#bbc7c6;text-align:center;padding-bottom:4px")}>
            {w}
          </div>
        ))}
        {cells.map((d, i) => {
          const dayMeetings = d ? byDay.get(dayKey(year, month, d)) ?? [] : [];
          return (
            <div
              key={i}
              style={css(
                "min-height:clamp(52px,15vw,88px);border-radius:10px;padding:8px;display:flex;flex-direction:column;gap:4px;background:" +
                  (d ? "#003734" : "transparent") +
                  (d && isToday(d) ? ";border:1px solid rgba(0,194,184,.5)" : "")
              )}
            >
              {d && <div style={css("font-size:12px;font-weight:500;color:" + (isToday(d) ? "#00e5d0" : "#bbc7c6"))}>{d}</div>}
              {dayMeetings.slice(0, 3).map((m) => (
                <div
                  key={m.id}
                  title={m.title}
                  style={css(
                    "font-size:10.5px;font-weight:500;color:#012624;background:#00c2b8;border-radius:4px;padding:2px 6px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis"
                  )}
                >
                  {new Date(m.whenAt).toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" })} {m.title}
                </div>
              ))}
              {dayMeetings.length > 3 && <div style={css("font-size:10px;color:#bbc7c6")}>+{dayMeetings.length - 3} more</div>}
            </div>
          );
        })}
      </div>
    </div>
  );
}
