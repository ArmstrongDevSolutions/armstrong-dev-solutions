"use client";

import { usePathname } from "next/navigation";

export default function Footer() {
  const pathname = usePathname();
  const isDoublesRoute = pathname.startsWith("/doubles");

  return (
    <footer className="border-t border-[var(--border)] bg-[var(--surface-header)]">
      <div
        className={`flex w-full flex-col gap-2 px-6 py-8 text-sm text-[var(--foreground-muted)] sm:flex-row sm:items-center sm:justify-between ${
          isDoublesRoute ? "sm:px-8" : "mx-auto max-w-6xl"
        }`}
      >
        <p>© {new Date().getFullYear()} Armstrong Dev Solutions</p>
        <p className="text-[var(--foreground)]">Built by Mike Armstrong 🤘</p>
      </div>
    </footer>
  );
}
