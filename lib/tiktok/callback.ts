import "server-only";
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";
import { exchangeCodeForToken, fetchTikTokUserInfo } from "./client";
import { saveTikTokConnection } from "./store";

const STATE_COOKIE = "tiktok_oauth_state";

export async function handleTikTokCallback(req: NextRequest, callbackPath: string): Promise<NextResponse> {
  const { userId } = await auth();
  if (!userId) return NextResponse.redirect(new URL("/sign-in", req.url));

  const url = new URL(req.url);
  const code = url.searchParams.get("code");
  const state = url.searchParams.get("state");
  const cookieState = req.cookies.get(STATE_COOKIE)?.value;

  const fail = (reason: string) => {
    const res = NextResponse.redirect(new URL(`/settings?tiktok=error&reason=${encodeURIComponent(reason)}`, req.url));
    res.cookies.delete(STATE_COOKIE);
    return res;
  };

  if (!code || !state || !cookieState || state !== cookieState) return fail("invalid_state");

  try {
    const redirectUri = new URL(callbackPath, req.url).toString();
    const token = await exchangeCodeForToken(code, redirectUri);
    const info = await fetchTikTokUserInfo(token.accessToken);
    await saveTikTokConnection(userId, info, token);
  } catch (err) {
    console.error("TikTok connect failed", err);
    return fail("connect_failed");
  }

  revalidatePath("/settings");
  revalidatePath("/profile");
  revalidatePath("/dashboard");

  const res = NextResponse.redirect(new URL("/settings?tiktok=connected", req.url));
  res.cookies.delete(STATE_COOKIE);
  return res;
}
