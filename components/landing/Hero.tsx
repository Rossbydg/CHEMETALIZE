import { css } from "@/lib/style";
import HomeClient from "@/app/HomeClient";

export default function Hero() {
  return (
    <section style={css("max-width:var(--page-max-width);margin:0 auto;padding:40px 26px 0;display:flex;flex-direction:column;gap:24px")}>
      <div style={css("display:flex;flex-direction:column;align-items:center;gap:20px;text-align:center;padding:20px 0 12px")}>
        <div style={css("font-size:12px;font-weight:500;letter-spacing:.12em;text-transform:uppercase;color:#bbc7c6")}>
          Your AI Sales Team
        </div>
        <h1 style={css("font-family:var(--font-matter);font-weight:500;line-height:1;letter-spacing:-.02em;color:#ffffff;font-size:clamp(2.2rem,5vw,3.6rem);max-width:820px;margin:0")}>
          Your sales team that never stops working.
        </h1>
        <p style={css("font-size:16px;line-height:1.5;color:#bbc7c6;max-width:560px;margin:0")}>
          Agentic Sales Team finds brands, pitches them in your voice, prices the deal, follows up, and books the call — so you can focus on making content.
        </p>
      </div>
      <HomeClient />
    </section>
  );
}
