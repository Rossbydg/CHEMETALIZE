export type StatusKey = "working" | "waiting" | "offline" | "error";
export interface StatusMeta { label: string; bg: string; color: string; dot: string }

const STATUS_META: Record<StatusKey, StatusMeta> = {
  working: { label: "Working", bg: "rgba(0,194,184,.14)", color: "#00e5d0", dot: "#00e5d0" },
  waiting: { label: "Waiting", bg: "rgba(187,199,198,.14)", color: "#bbc7c6", dot: "#bbc7c6" },
  offline: { label: "Offline", bg: "rgba(112,119,119,.18)", color: "#707777", dot: "#707777" },
  error: { label: "Error", bg: "rgba(253,233,255,.16)", color: "#fde9ff", dot: "#fde9ff" },
};

export function statusMeta(s: StatusKey): StatusMeta {
  return STATUS_META[s] ?? STATUS_META.offline;
}
