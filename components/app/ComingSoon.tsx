import { css } from "@/lib/style";

export default function ComingSoon({ title }: { title: string }) {
  return (
    <div style={css("padding:36px 40px;display:flex;flex-direction:column;gap:12px")}>
      <div style={css("font-size:12px;font-weight:500;letter-spacing:.12em;text-transform:uppercase;color:#bbc7c6")}>{title}</div>
      <h1 style={css("font-family:var(--font-matter);font-weight:500;font-size:28px;color:#ffffff;margin:0")}>Coming soon</h1>
      <p style={css("font-size:15px;color:#bbc7c6;max-width:480px;line-height:1.5;margin:0")}>
        We&apos;ll build this section together soon.
      </p>
    </div>
  );
}
