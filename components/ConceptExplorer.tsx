"use client";

import { JavaCode } from "@/components/JavaCode";
import { NoteReader } from "@/components/NoteReader";
import {
  CONCEPT_GROUPS,
  DEFAULT_CONCEPT_MODE,
  conceptById,
  conceptsInGroup,
  searchLessons,
  type ConceptLesson,
  type ConceptSource,
} from "@/lib/concepts";
import { findRanges } from "@/lib/note-find";
import { openedNote, rememberOpenedNote } from "@/lib/opened-notes";
import { STUDY_SUBJECTS, subjectById } from "@/lib/subjects";
import { MANUAL_GROUPS, manualById, manualInGroup, searchManualLessons } from "@/lib/manual-lessons";
import { MONGO_GROUPS, mongoById, mongoInGroup, searchMongoLessons } from "@/lib/mongo-lessons";
import { REST_GROUPS, restById, restInGroup, searchRestLessons } from "@/lib/rest-assured-lessons";
import { PLAYWRIGHT_GROUPS, playwrightById, playwrightInGroup, searchPlaywrightLessons } from "@/lib/playwright-lessons";
import { SELENIUM_GROUPS, searchSeleniumLessons, seleniumById, seleniumInGroup } from "@/lib/selenium-lessons";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";

type RepoHit = {
  source: "repo" | "gemini" | "missing";
  title: string;
  path?: string;
  code?: string;
  answer?: string;
  focus?: string;
};

type OpenSource = { title: string; path: string; kind: "java" | "pdf"; focus?: string };

function Highlight({
  text,
  query,
  markFrom = 0,
  active = -1,
}: {
  text: string;
  query: string;
  markFrom?: number;
  active?: number;
}) {
  const ranges = findRanges(text, query);
  if (!ranges.length) return text;
  const parts = [];
  let cursor = 0;
  ranges.forEach((range, index) => {
    if (range.start > cursor) parts.push(text.slice(cursor, range.start));
    const current = markFrom + index === active;
    parts.push(
      <mark
        key={`${range.start}-${index}`}
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

function lessonMatchCount(lesson: ConceptLesson, query: string): number {
  const chunks = [
    lesson.summary,
    lesson.simple || "",
    ...(lesson.points || []),
    lesson.example?.code || "",
    lesson.example?.output || "",
    lesson.how || "",
    lesson.compare?.title || "",
    ...(lesson.compare?.rows?.length
      ? lesson.compare.rows.flatMap((row) => [row.leftLabel, row.left, row.rightLabel, row.right])
      : [lesson.compare?.leftLabel || "", lesson.compare?.left || "", lesson.compare?.rightLabel || "", lesson.compare?.right || ""]),
    lesson.table?.title || "",
    ...(lesson.table?.headers || []).slice(1),
    ...(lesson.table?.rows || []).flat(),
    ...(lesson.mistakes || []),
    ...(lesson.questions || []).flatMap((item) => [item.prompt, item.short, item.detail]),
  ];
  return chunks.reduce((total, chunk) => total + findRanges(chunk, query).length, 0);
}

function LearnLesson({
  lesson,
  query,
  active,
  copied,
  matchCount,
  onQuery,
  onStep,
  onCopy,
  onOpen,
  onSource,
}: {
  lesson: ConceptLesson;
  query: string;
  active: number;
  copied: string;
  matchCount: number;
  onQuery: (value: string) => void;
  onStep: (delta: number) => void;
  onCopy: (label: string, value: string) => void;
  onOpen: (id: string) => void;
  onSource: (index: number) => void;
}) {
  const searching = query.trim().length >= 2;
  const cursor = { n: 0 };
  const take = (text: string) => {
    const start = cursor.n;
    if (searching) cursor.n += findRanges(text, query).length;
    return start;
  };
  const summaryAt = take(lesson.summary);
  const simpleAt = lesson.simple ? take(lesson.simple) : 0;
  const codeAt = lesson.example ? take(lesson.example.code) : 0;
  const codeCount = lesson.example && searching ? findRanges(lesson.example.code, query).length : 0;
  const outputAt = lesson.example ? take(lesson.example.output) : 0;
  const pointAt = lesson.points.map((point) => take(point));
  const compareTitleAt = lesson.compare ? take(lesson.compare.title) : 0;
  const compareLeftLabelAt = lesson.compare && !lesson.compare.rows?.length ? take(lesson.compare.leftLabel) : 0;
  const compareLeftAt = lesson.compare && !lesson.compare.rows?.length ? take(lesson.compare.left) : 0;
  const compareRightLabelAt = lesson.compare && !lesson.compare.rows?.length ? take(lesson.compare.rightLabel) : 0;
  const compareRightAt = lesson.compare && !lesson.compare.rows?.length ? take(lesson.compare.right) : 0;
  const compareRowAt = (lesson.compare?.rows || []).map((row) => ({
    leftLabel: take(row.leftLabel),
    left: take(row.left),
    rightLabel: take(row.rightLabel),
    right: take(row.right),
  }));
  const tableTitleAt = lesson.table ? take(lesson.table.title) : 0;
  const tableHeaderAt = (lesson.table?.headers || []).slice(1).map((header) => take(header));
  const tableRowAt = (lesson.table?.rows || []).map((row) => row.map((cell) => take(cell)));
  const questionAt = (lesson.questions || []).map((item) => ({
    prompt: take(item.prompt),
    short: take(item.short),
    detail: take(item.detail),
  }));
  const howAt = lesson.how ? take(lesson.how) : 0;
  const mistakeAt = (lesson.mistakes || []).map((item) => take(item));
  const codeActive = active >= codeAt && active < codeAt + codeCount ? active - codeAt : -1;

  return (
    <article className="library-note">
      <div className="note-find">
        <input
          aria-label="Find in this lesson"
          value={query}
          placeholder="Find in this lesson"
          onChange={(event) => onQuery(event.target.value)}
        />
        {searching ? (
          <span className="note-find-count">{matchCount ? `${active + 1} of ${matchCount}` : "No matches"}</span>
        ) : null}
        <button type="button" onClick={() => onStep(-1)} disabled={!matchCount}>
          Previous
        </button>
        <button type="button" onClick={() => onStep(1)} disabled={!matchCount}>
          Next
        </button>
      </div>
      <div className="lesson-body">
      <h2 className="note-title">{lesson.title}</h2>
      <p className="lesson-kicker">{lesson.basis || "Prepared explanation. This is not copied from a PDF."}</p>
      <section className="lesson-lead">
        <p className="lesson-label">Quick interview answer</p>
        <p className="lesson-speak">
          <Highlight text={lesson.summary} query={query} markFrom={summaryAt} active={active} />
        </p>
        <div className="lesson-actions">
          <button className="btn secondary" type="button" onClick={() => onCopy("answer", lesson.summary)}>
            Copy answer
          </button>
          {copied === "answer" ? <span role="status">Answer copied</span> : null}
        </div>
      </section>
      {lesson.simple ? (
        <section className="lesson-block">
          <h3 className="note-h">Simple explanation</h3>
          <p className="note-block">
            <Highlight text={lesson.simple} query={query} markFrom={simpleAt} active={active} />
          </p>
        </section>
      ) : null}
      {lesson.example ? (
        <section className="lesson-block">
          <h3 className="note-h">Example</h3>
          <div className="lesson-actions">
            <button className="btn secondary" type="button" onClick={() => onCopy("code", lesson.example?.code || "")}>
              Copy code
            </button>
            {copied === "code" ? <span role="status">Code copied</span> : null}
          </div>
          <JavaCode code={lesson.example.code} query={searching ? query : ""} active={codeActive} />
          <p className="lesson-output">
            <span>Expected output</span>
            <Highlight text={lesson.example.output} query={query} markFrom={outputAt} active={active} />
          </p>
        </section>
      ) : null}
      {lesson.points.length ? (
        <section className="lesson-block">
          <h3 className="note-h">Important points</h3>
          {lesson.points.map((point, index) => (
            <p key={point} className="note-item">
              <Highlight text={point} query={query} markFrom={pointAt[index]} active={active} />
            </p>
          ))}
        </section>
      ) : null}
      {lesson.compare ? (
        <section className="lesson-block">
          <h3 className="note-h">
            <Highlight text={lesson.compare.title} query={query} markFrom={compareTitleAt} active={active} />
          </h3>
          <div className="lesson-compare">
            {(lesson.compare.rows || [{ leftLabel: lesson.compare.leftLabel, left: lesson.compare.left, rightLabel: lesson.compare.rightLabel, right: lesson.compare.right }]).map((row, index) => (
              <div key={`${row.leftLabel}-${index}`} className="lesson-compare-pair">
                <p>
                  <strong>
                    <Highlight text={row.leftLabel} query={query} markFrom={lesson.compare?.rows ? compareRowAt[index].leftLabel : compareLeftLabelAt} active={active} />
                  </strong>
                  <Highlight text={row.left} query={query} markFrom={lesson.compare?.rows ? compareRowAt[index].left : compareLeftAt} active={active} />
                </p>
                <p>
                  <strong>
                    <Highlight text={row.rightLabel} query={query} markFrom={lesson.compare?.rows ? compareRowAt[index].rightLabel : compareRightLabelAt} active={active} />
                  </strong>
                  <Highlight text={row.right} query={query} markFrom={lesson.compare?.rows ? compareRowAt[index].right : compareRightAt} active={active} />
                </p>
              </div>
            ))}
          </div>
        </section>
      ) : null}
      {lesson.table ? (
        <section className="lesson-block">
          <h3 className="note-h">
            <Highlight text={lesson.table.title} query={query} markFrom={tableTitleAt} active={active} />
          </h3>
          <div className="lesson-sheet">
            <p className="lesson-kicker">
              {lesson.table.headers.slice(1).map((header, headerIndex) => (
                <span key={header}>
                  <Highlight text={header} query={query} markFrom={tableHeaderAt[headerIndex]} active={active} />
                  {headerIndex < lesson.table!.headers.length - 2 ? " · " : ""}
                </span>
              ))}
            </p>
            {lesson.table.rows.map((row, rowIndex) => (
              <div key={row[0]} className="lesson-sheet-row">
                <strong>
                  <Highlight text={row[0]} query={query} markFrom={tableRowAt[rowIndex][0]} active={active} />
                </strong>
                {lesson.table?.headers.slice(1).map((header, headerIndex) => (
                  <p key={header}>
                    <span>{header}</span>
                    <Highlight text={row[headerIndex + 1] || ""} query={query} markFrom={tableRowAt[rowIndex][headerIndex + 1]} active={active} />
                  </p>
                ))}
              </div>
            ))}
          </div>
        </section>
      ) : null}
      {lesson.questions?.length ? (
        <section className="lesson-block">
          <h3 className="note-h">Common follow-up questions</h3>
          {lesson.questions.map((item, index) => (
            <details key={item.prompt} className="lesson-q">
              <summary>
                <Highlight text={item.prompt} query={query} markFrom={questionAt[index].prompt} active={active} />
              </summary>
              <p>
                <Highlight text={item.short} query={query} markFrom={questionAt[index].short} active={active} />
              </p>
              <p className="lesson-kicker">
                <Highlight text={item.detail} query={query} markFrom={questionAt[index].detail} active={active} />
              </p>
            </details>
          ))}
        </section>
      ) : null}
      {lesson.how || lesson.mistakes?.length || lesson.gap ? (
        <details className="lesson-more">
          <summary>Detailed explanation</summary>
          {lesson.gap ? <p className="lesson-gap">{lesson.gap}</p> : null}
          {lesson.how ? (
            <p className="note-block">
              <Highlight text={lesson.how} query={query} markFrom={howAt} active={active} />
            </p>
          ) : null}
          {lesson.mistakes?.map((item, index) => (
            <p key={item} className="note-item">
              <Highlight text={item} query={query} markFrom={mistakeAt[index]} active={active} />
            </p>
          ))}
        </details>
      ) : null}
      {lesson.related.length ? (
        <section className="lesson-block">
          <h3 className="note-h">Related concepts</h3>
          <div className="examples">
            {lesson.related.map((id) => {
              const related = conceptById(id) || seleniumById(id) || playwrightById(id) || manualById(id) || mongoById(id) || restById(id);
              if (!related) return null;
              return (
                <button
                  key={id}
                  className="chip"
                  type="button"
                  onClick={(event) => {
                    event.currentTarget.blur();
                    onOpen(id);
                  }}
                >
                  {related.title}
                </button>
              );
            })}
          </div>
        </section>
      ) : null}
      {lesson.sources.length ? (
        <section className="lesson-block">
          <h3 className="note-h">Source reference</h3>
          {lesson.sources.map((source, index) => (
            <button key={source.path + source.label} className="file-button" type="button" onClick={() => onSource(index)}>
              {source.label}
            </button>
          ))}
        </section>
      ) : null}
      </div>
    </article>
  );
}

export function ConceptExplorer() {
  const router = useRouter();
  const params = useSearchParams();
  const subjectId = params.get("subject") || "";
  const requested = params.get("topic") || "";
  const knownTopic = (id: string) => Boolean(conceptById(id) || seleniumById(id) || playwrightById(id) || manualById(id) || mongoById(id) || restById(id));
  const [topicId, setTopicId] = useState(requested && knownTopic(requested) ? requested : "");
  const [mode, setMode] = useState<"learn" | "source">(DEFAULT_CONCEPT_MODE);
  const [showList, setShowList] = useState(!topicId);
  const [query, setQuery] = useState("");
  const [lessonFind, setLessonFind] = useState("");
  const [repoHit, setRepoHit] = useState<RepoHit | null>(null);
  const [searchError, setSearchError] = useState("");
  const [sourceIndex, setSourceIndex] = useState(0);
  const [looseSource, setLooseSource] = useState<OpenSource | null>(null);
  const [sourceText, setSourceText] = useState("");
  const [sourceError, setSourceError] = useState("");
  const [sourceLoading, setSourceLoading] = useState(false);
  const [copied, setCopied] = useState("");
  const [findAt, setFindAt] = useState(0);
  const viewRef = useRef<HTMLElement>(null);
  const seleniumLibrary = subjectId === "selenium" || (!subjectId && Boolean(seleniumById(requested) || seleniumById(topicId)));
  const playwrightLibrary = subjectId === "playwright" || (!subjectId && !seleniumLibrary && Boolean(playwrightById(requested) || playwrightById(topicId)));
  const manualLibrary =
    subjectId === "manual-testing" ||
    (!subjectId && !seleniumLibrary && !playwrightLibrary && Boolean(manualById(requested) || manualById(topicId)));
  const mongoLibrary =
    subjectId === "mongodb" ||
    (!subjectId && !seleniumLibrary && !playwrightLibrary && !manualLibrary && Boolean(mongoById(requested) || mongoById(topicId)));
  const restLibrary =
    subjectId === "rest-assured" ||
    (!subjectId && !seleniumLibrary && !playwrightLibrary && !manualLibrary && !mongoLibrary && Boolean(restById(requested) || restById(topicId)));
  const lesson = restLibrary
    ? restById(topicId)
    : mongoLibrary
    ? mongoById(topicId)
    : manualLibrary
      ? manualById(topicId)
      : playwrightLibrary
        ? playwrightById(topicId)
        : seleniumLibrary
          ? seleniumById(topicId)
          : conceptById(topicId);
  const lessonHits = useMemo(
    () =>
      query.trim().length >= 2
        ? restLibrary
          ? searchRestLessons(query)
          : mongoLibrary
          ? searchMongoLessons(query)
          : manualLibrary
            ? searchManualLessons(query)
            : playwrightLibrary
              ? searchPlaywrightLessons(query)
              : seleniumLibrary
                ? searchSeleniumLessons(query)
                : searchLessons(query)
        : [],
    [query, seleniumLibrary, playwrightLibrary, manualLibrary, mongoLibrary, restLibrary],
  );
  const inLesson = lesson ? lessonMatchCount(lesson, lessonFind) : 0;
  const findIndex = inLesson ? findAt % inLesson : 0;

  useEffect(() => {
    setFindAt(0);
  }, [lessonFind, topicId]);

  useEffect(() => {
    if (!copied) return;
    const timer = window.setTimeout(() => setCopied(""), 2000);
    return () => window.clearTimeout(timer);
  }, [copied]);

  useEffect(() => {
    if (lessonFind.trim().length < 2) return;
    const node = viewRef.current?.querySelector("[data-note-focus]");
    const pane = viewRef.current;
    if (!(node instanceof HTMLElement) || !pane) return;
    const lessonBody = pane.querySelector(".lesson-body");
    const scroller = lessonBody instanceof HTMLElement && lessonBody.scrollHeight > lessonBody.clientHeight + 8 ? lessonBody : pane;
    const bar = pane.querySelector(".note-find");
    const paneScrolls = scroller.scrollHeight > scroller.clientHeight + 8;
    const anchor = paneScrolls ? scroller.getBoundingClientRect().top : 0;
    const cover = Math.max(anchor, bar?.getBoundingClientRect().bottom || 0);
    const delta = node.getBoundingClientRect().top - cover - 12;
    if (Math.abs(delta) < 8) return;
    if (paneScrolls) scroller.scrollTop += delta;
    else window.scrollBy(0, delta);
  }, [findIndex, lessonFind, topicId, mode]);

  useEffect(() => {
    if (requested && (conceptById(requested) || seleniumById(requested) || playwrightById(requested) || manualById(requested) || mongoById(requested) || restById(requested))) {
      setTopicId(requested);
      setMode(DEFAULT_CONCEPT_MODE);
      setShowList(false);
      return;
    }
    if (!requested) {
      setTopicId("");
      setShowList(true);
    }
  }, [requested]);

  useLayoutEffect(() => {
    if (!topicId) return;
    const pane = viewRef.current;
    if (!pane) return;
    pane.scrollTop = 0;
    const lessonBody = pane.querySelector(".lesson-body");
    if (lessonBody instanceof HTMLElement) lessonBody.scrollTop = 0;
    const paneScrolls = pane.scrollHeight > pane.clientHeight + 8;
    if (!paneScrolls) {
      const topbar = document.querySelector(".topbar");
      const topbarCovers =
        topbar instanceof HTMLElement &&
        getComputedStyle(topbar).display !== "none" &&
        getComputedStyle(topbar).position === "sticky";
      const offset = topbarCovers ? topbar.getBoundingClientRect().height : 0;
      const y = pane.getBoundingClientRect().top + window.scrollY - offset;
      window.scrollTo(0, Math.max(0, y));
    }
    const active = document.querySelector('.concepts-page .library-tree .file-button[data-active="true"]');
    const tree = active?.closest(".library-tree");
    if (active instanceof HTMLElement && tree instanceof HTMLElement && tree.scrollHeight > tree.clientHeight + 8) {
      const next = active.getBoundingClientRect().top - tree.getBoundingClientRect().top + tree.scrollTop;
      tree.scrollTop = Math.max(0, next);
    }
  }, [topicId]);

  const activeSource: OpenSource | null = looseSource
    ? looseSource
    : lesson?.sources[sourceIndex]
      ? {
          title: lesson.sources[sourceIndex].label,
          path: lesson.sources[sourceIndex].path,
          kind: lesson.sources[sourceIndex].kind,
          focus: lesson.sources[sourceIndex].focus,
        }
      : null;
  const sourcePath = activeSource?.path || "";
  const sourceKind = activeSource?.kind || "pdf";

  useEffect(() => {
    if (mode !== "source" || !sourcePath) return;
    const cached = openedNote(sourcePath);
    if (cached?.text) {
      setSourceText(cached.text);
      setSourceError("");
      setSourceLoading(false);
      return;
    }
    let cancelled = false;
    setSourceLoading(true);
    setSourceError("");
    setSourceText("");
    void fetch(`/api/library/file?path=${encodeURIComponent(sourcePath)}`)
      .then(async (response) => {
        const data = (await response.json()) as { text?: string; error?: string };
        if (!response.ok || !data.text) throw new Error(data.error || "Could not open that source.");
        rememberOpenedNote(sourcePath, sourceKind, data.text);
        if (!cancelled) setSourceText(data.text);
      })
      .catch((caught) => {
        if (!cancelled) setSourceError(caught instanceof Error ? caught.message : "Could not open that source.");
      })
      .finally(() => {
        if (!cancelled) setSourceLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [mode, sourcePath, sourceKind]);

  function openLesson(id: string) {
    setTopicId(id);
    setMode(DEFAULT_CONCEPT_MODE);
    setLooseSource(null);
    setSourceIndex(0);
    setLessonFind("");
    setShowList(false);
    const subject = restById(id) ? "rest-assured" : mongoById(id) ? "mongodb" : manualById(id) ? "manual-testing" : playwrightById(id) ? "playwright" : seleniumById(id) ? "selenium" : "java";
    router.push(`/concepts?subject=${subject}&topic=${encodeURIComponent(id)}`, { scroll: false });
  }

  function openSubjects() {
    setTopicId("");
    setShowList(true);
    setQuery("");
    setLessonFind("");
    router.push("/concepts");
  }

  function openSubject(id: string) {
    setTopicId("");
    setShowList(true);
    setQuery("");
    router.push(id === "java" ? "/concepts?subject=java" : `/concepts?subject=${encodeURIComponent(id)}`);
  }

  function openSource(source: ConceptSource) {
    setLooseSource(null);
    const index = lesson?.sources.findIndex((item) => item.path === source.path) ?? -1;
    setSourceIndex(index >= 0 ? index : 0);
    setMode("source");
    setShowList(false);
  }

  function openRepo(hit: RepoHit) {
    if (!hit.path) return;
    const kind = hit.path.toLowerCase().endsWith(".pdf") ? "pdf" : "java";
    setLooseSource({ title: hit.title, path: hit.path, kind, focus: hit.focus });
    setMode("source");
    setShowList(false);
  }

  async function searchLibrary() {
    const asked = query.trim();
    setRepoHit(null);
    setSearchError("");
    if (asked.length < 3) return;
    try {
      const response = await fetch("/api/interview", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question: asked, repoOnly: true }),
      });
      const data = (await response.json()) as RepoHit & { error?: string };
      if (!response.ok) throw new Error(data.error || "Could not search the library.");
      if (data.source === "repo") setRepoHit(data);
    } catch (caught) {
      setSearchError(caught instanceof Error ? caught.message : "Could not search the library.");
    }
  }

  async function copyText(label: string, value: string) {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(label);
    } catch {
      setCopied("");
    }
  }

  const topicIsJava = Boolean(requested && conceptById(requested));
  const topicIsSelenium = Boolean(requested && seleniumById(requested));
  const topicIsPlaywright = Boolean(requested && playwrightById(requested));
  const topicIsManual = Boolean(requested && manualById(requested));
  const topicIsMongo = Boolean(requested && mongoById(requested));
  const topicIsRest = Boolean(requested && restById(requested));
  const showingJava = subjectId === "java" || (!subjectId && topicIsJava);
  const showingSelenium = subjectId === "selenium" || (!subjectId && topicIsSelenium && !showingJava);
  const showingPlaywright = subjectId === "playwright" || (!subjectId && topicIsPlaywright && !showingJava && !showingSelenium);
  const showingManual = subjectId === "manual-testing" || (!subjectId && topicIsManual && !showingJava && !showingSelenium && !showingPlaywright);
  const showingMongo = subjectId === "mongodb" || (!subjectId && topicIsMongo && !showingJava && !showingSelenium && !showingPlaywright && !showingManual);
  const showingRest = subjectId === "rest-assured" || (!subjectId && topicIsRest && !showingJava && !showingSelenium && !showingPlaywright && !showingManual && !showingMongo);
  const showingLibrary = showingJava || showingSelenium || showingPlaywright || showingManual || showingMongo || showingRest;
  const laterSubject = !showingLibrary && subjectId
    ? subjectById(subjectId) || { id: subjectId, title: "Subject", status: "later" as const, note: "This subject is not in the library yet." }
    : undefined;
  const topicGroups = showingRest ? REST_GROUPS : showingMongo ? MONGO_GROUPS : showingManual ? MANUAL_GROUPS : showingPlaywright ? PLAYWRIGHT_GROUPS : showingSelenium ? SELENIUM_GROUPS : CONCEPT_GROUPS;
  const topicsInGroup = showingRest ? restInGroup : showingMongo ? mongoInGroup : showingManual ? manualInGroup : showingPlaywright ? playwrightInGroup : showingSelenium ? seleniumInGroup : conceptsInGroup;
  const repoVisible =
    Boolean(repoHit?.path) &&
    (showingRest
      ? /rest.?assured/i.test(repoHit?.path || "")
      : showingMongo
      ? /mongo/i.test(repoHit?.path || "")
      : showingManual
        ? /manual/i.test(repoHit?.path || "")
        : showingPlaywright
          ? /playwright/i.test(repoHit?.path || "")
          : !showingSelenium || /selenium|pop-up|popup/i.test(repoHit?.path || ""));
  const orderedTopics = topicGroups.flatMap((group) => topicsInGroup(group.id).map((item) => item.id));
  const topicIndex = orderedTopics.indexOf(topicId);
  const previousTopic = topicIndex > 0 ? orderedTopics[topicIndex - 1] : "";
  const nextTopic = topicIndex >= 0 && topicIndex < orderedTopics.length - 1 ? orderedTopics[topicIndex + 1] : "";
  const libraryTitle = showingRest ? "REST Assured concepts" : showingMongo ? "MongoDB concepts" : showingManual ? "Manual testing concepts" : showingPlaywright ? "Playwright concepts" : showingSelenium ? "Selenium concepts" : "Java concepts";

  return (
    <div className={`concepts-page${showingLibrary && !showList ? " reading" : ""}`}>
      {!showingLibrary && !laterSubject ? (
        <div className="programs-intro">
          <h1>Interview preparation</h1>
          <p className="lede">Choose a subject. Java, Selenium, Playwright, Manual Testing, MongoDB, and REST Assured are ready. The other subjects stay in Programs until their lessons are converted.</p>
          <div className="subject-grid">
            {STUDY_SUBJECTS.map((subject) => (
              <button key={subject.id} className="subject-card" type="button" data-ready={subject.status === "ready"} onClick={() => openSubject(subject.id)}>
                <strong>{subject.title}</strong>
                <span>{subject.status === "ready" ? "Open lessons" : "Not converted yet"}</span>
                <span className="subject-note">{subject.note}</span>
              </button>
            ))}
          </div>
        </div>
      ) : null}
      {laterSubject ? (
        <div className="programs-intro">
          <button className="btn secondary" type="button" onClick={openSubjects}>Back to subjects</button>
          <h1>{laterSubject.title}</h1>
          <p className="lede">{laterSubject.note} The original files stay in Programs.</p>
        </div>
      ) : null}
      {showingLibrary ? (
        <>
      <div className="programs-intro">
        <button className="btn secondary" type="button" onClick={openSubjects}>Back to subjects</button>
        <h1>{libraryTitle}</h1>
        <p className="lede">
          Learn mode is the default. Source mode opens the saved PDF or Java program. The original files stay in
          Programs.
        </p>
      </div>
      <div className="library">
        <button className="btn secondary subject-back" type="button" onClick={openSubjects}>Back to subjects</button>
        <aside className="library-tree" aria-label={showingRest ? "REST Assured topics" : showingMongo ? "MongoDB topics" : showingManual ? "Manual testing topics" : showingPlaywright ? "Playwright topics" : showingSelenium ? "Selenium topics" : "Java topics"}>
          <form
            className="concept-search"
            onSubmit={(event) => {
              event.preventDefault();
              void searchLibrary();
            }}
          >
            <input
              aria-label="Search concepts"
              value={query}
              placeholder={showingRest ? "Search given, JSONPath, auth" : showingMongo ? "Search find, filter, aggregation" : showingManual ? "Search smoke, severity, regression" : showingPlaywright ? "Search locators, expect, trace" : showingSelenium ? "Search locators, waits, TestNG" : "Search OOP, ArrayList, second largest"}
              onChange={(event) => setQuery(event.target.value)}
            />
          </form>
          {searchError ? <p className="error">{searchError}</p> : null}
          {lessonHits.length ? (
            <div className="file-list">
              {lessonHits.slice(0, 6).map((hit) => (
                <button key={hit.id} className="file-button" type="button" onClick={() => openLesson(hit.id)}>
                  <span className="result-kind">Lesson</span> {hit.title}
                </button>
              ))}
            </div>
          ) : null}
          {repoVisible && repoHit?.code ? (
            <button className="file-button" type="button" onClick={() => openRepo(repoHit)}>
              <span className="result-kind">Program</span> {repoHit.title}
            </button>
          ) : null}
          {repoVisible && repoHit?.answer && repoHit.path?.toLowerCase().endsWith(".pdf") ? (
            <button className="file-button" type="button" onClick={() => openRepo(repoHit)}>
              <span className="result-kind">Source note</span> {repoHit.title}
            </button>
          ) : null}
          {topicGroups.map((group) => (
            <section key={group.id}>
              <p className="concept-group">{group.title}</p>
              <div className="file-list">
                {topicsInGroup(group.id).map((item) => (
                  <button
                    key={item.id}
                    className="file-button"
                    type="button"
                    data-active={item.id === topicId}
                    onClick={() => openLesson(item.id)}
                  >
                    {item.title}
                  </button>
                ))}
              </div>
            </section>
          ))}
        </aside>
        <section className="library-view" ref={viewRef}>
          <div className="read-bar">
            <button type="button" onClick={openSubjects}>Subjects</button>
            <button type="button" onClick={() => setShowList(true)}>
              Topics
            </button>
            <strong>{lesson?.title || libraryTitle}</strong>
          </div>
          {!lesson ? <p className="hint">Choose a topic. Learn mode opens first.</p> : null}
          {lesson ? (
            <>
              <div className="mode-switch">
                <button type="button" data-active={mode === "learn"} onClick={() => { setMode("learn"); setLooseSource(null); }}>
                  Learn
                </button>
                <button type="button" data-active={mode === "source"} onClick={() => setMode("source")} disabled={!lesson.sources.length && !looseSource}>
                  Source
                </button>
              </div>
              {mode === "learn" ? (
                <LearnLesson
                  lesson={lesson}
                  query={lessonFind}
                  active={findIndex}
                  copied={copied}
                  onQuery={setLessonFind}
                  onStep={(delta) => {
                    if (!inLesson) return;
                    setFindAt((value) => (value + delta + inLesson) % inLesson);
                  }}
                  matchCount={inLesson}
                  onCopy={(label, value) => void copyText(label, value)}
                  onOpen={openLesson}
                  onSource={(index) => {
                    setSourceIndex(index);
                    setLooseSource(null);
                    setMode("source");
                  }}
                />
              ) : (
                <div>
                  {lesson.sources.length > 1 && !looseSource ? (
                    <div className="examples">
                      {lesson.sources.map((source, index) => (
                        <button key={source.path + source.label} className="chip" type="button" data-active={index === sourceIndex} onClick={() => openSource(source)}>
                          {source.label}
                        </button>
                      ))}
                    </div>
                  ) : null}
                  {sourceLoading ? <p className="hint">Opening the saved source…</p> : null}
                  {sourceError ? <p className="error">{sourceError}</p> : null}
                  {!activeSource ? <p className="hint">This lesson has no saved source file.</p> : null}
                  {activeSource && sourceText ? (
                    <NoteReader text={sourceText} kind={activeSource.kind} title={activeSource.title} focus={activeSource.focus} />
                  ) : null}
                </div>
              )}
              <div className="lesson-actions">
                <button className="btn secondary" type="button" disabled={!previousTopic} onClick={() => previousTopic && openLesson(previousTopic)}>
                  Previous lesson
                </button>
                <button className="btn secondary" type="button" disabled={!nextTopic} onClick={() => nextTopic && openLesson(nextTopic)}>
                  Next lesson
                </button>
              </div>
            </>
          ) : null}
        </section>
      </div>
        </>
      ) : null}
    </div>
  );
}
