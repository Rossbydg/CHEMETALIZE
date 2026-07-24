import "server-only";
import { geminiJSON, isGeminiConfigured } from "./gemini";

// Plain wall-clock numbers, deliberately not a Date/ISO string — the browser that asks resolves
// "now" in its own local time and later reconstructs the answer the same way, so no server ever
// has to guess the creator's timezone.
export interface NowParts {
  year: number;
  month: number;
  day: number;
  hour: number;
  minute: number;
  weekday: string;
}

export interface ParsedMeetingTime {
  year: number;
  month: number;
  day: number;
  hour: number;
  minute: number;
  label: string;
}

const SCHEMA = {
  type: "OBJECT",
  properties: {
    year: { type: "INTEGER" },
    month: { type: "INTEGER" },
    day: { type: "INTEGER" },
    hour: { type: "INTEGER" },
    minute: { type: "INTEGER" },
    label: { type: "STRING" },
  },
  required: ["year", "month", "day", "hour", "minute", "label"],
};

// Without Gemini this returns null — the caller falls back to a plain typed date/time picker.
export async function parseMeetingTime(phrase: string, now: NowParts): Promise<ParsedMeetingTime | null> {
  if (!isGeminiConfigured() || !phrase.trim()) return null;

  const pad = (n: number) => String(n).padStart(2, "0");
  const system = [
    `You convert a short natural-language scheduling phrase into an exact date and 24-hour time.`,
    `Right now it is ${now.weekday}, ${now.year}-${pad(now.month)}-${pad(now.day)} at ${pad(now.hour)}:${pad(now.minute)}.`,
    `Resolve the phrase relative to that moment. "Next Tuesday" means the closest Tuesday strictly after today. If no time of day is stated, use 10:00. If no date is stated, assume the nearest sensible future date.`,
    `Also write a short friendly label like "Tuesday, Jan 13 at 2:00 PM".`,
    `Return ONLY JSON matching the schema — year, month (1-12), day, hour (0-23), minute, label.`,
  ].join("\n\n");

  try {
    const result = await geminiJSON<ParsedMeetingTime>(system, [{ role: "user", text: phrase }], SCHEMA, {
      maxTokens: 500,
      temperature: 0.2,
    });
    if (!result.year || !result.month || !result.day) return null;
    return result;
  } catch {
    return null;
  }
}
