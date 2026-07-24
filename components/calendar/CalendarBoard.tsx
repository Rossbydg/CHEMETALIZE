"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { css } from "@/lib/style";
import CalendarGrid from "./CalendarGrid";
import BookMeetingForm from "./BookMeetingForm";
import type { MeetingView } from "@/lib/meetings/types";

export default function CalendarBoard({ meetings }: { meetings: MeetingView[] }) {
  const router = useRouter();
  const [showForm, setShowForm] = useState(false);

  const upcoming = meetings.filter((m) => new Date(m.whenAt).getTime() >= Date.now() - 60 * 60 * 1000);

  return (
    <div style={css("padding:36px 40px;display:flex;flex-direction:column;gap:32px")}>
      <div style={css("display:flex;align-items:center;justify-content:space-between")}>
        <div>
          <div style={css("font-size:12px;font-weight:500;letter-spacing:.12em;text-transform:uppercase;color:#bbc7c6")}>Calendar</div>
          <h1 style={css("font-family:var(--font-matter);font-weight:500;font-size:24px;color:#ffffff;margin:8px 0 0")}>Booked calls</h1>
        </div>
        <button
          onClick={() => setShowForm((s) => !s)}
          style={css(
            "background:#00c2b8;border:none;border-radius:6px;padding:10px 18px;font-size:13px;font-weight:500;color:#012624;cursor:pointer"
          )}
        >
          {showForm ? "Close" : "+ Book a call"}
        </button>
      </div>

      {showForm && (
        <div style={css("background:#003734;border-radius:16px;padding:24px;max-width:480px")}>
          <BookMeetingForm defaultTitle="" onBooked={() => router.refresh()} />
        </div>
      )}

      <CalendarGrid meetings={meetings} />

      <div style={css("display:flex;flex-direction:column;gap:12px")}>
        <div style={css("font-size:14px;font-weight:500;color:#ffffff")}>Upcoming</div>
        {upcoming.length ? (
          <div style={css("display:flex;flex-direction:column;gap:8px")}>
            {upcoming.map((m) => (
              <div
                key={m.id}
                style={css("display:flex;align-items:center;justify-content:space-between;background:#003734;border-radius:10px;padding:12px 16px")}
              >
                <span style={css("font-size:13px;font-weight:500;color:#ffffff")}>{m.title}</span>
                <span style={css("font-size:12px;color:#bbc7c6")}>
                  {m.whenLabel || new Date(m.whenAt).toLocaleString("en-US", { weekday: "short", month: "short", day: "numeric", hour: "numeric", minute: "2-digit" })}
                </span>
              </div>
            ))}
          </div>
        ) : (
          <p style={css("font-size:13px;color:#bbc7c6;margin:0")}>Nothing booked yet.</p>
        )}
      </div>
    </div>
  );
}
