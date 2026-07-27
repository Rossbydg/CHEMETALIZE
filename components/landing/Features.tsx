import { css } from "@/lib/style";
import ScrollReveal from "@/components/ScrollReveal";

const FEATURES = [
  { title: "Finds brands", body: "Your Research agent scans the web for brands already sponsoring creators in your niche, and drops them into a queue for you to approve." },
  { title: "Pitches in your voice", body: "Initial Outreach writes a personalized first-touch pitch as you — a polished email if the brand has one, a short DM if it only has a profile." },
  { title: "Prices the deal", body: "Proposal drafts a scoped, priced proposal grounded in your audience, your rates, and what the brand actually needs." },
  { title: "Stays on it", body: "Follow-up re-engages brands that went quiet, with a short, polite nudge that builds on what was already said." },
  { title: "Books the call", body: "Scheduler locks in the brand call the moment they're ready — just tell it the day and time in plain English." },
  { title: "Shows you everything, live", body: "The dashboard lights up as your team works — who's active, what they're doing, and what's been booked this month." },
];

export default function Features() {
  return (
    <section id="features" style={css("max-width:var(--page-max-width);margin:0 auto;padding:88px 26px;display:flex;flex-direction:column;gap:40px")}>
      <div style={css("display:flex;flex-direction:column;gap:12px;text-align:center")}>
        <div style={css("font-size:12px;font-weight:500;letter-spacing:.12em;text-transform:uppercase;color:#bbc7c6")}>What it does</div>
        <h2 style={css("font-family:var(--font-matter);font-weight:500;font-size:clamp(1.6rem,3vw,2.25rem);line-height:1;letter-spacing:-.01em;color:#ffffff;margin:0")}>
          A full deal team, minus the headcount.
        </h2>
      </div>
      <div className="features-grid" style={css("display:grid;gap:20px")}>
        {FEATURES.map((f) => (
          <ScrollReveal key={f.title}>
            <div style={css("background:#003734;border-radius:16px;padding:36px;height:100%")}>
              <h3 style={css("font-family:var(--font-matter);font-weight:500;font-size:20px;color:#ffffff;margin:0 0 12px;line-height:1.3")}>{f.title}</h3>
              <p style={css("font-size:16px;line-height:1.4;color:#bbc7c6;margin:0")}>{f.body}</p>
            </div>
          </ScrollReveal>
        ))}
      </div>
    </section>
  );
}
