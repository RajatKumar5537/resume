import { readFileSync } from "node:fs";
import mongoose from "mongoose";
import { extractText, getDocumentProxy } from "unpdf";

const text = readFileSync(new URL("../.env.local", import.meta.url), "utf8");
const raw = text.split(/\r?\n/).find((line) => line.startsWith("MONGODB_URI="))?.slice("MONGODB_URI=".length).trim() ?? "";
const uri = raw.replace(/^"|"$/g, "");
const repo = "RajatKumar5537/Java-Selenium-Program";
const branch = "master";

function titleFrom(path) {
  return (path.split("/").pop() || path).replace(/\.(java|pdf)$/i, "").replace(/[_-]+/g, " ");
}

await mongoose.connect(uri, { dbName: "resume-builder", serverSelectionTimeoutMS: 20000 });
const notes = mongoose.connection.collection("interview_notes");
await notes.createIndex({ path: 1 }, { unique: true });

const treeResponse = await fetch(`https://api.github.com/repos/${repo}/git/trees/${branch}?recursive=1`, {
  headers: { Accept: "application/vnd.github+json", "User-Agent": "desk-resumes" },
});
if (!treeResponse.ok) throw new Error(`Tree request failed: ${treeResponse.status}`);
const tree = await treeResponse.json();
const files = (tree.tree || []).filter(
  (item) => item.type === "blob" && item.path && /\.(java|pdf)$/i.test(item.path) && !item.path.startsWith("test-output/") && !item.path.startsWith("driver/"),
);

let saved = 0;
for (const file of files) {
  const encoded = file.path.split("/").map((part) => encodeURIComponent(part)).join("/");
  const response = await fetch(`https://raw.githubusercontent.com/${repo}/${branch}/${encoded}`, {
    headers: { "User-Agent": "desk-resumes" },
  });
  if (!response.ok) {
    console.log("skip", file.path, response.status);
    continue;
  }
  const kind = file.path.toLowerCase().endsWith(".pdf") ? "pdf" : "java";
  let body = "";
  if (kind === "pdf") {
    const bytes = new Uint8Array(await response.arrayBuffer());
    const pdf = await getDocumentProxy(bytes);
    const extracted = await extractText(pdf, { mergePages: true });
    const rawText = Array.isArray(extracted.text) ? extracted.text.join("\n\n") : extracted.text;
    body = rawText.replace(/[ \t]+\n/g, "\n").replace(/\n{3,}/g, "\n\n").trim();
  } else {
    body = (await response.text()).trim();
  }
  if (!body) {
    console.log("empty", file.path);
    continue;
  }
  await notes.updateOne(
    { path: file.path },
    { $set: { kind, path: file.path, title: titleFrom(file.path), text: body, sha: file.sha, updatedAt: new Date().toISOString() } },
    { upsert: true },
  );
  saved += 1;
  console.log(saved, kind, file.path, body.length);
}

const counts = await notes.aggregate([{ $group: { _id: "$kind", count: { $sum: 1 } } }]).toArray();
console.log("stored", JSON.stringify(counts));
await mongoose.disconnect();
