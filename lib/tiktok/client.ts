import "server-only";
import type { TikTokUserInfo, TikTokTokenResult } from "./types";

const AUTH_URL = "https://www.tiktok.com/v2/auth/authorize/";
const TOKEN_URL = "https://open.tiktokapis.com/v2/oauth/token/";
const USERINFO_URL = "https://open.tiktokapis.com/v2/user/info/";
const SCOPES = "user.info.basic,user.info.stats";

export function buildAuthorizeUrl(redirectUri: string, state: string): string {
  const clientKey = process.env.TIKTOK_CLIENT_KEY;
  if (!clientKey) throw new Error("TIKTOK_CLIENT_KEY is not configured");

  const params = new URLSearchParams({
    client_key: clientKey,
    scope: SCOPES,
    response_type: "code",
    redirect_uri: redirectUri,
    state,
  });
  return `${AUTH_URL}?${params.toString()}`;
}

export async function exchangeCodeForToken(code: string, redirectUri: string): Promise<TikTokTokenResult> {
  const clientKey = process.env.TIKTOK_CLIENT_KEY;
  const clientSecret = process.env.TIKTOK_CLIENT_SECRET;
  if (!clientKey || !clientSecret) throw new Error("TikTok credentials are not configured");

  const res = await fetch(TOKEN_URL, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded", Accept: "application/json" },
    body: new URLSearchParams({
      client_key: clientKey,
      client_secret: clientSecret,
      code,
      grant_type: "authorization_code",
      redirect_uri: redirectUri,
    }),
  });

  const data = await res.json();
  if (!res.ok || data.error) {
    throw new Error(data.error_description || data.error || "TikTok token exchange failed");
  }

  return {
    accessToken: data.access_token as string,
    refreshToken: data.refresh_token as string,
    expiresAt: new Date(Date.now() + Number(data.expires_in) * 1000),
  };
}

export async function fetchTikTokUserInfo(accessToken: string): Promise<TikTokUserInfo> {
  const fields = ["open_id", "avatar_url", "display_name", "follower_count", "following_count", "likes_count", "video_count"].join(",");
  const res = await fetch(`${USERINFO_URL}?fields=${fields}`, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });

  const data = await res.json();
  if (!res.ok || (data.error && data.error.code !== "ok")) {
    throw new Error(data.error?.message || "Failed to fetch TikTok profile");
  }

  const u = data.data.user;
  return {
    openId: u.open_id as string,
    displayName: u.display_name as string,
    avatarUrl: u.avatar_url as string,
    followerCount: Number(u.follower_count ?? 0),
    followingCount: Number(u.following_count ?? 0),
    likesCount: Number(u.likes_count ?? 0),
    videoCount: Number(u.video_count ?? 0),
  };
}
