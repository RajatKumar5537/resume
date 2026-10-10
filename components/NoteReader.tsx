"use client";

import { JavaCode } from "@/components/JavaCode";
import { focusBlockIndex, noteBlocks, type NoteBlock } from "@/components/PdfNote";
import { useEffect, useMemo, useRef } from "react";

function scrollMatch(node: HTMLElement) {
  const lessonBody = node.closest(".lesson-body");
  const pane = lessonBody instanceof HTMLElement && lessonBody.scrollHeight > lessonBody.clientHeight + 8
    ? lessonBody
    : node.closest(".library-view, .interview-answer");
  if (!(pane instanceof HTMLElement)) {
    node.scrollIntoView({ block: "center", inline: "nearest" });
    return;
  }
  const coverBottom = pane.querySelector(".read-bar")?.getBoundingClientRect().bottom || 0;
  const paneScrolls = pane.scrollHeight > pane.clientHeight + 8;
  const anchor = paneScrolls ? pane.getBoundingClientRect().top : 0;
  const clearance = Math.max(anchor, coverBottom) + 12;
  const delta = node.getBoundingClientRect().top - clearance;
  if (Math.abs(delta) < 8) return;
  if (paneScrolls) pane.scrollTop += delta;
  else window.scrollBy(0, delta);
}

function FocusedWord({ text, focus }: { text: string; focus: string }) {
  const at = text.toLowerCase().indexOf(focus.toLowerCase());
  if (at < 0) return text;
  return (
    <>
      {text.slice(0, at)}
      <mark className="note-focus" data-note-focus="true">
        {text.slice(at, at + focus.length)}
      </mark>
      {text.slice(at + focus.length)}
    </>
  );
}

export function NoteReader({
  text,
  kind,
  title,
  focus = "",
}: {
  text: string;
  kind: "java" | "pdf";
  title: string;
  focus?: string;
}) {
  const rootRef = useRef<HTMLDivElement>(null);
  const blocks = useMemo(() => (kind === "pdf" ? noteBlocks(text) : []), [kind, text]);
  const focusAt = focusBlockIndex(blocks, focus);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    const target = root.querySelector("[data-note-focus]");
    if (target instanceof HTMLElement) scrollMatch(target);
  }, [focus, text, kind]);

  function showSection(id: string) {
    const node = rootRef.current?.querySelector(`#${CSS.escape(id)}`);
    if (node instanceof HTMLElement) scrollMatch(node);
  }

  const headings = blocks.filter((block) => block.kind === "heading" && block.id);

  function blockBody(block: NoteBlock, index: number) {
    if (index === focusAt && focus) return <FocusedWord text={block.text} focus={focus} />;
    return block.text;
  }

  return (
    <div className="library-note" ref={rootRef}>
      <div className="lesson-body">
      {title ? <h2 className="note-title">{title}</h2> : null}
      {headings.length >= 3 ? (
        <details className="note-toc">
          <summary>Sections ({headings.length})</summary>
          <nav>
            {headings.map((heading) => (
              <button key={heading.id} type="button" onClick={() => showSection(heading.id || "")}>
                {heading.text}
              </button>
            ))}
          </nav>
        </details>
      ) : null}
      {kind === "java" ? <JavaCode code={text} /> : null}
      {kind === "pdf"
        ? blocks.map((block, index) => {
            const body = blockBody(block, index);
            if (block.kind === "heading") {
              return (
                <h3 key={block.id} id={block.id} className="note-h note-section">
                  {body}
                </h3>
              );
            }
            if (block.kind === "question") {
              return (
                <p key={`${block.kind}-${index}`} className="note-q note-block">
                  {body}
                </p>
              );
            }
            if (block.kind === "item") {
              return (
                <p key={`${block.kind}-${index}`} className="note-item">
                  {body}
                </p>
              );
            }
            if (block.kind === "point") {
              return (
                <p key={`${block.kind}-${index}`} className="note-point">
                  {body}
                </p>
              );
            }
            if (block.kind === "code") {
              return (
                <div key={`${block.kind}-${index}`} className="code-scroll">
                  <pre className="answer-code">{body}</pre>
                </div>
              );
            }
            return (
              <p key={`${block.kind}-${index}`} className="note-block">
                {body}
              </p>
            );
          })
        : null}
      </div>
    </div>
  );
}
