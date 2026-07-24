"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { css } from "@/lib/style";

export default function DiscoverBrandsButton() {
  const router = useRouter();
  const [running, setRunning] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  async function run() {
    setRunning(true);
    setMessage(null);
    try {
      const res = await fetch("/api/scrape", { method: "POST" });
      const data = await res.json();
      setMessage(
        data.inserted ? `Found ${data.inserted} brand${data.inserted === 1 ? "" : "s"} — check Pending review.` : "Nothing new found this time."
      );
      router.refresh();
    } catch {
      setMessage("Something went wrong — try again.");
    } finally {
      setRunning(false);
    }
  }

  return (
    <div style={css("display:flex;flex-direction:column;align-items:flex-end;gap:4px")}>
      <button
        onClick={run}
        disabled={running}
        style={css(
          "background:none;border:1px solid rgba(255,255,255,.14);border-radius:6px;padding:10px 16px;font-size:13px;color:#edfffe;cursor:pointer;" +
            (running ? "opacity:.6" : "")
        )}
      >
        {running ? "Discovering…" : "Discover brands"}
      </button>
      {message && <span style={css("font-size:11px;color:#bbc7c6")}>{message}</span>}
    </div>
  );
}
