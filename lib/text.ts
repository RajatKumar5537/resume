const SKILL_ALIASES: Record<string, string[]> = {
  "node.js": ["node.js", "nodejs", "node js"],
  "next.js": ["next.js", "nextjs", "next js"],
  "socket.io": ["socket.io", "socketio", "socket io"],
  "selenium webdriver": ["selenium webdriver", "selenium", "webdriver"],
  "rest apis": ["rest apis", "rest api", "restful"],
  "rest assured": ["rest assured", "rest-assured"],
  "github actions": ["github actions"],
  mongodb: ["mongodb", "mongo db"],
  javascript: ["javascript", "java script"],
  typescript: ["typescript", "type script"],
  react: ["react", "react.js", "reactjs"],
  "cross-browser testing": ["cross-browser", "cross browser"],
  "test cases": ["test cases", "test case"],
  "code review": ["code review", "code reviews"],
  "test planning": ["test planning", "test plan", "test strategy"],
  "bug reporting": ["bug reporting", "bug report", "defect", "defects"],
  "edge cases": ["edge cases", "edge case"],
};

function escapeReg(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function indexOfAlias(text: string, term: string): number {
  const lower = text.toLowerCase();
  const token = term.toLowerCase().trim();
  if (!token) return -1;

  if (token === "java") {
    const stripped = lower.replace(/javascript/g, " ").replace(/java\s*script/g, " ");
    const match = /(^|[^a-z0-9])java(?=[^a-z0-9]|$)/.exec(stripped);
    return match ? match.index : -1;
  }

  const compact = token.replace(/[^a-z0-9+#]+/g, " ").trim();
  const parts = compact.split(/\s+/).filter(Boolean);
  if (!parts.length) return -1;

  if (parts.length === 1) {
    const word = escapeReg(parts[0]);
    const plural = /\d$/.test(parts[0]) ? word : `${word}s?`;
    const re = new RegExp(`(^|[^a-z0-9])${plural}(?=[^a-z0-9]|$)`, "i");
    const direct = re.exec(lower);
    if (direct) return direct.index;
    const withoutDots = re.exec(lower.replace(/\./g, ""));
    return withoutDots ? withoutDots.index : -1;
  }

  const pattern = parts
    .map((part) => {
      const escaped = escapeReg(part);
      const stem = part.replace(/(es|s)$/i, "");
      if (stem.length >= 3 && stem !== part) return `(?:${escaped}|${escapeReg(stem)})`;
      return escaped;
    })
    .join("[^a-z0-9]+");
  const match = new RegExp(pattern, "i").exec(lower);
  return match ? match.index : -1;
}

export function firstIndex(text: string, term: string): number {
  const aliases = SKILL_ALIASES[term.toLowerCase()] ?? [term];
  let best = Number.POSITIVE_INFINITY;
  for (const alias of aliases) {
    const index = indexOfAlias(text, alias);
    if (index >= 0 && index < best) best = index;
  }
  return best;
}

export function textHas(text: string, term: string): boolean {
  return firstIndex(text, term) !== Number.POSITIVE_INFINITY;
}

export function humanJoin(items: string[]): string {
  if (items.length === 0) return "";
  if (items.length === 1) return items[0];
  if (items.length === 2) return `${items[0]} and ${items[1]}`;
  return `${items.slice(0, -1).join(", ")}, and ${items[items.length - 1]}`;
}

export function shortUrl(url: string): string {
  return url.replace(/^https?:\/\//i, "").replace(/\/$/, "");
}

export function cleanLine(value: string): string {
  return value.replace(/\s+/g, " ").replace(/[|•].*$/, "").trim();
}

export function guessTitle(text: string): string {
  const labeled = text.match(/(?:job title|position|role title)\s*[:\-–]\s*([^\n]{2,80})/i);
  if (labeled) return cleanLine(labeled[1]).slice(0, 80);

  const first = text
    .split(/\n/)
    .map((line) => line.trim())
    .find(Boolean);
  if (first && first.length <= 60 && !/[.!?]$/.test(first) && first.split(/\s+/).length <= 8) {
    return cleanLine(first).slice(0, 80);
  }

  const hiring = text.match(
    /(?:we are hiring|we're hiring)\s+(?:an?\s+)?([A-Za-z][A-Za-z0-9/+#.&' -]{1,50}?)(?:\s+to\b|\s+who\b|\s+for\b|[,.]|$)/i,
  );
  return hiring ? cleanLine(hiring[1]).slice(0, 80) : "";
}

export function guessCompany(text: string): string {
  const labeled = text.match(/(?:company|organisation|organization)\s*[:\-–]\s*([^\n]{2,80})/i);
  return labeled ? cleanLine(labeled[1]).slice(0, 80) : "";
}

export function isJobLink(value: string): boolean {
  return /^https?:\/\/\S+$/i.test(value.trim());
}
