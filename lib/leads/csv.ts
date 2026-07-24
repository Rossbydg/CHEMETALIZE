import type { CreateLeadInput } from "./types";

const HEADER_ALIASES: Record<"name" | "company" | "email" | "platform", string[]> = {
  name: ["name", "contact", "contact name", "full name"],
  company: ["company", "brand", "brand name", "organization"],
  email: ["email", "e-mail", "contact email"],
  platform: ["platform", "channel", "social platform"],
};

function parseCsvLine(line: string): string[] {
  const cells: string[] = [];
  let cur = "";
  let inQuotes = false;
  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (inQuotes) {
      if (ch === '"') {
        if (line[i + 1] === '"') {
          cur += '"';
          i++;
        } else {
          inQuotes = false;
        }
      } else {
        cur += ch;
      }
    } else if (ch === '"') {
      inQuotes = true;
    } else if (ch === ",") {
      cells.push(cur);
      cur = "";
    } else {
      cur += ch;
    }
  }
  cells.push(cur);
  return cells.map((c) => c.trim());
}

// Parses a CSV with a header row, matching columns by common aliases (case-insensitive).
// Rows with neither a name nor a company (nothing to call the brand) are skipped.
export function parseLeadsCsv(text: string): CreateLeadInput[] {
  const lines = text.split(/\r?\n/).filter((l) => l.trim().length > 0);
  if (lines.length < 2) return [];

  const header = parseCsvLine(lines[0]).map((h) => h.toLowerCase());
  const colFor = (field: keyof typeof HEADER_ALIASES) => header.findIndex((h) => HEADER_ALIASES[field].includes(h));

  const nameCol = colFor("name");
  const companyCol = colFor("company");
  const emailCol = colFor("email");
  const platformCol = colFor("platform");

  const out: CreateLeadInput[] = [];
  for (const line of lines.slice(1)) {
    const cells = parseCsvLine(line);
    const name = nameCol >= 0 ? cells[nameCol] : "";
    const company = companyCol >= 0 ? cells[companyCol] : "";
    const displayName = name || company;
    if (!displayName) continue;

    out.push({
      name: displayName,
      company: company || undefined,
      email: emailCol >= 0 ? cells[emailCol] || undefined : undefined,
      platform: platformCol >= 0 ? cells[platformCol] || undefined : undefined,
    });
  }
  return out;
}
