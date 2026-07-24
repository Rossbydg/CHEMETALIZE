"use client";
import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { css } from "@/lib/style";
import { sendChatMessage } from "@/lib/chat/actions";
import type { NowParts } from "@/lib/ai/meetingTime";

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

export default function ChatComposer() {
  const router = useRouter();
  const [text, setText] = useState("");
  const [isPending, startTransition] = useTransition();

  function submit() {
    if (!text.trim() || isPending) return;
    const value = text;
    setText("");
    startTransition(async () => {
      await sendChatMessage(value, nowParts());
      router.refresh();
    });
  }

  return (
    <div style={css("display:flex;gap:10px")}>
      <input
        style={css(
          "background:#003734;border:1px solid rgba(255,255,255,.14);border-radius:8px;padding:12px 16px;font-size:13.5px;color:#edfffe;outline:none;flex:1"
        )}
        value={text}
        onChange={(e) => setText(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter") submit();
        }}
        placeholder="@Research find me some fitness brands"
        disabled={isPending}
      />
      <button
        onClick={submit}
        disabled={isPending || !text.trim()}
        style={css(
          "background:#00c2b8;border:none;border-radius:8px;padding:0 22px;font-size:13px;font-weight:500;color:#012624;cursor:pointer;" +
            (isPending || !text.trim() ? "opacity:.6" : "")
        )}
      >
        {isPending ? "…" : "Send"}
      </button>
    </div>
  );
}
