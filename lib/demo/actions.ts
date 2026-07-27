"use server";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { headers } from "next/headers";
import { getDb, isDbConfigured } from "@/lib/db";
import { meetings, users } from "@/lib/db/schema";
import { sendOwnerEmail } from "@/lib/email/resend";
import { checkAndRecordAttempt, clientIp } from "./rateLimit";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const OWNER_EMAIL = process.env.OWNER_EMAIL || "rossby.eclof@gmail.com";

export interface BookDemoInput {
  name: string;
  email: string;
  whenAt: string; // ISO instant, resolved client-side in the visitor's own timezone
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

  const ip = clientIp(headers());
  const rate = await checkAndRecordAttempt(ip);
  if (!rate.ok) {
    return {
      ok: false,
      error: `Too many booking attempts — please try again in ${rate.retryAfterMinutes} minute${rate.retryAfterMinutes === 1 ? "" : "s"}.`,
    };
  }

  const name = input.name.trim().slice(0, 120);
  const email = input.email.trim().slice(0, 200);
  if (!name) return { ok: false, error: "Please enter your name." };
  if (!EMAIL_RE.test(email)) return { ok: false, error: "Please enter a valid email." };
  if (!input.whenAt) return { ok: false, error: "Please pick a date and time." };

  // Parsed from an ISO instant the client already resolved — no ambiguity about whose
  // timezone "10:00" means, unlike parsing a bare date+time string on this UTC server would be.
  const whenAt = new Date(input.whenAt);
  if (isNaN(whenAt.getTime())) return { ok: false, error: "Please pick a valid date and time." };

  const now = new Date();
  const maxAhead = new Date(now.getTime() + 1000 * 60 * 60 * 24 * 180);
  if (whenAt < now) return { ok: false, error: "That time has already passed — please pick a future time." };
  if (whenAt > maxAhead) return { ok: false, error: "Please pick a date within the next 6 months." };

  const db = getDb()!;
  const ownerRows = await db.select({ id: users.id }).from(users).where(eq(users.email, OWNER_EMAIL)).limit(1);
  const ownerId = ownerRows[0]?.id;
  if (!ownerId) return { ok: false, error: "Booking isn't available right now." };

  // No whenLabel stored — this server has no idea what timezone the account owner views the
  // calendar in, so a label baked here would just repeat the same bug in a different spot.
  // The calendar UI already formats whenAt correctly in each viewer's own browser.
  const [inserted] = await db
    .insert(meetings)
    .values({
      userId: ownerId,
      title: `Demo — ${name} (${email})`,
      kind: "call",
      whenAt,
    })
    .returning({ id: meetings.id });

  // TEMP-DIAGNOSTIC: write the raw failure into this specific row's whenLabel (unused for demo
  // bookings otherwise) so it can be read directly from the DB — the Vercel log views aren't
  // surfacing this request at all. Targets inserted.id only, never other rows.
  try {
    if (!process.env.RESEND_API_KEY) {
      throw new Error("RESEND_API_KEY is not set in this runtime");
    }
    // UTC, explicitly labeled as such, since email can't adapt to the reader's timezone —
    // the calendar in the app is the source of truth for "what time is this in my timezone."
    const utcLabel = whenAt.toLocaleString("en-US", {
      weekday: "short",
      month: "short",
      day: "numeric",
      hour: "numeric",
      minute: "2-digit",
      timeZone: "UTC",
    });
    await sendOwnerEmail({
      to: OWNER_EMAIL,
      subject: `New demo booked — ${name}`,
      text: [
        `${name} (${email}) booked a product demo for ${utcLabel} UTC.`,
        input.notes?.trim() ? `\nNotes: ${input.notes.trim()}` : "",
        `\nIt's already on your calendar in Agentic Sales Team, shown there in your own local time.`,
      ].join(""),
    });
    await db.update(meetings).set({ whenLabel: "DIAG: email sent ok" }).where(eq(meetings.id, inserted.id));
  } catch (err) {
    // The booking itself succeeded and is on the calendar — an email hiccup shouldn't undo that.
    console.error("Demo booking email failed", err);
    const msg = err instanceof Error ? err.message : String(err);
    await db.update(meetings).set({ whenLabel: `DIAG: ${msg}`.slice(0, 250) }).where(eq(meetings.id, inserted.id));
  }

  revalidatePath("/calendar");
  revalidatePath("/dashboard");

  return { ok: true };
}
