import assert from "node:assert/strict";
import { PLAYWRIGHT_ADVANCED_GROUPS } from "./playwright-advanced";
import { PLAYWRIGHT_CONCEPTS, searchPlaywrightLessons } from "./playwright-lessons";

const questions = [
  "What is Playwright, and how does it differ from Selenium?",
  "What is the difference between locator(), getByRole(), and getByText()?",
  "What is the difference between locator() and page.$()?",
  "How does Playwright's auto-waiting work?",
  "What is the difference between auto-waiting and an explicit wait?",
  "What is the difference between toBeVisible() and isVisible()?",
  "Why should you prefer web-first assertions?",
  "What is the difference between a browser, browser context, and page?",
  "How do you handle multiple tabs or windows?",
  "How do you handle iframes?",
  "How do you handle JavaScript alerts, confirmations, and prompts?",
  "How do you upload and download files?",
  "How do you handle dynamic elements?",
  "How do you use async/await, and what happens if you forget await?",
  "How do you select an element when multiple elements match the same locator?",
  "How would you design a Playwright framework from scratch?",
  "How do you implement Page Object Model in Playwright?",
  "What are fixtures, and why are they useful?",
  "What is the difference between a built-in fixture and a custom fixture?",
  "How do you share reusable setup without duplicating code?",
  "How do you manage test configuration across environments?",
  "How do you handle test data creation and cleanup?",
  "How do you prevent tests from depending on each other?",
  "What is the difference between beforeEach, beforeAll, and fixtures?",
  "When would you use POM, and when would a simple helper function be enough?",
  "How would you structure a framework for multiple applications or modules?",
  "How do you manage secrets and environment variables?",
  "How do you implement reusable authentication?",
  "How do you design a custom fixture for a logged-in user?",
  "How do you review a Playwright automation pull request?",
  "What makes a Playwright test flaky?",
  "A test passes locally but fails in Jenkins. How would you investigate?",
  "Why should you avoid fixed waitForTimeout() calls?",
  "How do you debug a timeout error?",
  "How do you use Trace Viewer?",
  "What is the purpose of screenshots and video recordings?",
  "How do you configure retries?",
  "Should retries be used to fix flaky tests? Why or why not?",
  "How do you debug a strict-mode violation?",
  "How do you handle a test that intermittently fails because an element disappears?",
  "How do you investigate a race condition between a UI action and an API response?",
  "How do you identify whether a failure comes from the application, test script, environment, or test data?",
  "How do you send API requests using Playwright's APIRequestContext?",
  "How do you validate status codes and response bodies?",
  "How do you mock an API response using page.route()?",
  "What is the difference between mocking a response and intercepting a request?",
  "How do you wait for an API response triggered by a button click?",
  "How do you reuse authentication state?",
  "How do you test an error response without depending on a real backend failure?",
  "How do you validate UI data against an API response?",
  "How would you validate API data against MongoDB?",
  "How do you test a UI flow that triggers asynchronous backend processing?",
  "How do you verify that a network request was sent with the expected payload?",
  "How do you prevent sensitive tokens and user data from appearing in test logs?",
  "How do you run Playwright tests in parallel?",
  "What is the difference between workers and sharding?",
  "How do you configure Chromium, Firefox, and WebKit projects?",
  "How do you run only smoke tests or regression tests?",
  "How do you run tests in Jenkins or Azure Pipelines?",
  "How do you publish an HTML report and preserve test artifacts?",
  "How do you manage browser installation in CI?",
  "How do you reduce execution time without reducing test coverage unnecessarily?",
  "How do you handle environment-specific failures?",
  "How would you scale a suite containing thousands of tests?",
  "You have 1,000 tests and only 20 minutes before release. How do you prioritize them?",
  "Your regression suite takes two hours. How would you reduce the execution time?",
  "A critical test fails in CI, but rerunning it passes. What do you do?",
  "A developer says your automation test is wrong. How do you investigate?",
  "How do you decide which test cases should be automated?",
  "How do you balance UI automation, API automation, and lower-level tests?",
  "How do you prevent automation from becoming difficult to maintain?",
  "How would you migrate an existing Selenium framework to Playwright?",
  "How do you measure automation effectiveness beyond the number of tests?",
  "How do you decide whether a release is safe when some tests are failing?",
  "How do you mentor a team member who writes brittle automation?",
  "How do you introduce coding standards and framework conventions across a QA team?",
];

const exercises = [
  "Exercise: Login automation",
  "Exercise: Data validation",
  "Exercise: Debug a flaky test",
  "Exercise: Design a CI-ready framework",
];

assert.equal(questions.length, 76);
assert.equal(exercises.length, 4);
assert.equal(PLAYWRIGHT_ADVANCED_GROUPS.length, 7);

for (const title of [...questions, ...exercises]) {
  const lesson = PLAYWRIGHT_CONCEPTS.find((item) => item.title === title);
  assert.ok(lesson, title);
  assert.ok(lesson.summary.length > 40, title);
  assert.ok(lesson.simple && lesson.simple.length > 20, title);
  assert.ok(lesson.points.length >= 3, title);
}

for (const title of exercises) {
  const lesson = PLAYWRIGHT_CONCEPTS.find((item) => item.title === title);
  assert.ok(lesson?.example && lesson.example.code.length > 40, title);
  assert.match(lesson.example.output, /not executed/i);
}

assert.equal(searchPlaywrightLessons("what is playwright")[0]?.id, "pw-what");
assert.equal(searchPlaywrightLessons("workers")[0]?.id, "pw-parallel");
assert.equal(searchPlaywrightLessons("trace viewer")[0]?.id, "pw-debug");
assert.equal(searchPlaywrightLessons("flaky")[0]?.id, "pw-timeouts");
assert.equal(searchPlaywrightLessons("workers versus sharding")[0]?.id, "pw-e-shard");
assert.equal(searchPlaywrightLessons("exercise login success and failure")[0]?.id, "pw-x-login");

console.log("playwright advanced checks passed");
