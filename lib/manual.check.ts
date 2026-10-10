import assert from "node:assert/strict";
import { searchLessons } from "./concepts";
import { searchManualLessons, MANUAL_CONCEPTS, MANUAL_GROUPS, MANUAL_PATHS } from "./manual-lessons";
import { searchPlaywrightLessons } from "./playwright-lessons";
import { searchSeleniumLessons } from "./selenium-lessons";

const allowed = new Set(MANUAL_PATHS);
const ids = new Set<string>();

for (const lesson of MANUAL_CONCEPTS) {
  assert.equal(ids.has(lesson.id), false, lesson.id);
  ids.add(lesson.id);
  assert.ok(lesson.summary.length > 20, lesson.id);
  assert.ok(lesson.simple && lesson.simple.length > 20, lesson.id);
  assert.ok(lesson.points.length > 0, lesson.id);
  assert.ok(MANUAL_GROUPS.some((group) => group.id === lesson.group), lesson.id);
  for (const related of lesson.related) {
    assert.ok(MANUAL_CONCEPTS.some((item) => item.id === related), `${lesson.id} -> ${related}`);
  }
  for (const source of lesson.sources) {
    assert.ok(allowed.has(source.path), `${lesson.id} ${source.path}`);
    assert.match(source.label, /M- Manual Testing\.pdf, page \d+/, lesson.id);
  }
  if (lesson.example) assert.ok(lesson.example.output.length > 0, lesson.id);
}

for (const group of MANUAL_GROUPS) {
  assert.ok(MANUAL_CONCEPTS.some((lesson) => lesson.group === group.id), group.id);
}

assert.ok(MANUAL_CONCEPTS.length >= 30);
assert.equal(searchManualLessons("smoke testing")[0]?.id, "mt-smoke");
assert.equal(searchManualLessons("sanity testing")[0]?.id, "mt-smoke");
assert.equal(searchManualLessons("regression testing")[0]?.id, "mt-regression");
assert.equal(searchManualLessons("retesting")[0]?.id, "mt-retest");
assert.equal(searchManualLessons("severity")[0]?.id, "mt-severity");
assert.equal(searchManualLessons("boundary value")[0]?.id, "mt-techniques");
assert.equal(searchManualLessons("story point")[0]?.id, "mt-agile");
assert.equal(searchManualLessons("spillover")[0]?.id, "mt-agile");
assert.equal(searchManualLessons("impact analysis")[0]?.id, "mt-impact");
assert.equal(searchManualLessons("login page")[0]?.id, "mt-login");
assert.equal(searchManualLessons("white box")[0]?.id, "mt-black-white");
assert.equal(searchManualLessons("defect report")[0]?.id, "mt-bug-report");
assert.equal(searchManualLessons("verification and validation")[0]?.id, "mt-vv");
assert.equal(searchManualLessons("page factory").length, 0);
assert.equal(searchManualLessons("getByRole").length, 0);
assert.equal(searchLessons("equivalence partitioning").length, 0);
assert.equal(searchSeleniumLessons("sanity testing").length, 0);
assert.equal(searchSeleniumLessons("page factory")[0]?.id, "se-page-factory");
assert.equal(searchPlaywrightLessons("getByRole")[0]?.id, "pw-locators");
assert.equal(searchPlaywrightLessons("boundary value").length, 0);

console.log(`manual checks passed (${MANUAL_CONCEPTS.length} lessons)`);
