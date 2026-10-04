import { extractText, getDocumentProxy } from "unpdf";
import mongoose from "mongoose";
import dbConnect from "@/lib/mongodb";
import { clearInterviewNotesCache } from "@/lib/interview-library";

const REPO = "RajatKumar5537/Java-Selenium-Program";
const BRANCH = "master";

type RepoFile = { path: string; sha: string };

function allowed(path: string): boolean {
  if (path.includes("..") || path.startsWith("test-output/") || path.startsWith("driver/")) return false;
  return (path.startsWith("Interview_PDF/") || path.startsWith("src/")) && /\.(pdf|java)$/i.test(path);
}

function titleFrom(path: string): string {
  return (path.split("/").pop() || path).replace(/\.(java|pdf)$/i, "").replace(/[_-]+/g, " ");
}

async function notes() {
  await dbConnect();
  return mongoose.connection.collection("interview_notes");
}

async function bumpRevision(): Promise<void> {
  const updatedAt = new Date().toISOString();
  const collection = await notes();
  await collection.updateOne(
    { path: "_revision" },
    { $set: { path: "_revision", kind: "meta", text: updatedAt, updatedAt } },
    { upsert: true },
  );
  clearInterviewNotesCache();
}

async function repoFiles(): Promise<RepoFile[]> {
  const response = await fetch(`https://api.github.com/repos/${REPO}/git/trees/${BRANCH}?recursive=1`, {
    headers: { Accept: "application/vnd.github+json", "User-Agent": "desk-resumes" },
  });
  if (!response.ok) throw new Error("Could not read the program repo.");
  const tree = (await response.json()) as { tree?: { type?: string; path?: string; sha?: string }[] };
  return (tree.tree || []).flatMap((item) => {
    if (item.type !== "blob" || !item.path || !item.sha || !allowed(item.path)) return [];
    return [{ path: item.path, sha: item.sha }];
  });
}

export async function planLibrarySync(): Promise<{ pending: RepoFile[]; removed: number }> {
  const files = await repoFiles();
  const wanted = new Set(files.map((file) => file.path));
  const collection = await notes();
  const rows = await collection.find({ kind: { $in: ["pdf", "java"] } }, { projection: { path: 1, sha: 1 } }).toArray();
  const saved = new Map(rows.map((row) => [String(row.path || ""), typeof row.sha === "string" ? row.sha : ""]));
  const stale = [...saved.keys()].filter((path) => path && !wanted.has(path));
  if (stale.length) await collection.deleteMany({ path: { $in: stale } });
  const pending = files.filter((file) => saved.get(file.path) !== file.sha);
  if (stale.length || !pending.length) await bumpRevision();
  return { pending, removed: stale.length };
}

export async function saveLibraryFile(path: string, sha: string): Promise<string> {
  if (!allowed(path) || !sha) throw new Error("That file is not part of the program repo.");
  const encoded = path.split("/").map((part) => encodeURIComponent(part)).join("/");
  const response = await fetch(`https://raw.githubusercontent.com/${REPO}/${BRANCH}/${encoded}`, {
    headers: { "User-Agent": "desk-resumes" },
  });
  if (!response.ok) throw new Error(`Could not download ${path.split("/").pop() || path}.`);
  const kind = path.toLowerCase().endsWith(".pdf") ? "pdf" : "java";
  let text = "";
  if (kind === "pdf") {
    const bytes = new Uint8Array(await response.arrayBuffer());
    const pdf = await getDocumentProxy(bytes);
    const extracted = await extractText(pdf, { mergePages: true });
    const raw = Array.isArray(extracted.text) ? extracted.text.join("\n\n") : extracted.text;
    text = raw.replace(/[ \t]+\n/g, "\n").replace(/\n{3,}/g, "\n\n").trim();
  } else {
    text = (await response.text()).trim();
  }
  if (!text) throw new Error(`${path.split("/").pop() || path} had no readable text.`);
  const collection = await notes();
  await collection.updateOne(
    { path },
    { $set: { kind, path, title: titleFrom(path), text, sha, updatedAt: new Date().toISOString() } },
    { upsert: true },
  );
  await bumpRevision();
  return path.split("/").pop() || path;
}
