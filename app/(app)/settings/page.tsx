import { currentUser } from "@/lib/auth/currentUser";
import { NOTIFICATION_SETTINGS } from "@/lib/settings/config";
import NotificationToggles from "@/components/settings/NotificationToggles";
import { css } from "@/lib/style";

export default async function SettingsPage() {
  const user = await currentUser();
  const stored = (user && "notifications" in user && user.notifications) || {};

  const initial: Record<string, boolean> = {};
  for (const s of NOTIFICATION_SETTINGS) {
    initial[s.key] = stored[s.key] ?? true;
  }

  return (
    <div style={css("padding:36px 40px;display:flex;flex-direction:column;gap:28px")}>
      <div>
        <div style={css("font-size:12px;font-weight:500;letter-spacing:.12em;text-transform:uppercase;color:#bbc7c6")}>Settings</div>
        <h1 style={css("font-family:var(--font-matter);font-weight:500;font-size:28px;color:#ffffff;margin:8px 0 0")}>Notifications</h1>
      </div>
      <NotificationToggles initial={initial} />
    </div>
  );
}
