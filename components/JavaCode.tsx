const CONTROL = new Set([
  "if",
  "else",
  "for",
  "while",
  "do",
  "switch",
  "case",
  "break",
  "continue",
  "return",
  "try",
  "catch",
  "finally",
  "throw",
  "new",
  "instanceof",
]);

const KEYWORD = new Set([
  "public",
  "private",
  "protected",
  "static",
  "final",
  "class",
  "interface",
  "enum",
  "void",
  "int",
  "long",
  "double",
  "float",
  "boolean",
  "char",
  "byte",
  "short",
  "abstract",
  "extends",
  "implements",
  "import",
  "package",
  "throws",
  "this",
  "super",
  "default",
  "null",
  "true",
  "false",
  "synchronized",
  "volatile",
  "transient",
  "native",
  "strictfp",
  "assert",
  "const",
  "goto",
]);

type TokenKind = "comment" | "string" | "number" | "keyword" | "control" | "class" | "method" | "variable" | "operator";

type Token = { kind: TokenKind | "plain"; text: string };

const OPERATORS = [
  ">>>=",
  ">>=",
  "<<=",
  ">>>",
  "==",
  "!=",
  "<=",
  ">=",
  "&&",
  "||",
  "++",
  "--",
  "+=",
  "-=",
  "*=",
  "/=",
  "%=",
  "&=",
  "|=",
  "^=",
  "->",
  "::",
  "<<",
  ">>",
  "+",
  "-",
  "*",
  "/",
  "%",
  "=",
  "<",
  ">",
  "!",
  "&",
  "|",
  "^",
  "~",
  "?",
  ":",
];

function highlightJava(code: string): Token[] {
  const tokens: Token[] = [];
  let index = 0;

  while (index < code.length) {
    const rest = code.slice(index);
    if (rest.startsWith("//")) {
      const end = rest.indexOf("\n");
      const text = end === -1 ? rest : rest.slice(0, end);
      tokens.push({ kind: "comment", text });
      index += text.length;
      continue;
    }
    if (rest.startsWith("/*")) {
      const end = rest.indexOf("*/");
      const text = end === -1 ? rest : rest.slice(0, end + 2);
      tokens.push({ kind: "comment", text });
      index += text.length;
      continue;
    }
    if (rest.startsWith("\"") || rest.startsWith("'")) {
      const quote = rest[0];
      let cursor = 1;
      while (cursor < rest.length) {
        if (rest[cursor] === "\\") {
          cursor += 2;
          continue;
        }
        if (rest[cursor] === quote) {
          cursor += 1;
          break;
        }
        if (quote === "\"" && rest[cursor] === "\n") break;
        cursor += 1;
      }
      tokens.push({ kind: "string", text: rest.slice(0, cursor) });
      index += cursor;
      continue;
    }
    const space = rest.match(/^\s+/);
    if (space) {
      tokens.push({ kind: "plain", text: space[0] });
      index += space[0].length;
      continue;
    }
    const number = rest.match(/^\d[\d_]*\.?[\d_]*([eE][+-]?\d+)?[fFdDlL]?/);
    if (number && !/^[a-zA-Z_]/.test(code[index - 1] || "")) {
      tokens.push({ kind: "number", text: number[0] });
      index += number[0].length;
      continue;
    }
    const word = rest.match(/^[A-Za-z_][A-Za-z0-9_]*/);
    if (word) {
      const name = word[0];
      const after = code.slice(index + name.length);
      const call = /^\s*\(/.test(after);
      let kind: TokenKind = "variable";
      if (CONTROL.has(name)) kind = "control";
      else if (KEYWORD.has(name)) kind = "keyword";
      else if (/^[A-Z]/.test(name)) kind = "class";
      else if (call) kind = "method";
      tokens.push({ kind, text: name });
      index += name.length;
      continue;
    }
    const operator = OPERATORS.find((item) => rest.startsWith(item));
    if (operator) {
      tokens.push({ kind: "operator", text: operator });
      index += operator.length;
      continue;
    }
    tokens.push({ kind: "plain", text: rest[0] });
    index += 1;
  }

  return tokens;
}

export function JavaCode({ code }: { code: string }) {
  const tokens = highlightJava(code);
  return (
    <pre className="answer-code">
      {tokens.map((token, index) =>
        token.kind === "plain" ? (
          token.text
        ) : (
          <span key={index} className={`tok tok-${token.kind}`}>
            {token.text}
          </span>
        ),
      )}
    </pre>
  );
}
