import { css } from "@/lib/style";
import ScrollReveal from "@/components/ScrollReveal";

export default function WhoItsFor() {
  return (
    <section id="who-its-for" style={css("max-width:var(--page-max-width);margin:0 auto;padding:88px 26px")}>
      <ScrollReveal>
        <div style={css("display:flex;flex-direction:column;gap:16px;max-width:640px")}>
          <div style={css("font-size:12px;font-weight:500;letter-spacing:.12em;text-transform:uppercase;color:#bbc7c6")}>Who it&apos;s for</div>
          <h2 style={css("font-family:var(--font-matter);font-weight:500;font-size:clamp(1.6rem,3vw,2.25rem);line-height:1.1;letter-spacing:-.01em;color:#ffffff;margin:0")}>
            Creators who want brand deals, not a second job chasing them.
          </h2>
          <p style={css("font-size:16px;line-height:1.5;color:#bbc7c6;margin:0")}>
            If you don&apos;t have the time, or a human manager, to find brands, write pitches, and follow up — this is that manager. It works your niche, your voice, and your rates, every day.
          </p>
        </div>
      </ScrollReveal>
    </section>
  );
}
