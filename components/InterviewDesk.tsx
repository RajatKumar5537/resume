"use client";

import { FormEvent, useEffect, useRef, useState } from "react";
import { NoteReader } from "@/components/NoteReader";
import { searchLessons } from "@/lib/concepts";
import { cachedAnswer, rememberAnswer, rememberOpenedNote, syncNoteCacheRevision } from "@/lib/opened-notes";

type InterviewResult = {
  source: "repo" | "gemini" | "missing";
  title: string;
  path?: string;
  url?: string;
  code?: string;
  answer?: string;
  focus?: string;
  note: string;
};

const EXAMPLES = [
  "Write a Java program for the Fibonacci series",
  "How do you handle an alert popup in Selenium?",
  "Explain polymorphism in Java",
];

export function InterviewDesk() {
  const [question, setQuestion] = useState("");
  const [result, setResult] = useState<InterviewResult | null>(null);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [reading, setReading] = useState(false);
  const answerRef = useRef<HTMLElement>(null);

  async function ask(value: string) {
    const asked = value.trim();
    if (!asked) {
      setError("Type an interview question.");
      return;
    }
    setBusy(true);
    setError("");
    try {
      try {
        const savedLibrary = window.localStorage.getItem("desk-library-list");
        if (savedLibrary) {
          const revision = (JSON.parse(savedLibrary) as { revision?: string }).revision || "";
          syncNoteCacheRevision(revision);
        }
      } catch {
        // A damaged folder list should not block the interview search.
      }
      const cached = cachedAnswer(asked);
      if (cached) {
        setResult(cached);
        setReading(true);
        window.scrollTo(0, 0);
        if (answerRef.current) answerRef.current.scrollTop = 0;
        return;
      }
      const response = await fetch("/api/interview", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question: asked }),
      });
      const data = (await response.json()) as InterviewResult & { error?: string };
      if (!response.ok) throw new Error(data.error || "Could not answer that question.");
      rememberAnswer(asked, data);
      if (data.path && data.code) rememberOpenedNote(data.path, "java", data.code);
      if (data.path?.toLowerCase().endsWith(".pdf") && data.answer) rememberOpenedNote(data.path, "pdf", data.answer);
      setResult(data);
      setReading(true);
      window.scrollTo(0, 0);
      if (answerRef.current) answerRef.current.scrollTop = 0;
    } catch (caught) {
      setResult(null);
      setReading(false);
      setError(caught instanceof Error ? caught.message : "Could not answer that question.");
    } finally {
      setBusy(false);
    }
  }

  useEffect(() => {
    if (!reading) return;
    window.scrollTo(0, 0);
    const pane = answerRef.current;
    if (!pane) return;
    const target = pane.querySelector("[data-note-focus]");
    if (!target) {
      pane.scrollTop = 0;
      pane.scrollLeft = 0;
      window.scrollTo(0, 0);
    } else {
      const coverBottom = Math.max(
        pane.querySelector(".note-find")?.getBoundingClientRect().bottom || 0,
        pane.querySelector(".read-bar")?.getBoundingClientRect().bottom || 0,
      );
      const paneScrolls = pane.scrollHeight > pane.clientHeight + 8;
      const anchor = paneScrolls ? pane.getBoundingClientRect().top : 0;
      const delta = target.getBoundingClientRect().top - Math.max(anchor, coverBottom) - 12;
      if (paneScrolls) pane.scrollTop += delta;
      else window.scrollBy(0, delta);
    }
    pane.querySelectorAll(".answer-code").forEach((node) => {
      node.scrollLeft = 0;
    });
  }, [reading, result]);

  function onSubmit(event: FormEvent) {
    event.preventDefault();
    void ask(question);
  }

  return (
    <div className={`interview-page${reading ? " reading" : ""}`}>
      <div className="interview-intro">
        <h1>Interview practice</h1>
        <p className="lede">
          Ask a Java, Selenium, or testing question. Desk looks in your Java-Selenium-Program repo first. If that
          program is not there, it uses your saved notes. Gemini answers only when the topic is not saved.
        </p>
      </div>
      <div className="interview-layout">
      <form className="panel interview-ask" onSubmit={onSubmit}>
        <label htmlFor="interview-question">Interview question</label>
        <textarea
          id="interview-question"
          value={question}
          placeholder="How do you reverse a string in Java?"
          onChange={(event) => setQuestion(event.target.value)}
        />
        {error ? <p className="error">{error}</p> : null}
        <div className="actions">
          <button className="btn" type="submit" disabled={busy}>
            {busy ? "Looking…" : "Find answer"}
          </button>
        </div>
        <div className="examples">
          {EXAMPLES.map((example) => (
            <button
              key={example}
              className="chip"
              type="button"
              onClick={() => {
                setQuestion(example);
                void ask(example);
              }}
            >
              {example}
            </button>
          ))}
        </div>
      </form>
      {result ? (
        <section className="panel answer-panel interview-answer" ref={answerRef}>
          <div className="read-bar">
            <button type="button" onClick={() => setReading(false)}>
              Question
            </button>
            <strong>{result.title}</strong>
          </div>
          <div className="answer-meta">
            <span className={`pill ${result.source === "repo" ? "repo" : "gpt"}`}>
              {result.source === "repo" ? "Your repo" : result.source === "gemini" ? "Gemini" : "Needs Gemini"}
            </span>
            <strong className="read-title">{result.title}</strong>
          </div>
          <p className="hint">{result.note}</p>
          {searchLessons(question)[0]?.score >= 120 ? (
            <p>
              <a href={`/concepts?topic=${searchLessons(question)[0].id}`}>
                Open the {searchLessons(question)[0].title} lesson
              </a>
            </p>
          ) : null}
          {result.url ? (
            <p>
              <a href={result.url} target="_blank" rel="noreferrer">
                {result.path}
              </a>
            </p>
          ) : null}
          {result.answer && result.code ? <p className="answer-text">{result.answer}</p> : null}
          {result.code ? <NoteReader text={result.code} kind="java" title={result.title} /> : null}
          {result.answer && !result.code ? (
            <NoteReader text={result.answer} kind="pdf" title={result.code ? "" : result.title} focus={result.focus} />
          ) : null}
        </section>
      ) : null}
      </div>
    </div>
  );
}
