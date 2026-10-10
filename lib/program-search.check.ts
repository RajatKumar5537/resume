import assert from "node:assert/strict";
import { matchPrograms, topicKey } from "./interview";

const files = [
  { path: "src/main/java/StringProgram/Revers_String.java", kind: "java" as const, origin: "github" as const, language: "java" },
  { path: "src/main/java/Java/FibonacciSeries.java", kind: "java" as const, origin: "github" as const, language: "java" },
  { path: "src/main/java/Selenium/Alert_Popup.java", kind: "java" as const, origin: "github" as const, language: "java" },
  {
    path: "library/tester/java-reverse-string",
    name: "Reverse a String",
    kind: "java" as const,
    origin: "mongodb" as const,
    language: "java",
  },
];

const repoOnly = files.filter((file) => file.origin === "github");
const reverse = matchPrograms("Reverse a String", repoOnly, "auto");
assert.equal(reverse.confidentPath, "src/main/java/StringProgram/Revers_String.java");
assert.equal(reverse.origin, "github");

const alias = matchPrograms("string reversal", repoOnly, "auto");
assert.equal(alias.confidentPath, reverse.confidentPath);

const saved = matchPrograms("string reversal", files, "auto");
assert.equal(saved.confidentPath, "library/tester/java-reverse-string");
assert.equal(saved.origin, "mongodb");

const otherLanguage = matchPrograms("Reverse a String", repoOnly, "javascript");
assert.equal(otherLanguage.confidentPath, "");
assert.equal(otherLanguage.close.some((item) => item.path.endsWith("Revers_String.java")), true);

const missing = matchPrograms("Count Character Occurrences", repoOnly, "java");
assert.equal(missing.confidentPath, "");

assert.equal(topicKey("Reverse a String"), topicKey("string reversal"));
assert.notEqual(topicKey("Reverse a String"), topicKey("Fibonacci Series"));

console.log("program search checks passed");
