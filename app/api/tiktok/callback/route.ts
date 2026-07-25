import { NextRequest } from "next/server";
import { handleTikTokCallback } from "@/lib/tiktok/callback";

export async function GET(req: NextRequest) {
  return handleTikTokCallback(req, "/api/tiktok/callback");
}
