import { css } from "@/lib/style";

export default function Footer() {
  return (
    <footer style={css("background:#011d1c;padding:36px 26px;border-top:1px solid rgba(255,255,255,.06)")}>
      <div style={css("max-width:var(--page-max-width);margin:0 auto;display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:12px")}>
        <div style={css("font-family:var(--font-matter);font-size:14px;font-weight:500;color:#ffffff")}>Agentic Sales Team</div>
        <div style={css("display:flex;align-items:center;gap:16px")}>
          <a href="/terms" style={css("font-size:13px;color:#707777")}>Terms</a>
          <a href="/privacy" style={css("font-size:13px;color:#707777")}>Privacy</a>
          <div style={css("font-size:13px;color:#707777")}>© 2026 Agentic Sales Team. All rights reserved.</div>
        </div>
      </div>
    </footer>
  );
}
