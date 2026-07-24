import { redirect } from "next/navigation";
import AppShell from "@/components/app/AppShell";
import { currentUser } from "@/lib/auth/currentUser";
import { getCreatorProfile, isProfileComplete } from "@/lib/profile/store";
import { isDbConfigured } from "@/lib/db";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const user = await currentUser();
  const name = (user && "name" in user && user.name) || (user && "email" in user && user.email) || "there";

  // No DB means nothing can persist yet — skip the gate rather than trap the creator in a loop.
  if (user && isDbConfigured()) {
    const profile = await getCreatorProfile(user.id);
    if (!isProfileComplete(profile)) {
      redirect("/onboarding");
    }
  }

  return <AppShell userName={name}>{children}</AppShell>;
}
