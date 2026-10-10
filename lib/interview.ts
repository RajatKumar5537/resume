import { listInterviewFiles, listSavedPrograms, loadPdfNotes, readInterviewNote, type SavedProgram, type StoredNote } from "@/lib/interview-library";

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

export type ProgramChoice = {
  path: string;
  title: string;
  origin: "mongodb" | "github";
};

export type InterviewResult = {
  source: "repo" | "gemini" | "missing" | "choices";
  origin?: "mongodb" | "github";
  title: string;
  path?: string;
  url?: string;
  code?: string;
  answer?: string;
  focus?: string;
  language?: string;
  note: string;
  choices?: ProgramChoice[];
  related?: ProgramChoice[];
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

export function topicKey(value: string): string {
  const { specific, weak } = questionTokens(value);
  const kept = [...specific, ...weak.filter((word) => word === "string" || word === "array" || word === "number")];
  return kept.join(" ") || value.toLowerCase().replace(/\s+/g, " ").trim();
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

const CODE_LANGUAGES = new Set(["java", "javascript", "typescript", "python"]);

function wantsCode(question: string, language: string): boolean {
  if (language && language !== "auto") return true;
  return /\b(program|code|algorithm|reverse|palindrome|fibonacci|prime|duplicate|sort|largest|occurrence|occurrences)\b/i.test(question);
}

export function matchPrograms(
  question: string,
  files: { path: string; name?: string; kind: "java" | "pdf"; text?: string; origin?: "mongodb" | "github"; language?: string }[],
  language = "auto",
): { confidentPath: string; origin: "mongodb" | "github" | ""; close: ProgramChoice[]; otherLanguage: boolean } {
  const wanted = language.trim().toLowerCase() || "auto";
  const saved = files.filter((file) => file.origin === "mongodb");
  const repo = files.filter((file) => file.origin !== "mongodb");
  const savedForLanguage = saved.filter((file) => wanted === "auto" || (file.language || "java") === wanted);
  const savedRank = rankQuestion(
    question,
    savedForLanguage.map((file) => ({
      path: `saved/${topicKey(file.name || file.path).replace(/ /g, "-")}.java`,
      name: file.name,
      kind: "java" as const,
      text: file.text || "",
    })),
  );
  const savedHit = savedForLanguage.find(
    (file) => `saved/${topicKey(file.name || file.path).replace(/ /g, "-")}.java` === savedRank.javaPath,
  );
  const choice = (file: { path: string; name?: string; origin?: "mongodb" | "github" }): ProgramChoice => ({
    path: file.path,
    title: (file.name || file.path.split("/").pop() || file.path).replace(/\.(java|pdf)$/i, "").replace(/[_-]+/g, " "),
    origin: file.origin === "mongodb" ? "mongodb" : "github",
  });
  if (savedHit) {
    return { confidentPath: savedHit.path, origin: "mongodb", close: [], otherLanguage: false };
  }
  const skipRepo = wanted !== "auto" && wanted !== "java";
  const ranked = skipRepo
    ? { javaPath: "", pdfPath: "", focus: "", solved: "", otherLanguage: true }
    : rankQuestion(question, repo);
  const { specific } = questionTokens(question);
  const partial = (file: { path: string; name?: string; origin?: "mongodb" | "github" }) => {
    const words = wordsFromPath(file.origin === "mongodb" ? `saved/${topicKey(file.name || "").replace(/ /g, "-")}.java` : file.path);
    const hits = specific.filter((token) => words.includes(token));
    return hits.length > 0 && hits.length < specific.length ? hits.length : 0;
  };
  const close = [...saved, ...repo]
    .map((file) => ({ file, score: partial(file) }))
    .filter((item) => item.score > 0)
    .sort((a, b) => b.score - a.score || a.file.path.localeCompare(b.file.path))
    .slice(0, 5)
    .map((item) => choice(item.file));
  if (!skipRepo && ranked.javaPath) {
    return {
      confidentPath: ranked.javaPath,
      origin: "github",
      close: close.filter((item) => item.path !== ranked.javaPath).slice(0, 4),
      otherLanguage: false,
    };
  }
  if (!skipRepo && wanted === "auto" && ranked.pdfPath) {
    return {
      confidentPath: ranked.pdfPath,
      origin: "github",
      close: close.filter((item) => item.path !== ranked.pdfPath).slice(0, 4),
      otherLanguage: false,
    };
  }
  if (skipRepo && ranked.otherLanguage) {
    const javaRank = rankQuestion(question, repo);
    const javaChoice = repo.find((file) => file.path === javaRank.javaPath);
    const withJava = javaChoice && !close.some((item) => item.path === javaChoice.path) ? [choice(javaChoice), ...close] : close;
    return { confidentPath: "", origin: "", close: withJava.slice(0, 5), otherLanguage: true };
  }
  return { confidentPath: "", origin: "", close, otherLanguage: ranked.otherLanguage };
}

async function askGemini(question: string, language: string): Promise<string | null> {
  const key = process.env.GEMINI_API_KEY || process.env.Gemini_API_Key;
  if (!key) return null;
  const coding = wantsCode(question, language);
  const named = CODE_LANGUAGES.has(language) ? language : "Java";
  const system = coding
    ? `Write a beginner-friendly ${named} solution. Use exactly these headings: Program title, Problem statement, Simple approach, Complete code, Explanation of important lines, Sample input, Sample output, Time complexity, Space complexity, Important edge cases. Put the code in one fenced block. Do not say the code was executed. Do not include secrets.`
    : "You help a QA engineer practice interview answers. Use the language named in the question: JavaScript stays JavaScript, Python stays Python. If no language is named, use Java. Start with the answer they would say out loud. Add a short code example only when the question needs code. Be accurate and concise. Do not say the code was executed.";
  const models = ["gemini-3.8-flash", "gemini-2.5-flash"];
  let lastError = "Gemini could not answer this question.";
  for (const model of models) {
    let response: Response;
    try {
      response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "x-goog-api-key": key,
          },
          body: JSON.stringify({
            systemInstruction: { parts: [{ text: system }] },
            contents: [{ role: "user", parts: [{ text: question }] }],
            generationConfig: { temperature: coding ? 0.2 : 0.3 },
          }),
          signal: AbortSignal.timeout(25000),
        },
      );
    } catch {
      throw new Error("Gemini took too long. Retry in a moment.");
    }
    const data = (await response.json()) as {
      error?: { message?: string; status?: string };
      candidates?: { content?: { parts?: { text?: string }[] } }[];
    };
    if (response.status === 404) {
      lastError = data.error?.message || lastError;
      continue;
    }
    if (response.status === 429) throw new Error("Gemini is rate limited. Retry in a moment, or open a saved program.");
    if (!response.ok) throw new Error(data.error?.message || lastError);
    const answer = data.candidates?.[0]?.content?.parts?.map((part) => part.text || "").join("").trim();
    if (!answer) throw new Error("Gemini returned an empty answer.");
    return answer;
  }
  throw new Error(lastError);
}

function splitGenerated(text: string): { code: string; explanation: string; title: string } {
  const fenced = text.match(/```[a-zA-Z0-9]*\n([\s\S]*?)```/);
  const code = fenced?.[1]?.trim() || "";
  const explanation = (fenced ? text.replace(fenced[0], "") : text).trim();
  const heading = explanation.match(/Program title\s*\n+([^\n]+)/i)?.[1]?.trim();
  return { code, explanation, title: heading || "Generated program" };
}

function libraryError(error: unknown): never {
  const message = error instanceof Error ? error.message : "Could not search the program library.";
  if (/mongodb|ECONNREFUSED|querySrv|server selection/i.test(message)) {
    throw new Error("The program library is unavailable. Retry in a moment.");
  }
  throw error instanceof Error ? error : new Error(message);
}

export async function answerInterview(
  question: string,
  options?: { repoOnly?: boolean; language?: string; generate?: boolean; owner?: string },
): Promise<InterviewResult> {
  const asked = question.trim();
  if (asked.length < 3) throw new Error("Type a program name or question.");
  const language = (options?.language || "auto").toLowerCase();
  let entries: RepoEntry[] = [];
  let saved: SavedProgram[] = [];
  let pdfNotes: StoredNote[] = [];
  try {
    entries = await catalog();
    if (language === "auto") pdfNotes = await loadPdfNotes();
    if (options?.owner) saved = await listSavedPrograms(options.owner);
  } catch (error) {
    libraryError(error);
  }
  const match = matchPrograms(
    asked,
    [
      ...saved.flatMap((program) =>
        [program.title, ...program.aliases].map((alias) => ({
          path: program.path,
          name: alias,
          kind: "java" as const,
          origin: "mongodb" as const,
          language: program.language,
        })),
      ),
      ...entries
        .filter((entry) => entry.kind === "java")
        .map((entry) => ({ ...entry, origin: "github" as const, language: "java" })),
      ...pdfNotes.map((note) => ({
        path: note.path,
        name: note.title,
        kind: "pdf" as const,
        text: note.text,
        origin: "github" as const,
        language: "java",
      })),
    ],
    language,
  );
  const savedHit = saved.find((program) => program.path === match.confidentPath);
  if (savedHit) {
    return {
      source: "repo",
      origin: "mongodb",
      title: savedHit.title,
      path: savedHit.path,
      language: savedHit.language,
      code: savedHit.text,
      answer: savedHit.explanation || undefined,
      note: "Found in MongoDB. This saved program is reused, so Gemini was not called.",
      related: match.close,
    };
  }
  if (match.origin === "github" && match.confidentPath) {
    const note = await readInterviewNote(match.confidentPath);
    const hit = entries.find((entry) => entry.path === match.confidentPath);
    if (note?.text && hit) {
      const pdf = hit.kind === "pdf";
      return {
        source: "repo",
        origin: "github",
        title: titleFrom(hit),
        path: hit.path,
        url: fileUrl(hit.path),
        code: pdf ? undefined : note.text,
        answer: pdf ? note.text : rankQuestion(asked, entries).solved || undefined,
        focus: pdf ? rankQuestion(asked, pdfNotes.map((item) => ({ path: item.path, name: item.title, kind: item.kind, text: item.text }))).focus : undefined,
        language: "java",
        note: pdf
          ? "Found in GitHub. Opened the synced note and moved to this word. Gemini was not called."
          : "Found in GitHub. This program is already in the synced repo, so Gemini was not called.",
        related: match.close,
      };
    }
  }
  if (options?.repoOnly || (!options?.generate && match.close.length)) {
    if (options?.repoOnly && !match.close.length) {
      return {
        source: "missing",
        title: "Not in your repo",
        note: "No saved Java program or PDF matched this search.",
      };
    }
    if (match.close.length) {
      return {
        source: "choices",
        title: "Closest programs",
        note: options?.repoOnly
          ? "No exact program matched. These saved files are the closest."
          : "No exact program matched. Open one of these, or generate a new explanation.",
        choices: match.close,
        language,
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
  const chat = await askGemini(asked, language);
  if (!chat) {
    return {
      source: "missing",
      title: "Not in your library",
      note: "This program is not in the synced library. Add a Gemini API key in GEMINI_API_KEY, or retry after saving a program.",
      choices: match.close,
    };
  }
  const generated = splitGenerated(chat);
  return {
    source: "gemini",
    title: generated.title,
    code: generated.code || undefined,
    answer: generated.explanation || chat,
    language: CODE_LANGUAGES.has(language) ? language : "java",
    note: "Generated by Gemini. It was not run. Save it if you want the next search to reuse it.",
    related: match.close,
  };
}
