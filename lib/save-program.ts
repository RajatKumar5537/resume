import mongoose from "mongoose";
import dbConnect from "@/lib/mongodb";
import { clearInterviewNotesCache } from "@/lib/interview-library";
import { topicKey } from "@/lib/interview";
import { bumpRevision } from "@/lib/sync-library";

let indexed = false;

export function ownerSlug(email: string): string {
  return email.trim().toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") || "user";
}

export async function saveGeneratedProgram(
  ownerId: string,
  input: { title: string; language: string; code: string; explanation?: string; aliases?: string[] },
): Promise<{ path: string; duplicate: boolean }> {
  const owner = ownerId.trim().toLowerCase();
  const title = input.title.trim().slice(0, 200);
  const language = (input.language || "java").trim().toLowerCase().slice(0, 40);
  const code = input.code.trim().slice(0, 20000);
  const explanation = (input.explanation || "").trim().slice(0, 20000);
  const aliases = (input.aliases || []).map((alias) => alias.trim()).filter(Boolean).slice(0, 8);
  if (!owner || !title || !code) throw new Error("Add a title and the program before saving.");
  const titleKey = topicKey(title);
  await dbConnect();
  const collection = mongoose.connection.collection("interview_notes");
  if (!indexed) {
    await collection.createIndex({ ownerId: 1, titleKey: 1, language: 1 });
    indexed = true;
  }
  const existing = await collection.findOne({ kind: "saved", ownerId: owner, titleKey, language }, { projection: { path: 1 } });
  if (existing && typeof existing.path === "string") return { path: existing.path, duplicate: true };
  const slug = titleKey.replace(/\s+/g, "-").replace(/[^a-z0-9-]+/g, "").slice(0, 80) || "program";
  const path = `library/${ownerSlug(owner)}/${language}-${slug}`;
  const now = new Date().toISOString();
  await collection.updateOne(
    { path },
    {
      $set: {
        kind: "saved",
        path,
        title,
        titleKey,
        language,
        text: code,
        explanation,
        aliases,
        ownerId: owner,
        source: "gemini",
        updatedAt: now,
      },
      $setOnInsert: { createdAt: now },
    },
    { upsert: true },
  );
  clearInterviewNotesCache();
  await bumpRevision();
  return { path, duplicate: false };
}
