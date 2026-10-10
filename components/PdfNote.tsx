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

export type NoteBlock = {
  kind: "heading" | "question" | "paragraph" | "item" | "point" | "code";
  text: string;
  id?: string;
};

function isItemLine(line: string): boolean {
  const value = line.trim();
  if (!value || isHeading(value) || isQuestion(value)) return false;
  return /^(?:[•●▪◦]|[-–]|\d+[.)])\s+\S/.test(value);
}

function isPointLine(line: string): boolean {
  return /^(?:A\.|example\s*[:.\-]|definition\s*[:.\-]|note\s*[:.\-]|important\s*[:.\-]|answer\s*[:.\-])/i.test(line.trim());
}

function isCodeLine(line: string): boolean {
  const trimmed = line.trim();
  if (!trimmed || isHeading(trimmed) || isQuestion(trimmed) || isItemLine(trimmed)) return false;
  if (/^(import |package |public |private |protected |class |interface |enum |@\w+)/.test(trimmed)) return true;
  if (/^(if|for|while|switch|catch|try|else|return|new|throw|int|long|double|float|boolean|char|String|var|final|static|void)\b/.test(trimmed) && /[(){};=]/.test(trimmed)) return true;
  if (/^[{}();]+$/.test(trimmed)) return true;
  if (/^\s{2,}\S/.test(line) && /[{}();=]/.test(line) && trimmed.split(/\s+/).length <= 14 && !trimmed.includes("?")) return true;
  return false;
}

export function noteBlocks(text: string): NoteBlock[] {
  const lines = text.replace(/\u00ad/g, "").replace(/\r/g, "").split("\n");
  const blocks: NoteBlock[] = [];
  let headingCount = 0;
  let paragraph = "";
  let code: string[] = [];

  const flushParagraph = () => {
    if (!paragraph) return;
    blocks.push({ kind: "paragraph", text: paragraph });
    paragraph = "";
  };
  const flushCode = () => {
    if (!code.length) return;
    blocks.push({ kind: "code", text: code.join("\n") });
    code = [];
  };
  const pushLine = (value: string) => {
    if (isHeading(value)) {
      flushParagraph();
      headingCount += 1;
      blocks.push({ kind: "heading", text: value, id: `note-h-${headingCount}` });
      return;
    }
    if (isQuestion(value)) {
      flushParagraph();
      blocks.push({ kind: "question", text: value });
      return;
    }
    if (isItemLine(value)) {
      flushParagraph();
      blocks.push({ kind: "item", text: value });
      return;
    }
    if (isPointLine(value)) {
      flushParagraph();
      blocks.push({ kind: "point", text: value });
      return;
    }
    paragraph = paragraph ? `${paragraph} ${value}` : value;
  };

  for (const raw of lines) {
    const trimmed = raw.trim().replace(/^/g, "•");
    if (!trimmed) {
      flushParagraph();
      flushCode();
      continue;
    }
    const continuesCode = code.length > 0 && (/^\s{2,}\S/.test(raw) || /^[{}();]+$/.test(trimmed));
    if (isCodeLine(raw) || continuesCode) {
      flushParagraph();
      code.push(raw.replace(/\t/g, "    ").replace(/[ \t]+$/g, ""));
      continue;
    }
    flushCode();
    const glued = trimmed.match(/^((?:\d+[.)]\s*)?[A-Z][^.]{2,55}?(?:-:|:))\s+(\S.*)$/);
    if (glued && isHeading(glued[1])) {
      pushLine(glued[1]);
      pushLine(glued[2]);
      continue;
    }
    pushLine(trimmed);
  }
  flushParagraph();
  flushCode();
  return blocks;
}

export function focusBlockIndex(blocks: NoteBlock[], focus: string): number {
  if (!focus) return -1;
  let best = -1;
  let rank = 0;
  blocks.forEach((block, index) => {
    const score = lineRank(block.text, focus);
    if (score > rank) {
      rank = score;
      best = index;
    }
  });
  return best;
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
