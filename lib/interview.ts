import { listInterviewFiles, loadPdfNotes, readInterviewNote } from "@/lib/interview-library";

const REPO = "RajatKumar5537/Java-Selenium-Program";
const BRANCH = "master";

const GENERIC = new Set([
  "number",
  "string",
  "array",
  "element",
  "digit",
  "character",
  "count",
  "program",
  "code",
  "java",
  "selenium",
  "write",
  "explain",
  "handle",
  "using",
  "example",
  "series",
  "popup",
  "pop",
  "what",
  "how",
  "why",
  "does",
  "your",
  "with",
  "from",
  "this",
  "that",
  "into",
  "print",
  "show",
  "give",
  "make",
  "find",
  "using",
  "language",
  "please",
  "the",
  "given",
  "these",
  "those",
  "list",
  "input",
  "explain",
  "describe",
  "send",
  "create",
  "about",
  "interview",
  "question",
]);

type RepoEntry = {
  path: string;
  name: string;
  words: string[];
  kind: "java" | "pdf";
  text: string;
};

export type InterviewResult = {
  source: "repo" | "gemini" | "missing";
  title: string;
  path?: string;
  url?: string;
  code?: string;
  answer?: string;
  focus?: string;
  note: string;
};

const OTHER_LANGUAGES = new Set(["javascript", "typescript", "python", "csharp", "golang", "ruby", "php", "kotlin", "swift"]);

function stem(word: string): string {
  const value = word.toLowerCase();
  if (value.startsWith("revers")) return "reverse";
  if (value === "bigest" || value === "biggest") return "largest";
  if (value === "fibonaci") return "fibonacci";
  if (value === "palindrom") return "palindrome";
  return value;
}

function wordsFromPath(path: string): string[] {
  const chunks = path
    .replace(/\.(java|pdf)$/i, "")
    .replace(/restassured/gi, "restassured")
    .replace(/([a-z])([A-Z])/g, "$1 $2")
    .split(/[^a-zA-Z0-9]+/)
    .map(stem)
    .filter((word) => word.length > 2 && !["src", "main", "test", "java"].includes(word));
  return [...new Set(chunks)];
}

function questionTokens(question: string): { specific: string[]; weak: string[] } {
  const expanded = question
    .toLowerCase()
    .replace(/fibonaci/g, "fibonacci")
    .replace(/palindrom(?!e)/g, "palindrome")
    .replace(/revers\w*/g, "reverse")
    .replace(/\b(2nd|2 nd|second)\b/g, "second")
    .replace(/\b(3rd|3 rd|third|4th|4 th|fourth|5th|fifth|nth)\b/g, "nth")
    .replace(/lasrgest|largets|largst/g, "largest")
    .replace(/largest|biggest|bigest/g, "largest")
    .replace(/hash\s*map/g, "hashmap")
    .replace(/rest\s*assured/g, "restassured")
    .replace(/pop-up|pop up/g, "popup")
    .replace(/encapsulation|inheritance|polymorphism|abstraction/g, "oops $&")
    .replace(/\bnode\.?js\b|\bjavascript\b|\bjs\b/g, "javascript")
    .replace(/\btypescript\b|\bts\b/g, "typescript")
    .replace(/\bpython\b|\bpy\b/g, "python")
    .replace(/\bc#\b|\bcsharp\b/g, "csharp");
  const tokens = [
    ...new Set(expanded.split(/[^a-z0-9]+/).map(stem).filter((word) => word.length > 2)),
  ];
  return {
    specific: tokens.filter((word) => !GENERIC.has(word)),
    weak: tokens.filter((word) => GENERIC.has(word)),
  };
}

async function catalog(): Promise<RepoEntry[]> {
  const files = await listInterviewFiles();
  if (!files.length) throw new Error("Interview notes are not in the database yet.");
  return files.map((file) => ({
    path: file.path,
    name: file.title,
    words: wordsFromPath(file.path),
    kind: file.kind,
    text: "",
  }));
}

function scoreEntry(entry: RepoEntry, specific: string[], weak: string[]): number {
  const matchedSpecific = specific.filter((token) => entry.words.includes(token));
  const matchedWeak = weak.filter((token) => entry.words.includes(token));
  if (specific.length > 0 && matchedSpecific.length === 0) return 0;
  if (specific.length === 0) return matchedWeak.length * 4;
  return matchedSpecific.length * 6 + matchedWeak.length;
}

function fileUrl(path: string): string {
  const encoded = path.split("/").map((part) => encodeURIComponent(part)).join("/");
  return `https://github.com/${REPO}/blob/${BRANCH}/${encoded}`;
}

function rankAsked(question: string): number | null {
  const text = question.toLowerCase();
  const digit = text.match(/\b(\d+)(?:st|nd|rd|th)\b/);
  if (digit) return Number(digit[1]);
  const names: [string, number][] = [
    ["first", 1],
    ["second", 2],
    ["third", 3],
    ["fourth", 4],
    ["fifth", 5],
  ];
  for (const [name, rank] of names) {
    if (new RegExp(`\\b${name}\\b`).test(text)) return rank;
  }
  return null;
}

function listedNumbers(question: string): number[] {
  const withoutRank = question.replace(/\b\d+(?:st|nd|rd|th)\b/gi, " ");
  const found = withoutRank.match(/\d+/g);
  if (!found || found.length < 2) return [];
  return found.map((value) => Number(value));
}

function rankSuffix(rank: number): string {
  if (rank % 100 >= 11 && rank % 100 <= 13) return `${rank}th`;
  if (rank % 10 === 1) return `${rank}st`;
  if (rank % 10 === 2) return `${rank}nd`;
  if (rank % 10 === 3) return `${rank}rd`;
  return `${rank}th`;
}

function solvedRank(question: string): string {
  const rank = rankAsked(question);
  const values = listedNumbers(question);
  if (!rank || values.length < 2) return "";
  const smallest = /\bsmall/.test(question.toLowerCase());
  const unique = [...new Set(values)].sort((a, b) => (smallest ? a - b : b - a));
  const label = smallest ? "smallest" : "largest";
  if (rank > unique.length) {
    return `For {${values.join(", ")}}, there are not ${rank} distinct numbers.`;
  }
  return `For {${values.join(", ")}}, the ${rankSuffix(rank)} ${label} number is ${unique[rank - 1]}.`;
}

function titleFrom(entry: RepoEntry): string {
  return entry.name.replace(/\.(java|pdf)$/i, "").replace(/[_-]+/g, " ");
}

function wordForms(token: string): string[] {
  const forms = [token];
  if (token.endsWith("s") && token.length > 4) forms.push(token.slice(0, -1));
  if (token === "oop" || token === "oops") forms.push("oop", "oops");
  return [...new Set(forms)];
}

function hasWord(text: string, token: string): boolean {
  return wordForms(token).some((form) => new RegExp(`\\b${form}\\b`, "i").test(text));
}

function pathMatch(words: string[], token: string): "exact" | "alias" | "none" {
  if (words.includes(token)) return "exact";
  if (wordForms(token).some((form) => form !== token && words.includes(form))) return "alias";
  return "none";
}

function sectionWord(text: string, token: string): boolean {
  return text.split(/\n/).some((line) => {
    const value = line.trim();
    return value.length > 0 && value.length < 90 && /[-:?]/.test(value) && hasWord(value, token);
  });
}

function closestPdf(entries: RepoEntry[], tokens: string[]): { entry: RepoEntry; focus: string } | undefined {
  const ranked = entries
    .filter((entry) => entry.kind === "pdf" && entry.text.trim())
    .map((entry) => {
      const hits = tokens.filter((token) => token.length > 2 && (hasWord(entry.text, token) || pathMatch(entry.words, token) !== "none"));
      const pathHits = hits.filter((token) => pathMatch(entry.words, token) !== "none").length;
      const exactPath = hits.filter((token) => pathMatch(entry.words, token) === "exact").length;
      const sectionHits = hits.filter((token) => sectionWord(entry.text, token)).length;
      return { entry, hits, exactPath, score: exactPath * 50 + pathHits * 100 + sectionHits * 20 + hits.length };
    })
    .filter((item) => item.hits.length > 0)
    .sort((a, b) => b.score - a.score || a.entry.path.localeCompare(b.entry.path));
  const exact = ranked.filter((item) => item.exactPath > 0);
  const winner = (exact.length ? exact : ranked)[0];
  if (!winner) return undefined;
  const token = winner.hits.find((item) => sectionWord(winner.entry.text, item)) ?? winner.hits[0];
  const focus = surfaceForm(winner.entry, token);
  return { entry: winner.entry, focus };
}

function surfaceForm(entry: RepoEntry, token: string): string {
  const forms = [token, ...wordForms(token).filter((form) => form !== token)];
  return forms.find((form) => entry.words.includes(form) || new RegExp(`\\b${form}\\b`, "i").test(entry.text)) ?? token;
}

export function rankQuestion(
  question: string,
  files: { path: string; name?: string; kind: "java" | "pdf"; text?: string }[],
): { javaPath: string; pdfPath: string; focus: string; solved: string; otherLanguage: boolean } {
  const asked = question.trim();
  const entries: RepoEntry[] = files.map((file) => ({
    path: file.path,
    name: file.name || file.path.split("/").pop() || file.path,
    words: wordsFromPath(file.path),
    kind: file.kind,
    text: file.text || "",
  }));
  const { specific, weak } = questionTokens(asked);
  const vocabulary = new Set(entries.flatMap((entry) => entry.words));
  const otherLanguage = specific.some((token) => OTHER_LANGUAGES.has(token) && !vocabulary.has(token));
  const known = specific.filter((token) => vocabulary.has(token));
  const ranked = entries
    .map((entry) => ({ ...entry, score: scoreEntry(entry, known, weak) }))
    .filter((entry) => known.length > 0 && known.every((token) => entry.words.includes(token)))
    .sort((a, b) => {
      const byScore = b.score - a.score;
      if (byScore !== 0) return byScore;
      const extra = (entry: RepoEntry) => entry.words.filter((word) => !GENERIC.has(word) && !known.includes(word)).length;
      return extra(a) - extra(b) || a.name.localeCompare(b.name);
    });
  const javaHit = !otherLanguage && known.length ? ranked.find((entry) => entry.kind === "java") : undefined;
  const pdfPick = !otherLanguage && !javaHit ? closestPdf(entries, specific) : undefined;
  return {
    javaPath: javaHit?.path || "",
    pdfPath: pdfPick?.entry.path || "",
    focus: pdfPick?.focus || "",
    solved: solvedRank(asked),
    otherLanguage,
  };
}

async function askGemini(question: string): Promise<string | null> {
  const key = process.env.GEMINI_API_KEY || process.env.Gemini_API_Key;
  if (!key) return null;
  const models = ["gemini-3.8-flash", "gemini-2.5-flash"];
  let lastError = "Gemini could not answer this question.";
  for (const model of models) {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-goog-api-key": key,
        },
        body: JSON.stringify({
          systemInstruction: {
            parts: [
              {
                text: "You help a QA engineer practice interview answers. Use the language named in the question: JavaScript stays JavaScript, Python stays Python. If no language is named, use Java. Start with the answer they would say out loud. Add a short code example only when the question needs code. Be accurate and concise.",
              },
            ],
          },
          contents: [{ role: "user", parts: [{ text: question }] }],
          generationConfig: { temperature: 0.3 },
        }),
      },
    );
    const data = (await response.json()) as {
      error?: { message?: string; status?: string };
      candidates?: { content?: { parts?: { text?: string }[] } }[];
    };
    if (response.status === 404) {
      lastError = data.error?.message || lastError;
      continue;
    }
    if (!response.ok) throw new Error(data.error?.message || lastError);
    const answer = data.candidates?.[0]?.content?.parts?.map((part) => part.text || "").join("").trim();
    if (!answer) throw new Error("Gemini returned an empty answer.");
    return answer;
  }
  throw new Error(lastError);
}

export async function answerInterview(question: string, options?: { repoOnly?: boolean }): Promise<InterviewResult> {
  const asked = question.trim();
  if (asked.length < 3) throw new Error("Type an interview question.");
  const entries = await catalog();
  const ranked = rankQuestion(asked, entries);

  if (!ranked.otherLanguage && ranked.javaPath) {
    const note = await readInterviewNote(ranked.javaPath);
    const javaHit = entries.find((entry) => entry.path === ranked.javaPath);
    if (note?.text && javaHit) {
      return {
        source: "repo",
        title: titleFrom(javaHit),
        path: javaHit.path,
        url: fileUrl(javaHit.path),
        code: note.text,
        answer: ranked.solved || undefined,
        note: ranked.solved
          ? "The number below is for the list in your question. The program is saved from your repo."
          : "This program is saved from your repo, so it opens without waiting for Gemini.",
      };
    }
  }

  if (!ranked.otherLanguage) {
    const pdfNotes = await loadPdfNotes();
    const pdfRank = rankQuestion(
      asked,
      pdfNotes.map((note) => ({ path: note.path, name: note.title, kind: note.kind, text: note.text })),
    );
    const pdfPick = pdfNotes.find((note) => note.path === pdfRank.pdfPath);
    if (pdfPick?.text.trim()) {
      return {
        source: "repo",
        title: titleFrom({ name: pdfPick.title, path: pdfPick.path, words: [], kind: pdfPick.kind, text: pdfPick.text }),
        path: pdfPick.path,
        url: fileUrl(pdfPick.path),
        answer: pdfPick.text,
        focus: pdfRank.focus,
        note: "Opened the saved PDF and moved to this word.",
      };
    }
  }

  if (options?.repoOnly) {
    return {
      source: "missing",
      title: "Not in your repo",
      note: "No saved Java program or PDF matched this search.",
    };
  }

  const chat = await askGemini(asked);
  if (!chat) {
    return {
      source: "missing",
      title: "Not in your repo",
      note: "This question is not in your saved notes. Add a free Gemini API key in GEMINI_API_KEY.",
    };
  }

  return {
    source: "gemini",
    title: "Gemini",
    answer: chat,
    note: "This question was not in your saved notes. This answer is from Gemini.",
  };
}
