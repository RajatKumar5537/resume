"use client";

import { signOut, useSession } from "next-auth/react";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

function currentTheme(): "light" | "dark" {
  const chosen = document.documentElement.getAttribute("data-theme");
  if (chosen === "dark" || chosen === "light") return chosen;
  return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}

function DeskLink({
  href,
  active,
  className,
  children,
}: {
  href: string;
  active?: boolean;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <a href={href} className={className} data-active={active || undefined}>
      {children}
    </a>
  );
}

function ThemeToggle() {
  const [theme, setTheme] = useState<"light" | "dark" | "">("");

  useEffect(() => {
    const apply = () => setTheme(currentTheme());
    apply();
    const media = window.matchMedia("(prefers-color-scheme: dark)");
    media.addEventListener("change", apply);
    return () => media.removeEventListener("change", apply);
  }, []);

  function toggle() {
    const next = currentTheme() === "dark" ? "light" : "dark";
    document.documentElement.setAttribute("data-theme", next);
    localStorage.setItem("desk-theme", next);
    setTheme(next);
  }

  return (
    <button className="theme-toggle" type="button" onClick={toggle}>
      {theme === "dark" ? "Light" : "Dark"}
    </button>
  );
}

export function Shell({ children }: { children: React.ReactNode }) {
  const path = usePathname();
  const { data: session } = useSession();
  if (path === "/login") {
    return (
      <>
        <div className="auth-theme">
          <ThemeToggle />
        </div>
        <main className="auth-main">{children}</main>
      </>
    );
  }
  const name = session?.user?.name?.trim() || "";
  const email = session?.user?.email?.trim() || "";
  return (
    <>
      <header className="topbar no-print">
        <DeskLink href="/" className="brand">
          Desk <span>Resumes</span>
        </DeskLink>
        {name || email ? (
          <p className="signed-in">
            <span className="signed-in-name">{name || "Signed in"}</span>
            {email ? <span className="signed-in-email">{email}</span> : null}
          </p>
        ) : null}
        <nav>
          <ThemeToggle />
          <DeskLink href="/" active={path === "/"}>
            New resume
          </DeskLink>
          <DeskLink href="/profile" active={path.startsWith("/profile")}>
            Master profile
          </DeskLink>
          <DeskLink href="/interview" active={path.startsWith("/interview")}>
            Interview
          </DeskLink>
          <DeskLink href="/applications" active={path.startsWith("/applications")}>
            Applications
          </DeskLink>
          <DeskLink href="/programs" active={path.startsWith("/programs")}>
            Programs
          </DeskLink>
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
