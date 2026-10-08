import { ensureAccountsVisible } from "@/lib/account";
import seedRows from "@/lib/application-seed.json";
import ResumeBuilder from "@/lib/models/ResumeBuilder";
import type { ApplicationRound } from "@/lib/types";

const OWNER = "kumarrajatpradhan5364@gmail.com";

type Row = {
  recordId?: string;
  userId?: string;
  payload?: unknown;
};

function ready(): Promise<void> {
  return ensureAccountsVisible();
}

export function isApplication(value: unknown): value is ApplicationRound {
  if (!value || typeof value !== "object") return false;
  const round = value as ApplicationRound;
  return typeof round.id === "string" && round.id.length > 0 && typeof round.company === "string" && round.company.trim().length > 0;
}

function cleanRound(round: ApplicationRound): ApplicationRound {
  return {
    id: round.id.trim(),
    company: round.company.trim(),
    date: round.date?.trim() || "",
    source: round.source?.trim() || "",
    stage: round.stage?.trim() || "",
    status: round.status?.trim() || "",
    note: round.note?.trim() || "",
  };
}

export async function listApplications(userId: string): Promise<ApplicationRound[]> {
  await ready();
  if (userId === OWNER) await seedOwnerApplications(userId);
  const rows = await ResumeBuilder.find({ kind: "application", userId }).lean<Row[]>();
  return rows
    .map((row) => row.payload)
    .filter(isApplication)
    .map(cleanRound)
    .sort((a, b) => a.date.localeCompare(b.date) || a.id.localeCompare(b.id));
}

async function seedOwnerApplications(userId: string): Promise<void> {
  const existing = await ResumeBuilder.countDocuments({ kind: "application", userId });
  if (existing > 0) return;
  const now = new Date().toISOString();
  await ResumeBuilder.insertMany(
    (seedRows as ApplicationRound[]).map((round) => ({
      kind: "application",
      recordId: round.id,
      userId,
      updatedAt: now,
      payload: cleanRound(round),
    })),
  );
}

export async function writeApplication(userId: string, round: ApplicationRound): Promise<void> {
  await ready();
  const saved = cleanRound(round);
  await ResumeBuilder.findOneAndUpdate(
    { kind: "application", recordId: saved.id, userId },
    { kind: "application", recordId: saved.id, userId, updatedAt: new Date().toISOString(), payload: saved },
    { upsert: true },
  );
}

export async function removeApplication(userId: string, id: string): Promise<void> {
  await ready();
  await ResumeBuilder.deleteOne({ kind: "application", recordId: id, userId });
}
