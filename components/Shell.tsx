"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export function Shell({ children }: { children: React.ReactNode }) {
  const path = usePathname();
  return (
    <>
      <header className="topbar no-print">
        <Link href="/" className="brand">
          Desk <span>Resumes</span>
        </Link>
        <nav>
          <Link href="/" data-active={path === "/"}>
            New resume
          </Link>
          <Link href="/profile" data-active={path.startsWith("/profile")}>
            Master profile
          </Link>
        </nav>
      </header>
      <main>{children}</main>
    </>
  );
}
