import Nav from "@/components/landing/Nav";
import Footer from "@/components/landing/Footer";
import { css } from "@/lib/style";

const h2 = "font-family:var(--font-matter);font-weight:500;font-size:20px;color:#ffffff;margin:32px 0 10px";
const p = "font-size:15px;line-height:1.6;color:#bbc7c6;margin:0 0 12px";
const li = "font-size:15px;line-height:1.6;color:#bbc7c6;margin:0 0 8px";

export const metadata = { title: "Privacy Policy — Agentic Sales Team" };

export default function PrivacyPage() {
  return (
    <main>
      <Nav />
      <section style={css("max-width:720px;margin:0 auto;padding:20px 26px 80px")}>
        <div style={css("font-size:12px;font-weight:500;letter-spacing:.12em;text-transform:uppercase;color:#bbc7c6")}>Legal</div>
        <h1 style={css("font-family:var(--font-matter);font-weight:500;font-size:32px;color:#ffffff;margin:8px 0 24px")}>Privacy Policy</h1>

        <p style={css(p)}>
          Agentic Sales Team is a single-user dashboard. This page explains what data the app stores and how it&apos;s
          used.
        </p>

        <h2 style={css(h2)}>Data we collect</h2>
        <ul style={css("padding-left:20px;margin:0 0 12px")}>
          <li style={css(li)}>Account info from sign-in (name, email) via our authentication provider.</li>
          <li style={css(li)}>Profile details you enter yourself: niche, bio, rates, platform stats, audience info.</li>
          <li style={css(li)}>Brand/lead research, drafted outreach, proposals, follow-ups, and meetings you create or that the app&apos;s agents generate on your behalf.</li>
          <li style={css(li)}>
            If you connect a TikTok account: your public profile photo and public follower statistics, retrieved via
            TikTok&apos;s Login Kit using the <code>user.info.basic</code> and <code>user.info.stats</code> scopes. We do
            not request or store TikTok private messages, posting permissions, or content.
          </li>
        </ul>

        <h2 style={css(h2)}>How we use it</h2>
        <p style={css(p)}>
          Data is used only to run the dashboard for the account holder: displaying stats and activity, drafting
          outreach in your voice, and tracking your deal pipeline. TikTok profile data is shown on your own
          dashboard and profile &mdash; it is never shared with brands, other users, or third parties.
        </p>

        <h2 style={css(h2)}>Storage</h2>
        <p style={css(p)}>
          Data is stored in our hosted database (Neon Postgres) and is only accessible to the signed-in account
          holder it belongs to.
        </p>

        <h2 style={css(h2)}>Third parties</h2>
        <p style={css(p)}>
          We use Clerk for authentication, Neon for database hosting, and TikTok&apos;s Login Kit for connected-account
          data — each governed by its own privacy policy. We do not sell or share your data for advertising.
        </p>

        <h2 style={css(h2)}>Disconnecting and deletion</h2>
        <p style={css(p)}>
          You can disconnect TikTok at any time from Settings, which stops future syncing and removes the stored
          TikTok profile data. To request full account deletion, contact the account holder directly.
        </p>
      </section>
      <Footer />
    </main>
  );
}
