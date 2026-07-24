"use client";
import { useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { css } from "@/lib/style";
import { importLeadsCsv } from "@/lib/leads/actions";

export default function CsvImportPanel({ onClose }: { onClose: () => void }) {
  const router = useRouter();
  const fileRef = useRef<HTMLInputElement>(null);
  const [csvText, setCsvText] = useState("");
  const [result, setResult] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function onFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => setCsvText(String(reader.result ?? ""));
    reader.readAsText(file);
  }

  function submit() {
    if (!csvText.trim()) return;
    startTransition(async () => {
      const res = await importLeadsCsv(csvText);
      setResult(`Imported ${res.imported} brand${res.imported === 1 ? "" : "s"}.`);
      router.refresh();
    });
  }

  return (
    <div style={css("background:#003734;border-radius:16px;padding:24px;display:flex;flex-direction:column;gap:14px;max-width:520px")}>
      <div style={css("font-size:15px;font-weight:500;color:#ffffff")}>Import a CSV</div>
      <p style={css("font-size:12.5px;color:#bbc7c6;margin:0;line-height:1.5")}>
        Columns are matched by name — name/contact, company/brand, email, platform/channel. Extra columns are ignored.
      </p>

      <input ref={fileRef} type="file" accept=".csv,text/csv" onChange={onFile} style={css("font-size:12px;color:#bbc7c6")} />

      <textarea
        value={csvText}
        onChange={(e) => setCsvText(e.target.value)}
        placeholder={"name,company,email,platform\nJane Doe,Northwind Coffee,jane@northwind.com,Instagram"}
        style={css(
          "background:#012624;border:1px solid rgba(255,255,255,.14);border-radius:6px;padding:10px 12px;font-size:12.5px;font-family:monospace;color:#edfffe;outline:none;min-height:120px;resize:vertical"
        )}
      />

      {result && <div style={css("font-size:12.5px;color:#00e5d0")}>{result}</div>}

      <div style={css("display:flex;gap:10px")}>
        <button
          onClick={submit}
          disabled={isPending || !csvText.trim()}
          style={css(
            "background:#00c2b8;border:none;border-radius:6px;padding:10px 20px;font-size:13px;font-weight:500;color:#012624;cursor:pointer;" +
              (isPending || !csvText.trim() ? "opacity:.6" : "")
          )}
        >
          {isPending ? "Importing…" : "Import"}
        </button>
        <button onClick={onClose} style={css("background:none;border:none;font-size:13px;color:#bbc7c6;cursor:pointer;padding:10px 4px")}>
          Close
        </button>
      </div>
    </div>
  );
}
