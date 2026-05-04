"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import ThemeToggle from "@/components/ThemeToggle";

const navLinks = [
  { href: "/about", label: "About" },
  { href: "/services", label: "Services" },
  { href: "/projects", label: "Projects" },
  { href: "/contact", label: "Contact" },
];

export default function Navbar() {
  const pathname = usePathname();

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
