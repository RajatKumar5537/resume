"use client";

import { FormEvent, useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";

type Mode = "sign-in" | "create" | "reset";

export default function LoginPage() {
  const router = useRouter();
  const [mode, setMode] = useState<Mode>("sign-in");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [busy, setBusy] = useState(false);

  function switchMode(next: Mode) {
    setMode(next);
    setError("");
    setNotice("");
    setConfirm("");
  }

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    setBusy(true);
    setError("");
    setNotice("");
    try {
      if (mode === "reset") {
        const response = await fetch("/api/auth/forgot", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, password, confirm }),
        });
        const data = (await response.json()) as { error?: string };
        if (!response.ok) throw new Error(data.error || "Could not reset the password.");
        setPassword("");
        setConfirm("");
        setMode("sign-in");
        setNotice("Password updated. Sign in with the new password.");
        setBusy(false);
        return;
      }
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
  const resetting = mode === "reset";

  return (
    <section className="panel auth-card">
      <h1>{resetting ? "Reset password" : creating ? "Create your account" : "Sign in"}</h1>
      <p className="lede">
        {resetting
          ? "Enter the email on the account and choose a new password. The saved password stays encrypted."
          : creating
            ? "Each person gets their own profile and resumes."
            : "Your resumes stay locked until you sign in."}
      </p>
      {error ? <p className="error">{error}</p> : null}
      {notice ? <p className="note">{notice}</p> : null}
      <form onSubmit={onSubmit}>
        {creating ? (
          <div className="field">
            <label htmlFor="name">Name</label>
            <input id="name" type="text" autoComplete="name" value={name} onChange={(event) => setName(event.target.value)} required />
          </div>
        ) : null}
        <div className="field">
          <label htmlFor="email">Email</label>
          <input id="email" type="email" autoComplete="username" value={email} onChange={(event) => setEmail(event.target.value)} required />
        </div>
        <PasswordInput
          id="password"
          label={resetting ? "New password" : "Password"}
          autoComplete={creating || resetting ? "new-password" : "current-password"}
          value={password}
          shown={showPassword}
          onChange={setPassword}
          onToggle={() => setShowPassword((visible) => !visible)}
        />
        {resetting ? (
          <PasswordInput
            id="confirm"
            label="Confirm new password"
            autoComplete="new-password"
            value={confirm}
            shown={showConfirm}
            onChange={setConfirm}
            onToggle={() => setShowConfirm((visible) => !visible)}
          />
        ) : null}
        {mode === "sign-in" ? (
          <button className="auth-text" type="button" onClick={() => switchMode("reset")}>
            Forgot password?
          </button>
        ) : null}
        <button className="btn" type="submit" disabled={busy}>
          {busy ? "Please wait…" : resetting ? "Reset password" : creating ? "Create account" : "Sign in"}
        </button>
        {mode === "sign-in" ? (
          <button className="btn secondary auth-switch" type="button" onClick={() => switchMode("create")}>
            Create account
          </button>
        ) : (
          <button className="btn secondary auth-switch" type="button" onClick={() => switchMode("sign-in")}>
            Back to sign in
          </button>
        )}
      </form>
    </section>
  );
}

function PasswordInput({
  id,
  label,
  autoComplete,
  value,
  shown,
  onChange,
  onToggle,
}: {
  id: string;
  label: string;
  autoComplete: string;
  value: string;
  shown: boolean;
  onChange: (value: string) => void;
  onToggle: () => void;
}) {
  return (
    <div className="field">
      <label htmlFor={id}>{label}</label>
      <div className="password-wrap">
        <input
          id={id}
          type={shown ? "text" : "password"}
          autoComplete={autoComplete}
          value={value}
          onChange={(event) => onChange(event.target.value)}
          required
        />
        <button
          className="password-eye"
          type="button"
          aria-label={shown ? "Hide password" : "Show password"}
          aria-pressed={shown}
          onClick={onToggle}
        >
          {shown ? <EyeOffIcon /> : <EyeIcon />}
        </button>
      </div>
    </div>
  );
}

function EyeIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path
        d="M2 12s3.5-6 10-6 10 6 10 6-3.5 6-10 6S2 12 2 12Z"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
      />
      <circle cx="12" cy="12" r="3" fill="none" stroke="currentColor" strokeWidth="1.8" />
    </svg>
  );
}

function EyeOffIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path
        d="M3 3l18 18M10.5 6.2A10.7 10.7 0 0 1 12 6c6.5 0 10 6 10 6a18.4 18.4 0 0 1-3.2 3.8M6.1 6.1C3.7 7.8 2 12 2 12s3.5 6 10 6c1.4 0 2.7-.3 3.8-.8"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
      <path d="M9.9 9.9a3 3 0 0 0 4.2 4.2" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  );
}
