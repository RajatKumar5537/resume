"use client";

import Link from "next/link";
import { signOut } from "next-auth/react";
import { usePathname } from "next/navigation";

export function Shell({ children }: { children: React.ReactNode }) {
  const path = usePathname();
  if (path === "/login") {
    return <main className="auth-main">{children}</main>;
  }
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
          <button
            className="nav-button"
            type="button"
            onClick={() => {
              if (!window.confirm("Sign out of Desk?")) return;
              signOut({ callbackUrl: "/login" });
            }}
          >
            Sign out
          </button>
        </nav>
      </header>
      <main>{children}</main>
    </>
  );
}
