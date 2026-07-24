"use client";
import { useEffect, useState, useTransition } from "react";
import { css } from "@/lib/style";
import { fetchNotifications, dismissNotification, dismissAllNotifications } from "@/lib/activity/actions";
import type { ActivityView } from "@/lib/activity/types";

const POLL_MS = 20000;

function timeAgo(iso: string): string {
  const mins = Math.floor((Date.now() - new Date(iso).getTime()) / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

export default function NotificationsBell() {
  const [open, setOpen] = useState(false);
  const [items, setItems] = useState<ActivityView[]>([]);
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    let cancelled = false;
    async function refresh() {
      const data = await fetchNotifications();
      if (!cancelled) setItems(data);
    }
    refresh();
    const interval = setInterval(refresh, POLL_MS);
    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, []);

  function clearOne(id: string) {
    setItems((prev) => prev.filter((i) => i.id !== id));
    startTransition(async () => {
      await dismissNotification(id);
    });
  }

  function clearAll() {
    setItems([]);
    startTransition(async () => {
      await dismissAllNotifications();
    });
  }

  return (
    <div style={css("position:relative")}>
      <button
        onClick={() => setOpen((o) => !o)}
        aria-label="Notifications"
        style={css("background:none;border:none;cursor:pointer;color:#bbc7c6;padding:6px;display:flex;position:relative")}
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M18 8a6 6 0 0 0-12 0c0 7-3 9-3 9h18s-3-2-3-9" />
          <path d="M13.73 21a2 2 0 0 1-3.46 0" />
        </svg>
        {items.length > 0 && (
          <span style={css("position:absolute;top:4px;right:4px;width:7px;height:7px;border-radius:50%;background:#00e5d0")} />
        )}
      </button>

      {open && (
        <>
          <div style={css("position:fixed;inset:0;z-index:19")} onClick={() => setOpen(false)} />
          <div
            style={css(
              "position:absolute;top:36px;right:0;width:320px;max-height:400px;overflow-y:auto;background:#003734;border:1px solid rgba(255,255,255,.1);border-radius:12px;padding:14px;z-index:20;box-shadow:0 12px 32px rgba(0,0,0,.4)"
            )}
          >
            <div style={css("display:flex;align-items:center;justify-content:space-between;margin-bottom:10px")}>
              <span style={css("font-size:12px;font-weight:500;letter-spacing:.06em;text-transform:uppercase;color:#bbc7c6")}>
                Notifications
              </span>
              {items.length > 0 && (
                <button
                  onClick={clearAll}
                  disabled={isPending}
                  style={css("background:none;border:none;font-size:11.5px;color:#00e5d0;cursor:pointer")}
                >
                  Clear all
                </button>
              )}
            </div>
            {items.length === 0 ? (
              <p style={css("font-size:12.5px;color:#bbc7c6;margin:0")}>You&apos;re all caught up.</p>
            ) : (
              <div style={css("display:flex;flex-direction:column;gap:8px")}>
                {items.map((n) => (
                  <div
                    key={n.id}
                    style={css(
                      "display:flex;align-items:flex-start;justify-content:space-between;gap:8px;background:#012624;border-radius:8px;padding:10px 12px"
                    )}
                  >
                    <div>
                      <p style={css("font-size:12.5px;color:#edfffe;line-height:1.5;margin:0")}>{n.text}</p>
                      <span style={css("font-size:10.5px;color:#707777")}>{timeAgo(n.createdAt)}</span>
                    </div>
                    <button
                      onClick={() => clearOne(n.id)}
                      aria-label="Dismiss"
                      style={css("background:none;border:none;color:#707777;cursor:pointer;font-size:14px;flex:none;line-height:1")}
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
