"use server";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { getDb, isDbConfigured } from "@/lib/db";
import { meetings, users } from "@/lib/db/schema";
import { sendOwnerEmail } from "@/lib/email/resend";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const OWNER_EMAIL = process.env.OWNER_EMAIL || "rossby.eclof@gmail.com";

export interface BookDemoInput {
  name: string;
  email: string;
  date: string; // yyyy-mm-dd, from an <input type="date">
  time: string; // HH:mm, from an <input type="time">
  notes?: string;
}

export interface BookDemoResult {
  ok: boolean;
  error?: string;
}

// Public — no auth. Anyone visiting the marketing site can call this, so every input is
// re-validated server-side rather than trusted from the form.
export async function bookDemo(input: BookDemoInput): Promise<BookDemoResult> {
  if (!isDbConfigured()) return { ok: false, error: "Booking isn't available right now." };

  const name = input.name.trim().slice(0, 120);
  const email = input.email.trim().slice(0, 200);
  if (!name) return { ok: false, error: "Please enter your name." };
  if (!EMAIL_RE.test(email)) return { ok: false, error: "Please enter a valid email." };
  if (!input.date || !input.time) return { ok: false, error: "Please pick a date and time." };

  const whenAt = new Date(`${input.date}T${input.time}`);
  if (isNaN(whenAt.getTime())) return { ok: false, error: "Please pick a valid date and time." };

  const now = new Date();
  const maxAhead = new Date(now.getTime() + 1000 * 60 * 60 * 24 * 180);
  if (whenAt < now) return { ok: false, error: "That time has already passed — please pick a future time." };
  if (whenAt > maxAhead) return { ok: false, error: "Please pick a date within the next 6 months." };

  const db = getDb()!;
  const ownerRows = await db.select({ id: users.id }).from(users).where(eq(users.email, OWNER_EMAIL)).limit(1);
  const ownerId = ownerRows[0]?.id;
  if (!ownerId) return { ok: false, error: "Booking isn't available right now." };

  const whenLabel = whenAt.toLocaleString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });

  await db.insert(meetings).values({
    userId: ownerId,
    title: `Demo — ${name} (${email})`,
    kind: "call",
    whenAt,
    whenLabel,
  });

  try {
    await sendOwnerEmail({
      to: OWNER_EMAIL,
      subject: `New demo booked — ${name}`,
      text: [
        `${name} (${email}) booked a product demo for ${whenLabel}.`,
        input.notes?.trim() ? `\nNotes: ${input.notes.trim()}` : "",
        `\nIt's already on your calendar in Agentic Sales Team.`,
      ].join(""),
    });
  } catch (err) {
    // The booking itself succeeded and is on the calendar — an email hiccup shouldn't undo that.
    console.error("Demo booking email failed", err);
  }

  revalidatePath("/calendar");
  revalidatePath("/dashboard");

  return { ok: true };
}
