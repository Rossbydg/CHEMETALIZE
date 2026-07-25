import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { buildAuthorizeUrl } from "@/lib/tiktok/client";

export async function GET(req: NextRequest) {
  const { userId } = await auth();
  if (!userId) return NextResponse.redirect(new URL("/sign-in", req.url));

  const state = crypto.randomUUID();
  const redirectUri = new URL("/api/tiktok/callback", req.url).toString();
  const authorizeUrl = buildAuthorizeUrl(redirectUri, state);

  const res = NextResponse.redirect(authorizeUrl);
  res.cookies.set("tiktok_oauth_state", state, {
    httpOnly: true,
    secure: true,
    sameSite: "lax",
    maxAge: 600,
    path: "/",
  });
  return res;
}
