import "server-only";

const DEFAULT_MODEL = process.env.GEMINI_MODEL || "gemini-2.5-flash";
const TIMEOUT_MS = 15000;

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

export async function geminiGenerate(system: string, turns: Turn[], opts?: GenerationOpts): Promise<string> {
  const data = await callGemini(
    toRequest(system, turns, {
      maxOutputTokens: opts?.maxTokens ?? 400,
      temperature: opts?.temperature ?? 0.6,
      thinkingConfig: { thinkingBudget: 0 },
    })
  );
  return textOf(data);
}

export async function geminiJSON<T>(system: string, turns: Turn[], schema: object, opts?: GenerationOpts): Promise<T> {
  const data = await callGemini(
    toRequest(system, turns, {
      maxOutputTokens: opts?.maxTokens ?? 700,
      temperature: opts?.temperature ?? 0.6,
      thinkingConfig: { thinkingBudget: 0 },
      responseMimeType: "application/json",
      responseSchema: schema,
    })
  );
  return JSON.parse(textOf(data) || "{}") as T;
}
