import { auth } from "@clerk/nextjs/server";
import { css } from "@/lib/style";
import { getCreatorProfile } from "@/lib/profile/store";
import ProfileForm from "@/components/profile/ProfileForm";
import type { ProfileInput } from "@/lib/profile/types";

export default async function ProfilePage() {
  const { userId } = await auth();
  const profile = userId ? await getCreatorProfile(userId) : null;

  const initial: ProfileInput = {
    niche: profile?.niche ?? "",
    bio: profile?.bio ?? "",
    platforms: profile?.platforms ?? [],
    audience: profile?.audience ?? {},
    tone: profile?.tone ?? "",
    pastDeals: profile?.pastDeals ?? "",
    rateFloor: profile?.rateFloor ?? null,
  };

  return (
    <div style={css("padding:36px 40px;display:flex;flex-direction:column;gap:24px")}>
      <div>
        <div style={css("font-size:12px;font-weight:500;letter-spacing:.12em;text-transform:uppercase;color:#bbc7c6")}>Profile</div>
        <h1 style={css("font-family:var(--font-matter);font-weight:500;font-size:28px;color:#ffffff;margin:8px 0 0")}>Your Media Kit</h1>
        <p style={css("font-size:14px;color:#bbc7c6;margin:8px 0 0;max-width:520px;line-height:1.5")}>
          This is what makes every pitch sound like you — your agents ground their work in it.
        </p>
      </div>
      <ProfileForm initial={initial} />
    </div>
  );
}
