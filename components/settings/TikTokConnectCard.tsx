import { css } from "@/lib/style";
import { disconnectTikTok } from "@/lib/tiktok/actions";
import type { CreatorProfile } from "@/lib/db/schema";

export default function TikTokConnectCard({ profile }: { profile: CreatorProfile | null }) {
  const connected = Boolean(profile?.tiktokOpenId);

  return (
    <div style={css("display:flex;align-items:center;justify-content:space-between;gap:16px;flex-wrap:wrap;background:#003734;border-radius:16px;padding:20px 24px")}>
      <div style={css("display:flex;align-items:center;gap:14px")}>
        {connected && profile?.tiktokAvatarUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={profile.tiktokAvatarUrl}
            alt=""
            style={css("width:44px;height:44px;border-radius:50%;object-fit:cover;flex:none")}
          />
        ) : (
          <div style={css("width:44px;height:44px;border-radius:50%;background:#012624;flex:none")} />
        )}
        <div>
          <div style={css("font-size:14px;font-weight:500;color:#ffffff")}>TikTok</div>
          <div style={css("font-size:13px;color:#bbc7c6;margin-top:4px;line-height:1.4")}>
            {connected
              ? `Connected as ${profile?.tiktokDisplayName} · ${(profile?.tiktokFollowerCount ?? 0).toLocaleString()} followers`
              : "Connect to auto-fill your profile photo and follower stats."}
          </div>
        </div>
      </div>
      {connected ? (
        <form action={disconnectTikTok}>
          <button
            type="submit"
            style={css(
              "font-size:12.5px;font-weight:500;color:#bbc7c6;background:rgba(255,255,255,.06);border:1px solid rgba(255,255,255,.14);border-radius:99px;padding:9px 18px;cursor:pointer"
            )}
          >
            Disconnect
          </button>
        </form>
      ) : (
        <a
          href="/api/tiktok/authorize"
          style={css(
            "font-size:12.5px;font-weight:500;color:#012624;background:linear-gradient(90deg,#cbfffc 0%,#edfffe 26%,#fffdfa 48%,#fad1ff 89%);border-radius:99px;padding:9px 18px;text-decoration:none;white-space:nowrap"
          )}
        >
          Connect TikTok
        </a>
      )}
    </div>
  );
}
