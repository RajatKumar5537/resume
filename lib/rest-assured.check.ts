import assert from "node:assert/strict";
import { searchLessons } from "./concepts";
import { searchManualLessons } from "./manual-lessons";
import { searchMongoLessons } from "./mongo-lessons";
import { searchPlaywrightLessons } from "./playwright-lessons";
import { REST_CONCEPTS, REST_GROUPS, REST_PATHS, searchRestLessons } from "./rest-assured-lessons";
import { searchSeleniumLessons } from "./selenium-lessons";

const allowed = new Set(REST_PATHS);
const ids = new Set<string>();

for (const lesson of REST_CONCEPTS) {
  assert.equal(ids.has(lesson.id), false, lesson.id);
  ids.add(lesson.id);
  assert.ok(lesson.summary.length > 20, lesson.id);
  assert.ok(lesson.simple && lesson.simple.length > 20, lesson.id);
  assert.ok(lesson.points.length > 0, lesson.id);
  assert.ok(REST_GROUPS.some((group) => group.id === lesson.group), lesson.id);
  for (const related of lesson.related) {
    assert.ok(REST_CONCEPTS.some((item) => item.id === related), `${lesson.id} -> ${related}`);
  }
  for (const source of lesson.sources) {
    assert.ok(allowed.has(source.path), `${lesson.id} ${source.path}`);
    assert.match(source.label, /(R- Rest_Assured|Explain RestAssured)\.pdf, page \d+/, lesson.id);
    assert.ok(source.focus && source.focus.length > 2, lesson.id);
  }
  if (lesson.example) {
    assert.ok(lesson.example.code.length > 20, lesson.id);
    assert.ok(/not executed|not called|not run|not sent/i.test(lesson.example.output), lesson.id);
  }
}

for (const group of REST_GROUPS) {
  assert.ok(REST_CONCEPTS.some((lesson) => lesson.group === group.id), group.id);
}

assert.ok(REST_CONCEPTS.length >= 30 && REST_CONCEPTS.length <= 35);
assert.equal(searchRestLessons("what is rest assured")[0]?.id, "ra-what");
assert.equal(searchRestLessons("restful api")[0]?.id, "ra-rest");
assert.equal(searchRestLessons("given when then")[0]?.id, "ra-gwt");
assert.equal(searchRestLessons("queryparam")[0]?.id, "ra-params");
assert.equal(searchRestLessons("hamcrest")[0]?.id, "ra-hamcrest");
assert.equal(searchRestLessons("json schema")[0]?.id, "ra-schema");
assert.equal(searchRestLessons("bearer token")[0]?.id, "ra-auth");
assert.equal(searchRestLessons("request specification")[0]?.id, "ra-spec");
assert.equal(searchRestLessons("jsonpath")[0]?.id, "ra-extract");
assert.equal(searchRestLessons("negative api testing")[0]?.id, "ra-negative");
assert.equal(searchRestLessons("page factory").length, 0);
assert.equal(searchRestLessons("bson").length, 0);
assert.equal(searchRestLessons("smoke testing").length, 0);
assert.equal(searchLessons("jsonpath").length, 0);
assert.equal(searchMongoLessons("jsonpath").length, 0);
assert.equal(searchPlaywrightLessons("hamcrest").length, 0);
assert.equal(searchManualLessons("bearer token").length, 0);
assert.equal(searchSeleniumLessons("page factory")[0]?.id, "se-page-factory");

const code = REST_CONCEPTS.map((lesson) => lesson.example?.code || "").join("\n");
assert.ok(code.includes('.get("https://api.example.com/users/1")'));
assert.ok(code.includes('requestBody.put("name", "Rajat")'));
assert.ok(code.includes('.body("data.email", equalTo("amit@example.com"))'));
assert.ok(code.includes(".relaxedHTTPSValidation()"));
assert.equal(code.includes("Stirng"), false);
assert.equal(code.toLowerCase().includes("sk_live"), false);

console.log(`rest assured checks passed (${REST_CONCEPTS.length} lessons)`);
