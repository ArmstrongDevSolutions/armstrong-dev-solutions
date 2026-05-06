"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { House, X } from "lucide-react";
import { supabase } from "@/lib/supabaseClient";
import ThemeToggle from "@/components/ThemeToggle";
import { useIsMobile } from "@/components/doubles/useIsMobile";

const navLinks = [
  { href: "/about", label: "About" },
  { href: "/services", label: "Services" },
  { href: "/projects", label: "Projects" },
  { href: "/contact", label: "Contact" },
];

export default function Navbar() {
  const pathname = usePathname();
  const isDoublesRoute = pathname.startsWith("/doubles");
  const isMobile = useIsMobile();
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [isSigningOut, setIsSigningOut] = useState(false);

  if (isDoublesRoute) {
    function handleReturnHome(e: React.MouseEvent<HTMLAnchorElement>) {
      e.preventDefault();
      setShowLogoutModal(true);
    }

    async function handleConfirmSignOut() {
      setIsSigningOut(true);
      await supabase.auth.signOut();
      const isLocalDev =
        window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1";
      window.location.href = isLocalDev
        ? `${window.location.origin}/`
        : "https://www.armstrongdevsolutions.com";
    }

    return (
      <header className="sticky top-0 z-50 shrink-0 bg-[#002b4d]">
        <div className="mx-auto flex w-full max-w-[1400px] items-center justify-between gap-4 px-5 py-4 sm:px-8">
          <h1 className="m-0 text-lg font-bold text-white sm:text-xl">
            Random Doubles:
            <br className="sm:hidden" />
            <span className="sm:ml-1">Player Check-In</span>
          </h1>
          <a
            href="https://www.armstrongdevsolutions.com"
            onClick={handleReturnHome}
            className="inline-flex items-center justify-center text-[#00b4d8] no-underline transition-opacity hover:opacity-85"
            aria-label="Return to Armstrong Dev Solutions home"
          >
            <House className="h-5 w-5 sm:hidden" />
            <span className="hidden text-sm font-semibold sm:inline sm:text-base">← Armstrong Dev Solutions</span>
          </a>
        </div>
        {showLogoutModal ? (
          <div
            onClick={() => setShowLogoutModal(false)}
            style={{
              position: "fixed",
              inset: 0,
              background: "rgba(0, 20, 40, 0.55)",
              backdropFilter: "blur(3px)",
              display: "flex",
              alignItems: isMobile ? "flex-end" : "center",
              justifyContent: "center",
              zIndex: 1000,
              padding: isMobile ? "0" : "24px",
            }}
          >
            <div
              onClick={(e) => e.stopPropagation()}
              style={{
                background: "#ffffff",
                borderRadius: isMobile ? "20px 20px 0 0" : "20px",
                boxShadow: "0 24px 64px rgba(0,43,77,0.22), 0 4px 16px rgba(0,43,77,0.1)",
                width: "100%",
                maxWidth: isMobile ? "100%" : "480px",
                maxHeight: isMobile ? "92vh" : "90vh",
                display: "flex",
                flexDirection: "column",
                overflow: "hidden",
              }}
            >
              <div
                style={{
                  padding: "22px 28px 18px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  background: "linear-gradient(135deg, #002b4d 0%, #003d66 100%)",
                }}
              >
                <div>
                  <h2 style={{ color: "#ffffff", margin: 0, fontSize: "18px" }}>Sign Out</h2>
                </div>
                <button
                  onClick={() => setShowLogoutModal(false)}
                  style={{
                    width: "34px",
                    height: "34px",
                    borderRadius: "8px",
                    border: "1px solid rgba(255,255,255,0.2)",
                    background: "rgba(255,255,255,0.08)",
                    color: "#ffffff",
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <X size={16} />
                </button>
              </div>

              <div style={{ padding: isMobile ? "20px" : "24px 28px" }}>
                <p style={{ margin: 0, fontSize: "15px", color: "#334155", lineHeight: 1.6 }}>
                  Are you sure you want to sign out?
                </p>
              </div>

              <div
                style={{
                  padding: isMobile ? "16px 20px" : "18px 28px",
                  borderTop: "1px solid #e2e8f0",
                  display: "flex",
                  gap: "10px",
                  background: "#f8fafc",
                  paddingBottom: isMobile ? "calc(16px + env(safe-area-inset-bottom, 0px))" : "18px",
                }}
              >
                <button
                  onClick={() => setShowLogoutModal(false)}
                  style={{
                    flex: 1,
                    padding: "14px",
                    borderRadius: "12px",
                    border: "1.5px solid #e2e8f0",
                    background: "#ffffff",
                    color: "#475569",
                    fontSize: "15px",
                    fontWeight: 600,
                    cursor: "pointer",
                  }}
                >
                  Cancel
                </button>
                <button
                  onClick={handleConfirmSignOut}
                  disabled={isSigningOut}
                  style={{
                    flex: 2,
                    padding: "14px",
                    borderRadius: "12px",
                    border: "none",
                    background: isSigningOut ? "#93c5fd" : "#0077cc",
                    color: "#ffffff",
                    fontSize: "15px",
                    fontWeight: 600,
                    cursor: isSigningOut ? "not-allowed" : "pointer",
                    boxShadow: isSigningOut ? "none" : "0 2px 10px rgba(0,119,204,0.28)",
                  }}
                >
                  {isSigningOut ? "Signing out..." : "Sign Out"}
                </button>
              </div>
            </div>
          </div>
        ) : null}
      </header>
    );
  }

  return (
    <header className="shrink-0 bg-[var(--surface-header)] backdrop-blur">
      <div className="mx-auto grid w-full max-w-6xl grid-cols-[1fr_auto_1fr] items-start gap-x-3 gap-y-2 px-6 py-3 sm:gap-x-4 sm:py-3.5">
        <Link
          href="/"
          className="min-w-0 justify-self-start pt-0.5 text-base font-semibold leading-tight tracking-tight text-[var(--foreground)] sm:text-lg"
        >
          Armstrong Dev Solutions 🤘
        </Link>

        <nav
          className="flex max-w-full shrink-0 flex-nowrap justify-center gap-1.5 sm:gap-2"
          aria-label="Primary"
        >
          {navLinks.map((link) => {
            const isActive = pathname.startsWith(link.href);

            return (
              <Link
                key={link.href}
                href={link.href}
                className={`rounded-md px-2.5 py-2 text-sm transition-colors sm:px-3 ${
                  isActive
                    ? "bg-[var(--accent)] font-medium text-[var(--accent-foreground)]"
                    : link.href === "/projects"
                      ? "border border-[var(--accent)] bg-[var(--surface)] font-medium text-[var(--foreground)] hover:bg-[var(--border-strong)] dark:border-transparent dark:bg-transparent dark:text-[var(--elephant-400)] dark:hover:bg-[var(--elephant-900)]/60"
                      : "text-[var(--foreground-muted)] hover:bg-[var(--surface)] hover:text-[var(--foreground)] dark:hover:bg-[var(--surface-hover)]"
                }`}
              >
                {link.label}
              </Link>
            );
          })}
        </nav>

        <div className="flex justify-self-end pt-0.5">
          <ThemeToggle />
        </div>
      </div>
    </header>
  );
}
