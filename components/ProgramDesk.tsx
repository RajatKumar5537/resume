"use client";

import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { JavaCode } from "@/components/JavaCode";
import { NoteText, readableNote } from "@/components/PdfNote";

type LibraryFile = {
  path: string;
  name: string;
  kind: "java" | "pdf";
};

type LibraryFolder = {
  id: string;
  label: string;
  files: LibraryFile[];
};

const LIBRARY_KEY = "desk-library";
const openedFiles = new Map<string, string>();

type SavedNote = { path: string; kind: "java" | "pdf"; text: string };
type SavedLibrary = { revision: string; folders: LibraryFolder[]; notes: SavedNote[] };
type LibraryResponse = Partial<SavedLibrary> & { unchanged?: boolean; error?: string };

function rememberNote(path: string, kind: "java" | "pdf", text: string) {
  openedFiles.set(path, kind === "pdf" ? readableNote(text) : text);
}

function applySavedNotes(notes: SavedNote[]) {
  openedFiles.clear();
  for (const note of notes) rememberNote(note.path, note.kind, note.text || "");
}

function readSavedLibrary(): SavedLibrary | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(LIBRARY_KEY);
    if (!raw) return null;
    const data = JSON.parse(raw) as Partial<SavedLibrary>;
    if (!data.revision || !Array.isArray(data.folders) || !data.folders.length || !Array.isArray(data.notes) || !data.notes.length) {
      return null;
    }
    return { revision: data.revision, folders: data.folders, notes: data.notes };
  } catch {
    return null;
  }
}

function writeSavedLibrary(saved: SavedLibrary) {
  try {
    localStorage.setItem(LIBRARY_KEY, JSON.stringify(saved));
  } catch {
    // The notes still stay in memory for this visit when the phone refuses the save.
  }
}

async function pullLibrary(revision: string): Promise<LibraryResponse> {
  const response = await fetch(`/api/library?revision=${encodeURIComponent(revision)}`);
  const data = (await response.json()) as LibraryResponse;
  if (!response.ok) throw new Error(data.error || "Could not open the programs.");
  return data;
}

function storeLibrary(data: LibraryResponse): SavedLibrary | null {
  if (!data.revision || !data.folders?.length || !data.notes?.length) return null;
  const saved = { revision: data.revision, folders: data.folders, notes: data.notes };
  writeSavedLibrary(saved);
  applySavedNotes(saved.notes);
  return saved;
}

export function ProgramDesk() {
  const [folders, setFolders] = useState<LibraryFolder[]>([]);
  const [openId, setOpenId] = useState("java");
  const [selected, setSelected] = useState<LibraryFile | null>(null);
  const [text, setText] = useState("");
  const [error, setError] = useState("");
  const [loadingList, setLoadingList] = useState(true);
  const [loadingFile, setLoadingFile] = useState(false);
  const [showFiles, setShowFiles] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [refreshNote, setRefreshNote] = useState("");
  const viewRef = useRef<HTMLElement>(null);

  useEffect(() => {
    window.scrollTo(0, 0);
    if (viewRef.current) viewRef.current.scrollTop = 0;
  }, [selected?.path, text]);

  useLayoutEffect(() => {
    const saved = readSavedLibrary();
    if (!saved) return;
    setFolders(saved.folders);
    applySavedNotes(saved.notes);
    setLoadingList(false);
  }, []);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        const saved = readSavedLibrary();
        const data = await pullLibrary(saved?.revision || "");
        if (cancelled || data.unchanged) return;
        const next = storeLibrary(data);
        if (!cancelled && next) setFolders(next.folders);
      } catch (caught) {
        if (!cancelled && !readSavedLibrary()) {
          setError(caught instanceof Error ? caught.message : "Could not open the programs.");
        }
      } finally {
        if (!cancelled) setLoadingList(false);
      }
    }
    void load();
    return () => {
      cancelled = true;
    };
  }, []);

  async function refreshNotes() {
    setRefreshing(true);
    setError("");
    setRefreshNote("Checking your repo…");
    try {
      const planResponse = await fetch("/api/library/sync", { method: "POST" });
      const plan = (await planResponse.json()) as {
        pending?: { path: string; sha: string }[];
        removed?: number;
        error?: string;
      };
      if (!planResponse.ok) throw new Error(plan.error || "Could not update the notes.");
      const pending = plan.pending || [];
      for (let index = 0; index < pending.length; index += 1) {
        const file = pending[index];
        const name = file.path.split("/").pop() || file.path;
        setRefreshNote(`Saving ${name}… ${pending.length - index} left`);
        const saveResponse = await fetch("/api/library/sync", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ path: file.path, sha: file.sha }),
        });
        const saved = (await saveResponse.json()) as { error?: string };
        if (!saveResponse.ok) throw new Error(saved.error || `Could not save ${name}.`);
      }
      openedFiles.clear();
      const saved = readSavedLibrary();
      const data = await pullLibrary(saved?.revision || "");
      if (data.unchanged && saved) applySavedNotes(saved.notes);
      const next = data.unchanged ? null : storeLibrary(data);
      if (next) setFolders(next.folders);
      if (selected) {
        const fresh = openedFiles.get(selected.path);
        if (fresh !== undefined) setText(fresh);
      }
      setRefreshNote(pending.length || plan.removed ? "Notes updated from your repo." : "Notes are already up to date.");
    } catch (caught) {
      setRefreshNote("");
      setError(caught instanceof Error ? caught.message : "Could not update the notes.");
    } finally {
      setRefreshing(false);
    }
  }

  async function choose(file: LibraryFile) {
    setSelected(file);
    setError("");
    setShowFiles(false);
    window.scrollTo(0, 0);
    if (viewRef.current) viewRef.current.scrollTop = 0;
    const saved = openedFiles.get(file.path);
    if (saved !== undefined) {
      setText(saved);
      setLoadingFile(false);
      return;
    }
    setText("");
    setLoadingFile(true);
    try {
      const response = await fetch(`/api/library/file?path=${encodeURIComponent(file.path)}`);
      const data = (await response.json()) as { text?: string; error?: string };
      if (!response.ok) throw new Error(data.error || "Could not open that file.");
      const next = file.kind === "pdf" ? readableNote(data.text || "") : data.text || "";
      openedFiles.set(file.path, next);
      setText(next);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Could not open that file.");
    } finally {
      setLoadingFile(false);
    }
  }

  return (
    <div className={`programs-page${showFiles ? "" : " reading"}`}>
      <div className="programs-intro">
        <h1>Programs</h1>
        <p className="lede">
          Pick a file. In portrait the notes fill the screen so you can read them out loud. Turn the phone sideways
          to keep the file list beside the notes.
        </p>
        <p className="update-row">
          <button className="btn secondary" type="button" disabled={refreshing} onClick={() => void refreshNotes()}>
            {refreshing ? "Updating…" : "Update notes"}
          </button>
        </p>
        {refreshNote ? <p className="hint">{refreshNote}</p> : null}
      </div>
      {error ? <p className="error">{error}</p> : null}
      <div className="library">
        <aside className="library-tree" aria-label="Program folders">
          {loadingList ? <p className="hint">Loading folders…</p> : null}
          {folders.map((folder) => {
            const open = openId === folder.id;
            return (
              <section key={folder.id}>
                <button
                  className="folder-button"
                  type="button"
                  data-open={open}
                  aria-expanded={open}
                  onClick={() => setOpenId(open ? "" : folder.id)}
                >
                  {folder.label}
                  <span>{folder.files.length}</span>
                </button>
                {open ? (
                  <div className="file-list">
                    {folder.files.map((file) => (
                      <button
                        key={file.path}
                        className="file-button"
                        type="button"
                        data-active={selected?.path === file.path}
                        onClick={() => void choose(file)}
                      >
                        {file.name}
                      </button>
                    ))}
                  </div>
                ) : null}
              </section>
            );
          })}
        </aside>
        <section className="library-view" aria-live="polite" ref={viewRef}>
          <div className="read-bar">
            <button type="button" onClick={() => setShowFiles(true)}>
              Files
            </button>
            <strong>{selected?.name || "Notes"}</strong>
          </div>
          {!selected ? <p className="hint">Choose a file from the folder list.</p> : null}
          {selected && loadingFile ? <p className="hint">Opening {selected.name}…</p> : null}
          {selected && !loadingFile ? <h2 className="read-title">{selected.name}</h2> : null}
          {selected?.kind === "java" && text ? <JavaCode code={text} /> : null}
          {selected?.kind === "pdf" && text ? <NoteText text={text} /> : null}
        </section>
      </div>
    </div>
  );
}
