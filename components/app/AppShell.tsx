"use client";
import { useState } from "react";
import type { ReactNode } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { SignOutButton } from "@clerk/nextjs";
import { css } from "@/lib/style";
import NotificationsBell from "./NotificationsBell";

const NAV_ITEMS = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/deals", label: "Deals" },
  { href: "/agents", label: "Agents" },
  { href: "/chat", label: "Chat" },
  { href: "/calendar", label: "Calendar" },
  { href: "/analytics", label: "Analytics" },
  { href: "/profile", label: "Profile" },
  { href: "/settings", label: "Settings" },
];

export default function AppShell({ userName, children }: { userName: string; children: ReactNode }) {
  const pathname = usePathname();
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchValue, setSearchValue] = useState("");

  return (
    <div style={css("display:flex;min-height:100dvh;background:#012624")}>
      <aside style={css("width:220px;flex:none;background:#011d1c;border-right:1px solid rgba(255,255,255,.06);display:flex;flex-direction:column;padding:24px 16px")}>
        <div style={css("font-family:var(--font-matter);font-size:15px;font-weight:500;color:#ffffff;padding:0 8px 24px")}>
          Agentic Sales Team
        </div>
        <nav style={css("display:flex;flex-direction:column;gap:2px;flex:1")}>
          {NAV_ITEMS.map((item) => {
            const active = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                style={css(
                  "display:block;padding:9px 12px;border-radius:6px;font-size:13px;letter-spacing:.02em;font-weight:" +
                    (active ? "500" : "400") +
                    ";color:" +
                    (active ? "#ffffff" : "#bbc7c6") +
                    ";background:" +
                    (active ? "rgba(0,194,184,.14)" : "transparent")
                )}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>
        <div style={css("border-top:1px solid rgba(255,255,255,.08);padding-top:16px;display:flex;flex-direction:column;gap:10px")}>
          <div style={css("font-size:13px;font-weight:500;color:#edfffe;padding:0 8px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap")}>
            {userName}
          </div>
          <SignOutButton redirectUrl="/">
            <button
              style={css(
                "text-align:left;background:none;border:none;padding:0 8px;font-size:11px;letter-spacing:.1em;text-transform:uppercase;color:#bbc7c6;cursor:pointer"
              )}
            >
              Log out
            </button>
          </SignOutButton>
        </div>
      </aside>

      <div style={css("flex:1;min-width:0;display:flex;flex-direction:column")}>
        <header style={css("height:64px;flex:none;display:flex;align-items:center;justify-content:flex-end;padding:0 28px;border-bottom:1px solid rgba(255,255,255,.06)")}>
          <div style={css("display:flex;align-items:center;gap:8px")}>
            {searchOpen && (
              <input
                autoFocus
                value={searchValue}
                onChange={(e) => setSearchValue(e.target.value)}
                onBlur={() => {
                  if (!searchValue) setSearchOpen(false);
                }}
                placeholder="Search brands, agents…"
                style={css(
                  "background:#003734;border:1px solid rgba(255,255,255,.14);border-radius:6px;padding:8px 12px;font-size:13px;color:#edfffe;width:240px;outline:none"
                )}
              />
            )}
            <button
              onClick={() => setSearchOpen((s) => !s)}
              aria-label="Search"
              style={css("background:none;border:none;cursor:pointer;color:#bbc7c6;padding:6px;display:flex")}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="10.5" cy="10.5" r="6.5" />
                <path d="m20 20-5-5" />
              </svg>
            </button>
            <NotificationsBell />
          </div>
        </header>
        <main style={css("flex:1;min-width:0")}>{children}</main>
      </div>
    </div>
  );
}
