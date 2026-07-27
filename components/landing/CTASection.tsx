import { css } from "@/lib/style";
import { Box } from "@/components/primitives";
import ScrollReveal from "@/components/ScrollReveal";

export default function CTASection() {
  return (
    <section style={css("background:#011d1c;padding:120px 26px")}>
      <ScrollReveal>
        <div style={css("max-width:640px;margin:0 auto;display:flex;flex-direction:column;align-items:center;gap:28px;text-align:center")}>
          <h2 style={css("font-family:var(--font-matter);font-weight:500;font-size:clamp(1.8rem,4vw,2.75rem);line-height:1.05;letter-spacing:-.02em;color:#ffffff;margin:0")}>
            Ready to put your sales team to work?
          </h2>
          <div style={css("display:flex;gap:12px;flex-wrap:wrap;justify-content:center")}>
            <Box
              as="span"
              style="display:inline-flex;align-items:center;font-size:13px;font-weight:400;letter-spacing:.04em;text-transform:uppercase;color:#1a1a1a;background:linear-gradient(90deg,#cbfffc 0%,#edfffe 26%,#fffdfa 48%,#fad1ff 89%);border-radius:6px;padding:14px 28px;cursor:pointer;"
              styleHover="opacity:.9"
            >
              <a href="/sign-up" style={css("color:inherit")}>Sign up free</a>
            </Box>
            <Box
              as="span"
              style="display:inline-flex;align-items:center;font-size:13px;font-weight:400;letter-spacing:.04em;text-transform:uppercase;color:#edfffe;background:none;border:1px solid rgba(255,255,255,.24);border-radius:6px;padding:14px 28px;cursor:pointer;"
              styleHover="border-color:#cbfffc"
            >
              <a href="/demo" style={css("color:inherit")}>Book a demo</a>
            </Box>
          </div>
        </div>
      </ScrollReveal>
    </section>
  );
}
