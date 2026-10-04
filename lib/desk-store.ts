import { ensureAccountsVisible } from "@/lib/account";
import ResumeBuilder from "@/lib/models/ResumeBuilder";
import type { Profile, ResumeDoc } from "@/lib/types";

type Row = {
  kind?: string;
  recordId?: string;
  userId?: string;
  payload?: unknown;
};

function ready(): Promise<void> {
  return ensureAccountsVisible();
}

export function isProfile(value: unknown): value is Profile {
  if (!value || typeof value !== "object") return false;
  const profile = value as Profile;
  return typeof profile.name === "string" && Array.isArray(profile.experience) && Array.isArray(profile.skillGroups);
}

export function isResume(value: unknown): value is ResumeDoc {
  if (!value || typeof value !== "object") return false;
  const doc = value as ResumeDoc;
  return typeof doc.id === "string" && doc.id.length > 0;
}

export async function readProfile(userId: string): Promise<Profile | null> {
  await ready();
  const row = await ResumeBuilder.findOne({ kind: "profile", userId }).lean<Row>();
  return row && isProfile(row.payload) ? row.payload : null;
}

export async function writeProfile(userId: string, profile: Profile): Promise<void> {
  await ready();
  await ResumeBuilder.findOneAndUpdate(
    { kind: "profile", recordId: userId },
    { kind: "profile", recordId: userId, userId, updatedAt: new Date().toISOString(), payload: profile },
    { upsert: true },
  );
}

export async function listResumes(userId: string): Promise<ResumeDoc[]> {
  await ready();
  const rows = await ResumeBuilder.find({ kind: "resume", userId }).sort({ updatedAt: -1 }).lean<Row[]>();
  return rows.map((row) => row.payload).filter(isResume);
}

export async function writeResume(userId: string, doc: ResumeDoc): Promise<void> {
  await ready();
  await ResumeBuilder.findOneAndUpdate(
    { kind: "resume", recordId: doc.id, userId },
    { kind: "resume", recordId: doc.id, userId, updatedAt: doc.updatedAt || "", payload: doc },
    { upsert: true },
  );
}

export async function removeResume(userId: string, id: string): Promise<void> {
  await ready();
  await ResumeBuilder.deleteOne({ kind: "resume", recordId: id, userId });
}

export async function replaceDesk(userId: string, profile: Profile, resumes: ResumeDoc[]): Promise<void> {
  await writeProfile(userId, profile);
  const ids = resumes.map((resume) => resume.id);
  await ResumeBuilder.deleteMany({ kind: "resume", userId, recordId: { $nin: ids } });
  for (const resume of resumes) {
    await writeResume(userId, resume);
  }
}
