import dbConnect from "@/lib/mongodb";
import ResumeBuilder from "@/lib/models/ResumeBuilder";
import type { Profile, ResumeDoc } from "@/lib/types";

const OWNER = "owner";

type Row = {
  kind?: string;
  recordId?: string;
  payload?: unknown;
};

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

export async function readProfile(): Promise<Profile | null> {
  await dbConnect();
  const row = await ResumeBuilder.findOne({ kind: "profile", recordId: OWNER }).lean<Row>();
  return row && isProfile(row.payload) ? row.payload : null;
}

export async function writeProfile(profile: Profile): Promise<void> {
  await dbConnect();
  await ResumeBuilder.findOneAndUpdate(
    { kind: "profile", recordId: OWNER },
    { kind: "profile", recordId: OWNER, updatedAt: new Date().toISOString(), payload: profile },
    { upsert: true },
  );
}

export async function listResumes(): Promise<ResumeDoc[]> {
  await dbConnect();
  const rows = await ResumeBuilder.find({ kind: "resume" }).sort({ updatedAt: -1 }).lean<Row[]>();
  return rows.map((row) => row.payload).filter(isResume);
}

export async function writeResume(doc: ResumeDoc): Promise<void> {
  await dbConnect();
  await ResumeBuilder.findOneAndUpdate(
    { kind: "resume", recordId: doc.id },
    { kind: "resume", recordId: doc.id, updatedAt: doc.updatedAt || "", payload: doc },
    { upsert: true },
  );
}

export async function removeResume(id: string): Promise<void> {
  await dbConnect();
  await ResumeBuilder.deleteOne({ kind: "resume", recordId: id });
}

export async function replaceDesk(profile: Profile, resumes: ResumeDoc[]): Promise<void> {
  await writeProfile(profile);
  const ids = resumes.map((resume) => resume.id);
  await ResumeBuilder.deleteMany({ kind: "resume", recordId: { $nin: ids } });
  for (const resume of resumes) {
    await writeResume(resume);
  }
}
