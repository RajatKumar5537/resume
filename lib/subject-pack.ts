import type { ConceptGroupId, ConceptLesson } from "@/lib/concepts";

export type SubjectPack = {
  groups: { id: ConceptGroupId; title: string }[];
  byId: (id: string) => ConceptLesson | undefined;
  inGroup: (group: ConceptGroupId) => ConceptLesson[];
  search: (query: string) => { id: string; title: string; score: number }[];
  firstId: string;
};

export const READY_SUBJECTS = ["java", "selenium", "playwright", "manual-testing", "mongodb", "rest-assured"];

const packs = new Map<string, SubjectPack>();
const loading = new Map<string, Promise<SubjectPack>>();

function toPack(
  groups: { id: ConceptGroupId; title: string }[],
  byId: (id: string) => ConceptLesson | undefined,
  inGroup: (group: ConceptGroupId) => ConceptLesson[],
  search: SubjectPack["search"],
): SubjectPack {
  const firstId = groups.flatMap((group) => inGroup(group.id).map((item) => item.id))[0] || "";
  return { groups, byId, inGroup, search, firstId };
}

async function importSubject(subject: string): Promise<SubjectPack> {
  if (subject === "selenium") {
    const mod = await import("@/lib/selenium-lessons");
    return toPack(mod.SELENIUM_GROUPS, mod.seleniumById, mod.seleniumInGroup, mod.searchSeleniumLessons);
  }
  if (subject === "playwright") {
    const mod = await import("@/lib/playwright-lessons");
    return toPack(mod.PLAYWRIGHT_GROUPS, mod.playwrightById, mod.playwrightInGroup, mod.searchPlaywrightLessons);
  }
  if (subject === "manual-testing") {
    const mod = await import("@/lib/manual-lessons");
    return toPack(mod.MANUAL_GROUPS, mod.manualById, mod.manualInGroup, mod.searchManualLessons);
  }
  if (subject === "mongodb") {
    const mod = await import("@/lib/mongo-lessons");
    return toPack(mod.MONGO_GROUPS, mod.mongoById, mod.mongoInGroup, mod.searchMongoLessons);
  }
  if (subject === "rest-assured") {
    const mod = await import("@/lib/rest-assured-lessons");
    return toPack(mod.REST_GROUPS, mod.restById, mod.restInGroup, mod.searchRestLessons);
  }
  const mod = await import("@/lib/concepts");
  return toPack(mod.CONCEPT_GROUPS, mod.conceptById, mod.conceptsInGroup, mod.searchLessons);
}

export function readySubject(id: string): boolean {
  return READY_SUBJECTS.includes(id);
}

export function loadSubjectPack(subject: string): Promise<SubjectPack> {
  const saved = packs.get(subject);
  if (saved) return Promise.resolve(saved);
  const pending = loading.get(subject);
  if (pending) return pending;
  const next = importSubject(subject).then((pack) => {
    packs.set(subject, pack);
    loading.delete(subject);
    return pack;
  });
  loading.set(subject, next);
  return next;
}

export function cachedLesson(id: string): ConceptLesson | undefined {
  for (const pack of packs.values()) {
    const lesson = pack.byId(id);
    if (lesson) return lesson;
  }
  return undefined;
}

export function cachedSubject(id: string): string {
  for (const [subject, pack] of packs) {
    if (pack.byId(id)) return subject;
  }
  return "";
}

export function prefetchReadySubjects(): void {
  for (const subject of READY_SUBJECTS) void loadSubjectPack(subject);
}
