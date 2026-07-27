import Nav from "@/components/landing/Nav";
import Footer from "@/components/landing/Footer";
import BookDemoForm from "@/components/landing/BookDemoForm";
import { css } from "@/lib/style";

export const metadata = { title: "Book a Demo — Agentic Sales Team" };

export default function DemoPage() {
  return (
    <main>
      <Nav />
      <section style={css("max-width:560px;margin:0 auto;padding:clamp(14px,4vw,20px) clamp(16px,5vw,26px) 100px")}>
        <div style={css("font-size:12px;font-weight:500;letter-spacing:.12em;text-transform:uppercase;color:#bbc7c6")}>Book a demo</div>
        <h1 style={css("font-family:var(--font-matter);font-weight:500;font-size:clamp(1.6rem,4vw,2.1rem);color:#ffffff;margin:8px 0 12px")}>
          See your sales team in action.
        </h1>
        <p style={css("font-size:15px;line-height:1.6;color:#bbc7c6;margin:0 0 28px")}>
          Pick a time and we&apos;ll walk you through how Agentic Sales Team finds brands, pitches them in your voice,
          and books the call.
        </p>
        <BookDemoForm />
      </section>
      <Footer />
    </main>
  );
}
