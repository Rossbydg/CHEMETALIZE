import "server-only";

const TIMEOUT_MS = 20000;

export function isFirecrawlConfigured(): boolean {
  return !!process.env.FIRECRAWL_API_KEY;
}

export interface SearchResult {
  url: string;
  title: string;
  description: string;
}

export async function searchBrands(query: string, limit = 8): Promise<SearchResult[]> {
  const key = process.env.FIRECRAWL_API_KEY;
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);
  try {
    const res = await fetch("https://api.firecrawl.dev/v2/search", {
      method: "POST",
      headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
      body: JSON.stringify({ query, limit }),
      signal: controller.signal,
    });
    if (!res.ok) throw new Error(`Firecrawl error ${res.status}: ${await res.text()}`);

    const data = await res.json();
    const web = data?.data?.web ?? (Array.isArray(data?.data) ? data.data : []);
    return (Array.isArray(web) ? web : []).map((w: { url?: string; title?: string; description?: string }) => ({
      url: w.url ?? "",
      title: w.title ?? "",
      description: w.description ?? "",
    }));
  } finally {
    clearTimeout(timer);
  }
}
