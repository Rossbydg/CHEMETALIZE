import { auth } from "@clerk/nextjs/server";
import { currentUser } from "@/lib/auth/currentUser";
import { NOTIFICATION_SETTINGS } from "@/lib/settings/config";
import NotificationToggles from "@/components/settings/NotificationToggles";
import TikTokConnectCard from "@/components/settings/TikTokConnectCard";
import { getCreatorProfile } from "@/lib/profile/store";
import { css } from "@/lib/style";

export default async function SettingsPage({ searchParams }: { searchParams: { tiktok?: string } }) {
  const user = await currentUser();
  const { userId } = await auth();
  const profile = userId ? await getCreatorProfile(userId) : null;
  const stored = (user && "notifications" in user && user.notifications) || {};

  const initial: Record<string, boolean> = {};
  for (const s of NOTIFICATION_SETTINGS) {
    initial[s.key] = stored[s.key] ?? true;
  }

  return (
    <div style={css("padding:clamp(16px,4vw,36px) clamp(16px,5vw,40px);display:flex;flex-direction:column;gap:28px")}>
      <div>
        <div style={css("font-size:12px;font-weight:500;letter-spacing:.12em;text-transform:uppercase;color:#bbc7c6")}>Settings</div>
        <h1 style={css("font-family:var(--font-matter);font-weight:500;font-size:28px;color:#ffffff;margin:8px 0 0")}>Notifications</h1>
      </div>

      {searchParams.tiktok === "error" && (
        <div style={css("font-size:13px;color:#ffb4b4;background:rgba(255,90,90,.08);border:1px solid rgba(255,90,90,.25);border-radius:12px;padding:12px 16px")}>
          Couldn&apos;t connect TikTok — please try again.
        </div>
      )}
      {searchParams.tiktok === "connected" && (
        <div style={css("font-size:13px;color:#9df4ea;background:rgba(0,194,184,.08);border:1px solid rgba(0,194,184,.25);border-radius:12px;padding:12px 16px")}>
          TikTok connected.
        </div>
      )}

      <div>
        <div style={css("font-size:12px;font-weight:500;letter-spacing:.12em;text-transform:uppercase;color:#bbc7c6;margin-bottom:12px")}>Connected accounts</div>
        <TikTokConnectCard profile={profile} />
      </div>

      <NotificationToggles initial={initial} />
    </div>
  );
}
