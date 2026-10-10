import { CONCEPTS } from "./concept-lessons";

export type ConceptGroupId =
  | "oop"
  | "arrays"
  | "collections"
  | "strings"
  | "wrappers"
  | "exceptions"
  | "execution"
  | "se-basics"
  | "se-locators"
  | "se-driver"
  | "se-waits"
  | "se-popups"
  | "se-actions"
  | "se-files"
  | "se-testng"
  | "se-parallel"
  | "se-exceptions"
  | "se-pages";

export type ConceptSource = {
  label: string;
  path: string;
  kind: "java" | "pdf";
  focus?: string;
};

export type ConceptLesson = {
  id: string;
  group: ConceptGroupId;
  title: string;
  aliases: string[];
  summary: string;
  simple?: string;
  points: string[];
  example?: { code: string; output: string };
  how?: string;
  compare?: {
    title: string;
    leftLabel: string;
    left: string;
    rightLabel: string;
    right: string;
    rows?: { leftLabel: string; left: string; rightLabel: string; right: string }[];
  };
  table?: { title: string; headers: string[]; rows: string[][] };
  questions?: { prompt: string; short: string; detail: string }[];
  mistakes?: string[];
  sources: ConceptSource[];
  related: string[];
  gap?: string;
  basis?: string;
};

export const CONCEPT_GROUPS: { id: ConceptGroupId; title: string }[] = [
  { id: "oop", title: "OOP Concepts" },
  { id: "arrays", title: "Arrays" },
  { id: "collections", title: "Collections Framework" },
  { id: "strings", title: "Strings" },
  { id: "wrappers", title: "Wrapper Classes" },
  { id: "exceptions", title: "Exception Handling" },
  { id: "execution", title: "Java Execution and Class Loading" },
];

export const DEFAULT_CONCEPT_MODE = "learn" as const;

export { CONCEPTS };

export function conceptById(id: string): ConceptLesson | undefined {
  return CONCEPTS.find((lesson) => lesson.id === id);
}

export function conceptsInGroup(group: ConceptGroupId): ConceptLesson[] {
  return CONCEPTS.filter((lesson) => lesson.group === group);
}

function plain(value: string): string {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, " ").trim();
}

export function searchLessons(query: string): { id: string; title: string; group: ConceptGroupId; score: number }[] {
  const asked = plain(query);
  if (asked.length < 2) return [];
  return CONCEPTS.map((lesson) => {
    const names = [lesson.title, ...lesson.aliases].map(plain).filter(Boolean);
    let score = 0;
    if (names.some((name) => name === asked)) score = 200;
    else if (names.some((name) => asked.includes(name))) score = 160;
    else {
      const tokens = asked.split(" ").filter((token) => token.length > 2);
      const blob = names.join(" ");
      const matched = tokens.filter((token) => blob.includes(token));
      if (tokens.length > 0 && matched.length === tokens.length) score = 70 + matched.length;
    }
    return { id: lesson.id, title: lesson.title, group: lesson.group, score };
  })
    .filter((item) => item.score >= 70)
    .sort((a, b) => b.score - a.score || a.title.localeCompare(b.title));
}
