import { NextRequest } from "next/server";
import { handleTikTokCallback } from "@/lib/tiktok/callback";

// Alias of /api/tiktok/callback — registered as TikTok's second required redirect URI.
export async function GET(req: NextRequest) {
  return handleTikTokCallback(req, "/api/auth/tiktok/callback");
}
