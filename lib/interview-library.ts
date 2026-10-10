import mongoose from "mongoose";
import dbConnect from "@/lib/mongodb";

export type StoredNote = {
  kind: "java" | "pdf";
  path: string;
  title: string;
  text: string;
};

type ListedFile = {
  kind: "java" | "pdf";
  path: string;
  title: string;
};

let cache: { revision: string; notes: StoredNote[] } | null = null;
let pdfCache: { revision: string; notes: StoredNote[] } | null = null;
let listCache: { revision: string; files: ListedFile[] } | null = null;

export function clearInterviewNotesCache(): void {
  cache = null;
  pdfCache = null;
  listCache = null;
}

function notesCollection() {
  return mongoose.connection.collection("interview_notes");
}

async function revisionStamp(): Promise<string> {
  const revisionRow = await notesCollection().findOne({ path: "_revision" }, { projection: { updatedAt: 1 } });
  return typeof revisionRow?.updatedAt === "string" ? revisionRow.updatedAt : "";
}

export async function notesRevision(): Promise<string> {
  await dbConnect();
  return revisionStamp();
}

function listedFile(row: { [key: string]: unknown }): ListedFile | null {
  const path = typeof row.path === "string" ? row.path : "";
  if (!path || path.startsWith("_") || path.startsWith("library/") || row.kind === "saved") return null;
  const kind = row.kind === "pdf" ? "pdf" : "java";
  const title = typeof row.title === "string" && row.title.trim() ? row.title : path.split("/").pop() || path;
  return { kind, path, title };
}

export async function listInterviewFiles(): Promise<ListedFile[]> {
  await dbConnect();
  const revision = await revisionStamp();
  if (listCache?.revision === revision && revision) return listCache.files;
  const rows = await notesCollection()
    .find({ path: { $not: /^_/ } }, { projection: { path: 1, kind: 1, title: 1 } })
    .toArray();
  const files = rows.flatMap((row) => {
    const file = listedFile(row as { [key: string]: unknown });
    return file ? [file] : [];
  });
  listCache = { revision, files };
  return files;
}

export type SavedProgram = {
  path: string;
  title: string;
  language: string;
  text: string;
  explanation: string;
  aliases: string[];
};

export async function listSavedPrograms(ownerId: string): Promise<SavedProgram[]> {
  const owner = ownerId.trim().toLowerCase();
  if (!owner) return [];
  await dbConnect();
  const rows = await notesCollection()
    .find({ kind: "saved", ownerId: owner }, { projection: { path: 1, title: 1, language: 1, text: 1, explanation: 1, aliases: 1 } })
    .toArray();
  return rows.flatMap((row) => {
    const path = typeof row.path === "string" ? row.path : "";
    const text = typeof row.text === "string" ? row.text.trim() : "";
    if (!path.startsWith("library/") || !text) return [];
    const aliases = Array.isArray(row.aliases) ? row.aliases.filter((item) => typeof item === "string") : [];
    return [{
      path,
      title: typeof row.title === "string" && row.title.trim() ? row.title : path,
      language: typeof row.language === "string" && row.language.trim() ? row.language : "java",
      text,
      explanation: typeof row.explanation === "string" ? row.explanation : "",
      aliases,
    }];
  });
}

export async function readInterviewNote(path: string): Promise<StoredNote | null> {
  const saved = cache?.notes.find((note) => note.path === path);
  if (saved) return saved;
  await dbConnect();
  const row = await notesCollection().findOne(
    { path },
    { projection: { path: 1, kind: 1, title: 1, text: 1 } },
  );
  if (!row || typeof row.path !== "string" || row.path.startsWith("_")) return null;
  const text = typeof row.text === "string" ? row.text.trim() : "";
  if (!text) return null;
  const kind = row.kind === "pdf" ? "pdf" : "java";
  const title = typeof row.title === "string" && row.title.trim() ? row.title : row.path.split("/").pop() || row.path;
  return { kind, path: row.path, title, text };
}

function notesFromRows(rows: { [key: string]: unknown }[]): StoredNote[] {
  return rows.flatMap((row) => {
    const file = listedFile(row);
    const text = typeof row.text === "string" ? row.text.trim() : "";
    if (!file || !text) return [];
    return [{ ...file, text }];
  });
}

export async function loadPdfNotes(): Promise<StoredNote[]> {
  await dbConnect();
  const revision = await revisionStamp();
  if (pdfCache?.revision === revision && revision) return pdfCache.notes;
  const rows = await notesCollection()
    .find({ kind: "pdf", path: { $not: /^_/ } }, { projection: { path: 1, kind: 1, title: 1, text: 1 } })
    .toArray();
  const notes = notesFromRows(rows as { [key: string]: unknown }[]);
  pdfCache = { revision, notes };
  return notes;
}

export async function loadInterviewNotes(): Promise<StoredNote[]> {
  await dbConnect();
  const revision = await revisionStamp();
  if (cache?.revision === revision && revision) return cache.notes;
  const rows = await notesCollection()
    .find({ path: { $not: /^_/ } }, { projection: { path: 1, kind: 1, title: 1, text: 1 } })
    .toArray();
  const notes = notesFromRows(rows as { [key: string]: unknown }[]);
  cache = { revision, notes };
  return notes;
}
