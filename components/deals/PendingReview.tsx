"use client";
import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { css } from "@/lib/style";
import { acceptLead, rejectLead } from "@/lib/leads/actions";
import type { LeadView } from "@/lib/leads/types";

export default function PendingReview({ leads }: { leads: LeadView[] }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  function accept(id: string) {
    startTransition(async () => {
      await acceptLead(id);
      router.refresh();
    });
  }

  function reject(id: string) {
    startTransition(async () => {
      await rejectLead(id);
      router.refresh();
    });
  }

  if (!leads.length) {
    return (
      <div style={css("background:#003734;border-radius:16px;padding:24px")}>
        <p style={css("font-size:13px;color:#bbc7c6;margin:0;line-height:1.5")}>
          Nothing waiting yet — brands your Research agent discovers will show up here for you to approve.
        </p>
      </div>
    );
  }

  return (
    <div style={css("display:flex;flex-direction:column;gap:10px")}>
      {leads.map((lead) => (
        <div
          key={lead.id}
          style={css(
            "display:flex;align-items:center;justify-content:space-between;gap:16px;background:#003734;border-radius:12px;padding:14px 18px;" +
              (isPending ? "opacity:.6" : "")
          )}
        >
          <div>
            <div style={css("font-size:13px;font-weight:500;color:#ffffff")}>{lead.name}</div>
            <div style={css("font-size:11.5px;color:#bbc7c6;margin-top:2px")}>
              {[lead.company, lead.platform].filter(Boolean).join(" · ") || "—"}
            </div>
          </div>
          <div style={css("display:flex;gap:8px;flex:none")}>
            <button
              onClick={() => accept(lead.id)}
              disabled={isPending}
              style={css(
                "background:rgba(0,194,184,.14);border:1px solid rgba(0,229,208,.3);border-radius:6px;padding:7px 14px;font-size:12px;font-weight:500;color:#00e5d0;cursor:pointer"
              )}
            >
              Accept
            </button>
            <button
              onClick={() => reject(lead.id)}
              disabled={isPending}
              style={css(
                "background:none;border:1px solid rgba(253,233,255,.3);border-radius:6px;padding:7px 14px;font-size:12px;font-weight:500;color:#fde9ff;cursor:pointer"
              )}
            >
              Reject
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
