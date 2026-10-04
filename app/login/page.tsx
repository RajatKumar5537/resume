"use client";

import { FormEvent, useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    setBusy(true);
    setError("");
    const result = await signIn("credentials", { email, password, redirect: false });
    if (result?.error) {
      setError("Email or password is incorrect.");
      setBusy(false);
      return;
    }
    router.push("/");
    router.refresh();
  }

  return (
    <section className="panel auth-card">
      <h1>Sign in</h1>
      <p className="lede">Your resumes stay locked until you sign in.</p>
      {error ? <p className="error">{error}</p> : null}
      <form onSubmit={onSubmit}>
        <div className="field">
          <label htmlFor="email">Email</label>
          <input id="email" type="email" autoComplete="username" value={email} onChange={(event) => setEmail(event.target.value)} />
        </div>
        <div className="field">
          <label htmlFor="password">Password</label>
          <input
            id="password"
            type="password"
            autoComplete="current-password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
          />
        </div>
        <button className="btn" type="submit" disabled={busy}>
          {busy ? "Please wait…" : "Sign in"}
        </button>
      </form>
    </section>
  );
}
