"use client";

import { JavaCode } from "@/components/JavaCode";
import { focusBlockIndex, noteBlocks, type NoteBlock } from "@/components/PdfNote";
import { findRanges } from "@/lib/note-find";
import { useEffect, useMemo, useRef, useState, type ReactNode } from "react";

type Match = { block: number; start: number; end: number };

function scrollMatch(node: HTMLElement) {
  const pane = node.closest(".library-view, .interview-answer");
  if (!(pane instanceof HTMLElement)) {
    node.scrollIntoView({ block: "center", inline: "nearest" });
    return;
  }
  const coverBottom = Math.max(
    pane.querySelector(".note-find")?.getBoundingClientRect().bottom || 0,
    pane.querySelector(".read-bar")?.getBoundingClientRect().bottom || 0,
  );
  const paneScrolls = pane.scrollHeight > pane.clientHeight + 8;
  const anchor = paneScrolls ? pane.getBoundingClientRect().top : 0;
  const clearance = Math.max(anchor, coverBottom) + 12;
  const delta = node.getBoundingClientRect().top - clearance;
  if (Math.abs(delta) < 8) return;
  if (paneScrolls) pane.scrollTop += delta;
  else window.scrollBy(0, delta);
}

function MarkedText({ text, ranges, active }: { text: string; ranges: Match[]; active: number }) {
  if (!ranges.length) return text;
  const parts: ReactNode[] = [];
  let cursor = 0;
  ranges.forEach((range, index) => {
    if (range.start > cursor) parts.push(text.slice(cursor, range.start));
    const current = index === active;
    parts.push(
      <mark
        key={`${range.start}-${range.end}`}
        className={current ? "note-hit note-hit-current" : "note-hit"}
        {...(current ? { "data-note-focus": "true" } : {})}
      >
        {text.slice(range.start, range.end)}
      </mark>,
    );
    cursor = range.end;
  });
  if (cursor < text.length) parts.push(text.slice(cursor));
  return parts;
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
  const [query, setQuery] = useState("");
  const [active, setActive] = useState(0);
  const rootRef = useRef<HTMLDivElement>(null);
  const blocks = useMemo(() => (kind === "pdf" ? noteBlocks(text) : []), [kind, text]);
  const searching = query.trim().length >= 2;
  const matches = useMemo(() => {
    if (!searching) return [] as Match[];
    if (kind === "java") return findRanges(text, query).map((range) => ({ block: 0, ...range }));
    const found: Match[] = [];
    blocks.forEach((block, blockIndex) => {
      findRanges(block.text, query).forEach((range) => found.push({ block: blockIndex, ...range }));
    });
    return found;
  }, [searching, kind, text, query, blocks]);
  const current = matches.length ? active % matches.length : 0;
  const focusAt = searching ? -1 : focusBlockIndex(blocks, focus);

  useEffect(() => {
    setActive(0);
  }, [query, text]);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    const target = root.querySelector("[data-note-focus]");
    if (target instanceof HTMLElement) scrollMatch(target);
  }, [current, searching, focus, text, kind]);

  function step(delta: number) {
    if (!matches.length) return;
    setActive((value) => (value + delta + matches.length) % matches.length);
  }

  function showSection(id: string) {
    const node = rootRef.current?.querySelector(`#${CSS.escape(id)}`);
    if (node instanceof HTMLElement) scrollMatch(node);
  }

  const headings = blocks.filter((block) => block.kind === "heading" && block.id);

  function blockBody(block: NoteBlock, index: number) {
    const ranges = matches.filter((match) => match.block === index);
    const activeInBlock = ranges.findIndex((match) => matches[current] === match);
    if (ranges.length) return <MarkedText text={block.text} ranges={ranges} active={activeInBlock} />;
    if (index === focusAt && focus) return <FocusedWord text={block.text} focus={focus} />;
    return block.text;
  }

  return (
    <div className="library-note" ref={rootRef}>
      <div className="note-find">
        <input
          aria-label="Find in this document"
          value={query}
          placeholder="Find in this document"
          enterKeyHint="search"
          autoCapitalize="off"
          autoCorrect="off"
          spellCheck={false}
          onChange={(event) => setQuery(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === "Enter") {
              event.preventDefault();
              step(event.shiftKey ? -1 : 1);
            }
          }}
        />
        {searching ? (
          <span className="note-find-count">{matches.length ? `${current + 1} of ${matches.length}` : "No matches"}</span>
        ) : null}
        <button type="button" onClick={() => step(-1)} disabled={!matches.length}>
          Previous
        </button>
        <button type="button" onClick={() => step(1)} disabled={!matches.length}>
          Next
        </button>
      </div>
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
      {kind === "java" ? <JavaCode code={text} query={searching ? query : ""} active={current} /> : null}
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
  );
}
