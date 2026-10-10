import assert from "node:assert/strict";
import { searchLessons } from "./concepts";
import { searchSeleniumLessons } from "./selenium-lessons";
import { PLAYWRIGHT_CONCEPTS, PLAYWRIGHT_GROUPS, PLAYWRIGHT_PATHS, searchPlaywrightLessons } from "./playwright-lessons";

const allowed = new Set(PLAYWRIGHT_PATHS);
const ids = new Set<string>();

for (const lesson of PLAYWRIGHT_CONCEPTS) {
  assert.equal(ids.has(lesson.id), false, lesson.id);
  ids.add(lesson.id);
  assert.ok(lesson.summary.length > 20, lesson.id);
  assert.ok(lesson.points.length > 0, lesson.id);
  assert.ok(lesson.simple && lesson.simple.length > 20, lesson.id);
  assert.ok(PLAYWRIGHT_GROUPS.some((group) => group.id === lesson.group), lesson.id);
  for (const related of lesson.related) {
    assert.ok(PLAYWRIGHT_CONCEPTS.some((item) => item.id === related), `${lesson.id} -> ${related}`);
  }
  for (const source of lesson.sources) assert.ok(allowed.has(source.path), `${lesson.id} ${source.path}`);
  if (lesson.example) {
    assert.ok(lesson.example.code.includes("\n") || lesson.example.code.includes("await") || lesson.example.code.includes("npx"), lesson.id);
    assert.ok(lesson.example.output.length > 0, lesson.id);
  }
}

for (const group of PLAYWRIGHT_GROUPS) {
  assert.ok(PLAYWRIGHT_CONCEPTS.some((lesson) => lesson.group === group.id), group.id);
}

assert.equal(PLAYWRIGHT_CONCEPTS.length, 95);
assert.equal(PLAYWRIGHT_CONCEPTS[0]?.id, "pw-what");
assert.equal(PLAYWRIGHT_CONCEPTS[14]?.id, "pw-debug");
assert.equal(searchPlaywrightLessons("what is playwright")[0]?.id, "pw-what");
assert.equal(searchPlaywrightLessons("browser context")[0]?.id, "pw-what");
assert.equal(searchPlaywrightLessons("network interception")[0]?.id, "pw-what");
assert.equal(searchPlaywrightLessons("difference between selenium and playwright")[0]?.id, "pw-vs-selenium");
assert.equal(searchPlaywrightLessons("install playwright")[0]?.id, "pw-install");
assert.equal(searchPlaywrightLessons("headless")[0]?.id, "pw-headless");
assert.equal(searchPlaywrightLessons("ui mode")[0]?.id, "pw-headless");
assert.equal(searchPlaywrightLessons("async and await")[0]?.id, "pw-async");
assert.equal(searchPlaywrightLessons("getByRole")[0]?.id, "pw-locators");
assert.equal(searchPlaywrightLessons("saucedemo")[0]?.id, "pw-actions");
assert.equal(searchPlaywrightLessons("checkbox")[0]?.id, "pw-dropdowns");
assert.equal(searchPlaywrightLessons("dynamic elements")[0]?.id, "pw-dynamic");
assert.equal(searchPlaywrightLessons("expect")[0]?.id, "pw-expect");
assert.equal(searchPlaywrightLessons("auto waiting")[0]?.id, "pw-autowait");
assert.equal(searchPlaywrightLessons("flaky")[0]?.id, "pw-timeouts");
assert.equal(searchPlaywrightLessons("basic test")[0]?.id, "pw-basic-test");
assert.equal(searchPlaywrightLessons("workers")[0]?.id, "pw-parallel");
assert.equal(searchPlaywrightLessons("trace viewer")[0]?.id, "pw-debug");
assert.equal(searchPlaywrightLessons("codegen")[0]?.id, "pw-debug");
assert.equal(searchPlaywrightLessons("page factory").length, 0);
assert.equal(searchPlaywrightLessons("findElement").length, 0);
assert.equal(searchLessons("getByRole").length, 0);
assert.equal(searchLessons("saucedemo").length, 0);
assert.equal(searchSeleniumLessons("getByRole").length, 0);
assert.equal(searchSeleniumLessons("trace viewer").length, 0);
assert.equal(searchSeleniumLessons("page factory")[0]?.id, "se-page-factory");

console.log(`playwright checks passed (${PLAYWRIGHT_CONCEPTS.length} lessons)`);
