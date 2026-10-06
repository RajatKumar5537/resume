import { extractText, getDocumentProxy } from "unpdf";
import type { Education, LinkItem, Profile, Project, Role, SkillGroup } from "@/lib/types";

const MAX_BYTES = 4 * 1024 * 1024;

function textValue(value: unknown): string {
  return typeof value === "string" ? value.trim() : "";
}

function textList(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  return value.map(textValue).filter(Boolean);
}

function haystack(source: string): string {
  return source.toLowerCase();
}

function appears(source: string, value: string): boolean {
  const needle = value.trim().toLowerCase();
  return needle.length > 1 && haystack(source).includes(needle);
}

function mostlyCopied(source: string, value: string): boolean {
  if (appears(source, value)) return true;
  const words = value
    .toLowerCase()
    .split(/[^a-z0-9+#]+/)
    .filter((word) => word.length > 3);
  if (!words.length) return false;
  const page = haystack(source);
  const hits = words.filter((word) => page.includes(word)).length;
  return hits >= Math.ceil(words.length * 0.6);
}

function keptYears(source: string, years: string): string {
  const number = years.match(/\d+/)?.[0];
  if (!number) return "";
  const page = haystack(source);
  if (!page.includes(number) || !/\byears?\b|\byrs?\b/.test(page)) return "";
  return years.trim();
}

function keptPhone(source: string, phone: string): string {
  const digits = phone.replace(/\D/g, "");
  if (digits.length < 8) return "";
  return source.replace(/\D/g, "").includes(digits) ? phone.trim() : "";
}

function keptLink(source: string, link: LinkItem): LinkItem | null {
  const plain = link.url.replace(/^https?:\/\//i, "").replace(/\/$/, "").trim().toLowerCase();
  if (plain.length < 5 || !haystack(source).includes(plain)) return null;
  return link;
}

function withId<T extends { id: string }>(item: Omit<T, "id">): T {
  return { ...item, id: crypto.randomUUID() } as T;
}

export function profileFromExtract(raw: unknown, source: string): Profile {
  const data = raw && typeof raw === "object" ? (raw as Record<string, unknown>) : {};
  const name = textValue(data.name);
  const profile: Profile = {
    name: appears(source, name) ? name : "",
    headline: mostlyCopied(source, textValue(data.headline)) ? textValue(data.headline) : "",
    identity: mostlyCopied(source, textValue(data.identity)) ? textValue(data.identity) : "",
    years: keptYears(source, textValue(data.years)),
    closing: mostlyCopied(source, textValue(data.closing)) ? textValue(data.closing) : "",
    email: appears(source, textValue(data.email)) ? textValue(data.email) : "",
    phone: keptPhone(source, textValue(data.phone)),
    location: appears(source, textValue(data.location)) ? textValue(data.location) : "",
    links: [],
    skillGroups: [],
    experience: [],
    projects: [],
    education: [],
  };

  if (Array.isArray(data.links)) {
    profile.links = data.links
      .map((item) => {
        const link = item && typeof item === "object" ? (item as Record<string, unknown>) : {};
        return keptLink(source, { id: "", label: textValue(link.label) || "Link", url: textValue(link.url) });
      })
      .filter((link): link is LinkItem => Boolean(link))
      .map((link) => withId<LinkItem>(link));
  }

  if (Array.isArray(data.skillGroups)) {
    profile.skillGroups = data.skillGroups
      .map((item) => {
        const group = item && typeof item === "object" ? (item as Record<string, unknown>) : {};
        const items = textList(group.items).filter((skill) => appears(source, skill));
        const name = textValue(group.name);
        if (!items.length) return null;
        return withId<SkillGroup>({ name: appears(source, name) ? name : "Skills", items });
      })
      .filter((group): group is SkillGroup => Boolean(group));
  }

  if (Array.isArray(data.experience)) {
    profile.experience = data.experience
      .map((item) => {
        const role = item && typeof item === "object" ? (item as Record<string, unknown>) : {};
        const company = textValue(role.company);
        const title = textValue(role.title);
        if (!appears(source, company) && !appears(source, title)) return null;
        return withId<Role>({
          title: appears(source, title) ? title : "",
          company: appears(source, company) ? company : "",
          location: appears(source, textValue(role.location)) ? textValue(role.location) : "",
          start: appears(source, textValue(role.start)) ? textValue(role.start) : "",
          end: appears(source, textValue(role.end)) ? textValue(role.end) : "",
          bullets: textList(role.bullets).filter((bullet) => mostlyCopied(source, bullet)),
        });
      })
      .filter((role): role is Role => Boolean(role));
  }

  if (Array.isArray(data.projects)) {
    profile.projects = data.projects
      .map((item) => {
        const project = item && typeof item === "object" ? (item as Record<string, unknown>) : {};
        const name = textValue(project.name);
        if (!appears(source, name)) return null;
        return withId<Project>({
          name,
          bullets: textList(project.bullets).filter((bullet) => mostlyCopied(source, bullet)),
        });
      })
      .filter((project): project is Project => Boolean(project));
  }

  if (Array.isArray(data.education)) {
    profile.education = data.education
      .map((item) => {
        const school = item && typeof item === "object" ? (item as Record<string, unknown>) : {};
        const schoolName = textValue(school.school);
        const degree = textValue(school.degree);
        if (!appears(source, schoolName) && !appears(source, degree)) return null;
        return withId<Education>({
          degree: appears(source, degree) ? degree : "",
          school: appears(source, schoolName) ? schoolName : "",
          location: appears(source, textValue(school.location)) ? textValue(school.location) : "",
          start: appears(source, textValue(school.start)) ? textValue(school.start) : "",
          end: appears(source, textValue(school.end)) ? textValue(school.end) : "",
        });
      })
      .filter((school): school is Education => Boolean(school));
  }

  return profile;
}

async function resumeText(file: File): Promise<string> {
  if (file.size <= 0) throw new Error("That file is empty.");
  if (file.size > MAX_BYTES) throw new Error("Use a resume smaller than 4 MB.");
  const name = file.name.toLowerCase();
  const pdf = name.endsWith(".pdf") || file.type === "application/pdf";
  const text = name.endsWith(".txt") || file.type.startsWith("text/");
  if (!pdf && !text) throw new Error("Upload a PDF or a text resume.");
  if (text) return (await file.text()).replace(/\u0000/g, "").trim();
  const bytes = new Uint8Array(await file.arrayBuffer());
  const document = await getDocumentProxy(bytes);
  const extracted = await extractText(document, { mergePages: true });
  const raw = Array.isArray(extracted.text) ? extracted.text.join("\n\n") : extracted.text;
  return raw.replace(/[ \t]+\n/g, "\n").replace(/\n{3,}/g, "\n\n").trim();
}

async function structureResume(source: string): Promise<unknown> {
  const key = process.env.GEMINI_API_KEY || process.env.Gemini_API_Key;
  if (!key) throw new Error("Reading a resume into a profile needs the Gemini key on the server.");
  const clipped = source.slice(0, 24000);
  const prompt = [
    "Turn this resume into JSON for the person who wrote it.",
    "Copy only facts that are written in the resume. Do not add employers, dates, skills, tools, or numbers.",
    "If a field is missing, use an empty string or an empty array.",
    "headline is the role line under the name. identity is a short role phrase from that line.",
    "years is only the experience length written in the resume, such as 5+, otherwise an empty string.",
    "closing is one sentence copied from the summary, otherwise an empty string.",
    "Group skills the way the resume groups them. If it has no groups, use one group named Skills.",
    "Return only this JSON shape:",
    '{"name":"","headline":"","identity":"","years":"","closing":"","email":"","phone":"","location":"","links":[{"label":"","url":""}],"skillGroups":[{"name":"","items":[""]}],"experience":[{"title":"","company":"","location":"","start":"","end":"","bullets":[""]}],"projects":[{"name":"","bullets":[""]}],"education":[{"degree":"","school":"","location":"","start":"","end":""}]}',
    "",
    clipped,
  ].join("\n");
  const models = ["gemini-3.8-flash", "gemini-2.5-flash"];
  let lastError = "The resume could not be read.";
  for (const model of models) {
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`, {
      method: "POST",
      headers: { "Content-Type": "application/json", "x-goog-api-key": key },
      body: JSON.stringify({
        contents: [{ role: "user", parts: [{ text: prompt }] }],
        generationConfig: { temperature: 0, responseMimeType: "application/json" },
      }),
    });
    const data = (await response.json()) as {
      error?: { message?: string };
      candidates?: { content?: { parts?: { text?: string }[] } }[];
    };
    if (response.status === 404) {
      lastError = data.error?.message || lastError;
      continue;
    }
    if (!response.ok) {
      if (response.status === 400) {
        const plain = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`, {
          method: "POST",
          headers: { "Content-Type": "application/json", "x-goog-api-key": key },
          body: JSON.stringify({
            contents: [{ role: "user", parts: [{ text: prompt }] }],
            generationConfig: { temperature: 0 },
          }),
        });
        const plainData = (await plain.json()) as {
          error?: { message?: string };
          candidates?: { content?: { parts?: { text?: string }[] } }[];
        };
        if (!plain.ok) throw new Error(plainData.error?.message || lastError);
        const plainAnswer = plainData.candidates?.[0]?.content?.parts?.map((part) => part.text || "").join("").trim() || "";
        const plainJson = plainAnswer.replace(/^```(?:json)?/i, "").replace(/```$/, "").trim();
        try {
          return JSON.parse(plainJson) as unknown;
        } catch {
          throw new Error("The resume could not be turned into a profile. Try the PDF again.");
        }
      }
      throw new Error(data.error?.message || lastError);
    }
    const answer = data.candidates?.[0]?.content?.parts?.map((part) => part.text || "").join("").trim();
    if (!answer) throw new Error("The resume did not return a profile.");
    const json = answer.replace(/^```(?:json)?/i, "").replace(/```$/, "").trim();
    try {
      return JSON.parse(json) as unknown;
    } catch {
      throw new Error("The resume could not be turned into a profile. Try the PDF again.");
    }
  }
  throw new Error(lastError);
}

export async function profileFromResume(file: File): Promise<Profile> {
  const source = await resumeText(file);
  if (source.length < 40) {
    throw new Error("That PDF has no selectable text. Export it again from the original resume and upload the new PDF.");
  }
  const extracted = await structureResume(source);
  const profile = profileFromExtract(extracted, source);
  if (!profile.name || (profile.experience.length === 0 && profile.skillGroups.length === 0)) {
    throw new Error("The file did not contain a readable name plus experience or skills.");
  }
  return profile;
}
