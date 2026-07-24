"use client";
import { useState } from "react";
import { css } from "@/lib/style";
import type { ProposalView } from "@/lib/proposals/types";

export default function ProposalCard({ proposal, leadEmail }: { proposal: ProposalView; leadEmail: string | null }) {
  const [copied, setCopied] = useState(false);

  const mailto = leadEmail
    ? `mailto:${encodeURIComponent(leadEmail)}?subject=${encodeURIComponent(proposal.title)}&body=${encodeURIComponent(proposal.body)}`
    : null;

  function copy() {
    navigator.clipboard.writeText(`${proposal.title}\n\n${proposal.body}`).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    });
  }

  return (
    <div style={css("display:flex;flex-direction:column;gap:10px;background:#012624;border:1px solid rgba(255,255,255,.08);border-radius:12px;padding:16px")}>
      <div style={css("font-size:13.5px;font-weight:500;color:#ffffff")}>{proposal.title}</div>
      <p style={css("font-size:13px;color:#edfffe;line-height:1.6;margin:0;white-space:pre-wrap")}>{proposal.body}</p>

      {proposal.packages.length > 0 && (
        <div style={css("display:flex;flex-wrap:wrap;gap:6px")}>
          {proposal.packages.map((p, i) => (
            <span
              key={i}
              style={css(
                "font-size:11px;font-weight:500;color:#bbc7c6;background:rgba(255,255,255,.06);border:1px solid rgba(255,255,255,.1);border-radius:99px;padding:4px 10px"
              )}
            >
              {p}
            </span>
          ))}
        </div>
      )}

      <div style={css("display:flex;gap:8px;align-items:center")}>
        {mailto && (
          <a
            href={mailto}
            style={css("background:#00c2b8;border-radius:6px;padding:8px 14px;font-size:12px;font-weight:500;color:#012624;text-decoration:none")}
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
      </div>
    </div>
  );
}
