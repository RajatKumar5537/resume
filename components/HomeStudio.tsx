"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { deleteResume, loadProfile, loadResumes } from "@/lib/storage";
import { needsMasterResume } from "@/lib/default-profile";
import { resumeHoursLeft } from "@/lib/resume-life";
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
  const [needsResume, setNeedsResume] = useState(false);

  useEffect(() => {
    let cancel = false;
    loadResumes()
      .then(async (list) => {
        if (cancel) return;
        setResumes(list);
        const profile = await loadProfile();
        if (!cancel) setNeedsResume(needsMasterResume(profile));
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
      const response = await fetch("/api/resume/write", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ jobText, jobTitle, company, jobUrl }),
      });
      const data = (await response.json()) as { resume?: ResumeDoc; error?: string };
      if (!response.ok || !data.resume) throw new Error(data.error || "Could not write this resume.");
      router.push(`/r/${data.resume.id}`);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Could not write this resume.");
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
      <h1>{needsResume ? "Add your resume first." : "A resume for this job."}</h1>
      <p className="lede">
        {needsResume
          ? "Upload your own resume on the master profile. Desk writes every later job resume from that file, for a developer, a tester, or any other role."
          : "Paste a job link or the full description. Desk uses AI to write an ATS resume from your master profile for that job. Every skill and every project stays on it. The generated resume is removed after 24 hours."}
      </p>

      {needsResume ? (
        <section className="panel">
          <h2>Upload your resume first</h2>
          <p>
            A new account does not use anyone else's resume. Upload your master resume, whether you are a developer,
            a tester, or in another role. Job resumes are then written from that file.
          </p>
          <div className="actions">
            <Link className="btn" href="/profile">
              Upload resume
            </Link>
          </div>
        </section>
      ) : step === "paste" ? (
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
            <button className="btn" type="button" onClick={onWrite} disabled={busy}>
              {busy ? "Writing the resume…" : "Write resume"}
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
      <p className="hint">Each job resume is removed 24 hours after it is written. Your master profile stays.</p>
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
                  {` · ${resume.matched.length} skills matched · removed in about ${resumeHoursLeft(resume.createdAt)}h`}
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
