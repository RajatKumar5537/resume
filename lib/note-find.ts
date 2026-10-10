export type TextRange = { start: number; end: number };

function phraseRanges(text: string, needle: string): TextRange[] {
  const haystack = text.toLowerCase();
  const ranges: TextRange[] = [];
  let from = 0;
  while (from < haystack.length) {
    const at = haystack.indexOf(needle, from);
    if (at < 0) break;
    ranges.push({ start: at, end: at + needle.length });
    from = at + needle.length;
  }
  return ranges;
}

export function findRanges(text: string, query: string): TextRange[] {
  const needle = query.trim().toLowerCase();
  if (needle.length < 2) return [];
  if (needle !== "oop" && needle !== "oops") return phraseRanges(text, needle);
  const ranges: TextRange[] = [];
  const pattern = /\b(?:oop|oops)\b/gi;
  let match: RegExpExecArray | null;
  while ((match = pattern.exec(text))) {
    ranges.push({ start: match.index, end: match.index + match[0].length });
  }
  return ranges;
}
