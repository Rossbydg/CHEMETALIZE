import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { getCreatorProfile, isProfileComplete } from "@/lib/profile/store";
import { isDbConfigured } from "@/lib/db";
import OnboardingWizard from "@/components/profile/OnboardingWizard";
import type { ProfileInput } from "@/lib/profile/types";

export default async function OnboardingPage() {
  const { userId } = await auth();
  const profile = userId && isDbConfigured() ? await getCreatorProfile(userId) : null;

  if (isProfileComplete(profile)) {
    redirect("/dashboard");
  }

  const initial: ProfileInput = {
    niche: profile?.niche ?? "",
    bio: profile?.bio ?? "",
    platforms: profile?.platforms ?? [],
    audience: profile?.audience ?? {},
    tone: profile?.tone ?? "",
    pastDeals: profile?.pastDeals ?? "",
    rateFloor: profile?.rateFloor ?? null,
  };

  return <OnboardingWizard initial={initial} />;
}
