import { css } from "@/lib/style";
import ScrollReveal from "@/components/ScrollReveal";

const ICONS = {
  profile: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="12" cy="8" r="4" />
      <path d="M4 20c0-4.4 3.6-7 8-7s8 2.6 8 7" />
    </svg>
  ),
  team: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="6" cy="6" r="2.3" />
      <circle cx="18" cy="6" r="2.3" />
      <circle cx="12" cy="18" r="2.3" />
      <path d="M8 7.3 10.5 16M16 7.3 13.5 16M8.3 6h7.4" />
    </svg>
  ),
  check: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M5 13l4 4L19 7" />
    </svg>
  ),
};

const STEPS = [
  { n: "01", icon: ICONS.profile, title: "Tell us who you are", body: "Fill in your niche, audience, platforms, and rates once — your Media Kit. Every helper grounds its work in it." },
  { n: "02", icon: ICONS.team, title: "Your team gets to work", body: "Agents discover brands, research them, and draft pitches, proposals, and follow-ups — solo, or working the book together." },
  { n: "03", icon: ICONS.check, title: "You approve and close", body: "Review discovered brands, open a pitch in your own mail app to send it, and watch booked calls land on your calendar." },
];

export default function HowItWorks() {
  return (
    <section id="how-it-works" style={css("background:#011d1c;padding:88px 26px")}>
      <div style={css("max-width:var(--page-max-width);margin:0 auto;display:flex;flex-direction:column;gap:40px")}>
        <div style={css("display:flex;flex-direction:column;gap:12px;text-align:center")}>
          <div style={css("font-size:12px;font-weight:500;letter-spacing:.12em;text-transform:uppercase;color:#bbc7c6")}>How it works</div>
          <h2 style={css("font-family:var(--font-matter);font-weight:500;font-size:clamp(1.6rem,3vw,2.25rem);line-height:1;letter-spacing:-.01em;color:#ffffff;margin:0")}>
            Three steps. No chasing.
          </h2>
        </div>
        <div style={css("display:grid;grid-template-columns:repeat(auto-fit,minmax(240px,1fr));gap:32px")}>
          {STEPS.map((s) => (
            <ScrollReveal key={s.n}>
              <div style={css("display:flex;flex-direction:column;gap:10px")}>
                <div style={css("width:44px;height:44px;border-radius:50%;background:rgba(0,194,184,.14);border:1px solid rgba(0,194,184,.3);color:#00e5d0;display:flex;align-items:center;justify-content:center")}>
                  {s.icon}
                </div>
                <div style={css("font-family:var(--font-matter);font-weight:500;font-size:36px;color:#fde9ff;letter-spacing:-.02em;line-height:1")}>{s.n}</div>
                <h3 style={css("font-family:var(--font-matter);font-weight:500;font-size:18px;color:#ffffff;margin:0")}>{s.title}</h3>
                <p style={css("font-size:16px;line-height:1.4;color:#bbc7c6;margin:0")}>{s.body}</p>
              </div>
            </ScrollReveal>
          ))}
        </div>
      </div>
    </section>
  );
}
