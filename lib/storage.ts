import { DEFAULT_PROFILE } from "@/lib/default-profile";
import type { Profile, ResumeDoc } from "@/lib/types";

const PROFILE_KEY = "desk.profile.v1";
const RESUMES_KEY = "desk.resumes.v1";
const MIGRATED_KEY = "desk.mongo.v1";

export type BackupFile = {
  profile: Profile;
  resumes: ResumeDoc[];
};

function canStore(): boolean {
  return typeof window !== "undefined" && typeof localStorage !== "undefined";
}

async function request<T>(url: string, init?: RequestInit): Promise<T> {
  const response = await fetch(url, {
    ...init,
    headers: { "Content-Type": "application/json", ...(init?.headers ?? {}) },
  });
  const data = (await response.json().catch(() => ({}))) as T & { error?: string };
  if (!response.ok) {
    throw new Error(data.error || "Could not reach the database.");
  }
  return data;
}

function readLocalProfile(): Profile | null {
  if (!canStore()) return null;
  const raw = localStorage.getItem(PROFILE_KEY);
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw) as Profile;
    if (!parsed || typeof parsed.name !== "string" || !Array.isArray(parsed.experience)) return null;
    return parsed;
  } catch {
    return null;
  }
}

function readLocalResumes(): ResumeDoc[] {
  if (!canStore()) return [];
  const raw = localStorage.getItem(RESUMES_KEY);
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw) as ResumeDoc[];
    return Array.isArray(parsed) ? parsed.filter((resume) => resume && typeof resume.id === "string") : [];
  } catch {
    return [];
  }
}

let moving: Promise<void> | null = null;

function migrateLocalOnce(): Promise<void> {
  if (!moving) moving = moveLocalData();
  return moving;
}

async function moveLocalData(): Promise<void> {
  if (!canStore() || localStorage.getItem(MIGRATED_KEY) === "1") return;
  const [profileResponse, resumeResponse] = await Promise.all([
    request<{ profile: Profile | null }>("/api/profile"),
    request<{ resumes: ResumeDoc[] }>("/api/resumes"),
  ]);
  const localProfile = readLocalProfile();
  const localResumes = readLocalResumes();
  if (!profileResponse.profile && localProfile) {
    await request("/api/profile", { method: "PUT", body: JSON.stringify({ profile: localProfile }) });
  }
  const remoteIds = new Set((resumeResponse.resumes ?? []).map((resume) => resume.id));
  for (const resume of localResumes) {
    if (remoteIds.has(resume.id)) continue;
    await request("/api/resumes", { method: "PUT", body: JSON.stringify({ resume }) });
  }
  localStorage.setItem(MIGRATED_KEY, "1");
}

export async function loadProfile(): Promise<Profile> {
  await migrateLocalOnce();
  const data = await request<{ profile: Profile | null }>("/api/profile");
  if (data.profile) return data.profile;
  const profile = structuredClone(DEFAULT_PROFILE);
  await saveProfile(profile);
  return profile;
}

export async function saveProfile(profile: Profile): Promise<void> {
  await request("/api/profile", { method: "PUT", body: JSON.stringify({ profile }) });
}

export async function loadResumes(): Promise<ResumeDoc[]> {
  await migrateLocalOnce();
  const data = await request<{ resumes: ResumeDoc[] }>("/api/resumes");
  return [...(data.resumes ?? [])].sort((a, b) => (b.updatedAt || "").localeCompare(a.updatedAt || ""));
}

export async function upsertResume(doc: ResumeDoc): Promise<void> {
  await request("/api/resumes", { method: "PUT", body: JSON.stringify({ resume: doc }) });
}

export async function deleteResume(id: string): Promise<void> {
  await request(`/api/resumes?id=${encodeURIComponent(id)}`, { method: "DELETE" });
}

export async function exportBackup(): Promise<BackupFile> {
  const [profile, resumes] = await Promise.all([loadProfile(), loadResumes()]);
  return { profile, resumes };
}

export function parseBackup(raw: string): BackupFile {
  const data = JSON.parse(raw) as Partial<BackupFile>;
  if (!data || typeof data !== "object" || !data.profile || typeof data.profile.name !== "string") {
    throw new Error("That file is not a Desk backup.");
  }
  if (!Array.isArray(data.profile.experience) || !Array.isArray(data.profile.skillGroups)) {
    throw new Error("That file is not a Desk backup.");
  }
  return {
    profile: data.profile,
    resumes: Array.isArray(data.resumes) ? data.resumes : [],
  };
}

export async function replaceAll(backup: BackupFile): Promise<void> {
  await request("/api/resumes", {
    method: "PUT",
    body: JSON.stringify({ profile: backup.profile, resumes: backup.resumes }),
  });
  if (canStore()) localStorage.setItem(MIGRATED_KEY, "1");
}
