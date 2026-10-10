import assert from "node:assert/strict";
import { searchLessons } from "./concepts";
import { searchManualLessons } from "./manual-lessons";
import { MONGO_CONCEPTS, MONGO_GROUPS, MONGO_PATHS, searchMongoLessons } from "./mongo-lessons";
import { searchPlaywrightLessons } from "./playwright-lessons";
import { searchSeleniumLessons } from "./selenium-lessons";

const allowed = new Set(MONGO_PATHS);
const ids = new Set<string>();

for (const lesson of MONGO_CONCEPTS) {
  assert.equal(ids.has(lesson.id), false, lesson.id);
  ids.add(lesson.id);
  assert.ok(lesson.summary.length > 20, lesson.id);
  assert.ok(lesson.simple && lesson.simple.length > 20, lesson.id);
  assert.ok(lesson.points.length > 0, lesson.id);
  assert.ok(MONGO_GROUPS.some((group) => group.id === lesson.group), lesson.id);
  for (const related of lesson.related) assert.ok(ids.has(related) || MONGO_CONCEPTS.some((item) => item.id === related), `${lesson.id} -> ${related}`);
  for (const source of lesson.sources) {
    assert.ok(allowed.has(source.path), `${lesson.id} ${source.path}`);
    assert.match(source.label, /S- SQL\.pdf, page \d+/, lesson.id);
  }
  if (lesson.example) {
    assert.ok(lesson.example.output.length > 0, lesson.id);
    assert.ok(/not executed|not run|not inserted/i.test(lesson.example.output), lesson.id);
  }
}

for (const group of MONGO_GROUPS) {
  assert.ok(MONGO_CONCEPTS.some((lesson) => lesson.group === group.id), group.id);
}

assert.ok(MONGO_CONCEPTS.length >= 25 && MONGO_CONCEPTS.length <= 35);
assert.equal(searchMongoLessons("what is mongodb")[0]?.id, "mg-what");
assert.equal(searchMongoLessons("sql and mongodb")[0]?.id, "mg-vs-sql");
assert.equal(searchMongoLessons("bson")[0]?.id, "mg-bson");
assert.equal(searchMongoLessons("objectid")[0]?.id, "mg-id");
assert.equal(searchMongoLessons("findOne")[0]?.id, "mg-find");
assert.equal(searchMongoLessons("greater than")[0]?.id, "mg-compare");
assert.equal(searchMongoLessons("regex")[0]?.id, "mg-regex");
assert.equal(searchMongoLessons("upsert")[0]?.id, "mg-upsert");
assert.equal(searchMongoLessons("projection")[0]?.id, "mg-project");
assert.equal(searchMongoLessons("aggregation pipeline")[0]?.id, "mg-pipeline");
assert.equal(searchMongoLessons("lookup")[0]?.id, "mg-lookup");
assert.equal(searchMongoLessons("duplicate email")[0]?.id, "mg-duplicates");
assert.equal(searchMongoLessons("deleteMany")[0]?.id, "mg-delete");
assert.equal(searchMongoLessons("page factory").length, 0);
assert.equal(searchMongoLessons("getByRole").length, 0);
assert.equal(searchMongoLessons("smoke testing").length, 0);
assert.equal(searchLessons("bson").length, 0);
assert.equal(searchSeleniumLessons("page factory")[0]?.id, "se-page-factory");
assert.equal(searchPlaywrightLessons("getByRole")[0]?.id, "pw-locators");
assert.equal(searchManualLessons("smoke testing")[0]?.id, "mt-smoke");

const queries = MONGO_CONCEPTS.flatMap((lesson) => (lesson.example ? [lesson.example.code] : []));
assert.ok(queries.some((code) => code.includes("db.users.find({})")));
assert.ok(queries.some((code) => code.includes('email: "amit@example.com"')));
assert.ok(queries.some((code) => code.includes("$gt: 25")));
assert.ok(queries.some((code) => code.includes('skills: "Selenium"')));
assert.ok(queries.some((code) => code.includes('totalUsers: { $sum: 1 }')));

console.log(`mongo checks passed (${MONGO_CONCEPTS.length} lessons)`);
