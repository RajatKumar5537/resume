"use client";

import { FormEvent, useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();
  const [mode, setMode] = useState<"sign-in" | "create">("sign-in");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  function showSignIn() {
    setMode("sign-in");
    setError("");
  }

  function showCreate() {
    setMode("create");
    setError("");
  }

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    setBusy(true);
    setError("");
    try {
      if (mode === "create") {
        const response = await fetch("/api/auth/register", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name, email, password }),
        });
        const data = (await response.json()) as { error?: string };
        if (!response.ok) throw new Error(data.error || "Could not create the account.");
      }
      const result = await signIn("credentials", { email, password, redirect: false });
      if (result?.error) throw new Error("Email or password is incorrect.");
      router.push("/");
      router.refresh();
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Could not sign in.");
      setBusy(false);
    }
  }

  const creating = mode === "create";

  return (
    <section className="panel auth-card">
      <h1>{creating ? "Create your account" : "Sign in"}</h1>
      <p className="lede">
        {creating
          ? "Each person gets their own profile and resumes."
          : "Your resumes stay locked until you sign in."}
      </p>
      {error ? <p className="error">{error}</p> : null}
      <form onSubmit={onSubmit}>
        {creating ? (
          <div className="field">
            <label htmlFor="name">Name</label>
            <input id="name" type="text" autoComplete="name" value={name} onChange={(event) => setName(event.target.value)} />
          </div>
        ) : null}
        <div className="field">
          <label htmlFor="email">Email</label>
          <input id="email" type="email" autoComplete="username" value={email} onChange={(event) => setEmail(event.target.value)} />
        </div>
        <div className="field">
          <label htmlFor="password">Password</label>
          <input
            id="password"
            type="password"
            autoComplete={creating ? "new-password" : "current-password"}
            value={password}
            onChange={(event) => setPassword(event.target.value)}
          />
        </div>
        <button className="btn" type="submit" disabled={busy}>
          {busy ? "Please wait…" : creating ? "Create account" : "Sign in"}
        </button>
        {creating ? (
          <button className="btn secondary auth-switch" type="button" onClick={showSignIn}>
            Back to sign in
          </button>
        ) : (
          <button className="btn secondary auth-switch" type="button" onClick={showCreate}>
            Create account
          </button>
        )}
      </form>
    </section>
  );
}
