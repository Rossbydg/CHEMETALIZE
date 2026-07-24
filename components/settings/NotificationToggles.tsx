"use client";
import { useState, useTransition } from "react";
import { css } from "@/lib/style";
import { NOTIFICATION_SETTINGS } from "@/lib/settings/config";
import { updateNotificationSetting } from "@/lib/settings/actions";

function Switch({ checked, onClick }: { checked: boolean; onClick: () => void }) {
  return (
    <button
      role="switch"
      aria-checked={checked}
      onClick={onClick}
      style={css(
        "width:42px;height:24px;border-radius:99px;border:none;cursor:pointer;position:relative;flex:none;transition:background .15s;background:" +
          (checked ? "#00c2b8" : "rgba(255,255,255,.15)")
      )}
    >
      <span
        style={css(
          "position:absolute;top:3px;width:18px;height:18px;border-radius:50%;background:#ffffff;transition:left .15s;left:" +
            (checked ? "21px" : "3px")
        )}
      />
    </button>
  );
}

export default function NotificationToggles({ initial }: { initial: Record<string, boolean> }) {
  const [values, setValues] = useState(initial);
  const [, startTransition] = useTransition();

  function toggle(key: string) {
    const next = !values[key];
    setValues((v) => ({ ...v, [key]: next }));
    startTransition(() => {
      updateNotificationSetting(key, next);
    });
  }

  return (
    <div style={css("display:flex;flex-direction:column;gap:14px;max-width:520px")}>
      {NOTIFICATION_SETTINGS.map((s) => (
        <div
          key={s.key}
          style={css("display:flex;align-items:center;justify-content:space-between;gap:16px;background:#003734;border-radius:16px;padding:20px 24px")}
        >
          <div>
            <div style={css("font-size:14px;font-weight:500;color:#ffffff")}>{s.label}</div>
            <div style={css("font-size:13px;color:#bbc7c6;margin-top:4px;line-height:1.4")}>{s.description}</div>
          </div>
          <Switch checked={values[s.key] ?? true} onClick={() => toggle(s.key)} />
        </div>
      ))}
    </div>
  );
}
