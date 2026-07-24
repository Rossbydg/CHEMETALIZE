"use client";
import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { css } from "@/lib/style";
import { dismissDraft } from "@/lib/outreach/actions";
import type { OutreachDraftView } from "@/lib/outreach/types";

export default function DraftCard({
  draft,
  leadId,
  leadEmail,
  brandLabel,
}: {
  draft: OutreachDraftView;
  leadId: string;
  leadEmail: string | null;
  brandLabel: string;
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [copied, setCopied] = useState(false);

  const mailto = leadEmail
    ? `mailto:${encodeURIComponent(leadEmail)}?subject=${encodeURIComponent(draft.subject ?? "")}&body=${encodeURIComponent(draft.body)}`
    : null;

  function copy() {
    const text = draft.subject ? `${draft.subject}\n\n${draft.body}` : draft.body;
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    });
  }

  function dismiss() {
    startTransition(async () => {
      await dismissDraft(draft.id, leadId);
      router.refresh();
    });
  }

  return (
    <div
      style={css(
        "display:flex;flex-direction:column;gap:10px;background:#012624;border:1px solid rgba(255,255,255,.08);border-radius:12px;padding:16px;" +
          (isPending ? "opacity:.5" : "")
      )}
    >
      <div style={css("display:flex;align-items:center;justify-content:space-between;gap:12px")}>
        <div style={css("display:flex;align-items:center;gap:8px")}>
          <span style={css("font-size:12px;font-weight:500;color:#bbc7c6")}>{brandLabel}</span>
          {draft.kind === "follow-up" && (
            <span
              style={css(
                "font-size:10px;font-weight:500;letter-spacing:.04em;text-transform:uppercase;color:#c08ce0;background:rgba(192,140,224,.14);border-radius:99px;padding:2px 8px"
              )}
            >
              Follow-up
            </span>
          )}
        </div>
        <div style={css("font-size:11px;color:#707777")}>{new Date(draft.createdAt).toLocaleDateString()}</div>
      </div>
      {draft.subject && <div style={css("font-size:13.5px;font-weight:500;color:#ffffff")}>{draft.subject}</div>}
      <p style={css("font-size:13px;color:#edfffe;line-height:1.6;margin:0;white-space:pre-wrap")}>{draft.body}</p>

      <div style={css("display:flex;gap:8px;align-items:center;flex-wrap:wrap")}>
        {mailto && (
          <a
            href={mailto}
            style={css(
              "background:#00c2b8;border-radius:6px;padding:8px 14px;font-size:12px;font-weight:500;color:#012624;text-decoration:none"
            )}
          >
            Open in mail app
          </a>
        )}
        <button
          onClick={copy}
          style={css(
            "background:none;border:1px solid rgba(255,255,255,.14);border-radius:6px;padding:8px 14px;font-size:12px;color:#edfffe;cursor:pointer"
          )}
        >
          {copied ? "Copied" : "Copy"}
        </button>
        <button
          onClick={dismiss}
          disabled={isPending}
          style={css("background:none;border:none;font-size:12px;color:#bbc7c6;cursor:pointer;padding:8px 4px")}
        >
          Dismiss
        </button>
      </div>
    </div>
  );
}
