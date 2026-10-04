export function isQuestion(line: string): boolean {
  const value = line.trim();
  if (/^(q(?:uestion)?\s*[\d.\:\)]|q\s+\d+)/i.test(value)) return true;
  return value.endsWith("?") && value.length > 8 && value.length < 180;
}

export function isHeading(line: string): boolean {
  const value = line.trim().replace(/^\d+[.)]\s*/, "");
  if (!value || value.length > 68 || isQuestion(line)) return false;
  if (/^[•●▪\-–]/.test(value)) return false;
  if (/[.]$/.test(value)) return false;
  if (/^(given|when|then|and)\(\)$/i.test(value)) return true;
  if (/^[A-Za-z_][\w]*\([^)\n]*\)$/.test(value)) return true;
  const sentence = /^(it'?s|we|using|for|use|this|that|you|these|those|here)\b/i.test(value);
  if (!sentence && /[-:]\s*$/.test(value) && value.length <= 60 && /^[A-Z0-9]/.test(value)) return true;
  if (
    /^(encapsulation|inheritance|polymorphism|abstraction|data hiding|oops concept|method over-?riding|compiler time polymorphism|compile time polymorphism|run time polymorphism)\b/i.test(
      value,
    ) &&
    value.length < 48
  ) {
    return true;
  }
  const words = value.split(/\s+/);
  return (
    words.length <= 6 &&
    /^[A-Z]/.test(value) &&
    !/[,;.]/.test(value) &&
    words.every((word) => /^[A-Z0-9(]/.test(word) || /^(of|the|and|a|to|in|for|on)$/i.test(word))
  );
}

export function readableNote(text: string): string {
  const lines = text.replace(/\u00ad/g, "").split(/\n/);
  const out: string[] = [];
  for (const raw of lines) {
    let line = raw.trim().replace(/^/g, "•");
    if (!line) {
      if (out[out.length - 1] !== "") out.push("");
      continue;
    }
    const glued = line.match(/^((?:\d+[.)]\s*)?[A-Z][^.]{2,55}?(?:-:|:))\s+(\S.*)$/);
    if (glued && isHeading(glued[1])) {
      if (out[out.length - 1] !== "") out.push("");
      out.push(glued[1]);
      out.push("");
      line = glued[2];
    }
    const startsItem = /^(Q\.|A\.|•|●|▪|[-–]|\d+[\).])\s*/.test(line);
    const startsQuestion = /^Q\./.test(line);
    const previous = out[out.length - 1] ?? "";
    const heading = isHeading(line) || isHeading(previous);
    const previousEnded = /[?:.]$/.test(previous);
    if ((startsQuestion || isHeading(line)) && previous) out.push("");
    if (!previous || startsItem || previousEnded || heading) out.push(line);
    else out[out.length - 1] = `${previous} ${line}`;
  }
  return out.join("\n").replace(/\n{3,}/g, "\n\n").trim();
}

function lineRank(line: string, needle: string): number {
  if (!new RegExp(`\\b${needle}\\b`, "i").test(line)) return 0;
  const stripped = line.trim().replace(/^(?:q(?:uestion)?\.?\s*)/i, "").replace(/^\d+[.)]\s*/, "");
  const leading = new RegExp(`^${needle}\\b`, "i").test(stripped);
  if (isHeading(line) && leading) return 4;
  if (isQuestion(line) && leading) return 3;
  if (isHeading(line) || isQuestion(line)) return 2;
  return 1;
}

function focusedLine(line: string, focus: string) {
  const at = line.toLowerCase().indexOf(focus);
  if (at < 0) return line;
  return (
    <>
      {line.slice(0, at)}
      <mark className="note-focus">{line.slice(at, at + focus.length)}</mark>
      {line.slice(at + focus.length)}
    </>
  );
}

export function NoteText({ text, focus }: { text: string; focus?: string }) {
  const needle = focus?.trim().toLowerCase() || "";
  const blocks = text.split(/\n{2,}/).filter((block) => block.trim());
  const lines = blocks.map((block) => block.split("\n"));
  let focusAt: { block: number; line: number } | null = null;
  let bestRank = 0;
  if (needle) {
    lines.forEach((group, block) => {
      group.forEach((line, lineIndex) => {
        const rank = lineRank(line, needle);
        if (rank > bestRank) {
          bestRank = rank;
          focusAt = { block, line: lineIndex };
        }
      });
    });
  }
  return (
    <div className="library-note">
      {lines.map((group, index) => (
        <div key={`${index}-${group[0]?.slice(0, 24) || index}`}>
          {group.map((line, lineIndex) => {
            const hit = focusAt?.block === index && focusAt.line === lineIndex;
            const body = hit ? focusedLine(line, needle) : line;
            if (isQuestion(line)) {
              return (
                <p key={`${index}-${lineIndex}`} className="note-q" data-note-focus={hit || undefined}>
                  {body}
                </p>
              );
            }
            if (isHeading(line)) {
              return (
                <p key={`${index}-${lineIndex}`} className="note-h" data-note-focus={hit || undefined}>
                  {body}
                </p>
              );
            }
            return (
              <p key={`${index}-${lineIndex}`} data-note-focus={hit || undefined}>
                {body}
              </p>
            );
          })}
        </div>
      ))}
    </div>
  );
}
