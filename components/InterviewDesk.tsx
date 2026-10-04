"use client";

import { FormEvent, useEffect, useRef, useState } from "react";
import { JavaCode } from "@/components/JavaCode";
import { NoteText, readableNote } from "@/components/PdfNote";

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
      const response = await fetch("/api/interview", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question: asked }),
      });
      const data = (await response.json()) as InterviewResult & { error?: string };
      if (!response.ok) throw new Error(data.error || "Could not answer that question.");
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
      const bar = pane.querySelector(".read-bar");
      const offset = (bar?.getBoundingClientRect().height || 0) + 16;
      const paneScrolls = pane.scrollHeight > pane.clientHeight + 8;
      const anchorTop = paneScrolls ? pane.getBoundingClientRect().top : 0;
      const delta = target.getBoundingClientRect().top - anchorTop - offset;
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
          {result.url ? (
            <p>
              <a href={result.url} target="_blank" rel="noreferrer">
                {result.path}
              </a>
            </p>
          ) : null}
          {result.answer && result.path?.toLowerCase().endsWith(".pdf") ? (
            <NoteText text={readableNote(result.answer)} focus={result.focus} />
          ) : null}
          {result.answer && !result.path?.toLowerCase().endsWith(".pdf") ? <p className="answer-text">{result.answer}</p> : null}
          {result.code ? <JavaCode code={result.code} /> : null}
        </section>
      ) : null}
      </div>
    </div>
  );
}
