"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { deleteResume, loadProfile, loadResumes, upsertResume } from "@/lib/storage";
import { tailor } from "@/lib/tailor";
import { guessCompany, guessTitle, isJobLink } from "@/lib/text";
import type { ResumeDoc } from "@/lib/types";

const PREFILL_KEY = "desk.prefill";

type Prefill = {
  jobText: string;
  jobTitle: string;
  company: string;
  jobUrl: string;
};

function formatWhen(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "";
  return date.toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
}

export function HomeStudio() {
  const router = useRouter();
  const [step, setStep] = useState<"paste" | "review">("paste");
  const [raw, setRaw] = useState("");
  const [jobText, setJobText] = useState("");
  const [jobTitle, setJobTitle] = useState("");
  const [company, setCompany] = useState("");
  const [jobUrl, setJobUrl] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [resumes, setResumes] = useState<ResumeDoc[]>([]);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let cancel = false;
    loadResumes()
      .then((list) => {
        if (!cancel) setResumes(list);
      })
      .catch((caught) => {
        if (!cancel) setError(caught instanceof Error ? caught.message : "Could not load your resumes.");
      })
      .finally(() => {
        if (!cancel) setReady(true);
      });
    const saved = sessionStorage.getItem(PREFILL_KEY);
    if (saved) {
      sessionStorage.removeItem(PREFILL_KEY);
      try {
        const prefill = JSON.parse(saved) as Prefill;
        setJobText(prefill.jobText || "");
        setJobTitle(prefill.jobTitle || "");
        setCompany(prefill.company || "");
        setJobUrl(prefill.jobUrl || "");
        setRaw(prefill.jobText || "");
        setStep("review");
      } catch {
        sessionStorage.removeItem(PREFILL_KEY);
      }
    }
    return () => {
      cancel = true;
    };
  }, []);

  async function onContinue() {
    const value = raw.trim();
    if (!value) {
      setError("Paste a job link or the job description.");
      return;
    }
    setError("");
    if (isJobLink(value)) {
      setBusy(true);
      try {
        const response = await fetch("/api/job", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ url: value }),
        });
        const data = (await response.json()) as {
          title?: string;
          company?: string;
          text?: string;
          warning?: string;
          error?: string;
        };
        if (!response.ok) throw new Error(data.error || "That link could not be read.");
        setJobUrl(value);
        setJobText(data.text || "");
        setJobTitle(data.title || guessTitle(data.text || ""));
        setCompany(data.company || guessCompany(data.text || ""));
        setStep("review");
        setError(data.warning || "");
      } catch (caught) {
        setJobUrl(value);
        setJobText("");
        setJobTitle("");
        setCompany("");
        setStep("review");
        setError(caught instanceof Error ? caught.message : "That link could not be read.");
      } finally {
        setBusy(false);
      }
      return;
    }
    setJobUrl("");
    setJobText(value);
    setJobTitle(guessTitle(value));
    setCompany(guessCompany(value));
    setStep("review");
  }

  async function onWrite() {
    if (jobText.trim().length < 80) {
      setError("Paste more of the job description so the resume can match it.");
      return;
    }
    setBusy(true);
    try {
      const doc = tailor({
        profile: await loadProfile(),
        jobText,
        jobTitle,
        company,
        jobUrl,
      });
      await upsertResume(doc);
      router.push(`/r/${doc.id}`);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Could not save this resume.");
      setBusy(false);
    }
  }

  async function onDelete(id: string) {
    if (!window.confirm("Delete this resume?")) return;
    try {
      await deleteResume(id);
      setResumes(await loadResumes());
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Could not delete that resume.");
    }
  }

  if (!ready) return <p className="hint">Loading your resumes…</p>;

  return (
    <div className="narrow">
      <h1>A resume for this job.</h1>
      <p className="lede">
        Paste a job link or the full description. Desk writes a resume in your format from your master profile,
        puts this job’s skills first, and keeps the rest of your skills. Experience stays limited to what you
        already entered.
      </p>

      {step === "paste" ? (
        <section className="panel">
          <label htmlFor="job-source">Job link or description</label>
          <textarea
            id="job-source"
            value={raw}
            placeholder={"https://company.com/jobs/sdet\n\nor paste the full job description"}
            onChange={(event) => setRaw(event.target.value)}
          />
          {error ? <p className="error">{error}</p> : null}
          <div className="actions">
            <button className="btn" type="button" onClick={onContinue} disabled={busy}>
              {busy ? "Reading the job…" : "Continue"}
            </button>
          </div>
        </section>
      ) : (
        <section className="panel">
          <div className="split">
            <div className="field">
              <label htmlFor="job-title">Job title</label>
              <input id="job-title" type="text" value={jobTitle} onChange={(event) => setJobTitle(event.target.value)} />
            </div>
            <div className="field">
              <label htmlFor="company">Company</label>
              <input id="company" type="text" value={company} onChange={(event) => setCompany(event.target.value)} />
            </div>
          </div>
          <div className="field">
            <label htmlFor="job-text">Job description</label>
            <textarea id="job-text" value={jobText} onChange={(event) => setJobText(event.target.value)} />
          </div>
          <p className="hint">{jobText.trim().length} characters. Check the title before writing the resume.</p>
          {error ? <p className="error">{error}</p> : null}
          <div className="actions">
            <button className="btn" type="button" onClick={onWrite}>
              Write resume
            </button>
            <button className="btn secondary" type="button" onClick={() => { setStep("paste"); setError(""); }}>
              Back
            </button>
          </div>
        </section>
      )}

      <h2 className="section-title" style={{ marginTop: 28 }}>
        Recent resumes
      </h2>
      <p className="hint">Saved in your database. A backup file is still available on the master profile.</p>
      {resumes.length === 0 ? (
        <p className="empty">No resumes yet. The first one will show up here.</p>
      ) : (
        <div className="list">
          {resumes.map((resume) => (
            <article className="card" key={resume.id}>
              <Link href={`/r/${resume.id}`}>
                <h2>{resume.jobTitle || resume.headline}</h2>
                <p className="hint">
                  {[resume.company, formatWhen(resume.updatedAt)].filter(Boolean).join(" · ")}
                  {` · ${resume.matched.length} skills matched`}
                </p>
              </Link>
              <button className="btn danger" type="button" onClick={() => onDelete(resume.id)}>
                Delete
              </button>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
