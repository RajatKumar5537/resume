import { tailor } from "@/lib/tailor";
import { textHas } from "@/lib/text";
import type { Profile, ResumeDoc } from "@/lib/types";

type DraftRole = { company?: unknown; bullets?: unknown };
type DraftProject = { name?: unknown; bullets?: unknown };

function words(text: string): string[] {
  return text.toLowerCase().split(/[^a-z0-9+#]+/).filter((word) => word.length > 3);
}

function numbersIn(text: string): string[] {
  return text.match(/\d+(?:\.\d+)?%?/g) ?? [];
}

function numbersFit(rewritten: string, source: string): boolean {
  const allowed = new Set(numbersIn(source));
  return numbersIn(rewritten).every((value) => allowed.has(value));
}

function cleanLine(value: string): string {
  return value
    .replace(/^[-*•]\s+/, "")
    .replace(/^\d+[.)]\s+/, "")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 500);
}

function sameLabel(left: string, right: string): boolean {
  const a = left.toLowerCase().trim();
  const b = right.toLowerCase().trim();
  if (!a || !b) return false;
  return a === b || a.includes(b) || b.includes(a);
}

const PLAIN = new Set([
  "build",
  "built",
  "building",
  "develop",
  "developed",
  "develops",
  "maintain",
  "maintained",
  "maintains",
  "test",
  "tested",
  "testing",
  "review",
  "reviewed",
  "reviews",
  "report",
  "reported",
  "reports",
  "prepare",
  "prepared",
  "prepares",
  "share",
  "shared",
  "check",
  "checked",
  "checks",
  "cover",
  "covered",
  "covers",
  "automate",
  "automated",
  "automation",
  "reduce",
  "reduced",
  "reducing",
  "create",
  "created",
  "design",
  "designed",
  "lead",
  "leads",
  "leading",
  "write",
  "wrote",
  "written",
  "validate",
  "validated",
  "validation",
  "using",
  "with",
  "from",
  "that",
  "this",
  "across",
  "including",
  "include",
  "included",
  "team",
  "teams",
  "manual",
  "effort",
  "results",
  "result",
  "clear",
  "based",
  "project",
  "projects",
  "needs",
  "work",
  "working",
  "worked",
  "software",
  "status",
  "script",
  "scripts",
  "code",
  "data",
  "user",
  "users",
  "flow",
  "flows",
  "role",
  "experience",
  "years",
  "hands",
  "perform",
  "performed",
  "verify",
  "verified",
  "support",
  "supported",
  "identify",
  "identified",
  "execute",
  "executed",
  "document",
  "documented",
  "ensure",
  "deliver",
  "delivered",
]);

function inSource(word: string, page: string): boolean {
  if (page.includes(word) || PLAIN.has(word)) return true;
  if (word.endsWith("s") && word.length > 4 && (page.includes(word.slice(0, -1)) || PLAIN.has(word.slice(0, -1)))) return true;
  return false;
}

function overlap(rewritten: string, source: string): number {
  const known = new Set(words(source));
  const next = words(rewritten);
  if (!next.length || !known.size) return 0;
  return next.filter((word) => known.has(word)).length / next.length;
}

function acceptBullet(rewritten: string, original: string, roleText: string): boolean {
  const line = cleanLine(rewritten);
  if (line.length < 12) return false;
  const page = roleText.toLowerCase();
  if (!numbersFit(line, roleText)) return false;
  if (words(line).some((word) => !inSource(word, page))) return false;
  const distinctive = original
    .toLowerCase()
    .split(/[^a-z0-9+#]+/)
    .filter((word) => word.length > 5);
  if (distinctive.length) {
    const hits = distinctive.filter((word) => line.toLowerCase().includes(word)).length;
    if (hits < Math.min(2, distinctive.length) && hits / distinctive.length < 0.34) return false;
  }
  return overlap(line, original) >= 0.4 || overlap(line, roleText) >= 0.45;
}

function textList(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  return value.filter((item): item is string => typeof item === "string");
}

function mergeBullets(originals: string[], proposed: string[], roleText: string): { bullets: string[]; changed: boolean } {
  const used = new Set<number>();
  let changed = false;
  const bullets = originals.map((original) => {
    let best = -1;
    let bestScore = 0;
    proposed.forEach((candidate, index) => {
      if (used.has(index)) return;
      const line = cleanLine(candidate);
      if (!acceptBullet(line, original, roleText)) return;
      const score = overlap(line, original);
      if (score >= bestScore) {
        best = index;
        bestScore = score;
      }
    });
    if (best < 0) return original;
    used.add(best);
    const line = cleanLine(proposed[best]);
    if (line !== original) changed = true;
    return line;
  });
  return { bullets, changed };
}

function profileCorpus(profile: Profile): string {
  return [
    profile.name,
    profile.headline,
    profile.identity,
    profile.years,
    profile.closing,
    ...profile.skillGroups.flatMap((group) => [group.name, ...group.items]),
    ...profile.experience.flatMap((role) => [role.title, role.company, role.location, ...role.bullets]),
    ...profile.projects.flatMap((project) => [project.name, ...project.bullets]),
    ...profile.education.flatMap((school) => [school.degree, school.school, school.location]),
  ].join("\n");
}

function summaryOk(summary: string, profile: Profile, jobTitle: string, missing: string[]): boolean {
  const text = summary.replace(/\s+/g, " ").trim();
  if (text.length < 80 || text.length > 1100 || !text.includes(".")) return false;
  const corpus = `${profileCorpus(profile)}\n${jobTitle}`;
  const page = corpus.toLowerCase();
  const content = words(text);
  const outside = content.filter((word) => !inSource(word, page));
  if (content.length && outside.length / content.length > 0.2) return false;
  if (!numbersFit(text, corpus)) return false;
  if (missing.some((name) => textHas(text, name))) return false;
  const claims = ["mentor", "mentoring", "certified", "certification", "junit", "maven"];
  if (claims.some((word) => textHas(text, word) && !textHas(corpus, word))) return false;
  return true;
}

export function applyDraft(base: ResumeDoc, draft: unknown, profile: Profile): ResumeDoc {
  const data = draft && typeof draft === "object" ? (draft as Record<string, unknown>) : {};
  let changed = false;
  const summaryText = typeof data.summary === "string" ? data.summary : "";
  const summary = summaryOk(summaryText, profile, base.jobTitle, base.missing) ? summaryText.replace(/\s+/g, " ").trim() : base.summary;
  if (summary !== base.summary) changed = true;

  const proposedRoles = Array.isArray(data.experience) ? (data.experience as DraftRole[]) : [];
  const experience = base.experience.map((role) => {
    const match = proposedRoles.find((item) => sameLabel(typeof item.company === "string" ? item.company : "", role.company));
    const merged = mergeBullets(role.bullets, textList(match?.bullets), role.bullets.join("\n"));
    if (merged.changed) changed = true;
    return { ...role, bullets: merged.bullets };
  });

  const proposedProjects = Array.isArray(data.projects) ? (data.projects as DraftProject[]) : [];
  const projects = base.projects.map((project) => {
    const match = proposedProjects.find((item) => sameLabel(typeof item.name === "string" ? item.name : "", project.name));
    const merged = mergeBullets(project.bullets, textList(match?.bullets), project.bullets.join("\n"));
    if (merged.changed) changed = true;
    return { ...project, bullets: merged.bullets };
  });

  return { ...base, summary, experience, projects, writer: changed ? "ai" : "profile" };
}

function promptFor(profile: Profile, jobText: string, jobTitle: string): string {
  const facts = {
    identity: profile.identity,
    years: profile.years,
    headline: profile.headline,
    closing: profile.closing,
    skills: profile.skillGroups.map((group) => ({ name: group.name, items: group.items })),
    experience: profile.experience.map((role) => ({
      title: role.title,
      company: role.company,
      start: role.start,
      end: role.end,
      bullets: role.bullets.filter(Boolean),
    })),
    projects: profile.projects.map((project) => ({
      name: project.name,
      bullets: project.bullets.filter(Boolean),
    })),
  };
  return [
    "Rewrite this resume so it matches the job and stays easy for an applicant tracking system to read.",
    "Use only facts from the profile. Do not add employers, dates, tools, certifications, metrics, or projects.",
    "Keep every skill, every project, and every experience bullet. Do not drop a point.",
    "Rephrase a bullet only to use the job's wording for work that bullet already describes. Keep every tool name, product name, and number from that bullet.",
    "Put the requirements this person already meets into the summary and the earliest bullets. Leave later bullets in place.",
    "Summary: 3 to 5 sentences, no first person, name the target role and the years, and mention profile skills that this job asks for.",
    "Each bullet is one sentence starting with a verb. No tables, icons, or keyword lists.",
    'Return only JSON: {"summary":"","experience":[{"company":"","bullets":[""]}],"projects":[{"name":"","bullets":[""]}]}',
    `Target role: ${jobTitle}`,
    "PROFILE:",
    JSON.stringify(facts),
    "JOB DESCRIPTION:",
    jobText.slice(0, 14000),
  ].join("\n");
}

type GeminiReply = {
  candidates?: { content?: { parts?: { text?: string }[] } }[];
};

async function geminiReply(model: string, key: string, prompt: string, jsonMode: boolean): Promise<GeminiReply> {
  const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`, {
    method: "POST",
    headers: { "Content-Type": "application/json", "x-goog-api-key": key },
    body: JSON.stringify({
      contents: [{ role: "user", parts: [{ text: prompt }] }],
      generationConfig: jsonMode
        ? { temperature: 0.2, maxOutputTokens: 8192, responseMimeType: "application/json" }
        : { temperature: 0.2, maxOutputTokens: 8192 },
    }),
  });
  const data = (await response.json()) as GeminiReply;
  return response.ok || response.status === 400 ? data : { candidates: [] };
}

async function askGemini(prompt: string): Promise<unknown | null> {
  const key = process.env.GEMINI_API_KEY || process.env.Gemini_API_Key;
  if (!key) return null;
  const models = ["gemini-3.8-flash", "gemini-2.5-flash"];
  for (const model of models) {
    try {
      let payload = await geminiReply(model, key, prompt, true);
      let answer = payload.candidates?.[0]?.content?.parts?.map((part) => part.text || "").join("").trim() || "";
      if (!answer) payload = await geminiReply(model, key, prompt, false);
      answer = payload.candidates?.[0]?.content?.parts?.map((part) => part.text || "").join("").trim() || "";
      const json = answer.replace(/^```(?:json)?/i, "").replace(/```$/, "").trim();
      if (!json) continue;
      return JSON.parse(json) as unknown;
    } catch {
      continue;
    }
  }
  return null;
}

export async function writeFreshResume(input: {
  profile: Profile;
  jobText: string;
  jobTitle: string;
  company: string;
  jobUrl: string;
}): Promise<ResumeDoc> {
  const base = tailor(input);
  const draft = await askGemini(promptFor(input.profile, input.jobText, input.jobTitle || base.jobTitle));
  if (!draft) return { ...base, writer: "profile" };
  return applyDraft(base, draft, input.profile);
}
