"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ResumePaper } from "@/components/ResumePaper";
import { resumeFilename, toPlainText } from "@/lib/plain";
import { resumeHoursLeft } from "@/lib/resume-life";
import { deleteResume, downloadOriginalResume, loadResumes, originalFileName, upsertResume } from "@/lib/storage";
import type { ResumeDoc } from "@/lib/types";

const PREFILL_KEY = "desk.prefill";

export function ResumeView({ id }: { id: string }) {
  const router = useRouter();
  const [doc, setDoc] = useState<ResumeDoc | null>(null);
  const [ready, setReady] = useState(false);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState("");
  const [originalName, setOriginalName] = useState("");

  useEffect(() => {
    let cancel = false;
    loadResumes()
      .then((resumes) => {
        if (cancel) return;
        const found = resumes.find((resume) => resume.id === id) ?? null;
        setDoc(found);
        if (found) document.title = `${found.contact.name} — ${found.headline}`;
      })
      .catch((caught) => {
        if (!cancel) setError(caught instanceof Error ? caught.message : "Could not load this resume.");
      })
      .finally(() => {
        if (!cancel) setReady(true);
      });
    originalFileName()
      .then((name) => {
        if (!cancel) setOriginalName(name);
      })
      .catch(() => {
        if (!cancel) setOriginalName("");
      });
    return () => {
      cancel = true;
    };
  }, [id]);

  function commit(next: ResumeDoc) {
    const updated = { ...next, updatedAt: new Date().toISOString() };
    setDoc(updated);
    upsertResume(updated)
      .then(() => setError(""))
      .catch((caught) => {
        setError(caught instanceof Error ? caught.message : "Could not save this edit.");
      });
  }

  function savePdf() {
    const root = document.documentElement;
    root.classList.add("printing");
    const cleanup = () => root.classList.remove("printing");
    window.addEventListener("afterprint", cleanup, { once: true });
    document.body.offsetHeight;
    window.print();
  }

  function downloadText() {
    if (!doc) return;
    const blob = new Blob([toPlainText(doc)], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = resumeFilename(doc, "txt");
    link.click();
    URL.revokeObjectURL(url);
  }

  async function copyText() {
    if (!doc) return;
    const text = toPlainText(doc);
    try {
      await navigator.clipboard.writeText(text);
    } catch {
      const area = document.createElement("textarea");
      area.value = text;
      document.body.appendChild(area);
      area.select();
      document.execCommand("copy");
      area.remove();
    }
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1600);
  }

  function tailorAgain() {
    if (!doc) return;
    sessionStorage.setItem(
      PREFILL_KEY,
      JSON.stringify({
        jobText: doc.jobText,
        jobTitle: doc.jobTitle,
        company: doc.company,
        jobUrl: doc.jobUrl,
      }),
    );
    router.push("/");
  }

  async function remove() {
    if (!doc) return;
    if (!window.confirm("Delete this resume?")) return;
    try {
      await deleteResume(doc.id);
      router.push("/");
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Could not delete this resume.");
    }
  }

  if (!ready) return <p className="hint">Loading resume…</p>;
  if (!doc) {
    return (
      <div className="narrow">
        <h1>This resume is not in your database.</h1>
        <p className="lede">It may have been removed after 24 hours, or it was deleted.</p>
        <a className="btn" href="/">
          New resume
        </a>
      </div>
    );
  }

  return (
    <>
      <div className="toolbar no-print">
        <p>{[doc.jobTitle, doc.company].filter(Boolean).join(" · ") || "Resume"}</p>
        <div className="actions">
          <button className="btn" type="button" onClick={savePdf}>
            Save PDF
          </button>
          {originalName ? (
            <button
              className="btn secondary"
              type="button"
              onClick={() =>
                downloadOriginalResume().catch((caught) =>
                  setError(caught instanceof Error ? caught.message : "Could not download the original resume."),
                )
              }
            >
              Download original
            </button>
          ) : null}
          <button className="btn secondary" type="button" onClick={downloadText}>
            Download text
          </button>
          <button className="btn secondary" type="button" onClick={copyText}>
            {copied ? "Copied" : "Copy text"}
          </button>
        </div>
      </div>
      {error ? <p className="error no-print">{error}</p> : null}
      <div className="studio">
        <aside className="aside no-print">
          <h2 className="section-title">Match</h2>
          <p className="hint">
            {doc.matched.length
              ? `${doc.matched.length} of your skills appear in this job.`
              : "Little overlap with this job. Edit the summary, or try a closer role."}
          </p>
          <div className="chips">
            {doc.matched.map((skill) => (
              <span className="chip" key={skill}>
                {skill}
              </span>
            ))}
          </div>
          {doc.missing.length ? (
            <>
              <p className="hint">In this job, not on your profile. Add one only if you have used it.</p>
              <div className="chips">
                {doc.missing.map((skill) => (
                  <span className="chip miss" key={skill}>
                    {skill}
                  </span>
                ))}
              </div>
            </>
          ) : (
            <p className="hint">The tools this job names are already on your profile.</p>
          )}

          <div className="field">
            <label htmlFor="headline">Line under your name</label>
            <input
              id="headline"
              type="text"
              value={doc.headline}
              onChange={(event) => commit({ ...doc, headline: event.target.value })}
            />
          </div>
          <div className="field">
            <label htmlFor="summary">Summary</label>
            <textarea
              id="summary"
              value={doc.summary}
              onChange={(event) => commit({ ...doc, summary: event.target.value })}
            />
          </div>
          <p className="hint">
            {doc.writer === "ai"
              ? "Written with AI for this job from your skills, experience, and projects. Tools you have not used are not added."
              : "Every skill and every project from your master profile is on this resume, with this job’s skills first. Tools you have not used are not added."}
            {` This resume is removed about ${resumeHoursLeft(doc.createdAt)} hours after it was created. Download the original from the master profile if you need to send that file instead.`}
          </p>

          <details className="block">
            <summary>Edit bullets</summary>
            {doc.experience.map((role, roleIndex) => (
              <div key={`${role.company}-${roleIndex}`} className="editor-card">
                <h3>{role.title}</h3>
                {role.bullets.map((bullet, bulletIndex) => (
                  <div className="bullet-edit" key={`${roleIndex}-${bulletIndex}`}>
                    <textarea
                      aria-label={`${role.title} bullet ${bulletIndex + 1}`}
                      value={bullet}
                      onChange={(event) => {
                        const experience = doc.experience.map((item, index) =>
                          index === roleIndex
                            ? {
                                ...item,
                                bullets: item.bullets.map((line, lineIndex) =>
                                  lineIndex === bulletIndex ? event.target.value : line,
                                ),
                              }
                            : item,
                        );
                        commit({ ...doc, experience });
                      }}
                    />
                    <button
                      className="btn secondary"
                      type="button"
                      disabled={role.bullets.length < 2}
                      onClick={() => {
                        const experience = doc.experience.map((item, index) =>
                          index === roleIndex
                            ? { ...item, bullets: item.bullets.filter((_, lineIndex) => lineIndex !== bulletIndex) }
                            : item,
                        );
                        commit({ ...doc, experience });
                      }}
                    >
                      Remove
                    </button>
                  </div>
                ))}
              </div>
            ))}
            {doc.projects.map((project, projectIndex) => (
              <div key={project.name} className="editor-card">
                <h3>{project.name}</h3>
                {project.bullets.map((bullet, bulletIndex) => (
                  <div className="bullet-edit" key={`${project.name}-${bulletIndex}`}>
                    <textarea
                      aria-label={`${project.name} bullet ${bulletIndex + 1}`}
                      value={bullet}
                      onChange={(event) => {
                        const projects = doc.projects.map((item, index) =>
                          index === projectIndex
                            ? {
                                ...item,
                                bullets: item.bullets.map((line, lineIndex) =>
                                  lineIndex === bulletIndex ? event.target.value : line,
                                ),
                              }
                            : item,
                        );
                        commit({ ...doc, projects });
                      }}
                    />
                    <button
                      className="btn secondary"
                      type="button"
                      disabled={project.bullets.length < 2 && doc.projects.length < 2}
                      onClick={() => {
                        const projects = doc.projects
                          .map((item, index) =>
                            index === projectIndex
                              ? { ...item, bullets: item.bullets.filter((_, lineIndex) => lineIndex !== bulletIndex) }
                              : item,
                          )
                          .filter((item) => item.bullets.length > 0);
                        commit({ ...doc, projects });
                      }}
                    >
                      Remove
                    </button>
                  </div>
                ))}
              </div>
            ))}
          </details>

          <details className="block">
            <summary>Job description</summary>
            {doc.jobUrl ? (
              <p>
                <a href={doc.jobUrl}>{doc.jobUrl}</a>
              </p>
            ) : null}
            <pre className="job-text">{doc.jobText}</pre>
          </details>

          <div className="actions">
            <button className="btn secondary" type="button" onClick={tailorAgain}>
              Tailor again
            </button>
            <button className="btn danger" type="button" onClick={remove}>
              Delete
            </button>
          </div>
        </aside>
        <ResumePaper doc={doc} />
      </div>
    </>
  );
}
