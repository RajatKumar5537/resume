import assert from "node:assert/strict";
import { focusBlockIndex, noteBlocks } from "../components/PdfNote";
import { rankQuestion } from "./interview";
import { findRanges } from "./note-find";
import { cachedAnswer, clearOpenedNotes, openedNote, rememberAnswer, rememberOpenedNote, syncNoteCacheRevision, syncNoteCacheUser } from "./opened-notes";

const java = (path: string) => ({ path, kind: "java" as const, text: "" });
const files = [
  java("src/main/java/Java/SecondLargest.java"),
  java("src/main/java/Java/LargestElement.java"),
  java("src/main/java/Java/nthBigestElement_Array.java"),
  java("src/main/java/Java/nthSmallestElement_Array.java"),
  java("src/main/java/StringProgram/Revers_String.java"),
  java("src/main/java/Java/ReverseNumber.java"),
  java("src/main/java/StringProgram/Reverse_Sentence.java"),
  java("src/main/java/Selenium/Alert_Popup.java"),
  java("src/main/java/Java/FibonacciSeries.java"),
  java("src/main/java/Java/FibonacciSeriesWithoutLoop.java"),
  java("src/main/java/Java/LargestStringInArray.java"),
  {
    path: "Interview_PDF/OOPS concept_Java.pdf",
    kind: "pdf" as const,
    text: "OOPS concept-:\nPolymorphism is one OOPS concept.\nInheritance is supported.\n",
  },
  {
    path: "Interview_PDF/Array_Collection_Java.pdf",
    kind: "pdf" as const,
    text: "Collection interface-:\nA collection stores objects.\nThis sentence also says collection.\n",
  },
  {
    path: "Interview_PDF/Manual Testing.pdf",
    kind: "pdf" as const,
    text: "12. Smoke Testing-:\nSmoke testing checks the build.\n2. Stress Testing-:\nStress testing checks load.\n",
  },
  {
    path: "Interview_PDF/API.pdf",
    kind: "pdf" as const,
    text: "collection collection collection concept concept oops oops\n",
  },
];

function expectJava(question: string, path: string) {
  const ranked = rankQuestion(question, files);
  assert.equal(ranked.otherLanguage, false, question);
  assert.equal(ranked.javaPath, path, question);
  assert.equal(ranked.pdfPath, "", question);
}

function expectPdf(question: string, path: string, focus: string) {
  const ranked = rankQuestion(question, files);
  assert.equal(ranked.javaPath, "", question);
  assert.equal(ranked.pdfPath, path, question);
  assert.equal(ranked.focus, focus, question);
}

expectJava("2nd largest", "src/main/java/Java/SecondLargest.java");
expectJava("largest number", "src/main/java/Java/LargestElement.java");
expectJava("find the 3rd largest number from {6,3,5,67,7}", "src/main/java/Java/nthBigestElement_Array.java");
expectJava("4th largest", "src/main/java/Java/nthBigestElement_Array.java");
expectJava("5th largest", "src/main/java/Java/nthBigestElement_Array.java");
expectJava("nth largest", "src/main/java/Java/nthBigestElement_Array.java");
expectJava("reverse a string", "src/main/java/StringProgram/Revers_String.java");
expectJava("How do you handle an alert popup in Selenium?", "src/main/java/Selenium/Alert_Popup.java");
expectJava("Write a Java program for the Fibonacci series", "src/main/java/Java/FibonacciSeries.java");

const otherLanguage = rankQuestion("reverse a string using javascript", files);
assert.equal(otherLanguage.otherLanguage, true);
assert.equal(otherLanguage.javaPath, "");
assert.equal(otherLanguage.pdfPath, "");

const solved = rankQuestion("find the 3rd largest number from {6,3,5,67,7}", files);
assert.match(solved.solved, /6/);

expectPdf("OOP", "Interview_PDF/OOPS concept_Java.pdf", "oops");
expectPdf("OOPS", "Interview_PDF/OOPS concept_Java.pdf", "oops");
expectPdf("OOP concepts", "Interview_PDF/OOPS concept_Java.pdf", "oops");
expectPdf("Collection", "Interview_PDF/Array_Collection_Java.pdf", "collection");
expectPdf("Smoke", "Interview_PDF/Manual Testing.pdf", "smoke");
expectPdf("stress testing", "Interview_PDF/Manual Testing.pdf", "stress");
expectPdf("Smoke SDLC stress testing", "Interview_PDF/Manual Testing.pdf", "smoke");

const exactOop = rankQuestion("OOP", [
  ...files,
  { path: "Interview_PDF/OOP notes.pdf", kind: "pdf", text: "OOP notes-:\nA short OOP note.\n" },
]);
assert.equal(exactOop.pdfPath, "Interview_PDF/OOP notes.pdf");
const exactOops = rankQuestion("OOPS", [
  ...files,
  { path: "Interview_PDF/OOP notes.pdf", kind: "pdf", text: "OOP notes-:\nA short OOP note.\n" },
]);
assert.equal(exactOops.pdfPath, "Interview_PDF/OOPS concept_Java.pdf");

const unrelated = rankQuestion("explain the sdlc phases", files);
assert.equal(unrelated.javaPath, "");
assert.equal(unrelated.pdfPath, "");

const sample = [
  "Collection interface-: A collection stores objects.",
  "",
  "Q. What is a collection?",
  "A. It groups objects.",
  "",
  "• Add an element",
  "• Remove an element",
  "",
  "1. Open the browser and sign in.",
  "",
  "12. Smoke Testing-:",
  "Smoke testing checks the build.",
  "",
  "Encapsulation",
  "Data hiding keeps fields private.",
  "",
  "public class Sample {",
  "    int value = 1;",
  "}",
].join("\n");

const blocks = noteBlocks(sample);
const kinds = blocks.map((block) => block.kind);
assert.deepEqual(kinds, ["heading", "paragraph", "question", "point", "item", "item", "item", "heading", "paragraph", "heading", "paragraph", "code"]);
const code = blocks.find((block) => block.kind === "code");
assert.ok(code?.text.includes("    int value = 1;"));
assert.equal(blocks.filter((block) => block.kind === "heading").length >= 3, true);
const joined = blocks.map((block) => block.text).join("\n");
for (const word of ["Collection interface", "stores objects", "What is a collection", "groups objects", "Add an element", "Open the browser", "Smoke Testing", "public class Sample", "int value"]) {
  assert.ok(joined.includes(word), word);
}
assert.equal(focusBlockIndex(blocks, "collection") >= 0, true);
assert.match(blocks[focusBlockIndex(blocks, "collection")].text, /Collection interface/);

const ranges = findRanges(joined, "Collection");
assert.equal(ranges.length, 3);
assert.equal(joined.slice(ranges[0].start, ranges[0].end).toLowerCase(), "collection");
assert.equal(findRanges(joined, "stores objects").length, 1);
assert.equal(findRanges(joined, "missing sentence").length, 0);
assert.equal(findRanges(joined, "c").length, 0);
const oopsRanges = findRanges("OOPS concept and OOP", "OOP");
assert.equal(oopsRanges.length, 2);
assert.equal("OOPS concept and OOP".slice(oopsRanges[0].start, oopsRanges[0].end), "OOPS");

clearOpenedNotes();
rememberOpenedNote("Interview_PDF/OOPS concept_Java.pdf", "pdf", "");
assert.equal(openedNote("Interview_PDF/OOPS concept_Java.pdf"), undefined);
rememberOpenedNote("Interview_PDF/OOPS concept_Java.pdf", "pdf", "OOPS concept");
assert.equal(openedNote("Interview_PDF/OOPS concept_Java.pdf")?.text, "OOPS concept");
rememberAnswer("OOP", { source: "missing", title: "Not in your repo", note: "Missing" });
assert.equal(cachedAnswer("OOP"), undefined);
rememberAnswer("  OOP  ", { source: "repo", title: "OOPS concept Java", path: "Interview_PDF/OOPS concept_Java.pdf", answer: "OOPS concept", note: "Opened" });
assert.equal(cachedAnswer("oop")?.path, "Interview_PDF/OOPS concept_Java.pdf");
syncNoteCacheRevision("revision-1");
assert.equal(openedNote("Interview_PDF/OOPS concept_Java.pdf")?.text, "OOPS concept");
syncNoteCacheRevision("revision-1");
assert.equal(cachedAnswer("oop")?.title, "OOPS concept Java");
syncNoteCacheRevision("revision-2");
assert.equal(openedNote("Interview_PDF/OOPS concept_Java.pdf"), undefined);
assert.equal(cachedAnswer("oop"), undefined);

rememberOpenedNote("Interview_PDF/OOPS concept_Java.pdf", "pdf", "OOPS concept");
syncNoteCacheUser("first@example.com");
assert.equal(openedNote("Interview_PDF/OOPS concept_Java.pdf")?.text, "OOPS concept");
syncNoteCacheUser("second@example.com");
assert.equal(openedNote("Interview_PDF/OOPS concept_Java.pdf"), undefined);

console.log("interview note checks passed");
