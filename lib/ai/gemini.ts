import "server-only";

// "gemini-flash-latest" is a rolling alias — pins to whatever the current flash model is, so this
// keeps working as specific dated models get retired (gemini-2.5-flash itself was retired mid-build).
const DEFAULT_MODEL = process.env.GEMINI_MODEL || "gemini-flash-latest";
// Newer models do a mandatory hidden "thinking" pass before replying (can't be disabled — see
// below), which adds latency versus the old thinkingBudget:0 behavior, so this has more headroom
// than a bare text call would need.
const TIMEOUT_MS = 25000;

export function isGeminiConfigured(): boolean {
  return !!process.env.GEMINI_API_KEY;
}

export interface Turn {
  role: "user" | "model";
  text: string;
}

interface GenerationOpts {
  maxTokens?: number;
  temperature?: number;
}

async function callGemini(body: unknown): Promise<{ candidates?: { content?: { parts?: { text?: string }[] } }[] }> {
  const key = process.env.GEMINI_API_KEY;
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);
  try {
    const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${DEFAULT_MODEL}:generateContent?key=${key}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
      signal: controller.signal,
    });
    if (!res.ok) throw new Error(`Gemini error ${res.status}: ${await res.text()}`);
    return res.json();
  } finally {
    clearTimeout(timer);
  }
}

function toRequest(system: string, turns: Turn[], generationConfig: Record<string, unknown>) {
  return {
    systemInstruction: { parts: [{ text: system }] },
    contents: turns.map((t) => ({ role: t.role, parts: [{ text: t.text }] })),
    generationConfig,
  };
}

function textOf(data: { candidates?: { content?: { parts?: { text?: string }[] } }[] }): string {
  return data.candidates?.[0]?.content?.parts?.map((p) => p.text ?? "").join("") ?? "";
}

// thinkingBudget:0 (the old way to keep replies fast and un-truncated) is now rejected outright
// by newer models — thinking can no longer be fully disabled. Leaving thinkingConfig unset is
// worse, not better: thinking usage then scales unpredictably with task complexity and measured
// as high as ~960 tokens on a single pitch-drafting call, silently eating the whole output budget
// and truncating the reply into invalid JSON. An explicit small budget reliably caps the hidden
// pass and leaves the rest of maxOutputTokens for the actual visible reply.
const THINKING_BUDGET = 256;

export async function geminiGenerate(system: string, turns: Turn[], opts?: GenerationOpts): Promise<string> {
  const data = await callGemini(
    toRequest(system, turns, {
      maxOutputTokens: opts?.maxTokens ?? 600,
      temperature: opts?.temperature ?? 0.6,
      thinkingConfig: { thinkingBudget: THINKING_BUDGET },
    })
  );
  return textOf(data);
}

export async function geminiJSON<T>(system: string, turns: Turn[], schema: object, opts?: GenerationOpts): Promise<T> {
  const data = await callGemini(
    toRequest(system, turns, {
      maxOutputTokens: opts?.maxTokens ?? 900,
      temperature: opts?.temperature ?? 0.6,
      thinkingConfig: { thinkingBudget: THINKING_BUDGET },
      responseMimeType: "application/json",
      responseSchema: schema,
    })
  );
  return JSON.parse(textOf(data) || "{}") as T;
}
