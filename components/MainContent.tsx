"use client";

import { usePathname } from "next/navigation";

export default function MainContent({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isDoublesRoute = pathname.startsWith("/doubles");

  if (isDoublesRoute) {
    return <main className="w-full flex-1">{children}</main>;
  }

  return <main className="mx-auto w-full max-w-[1400px] flex-1 px-6 pb-12 pt-0">{children}</main>;
}
