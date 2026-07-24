import "server-only";
import { auth, currentUser as clerkCurrentUser } from "@clerk/nextjs/server";
import { eq } from "drizzle-orm";
import { getDb, isDbConfigured } from "@/lib/db";
import { users, type User } from "@/lib/db/schema";

export async function currentUser(): Promise<User | { id: string; email: string | null; name: string | null } | null> {
  const { userId } = await auth();
  if (!userId) return null;

  if (!isDbConfigured()) {
    return { id: userId, email: null, name: null };
  }

  const db = getDb()!;
  const existing = await db.select().from(users).where(eq(users.id, userId)).limit(1);
  if (existing[0]) return existing[0];

  const clerkUser = await clerkCurrentUser();
  const email = clerkUser?.emailAddresses?.[0]?.emailAddress ?? null;
  const name = clerkUser?.fullName || clerkUser?.firstName || null;

  const inserted = await db
    .insert(users)
    .values({ id: userId, email, name })
    .onConflictDoNothing({ target: users.id })
    .returning();

  return inserted[0] ?? { id: userId, email, name };
}
