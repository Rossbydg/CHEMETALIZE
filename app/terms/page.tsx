import Nav from "@/components/landing/Nav";
import Footer from "@/components/landing/Footer";
import { css } from "@/lib/style";

const h2 = "font-family:var(--font-matter);font-weight:500;font-size:20px;color:#ffffff;margin:32px 0 10px";
const p = "font-size:15px;line-height:1.6;color:#bbc7c6;margin:0 0 12px";

export const metadata = { title: "Terms of Service — Agentic Sales Team" };

export default function TermsPage() {
  return (
    <main>
      <Nav />
      <section style={css("max-width:720px;margin:0 auto;padding:clamp(14px,4vw,20px) clamp(16px,5vw,26px) 80px")}>
        <div style={css("font-size:12px;font-weight:500;letter-spacing:.12em;text-transform:uppercase;color:#bbc7c6")}>Legal</div>
        <h1 style={css("font-family:var(--font-matter);font-weight:500;font-size:32px;color:#ffffff;margin:8px 0 24px")}>Terms of Service</h1>

        <p style={css(p)}>
          Agentic Sales Team (&quot;the app&quot;, &quot;we&quot;) is a single-user dashboard that helps a creator find brand deals,
          draft outreach, track proposals and follow-ups, and manage their sales pipeline. These terms apply to
          the account holder using the app at chemetalize.vercel.app.
        </p>

        <h2 style={css(h2)}>Use of the app</h2>
        <p style={css(p)}>
          The app is provided for the account holder&apos;s personal, professional use in managing their own brand-deal
          pipeline. You are responsible for the accuracy of information you enter and for any messages sent to
          brands or contacts through the app.
        </p>

        <h2 style={css(h2)}>Connected accounts</h2>
        <p style={css(p)}>
          You may connect third-party accounts, including TikTok, to automatically populate profile information
          such as your display photo and public follower statistics. You can disconnect a connected account at any
          time from Settings, which stops further data syncing from that provider.
        </p>

        <h2 style={css(h2)}>No warranty</h2>
        <p style={css(p)}>
          The app is provided &quot;as is&quot; without warranties of any kind. Drafted messages, pricing suggestions, and
          research briefs are generated to assist you and should be reviewed before you rely on or send them.
        </p>

        <h2 style={css(h2)}>Changes</h2>
        <p style={css(p)}>
          These terms may be updated as the app evolves. Continued use of the app after a change means you accept
          the updated terms.
        </p>

        <h2 style={css(h2)}>Contact</h2>
        <p style={css(p)}>Questions about these terms can be sent to the account holder directly.</p>
      </section>
      <Footer />
    </main>
  );
}
