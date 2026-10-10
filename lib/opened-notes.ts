export type OpenedKind = "java" | "pdf";

type OpenedNote = {
  kind: OpenedKind;
  text: string;
};

type CachedAnswer = {
  source: "repo" | "gemini" | "missing" | "choices";
  origin?: "mongodb" | "github";
  title: string;
  path?: string;
  url?: string;
  code?: string;
  answer?: string;
  focus?: string;
  language?: string;
  note: string;
  choices?: { path: string; title: string; origin: "mongodb" | "github" }[];
  related?: { path: string; title: string; origin: "mongodb" | "github" }[];
};

const notes = new Map<string, OpenedNote>();
const answers = new Map<string, CachedAnswer>();
let seenRevision = "";
let seenUser = "";

function questionKey(question: string): string {
  return question.trim().toLowerCase().replace(/\s+/g, " ");
}

export function clearOpenedNotes(): void {
  notes.clear();
  answers.clear();
}

export function syncNoteCacheRevision(revision: string): void {
  if (!revision) return;
  if (seenRevision && seenRevision !== revision) clearOpenedNotes();
  seenRevision = revision;
}

export function syncNoteCacheUser(userId: string): void {
  if (seenUser && seenUser !== userId) clearOpenedNotes();
  seenUser = userId;
}

export function openedNote(path: string): OpenedNote | undefined {
  return notes.get(path);
}

export function rememberOpenedNote(path: string, kind: OpenedKind, text: string): void {
  if (!path || !text) return;
  notes.set(path, { kind, text });
}

export function cachedAnswer(question: string): CachedAnswer | undefined {
  return answers.get(questionKey(question));
}

export function rememberAnswer(question: string, result: CachedAnswer): void {
  const key = questionKey(question);
  if (!key || result.source === "missing") return;
  answers.set(key, result);
}
