import assert from "node:assert/strict";
import { PRACTICE_PATHS } from "./concept-lessons-gaps";
import { CONCEPTS, DEFAULT_CONCEPT_MODE, searchLessons } from "./concepts";
import { rankQuestion } from "./interview";

const REAL = new Set([
  ...PRACTICE_PATHS,
  "Interview_PDF/OOPS concept_Java.pdf",
  "Interview_PDF/Array_Collection_Java.pdf",
  "src/main/java/Java/LargestElement.java",
  "src/main/java/Java/SecondLargest.java",
  "src/main/java/Java/nthBigestElement_Array.java",
  "src/main/java/Java/nthSmallestElement_Array.java",
  "src/main/java/Java/SumOfArray.java",
  "src/main/java/Java/RemoveDuplicateNumberArray.java",
  "src/main/java/Java/HashMapExample.java",
  "src/main/java/Sorting/LinearSearch.java",
  "src/main/java/Sorting/BinarySearch.java",
  "src/main/java/Sorting/Sorting.java",
]);

assert.equal(DEFAULT_CONCEPT_MODE, "learn");
assert.equal(searchLessons("OOP")[0]?.id, "oop-overview");
assert.equal(searchLessons("OOPS")[0]?.id, "oop-overview");
assert.equal(searchLessons("ArrayList")[0]?.id, "list-arraylist");
assert.equal(searchLessons("HashMap collision")[0]?.id, "hashmap-collision");
assert.equal(searchLessons("second largest")[0]?.id, "largest-second");
assert.equal(searchLessons("2nd largest")[0]?.id, "largest-second");
assert.equal(searchLessons("reverse a string using javascript").length, 0);
assert.equal(searchLessons("Explain polymorphism in Java")[0]?.id, "polymorphism");

const second = CONCEPTS.find((lesson) => lesson.id === "largest-second");
const nth = CONCEPTS.find((lesson) => lesson.id === "nth-largest");
const poly = CONCEPTS.find((lesson) => lesson.id === "polymorphism");
const collision = CONCEPTS.find((lesson) => lesson.id === "hashmap-collision");
assert.equal(second?.example?.output, "7");
assert.equal(nth?.example?.output, "6");
assert.equal(poly?.example?.output, "Bark");
assert.ok(collision?.gap);
assert.equal(collision?.sources.length, 0);

const ids = new Set<string>();
for (const lesson of CONCEPTS) {
  assert.equal(ids.has(lesson.id), false, lesson.id);
  ids.add(lesson.id);
  assert.ok(lesson.summary.length > 20, lesson.id);
  for (const related of lesson.related) assert.ok(CONCEPTS.some((item) => item.id === related), `${lesson.id} -> ${related}`);
  for (const source of lesson.sources) assert.ok(REAL.has(source.path), `${lesson.id} ${source.path}`);
  if (lesson.example) {
    assert.ok(lesson.example.code.includes("\n") || lesson.example.code.includes("System.out"));
    assert.ok(lesson.example.output.length > 0);
  }
}

const files = [
  { path: "src/main/java/Java/SecondLargest.java", kind: "java" as const },
  { path: "src/main/java/Java/LargestElement.java", kind: "java" as const },
  { path: "src/main/java/StringProgram/Revers_String.java", kind: "java" as const },
];
assert.equal(rankQuestion("2nd largest", files).javaPath, "src/main/java/Java/SecondLargest.java");
assert.equal(rankQuestion("reverse a string using javascript", files).javaPath, "");

console.log("concept checks passed");
