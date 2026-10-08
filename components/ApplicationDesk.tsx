"use client";

import { FormEvent, useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import type { ApplicationRound } from "@/lib/types";

const STAGES = ["Technical Round", "Assignment", "HR Round", "Final Round", "Applied"];
const STATUSES = ["Selected", "Rejected", "Pending", "No Response", "Hold"];

const emptyRound = (company = ""): ApplicationRound => ({
  id: "",
  company,
  date: new Date().toISOString().slice(0, 10),
  source: "",
  stage: "Technical Round",
  status: "Pending",
  note: "",
});

function formatDate(value: string): string {
  const date = new Date(`${value}T00:00:00`);
  if (Number.isNaN(date.getTime())) return value || "No date";
  return date.toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
}

function statusClass(status: string): string {
  const key = status.toLowerCase().replace(/\s+/g, "-");
  return key ? `status-${key}` : "status-open";
}

function RoundEditor({
  draft,
  setDraft,
  rounds,
  busy,
  onSubmit,
}: {
  draft: ApplicationRound;
  setDraft: (round: ApplicationRound | null) => void;
  rounds: ApplicationRound[];
  busy: boolean;
  onSubmit: (event: FormEvent) => void;
}) {
  const stageOptions = draft.stage && !STAGES.includes(draft.stage) ? [draft.stage, ...STAGES] : STAGES;
  const statusOptions = draft.status && !STATUSES.includes(draft.status) ? [draft.status, ...STATUSES] : STATUSES;
  return (
    <form className="panel round-editor" onSubmit={onSubmit}>
      <h2>{draft.id ? "Edit round" : draft.company ? `Add a round at ${draft.company}` : "New company"}</h2>
      <div className="field">
        <label htmlFor="application-company">Company</label>
        <input
          id="application-company"
          type="text"
          list="application-companies"
          value={draft.company}
          onChange={(event) => setDraft({ ...draft, company: event.target.value })}
        />
        <datalist id="application-companies">
          {[...new Set(rounds.map((round) => round.company))].map((company) => (
            <option key={company} value={company} />
          ))}
        </datalist>
      </div>
      <div className="split">
        <div className="field">
          <label htmlFor="application-date">Date</label>
          <input id="application-date" type="date" value={draft.date} onChange={(event) => setDraft({ ...draft, date: event.target.value })} />
        </div>
        <div className="field">
          <label htmlFor="application-source">Round</label>
          <input
            id="application-source"
            type="text"
            value={draft.source}
            placeholder="2nd Round"
            onChange={(event) => setDraft({ ...draft, source: event.target.value })}
          />
        </div>
      </div>
      <div className="split">
        <div className="field">
          <label htmlFor="application-stage">Stage</label>
          <select id="application-stage" value={draft.stage} onChange={(event) => setDraft({ ...draft, stage: event.target.value })}>
            <option value="">Not set</option>
            {stageOptions.map((stage) => (
              <option key={stage}>{stage}</option>
            ))}
          </select>
        </div>
        <div className="field">
          <label htmlFor="application-status">Status</label>
          <select id="application-status" value={draft.status} onChange={(event) => setDraft({ ...draft, status: event.target.value })}>
            <option value="">Open</option>
            {statusOptions.map((status) => (
              <option key={status}>{status}</option>
            ))}
          </select>
        </div>
      </div>
      <div className="field">
        <label htmlFor="application-note">Note</label>
        <input id="application-note" type="text" value={draft.note} onChange={(event) => setDraft({ ...draft, note: event.target.value })} />
      </div>
      <div className="actions">
        <button className="btn" type="submit" disabled={busy}>
          {busy ? "Saving…" : "Save round"}
        </button>
        <button className="btn secondary" type="button" onClick={() => setDraft(null)}>
          Cancel
        </button>
      </div>
    </form>
  );
}

export function ApplicationDesk() {
  const [rounds, setRounds] = useState<ApplicationRound[]>([]);
  const [ready, setReady] = useState(false);
  const [error, setError] = useState("");
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState("All");
  const [draft, setDraft] = useState<ApplicationRound | null>(null);
  const [busy, setBusy] = useState(false);
  const keepScroll = useRef<number | null>(null);

  async function refresh() {
    const response = await fetch("/api/applications");
    const data = (await response.json()) as { rounds?: ApplicationRound[]; error?: string };
    if (!response.ok) throw new Error(data.error || "Could not load your applications.");
    setRounds(data.rounds || []);
  }

  useEffect(() => {
    let cancel = false;
    refresh()
      .catch((caught) => {
        if (!cancel) setError(caught instanceof Error ? caught.message : "Could not load your applications.");
      })
      .finally(() => {
        if (!cancel) setReady(true);
      });
    return () => {
      cancel = true;
    };
  }, []);

  const companies = useMemo(() => {
    const needle = query.trim().toLowerCase();
    const grouped = new Map<string, ApplicationRound[]>();
    for (const round of rounds) {
      const name = round.company.trim();
      const key = name.toLowerCase();
      if (needle && !key.includes(needle) && !round.stage.toLowerCase().includes(needle) && !round.source.toLowerCase().includes(needle)) {
        continue;
      }
      const list = grouped.get(key) || [];
      list.push({ ...round, company: name });
      grouped.set(key, list);
    }
    return [...grouped.values()]
      .map((list) => list.sort((a, b) => a.date.localeCompare(b.date) || a.id.localeCompare(b.id)))
      .filter((list) => filter === "All" || list.some((round) => (round.status || "Open") === filter))
      .sort((a, b) => (b[b.length - 1]?.date || "").localeCompare(a[a.length - 1]?.date || ""));
  }, [rounds, query, filter]);

  const counts = useMemo(() => {
    const tally = new Map<string, number>();
    for (const round of rounds) {
      const status = round.status || "Open";
      tally.set(status, (tally.get(status) || 0) + 1);
    }
    return tally;
  }, [rounds]);

  async function save(event: FormEvent) {
    event.preventDefault();
    if (!draft?.company.trim()) {
      setError("Add the company name.");
      return;
    }
    setBusy(true);
    setError("");
    try {
      const round = { ...draft, id: draft.id || crypto.randomUUID(), company: draft.company.trim() };
      const response = await fetch("/api/applications", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ round }),
      });
      const data = (await response.json()) as { error?: string };
      if (!response.ok) throw new Error(data.error || "Could not save that round.");
      setDraft(null);
      await refresh();
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Could not save that round.");
    } finally {
      setBusy(false);
    }
  }

  useLayoutEffect(() => {
    if (keepScroll.current == null) return;
    window.scrollTo(0, keepScroll.current);
  }, [draft]);

  useEffect(() => {
    if (keepScroll.current == null) return;
    window.scrollTo(0, keepScroll.current);
    keepScroll.current = null;
  }, [draft]);

  function openEditor(round: ApplicationRound) {
    keepScroll.current = window.scrollY;
    setDraft(round);
  }

  async function remove(round: ApplicationRound) {
    if (!window.confirm(`Delete the ${round.stage || "round"} at ${round.company}?`)) return;
    setError("");
    try {
      const response = await fetch(`/api/applications?id=${encodeURIComponent(round.id)}`, { method: "DELETE" });
      const data = (await response.json()) as { error?: string };
      if (!response.ok) throw new Error(data.error || "Could not delete that round.");
      if (draft?.id === round.id) setDraft(null);
      await refresh();
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Could not delete that round.");
    }
  }

  if (!ready) return <p className="hint">Loading applications…</p>;

  return (
    <div className="narrow applications-page">
      <h1>Applications</h1>
      <p className="lede">Each company stays in one place. Add another round when the same office calls you back.</p>
      <div className="examples">
        <button className="chip" type="button" data-active={filter === "All" || undefined} onClick={() => setFilter("All")}>
          All {rounds.length}
        </button>
        {STATUSES.map((status) => (
          <button key={status} className="chip" type="button" data-active={filter === status || undefined} onClick={() => setFilter(status)}>
            {status} {counts.get(status) || 0}
          </button>
        ))}
      </div>
      <div className="field" style={{ marginTop: 14 }}>
        <label htmlFor="application-search">Search company or round</label>
        <input id="application-search" type="text" value={query} placeholder="Deloitte" onChange={(event) => setQuery(event.target.value)} />
      </div>
      {error ? <p className="error">{error}</p> : null}
      <div className="actions">
        <button className="btn" type="button" onClick={() => setDraft(emptyRound())}>
          Add company
        </button>
      </div>

      {draft && !draft.id && !draft.company ? (
        <RoundEditor draft={draft} setDraft={setDraft} rounds={rounds} busy={busy} onSubmit={save} />
      ) : null}

      <div className="application-list">
        {companies.length === 0 ? <p className="empty">No applications match this search.</p> : null}
        {companies.map((list) => {
          const latest = list[list.length - 1];
          const addingHere = Boolean(draft && !draft.id && draft.company.toLowerCase() === list[0].company.toLowerCase());
          return (
            <article className="card application-company" key={list[0].company.toLowerCase()}>
              <div className="application-head">
                <div>
                  <h2>{list[0].company}</h2>
                  <p className="hint">
                    {list.length} {list.length === 1 ? "round" : "rounds"}
                  </p>
                </div>
                <span className={`pill ${statusClass(latest.status)}`}>{latest.status || "Open"}</span>
                <button
                  className="btn secondary"
                  type="button"
                  onClick={() =>
                    setDraft({
                      ...emptyRound(list[0].company),
                      source: `${list.length + 1}${list.length === 0 ? "st" : list.length === 1 ? "nd" : list.length === 2 ? "rd" : "th"} Round`,
                    })
                  }
                >
                  Add round
                </button>
              </div>
              {addingHere && draft ? (
                <RoundEditor draft={draft} setDraft={setDraft} rounds={rounds} busy={busy} onSubmit={save} />
              ) : null}
              <div>
                {list.map((round) => (
                  <div key={round.id}>
                    <div className="round-row">
                      <time>{formatDate(round.date)}</time>
                      <div>
                        <strong>{[round.source, round.stage].filter(Boolean).join(" · ") || "Round"}</strong>
                        {round.note ? <p className="hint">{round.note}</p> : null}
                      </div>
                      <span className={`pill ${statusClass(round.status)}`}>{round.status || "Open"}</span>
                      <div className="round-actions">
                        <button className="btn secondary" type="button" onClick={() => openEditor(round)}>
                          Edit
                        </button>
                        <button className="btn danger" type="button" onClick={() => void remove(round)}>
                          Delete
                        </button>
                      </div>
                    </div>
                    {draft?.id === round.id ? (
                      <RoundEditor draft={draft} setDraft={setDraft} rounds={rounds} busy={busy} onSubmit={save} />
                    ) : null}
                  </div>
                ))}
              </div>
            </article>
          );
        })}
      </div>
    </div>
  );
}
