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
let listCache: { revision: string; files: ListedFile[] } | null = null;

export function clearInterviewNotesCache(): void {
  cache = null;
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
  if (!path || path.startsWith("_")) return null;
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

export async function loadInterviewNotes(): Promise<StoredNote[]> {
  await dbConnect();
  const revision = await revisionStamp();
  if (cache?.revision === revision && revision) return cache.notes;
  const rows = await notesCollection()
    .find({ path: { $not: /^_/ } }, { projection: { path: 1, kind: 1, title: 1, text: 1 } })
    .toArray();
  const notes = rows.flatMap((row) => {
    const file = listedFile(row as { [key: string]: unknown });
    const text = typeof row.text === "string" ? row.text.trim() : "";
    if (!file || !text) return [];
    return [{ ...file, text }];
  });
  cache = { revision, notes };
  return notes;
}
