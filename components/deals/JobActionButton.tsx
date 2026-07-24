"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { css } from "@/lib/style";
import { getJobStatus } from "@/lib/jobs/actions";

const MAX_POLLS = 20;
const POLL_DELAY_MS = 700;

export default function JobActionButton({
  label,
  pendingLabel,
  enqueue,
}: {
  label: string;
  pendingLabel: string;
  enqueue: () => Promise<string | null>;
}) {
  const router = useRouter();
  const [running, setRunning] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function run() {
    setRunning(true);
    setError(null);
    try {
      const jobId = await enqueue();
      if (!jobId) {
        setError("Couldn't start — check your setup.");
        return;
      }

      for (let i = 0; i < MAX_POLLS; i++) {
        await fetch("/api/jobs/run", { method: "POST" });
        const status = await getJobStatus(jobId);
        if (status?.status === "done") break;
        if (status?.status === "failed") {
          setError("Something went wrong — try again.");
          break;
        }
        await new Promise((r) => setTimeout(r, POLL_DELAY_MS));
      }
      router.refresh();
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
          "background:#00c2b8;border:none;border-radius:6px;padding:8px 16px;font-size:12px;font-weight:500;color:#012624;cursor:pointer;" +
            (running ? "opacity:.6" : "")
        )}
      >
        {running ? pendingLabel : label}
      </button>
      {error && <span style={css("font-size:11px;color:#fde9ff")}>{error}</span>}
    </div>
  );
}
