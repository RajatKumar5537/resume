import assert from "node:assert/strict";
import { searchLessons } from "./concepts";
import { SELENIUM_CONCEPTS, SELENIUM_GROUPS, SELENIUM_PATHS, searchSeleniumLessons } from "./selenium-lessons";

const allowed = new Set(SELENIUM_PATHS);
const ids = new Set<string>();

for (const lesson of SELENIUM_CONCEPTS) {
  assert.equal(ids.has(lesson.id), false, lesson.id);
  ids.add(lesson.id);
  assert.ok(lesson.summary.length > 20, lesson.id);
  assert.ok(lesson.points.length > 0, lesson.id);
  assert.ok(SELENIUM_GROUPS.some((group) => group.id === lesson.group), lesson.id);
  for (const related of lesson.related) assert.ok(ids.has(related) || SELENIUM_CONCEPTS.some((item) => item.id === related), `${lesson.id} -> ${related}`);
  for (const source of lesson.sources) assert.ok(allowed.has(source.path), `${lesson.id} ${source.path}`);
  if (lesson.example) assert.ok(lesson.example.output.length > 0, lesson.id);
}

for (const group of SELENIUM_GROUPS) {
  assert.ok(SELENIUM_CONCEPTS.some((lesson) => lesson.group === group.id), group.id);
}

assert.equal(searchSeleniumLessons("page factory")[0]?.id, "se-page-factory");
assert.equal(searchSeleniumLessons("xpath")[0]?.id, "se-xpath");
assert.equal(searchSeleniumLessons("findElement")[0]?.id, "se-find-element");
assert.equal(searchSeleniumLessons("alert")[0]?.id, "se-alerts");
assert.equal(searchSeleniumLessons("TestNG")[0]?.id, "se-testng-annotations");
assert.equal(searchSeleniumLessons("reverse a string using javascript").length, 0);
assert.equal(searchLessons("OOP")[0]?.id, "oop-overview");
assert.equal(searchLessons("findElement").length, 0);

console.log(`selenium checks passed (${SELENIUM_CONCEPTS.length} lessons)`);
