import { auth } from "@clerk/nextjs/server";
import { UserButton } from "@clerk/nextjs";
import { css } from "@/lib/style";
import { Box } from "@/components/primitives";

export default async function Nav() {
  const { userId } = await auth();

  return (
    <header style={css("position:relative;z-index:5;max-width:var(--page-max-width);margin:0 auto;height:80px;display:flex;align-items:center;justify-content:space-between;padding:0 26px")}>
      <div style={css("font-family:var(--font-matter);font-size:16px;font-weight:500;letter-spacing:-.01em;color:#ffffff")}>
        Agentic Sales Team
      </div>
      <nav style={css("display:flex;gap:24px;align-items:center")}>
        <a href="#features" style={css("font-size:12px;font-weight:400;letter-spacing:.12em;text-transform:uppercase;color:#bbc7c6")}>Features</a>
        <a href="#how-it-works" style={css("font-size:12px;font-weight:400;letter-spacing:.12em;text-transform:uppercase;color:#bbc7c6")}>How it works</a>
        <a href="#who-its-for" style={css("font-size:12px;font-weight:400;letter-spacing:.12em;text-transform:uppercase;color:#bbc7c6")}>Who it&apos;s for</a>
      </nav>
      <div style={css("display:flex;align-items:center;gap:20px")}>
        {userId ? (
          <>
            <a href="/dashboard" style={css("font-size:12px;font-weight:400;letter-spacing:.12em;text-transform:uppercase;color:#ffffff")}>Dashboard</a>
            <UserButton />
          </>
        ) : (
          <>
            <a href="/sign-in" style={css("font-size:12px;font-weight:400;letter-spacing:.12em;text-transform:uppercase;color:#ffffff")}>Log in</a>
            <Box
              as="span"
              style="display:inline-flex;align-items:center;font-size:13px;font-weight:400;letter-spacing:.04em;text-transform:uppercase;color:#1a1a1a;background:linear-gradient(90deg,#cbfffc 0%,#edfffe 26%,#fffdfa 48%,#fad1ff 89%);border-radius:6px;padding:10px 22px;cursor:pointer;"
              styleHover="opacity:.9"
            >
              <a href="/sign-up" style={css("color:inherit")}>Sign up</a>
            </Box>
          </>
        )}
      </div>
    </header>
  );
}
