import type { ConceptGroupId, ConceptLesson } from "./concepts";
import { PLAYWRIGHT_ADVANCED, PLAYWRIGHT_ADVANCED_GROUPS } from "./playwright-advanced";

const BASIS = "Prepared interview explanation. It is not a quotation from the saved PDF.";
const PDF = "Interview_PDF/Playwright.pdf";

export const PLAYWRIGHT_GROUPS: { id: ConceptGroupId; title: string }[] = [
  { id: "pw-fundamentals", title: "Playwright Fundamentals" },
  { id: "pw-locators", title: "Locators and Actions" },
  { id: "pw-assertions", title: "Assertions and Waiting" },
  { id: "pw-execution", title: "Test Execution and Debugging" },
  ...PLAYWRIGHT_ADVANCED_GROUPS,
];

export const PLAYWRIGHT_PATHS = [PDF];

function pdf(label: string, focus: string): ConceptLesson["sources"] {
  return [{ label, path: PDF, kind: "pdf", focus }];
}

export const PLAYWRIGHT_CONCEPTS: ConceptLesson[] = [
  {
    id: "pw-what",
    group: "pw-fundamentals",
    title: "What is Playwright and what are its main features?",
    aliases: ["what is playwright", "playwright features", "browser context", "network interception"],
    basis: BASIS,
    summary:
      "Playwright is an open-source library for end-to-end browser testing. One API drives Chromium, Firefox, and WebKit. It can run headless or headed, run tests in parallel, and intercept network traffic.",
    simple:
      "I use Playwright when I need a real browser to click through a web app. The same test code can target more than one browser engine.",
    points: [
      "The saved note calls it an open-source automation library for end-to-end testing.",
      "One API covers Chromium, Firefox, and WebKit.",
      "The saved note names cross-browser testing, parallel testing, network interception, and headless and headful modes.",
      "A test receives a page. That page belongs to one browser context.",
      "I do not treat page.context() as the way to create a second user.",
    ],
    how: "The saved note says a new context is created with page.context(). That call returns the context the page already belongs to. A separate isolated session is browser.newContext(). Close that context when the second user is finished. The note also says network interception can modify requests and responses. The current call is page.route().",
    example: {
      code: `test('second user sees a fresh session', async ({ browser }) => {
  const context = await browser.newContext();
  const page = await context.newPage();
  await page.goto('https://example.com');
  await context.close();
});`,
      output:
        "This is a short snippet, not a full file. It opens an isolated context and closes it. It was not executed here.",
    },
    questions: [
      {
        prompt: "How do you handle browser contexts in Playwright?",
        short: "A context is an isolated browser session, with its own cookies and storage. page.context() returns the current one. browser.newContext() creates another one.",
        detail: "The saved note says to create a context with page.context(). That does not create a new context. Use browser.newContext() when two users must not share cookies.",
      },
      {
        prompt: "What is the purpose of network interception in Playwright?",
        short: "page.route() can mock, change, or block a request before the app receives the real response.",
        detail: "The saved note says this helps API checks, mocked responses, and network debugging. route.fulfill() returns a fake response. route.continue() sends the real request. route.abort() stops it.",
      },
    ],
    sources: pdf("Playwright.pdf, page 1", "main features"),
    related: ["pw-vs-selenium", "pw-headless", "pw-dynamic"],
  },
  {
    id: "pw-vs-selenium",
    group: "pw-fundamentals",
    title: "What is the difference between Selenium and Playwright?",
    aliases: ["selenium vs playwright", "selenium and playwright", "difference between selenium and playwright"],
    basis: BASIS,
    summary:
      "Selenium is the older, multi-language web driver with a very large community. Playwright is newer, starts with less setup, runs tests in parallel by default, and has built-in network interception and auto-waiting.",
    simple:
      "I pick the tool that matches the language and the team. Selenium is a strong Java choice. Playwright is a strong JavaScript choice when I want waiting and tracing built in.",
    points: [
      "The saved note says Selenium is mature, supports multiple languages, and has a large community.",
      "The same note says Playwright is newer, with easier setup, built-in parallel execution, and network interception.",
      "Selenium talks to a browser through a driver. Playwright talks to the browser over its own protocol.",
      "Playwright waits for an element to be ready before click and fill. Selenium needs an explicit wait for the same pause.",
      "This comparison is about the tools. It is not a claim about one project’s pass rate.",
    ],
    compare: {
      title: "Selenium and Playwright",
      leftLabel: "Selenium",
      left: "Mature web driver. Java, Python, C#, JavaScript, and Ruby are common. Waits and reports are usually added by the framework.",
      rightLabel: "Playwright",
      right: "Newer browser automation library. JavaScript is the focus of these lessons. Auto-waiting, parallel workers, tracing, and network routing are built in.",
    },
    sources: pdf("Playwright.pdf, page 1", "Difference between Selenium"),
    related: ["pw-what", "pw-autowait", "pw-parallel"],
  },
  {
    id: "pw-install",
    group: "pw-fundamentals",
    title: "How do you install Playwright in a JavaScript project?",
    aliases: ["install playwright", "npm install playwright", "npm init playwright"],
    basis: BASIS,
    summary:
      "For a new project I run npm init playwright@latest. That installs @playwright/test, the browsers, and a starter config. The saved note only shows npm install @playwright/test, which installs the package and still needs the browsers.",
    simple:
      "The package is the test runner. The browsers are a separate download. A test cannot open Chromium until both are present.",
    points: [
      "The saved command is npm install @playwright/test.",
      "That command does not download Chromium, Firefox, or WebKit.",
      "npx playwright install downloads the browsers.",
      "npm init playwright@latest is the current starter. Choose JavaScript when it asks.",
      "These lessons stay in JavaScript. TypeScript can wait.",
    ],
    how: "I keep the saved install topic, and I do not leave the browsers out. After the package install, npx playwright install is the missing step. The init command does both and adds playwright.config.js plus an example test.",
    example: {
      code: `npm init playwright@latest
npm install -D @playwright/test
npx playwright install`,
      output:
        "These are shell commands, not a test. The first command is the starter. The next two lines are the manual package install from the saved note, plus the browser download the note does not show. They were not run here.",
    },
    sources: pdf("Playwright.pdf, page 1", "npm install"),
    related: ["pw-basic-test", "pw-what", "pw-headless"],
  },
  {
    id: "pw-headless",
    group: "pw-fundamentals",
    title: "What is the difference between headless and headed mode?",
    aliases: ["headless", "headed", "headful", "ui mode"],
    basis: BASIS,
    summary:
      "Headless runs the browser without a window. That is the default and the usual CI mode. Headed mode shows the window so I can watch the test. The saved note calls the visible mode headful. The current flag is --headed.",
    simple:
      "I run headless when I only need the result. I run headed when I need to see where the click landed.",
    points: [
      "Headless has no user interface. It suits a pipeline.",
      "The saved note says headful mode shows the interface.",
      "The command I use is npx playwright test --headed.",
      "There is no --headful flag in the current CLI.",
      "UI Mode is a separate window for watching and picking tests. It is npx playwright test --ui.",
    ],
    how: "Headed mode and UI Mode are different. Headed mode shows the browser under test. UI Mode shows Playwright’s test runner, and I can run one test from that window.",
    example: {
      code: `npx playwright test
npx playwright test --headed
npx playwright test --ui`,
      output:
        "The first command uses the default headless browser. The second shows the browser window. The third opens UI Mode. These commands were not run here.",
    },
    questions: [
      {
        prompt: "How do you run one browser in headed mode?",
        short: "npx playwright test --project=chromium --headed runs the Chromium project with a visible window.",
        detail: "The project name comes from playwright.config.js. Headed mode does not change the assertion. It only shows the browser.",
      },
    ],
    sources: pdf("Playwright.pdf, page 1", "headless"),
    related: ["pw-install", "pw-debug", "pw-parallel"],
  },
  {
    id: "pw-async",
    group: "pw-fundamentals",
    title: "What are async and await in Playwright?",
    aliases: ["async and await", "async", "await"],
    basis: BASIS,
    summary:
      "async marks a function that returns a promise. await pauses that function until the promise settles. Playwright browser calls return promises, so a test callback is async and each page or expect action is awaited.",
    simple:
      "Without await, the next line starts before the click or the navigation has finished. The failure then looks random.",
    points: [
      "The saved note says async declares an asynchronous function that returns a promise.",
      "await is used inside that function and waits for the promise to resolve or reject.",
      "The test function itself is async ({ page }) => { ... }.",
      "await page.goto(), await locator.click(), and await expect() are the normal pattern.",
      "await does not mean a fixed sleep. The pause ends when that action finishes or times out.",
    ],
    example: {
      code: `import { test, expect } from '@playwright/test';

test('title is visible', async ({ page }) => {
  await page.goto('https://example.com');
  await expect(page).toHaveTitle(/Example Domain/);
});`,
      output:
        "This is a complete small test. goto finishes before the title assertion starts. The assertion retries until the title matches or the expect timeout ends. It was not executed here.",
    },
    sources: pdf("Playwright.pdf, page 2", "async"),
    related: ["pw-basic-test", "pw-autowait", "pw-expect"],
  },
  {
    id: "pw-locators",
    group: "pw-locators",
    title: "What are Playwright locators and how do you use them?",
    aliases: ["locators", "locator", "getByRole", "getByLabel", "selectors"],
    basis: BASIS,
    summary:
      "A locator describes how to find an element, and it is re-checked at action time. I prefer getByRole, getByLabel, getByPlaceholder, and getByText. The saved note also shows CSS, XPath, and the older text= selector.",
    simple:
      "I locate a control the way a user sees it: the button name, the field label, or the placeholder. I use CSS or XPath when the page has no accessible name.",
    points: [
      "page.getByRole('button', { name: 'Sign in' }) uses the accessible name.",
      "page.getByLabel('Email') uses the label text.",
      "page.getByPlaceholder('Search') uses the placeholder.",
      "page.getByText('Example Domain') replaces the saved text= selector for visible text.",
      "page.locator('css=...') and page.locator('xpath=...') still work for hard cases.",
      "A locator does not click by itself. click(), fill(), or expect() uses it.",
    ],
    how: "The saved example is page.locator('text=Example Domain'). That text engine still runs. The current user-facing form is page.getByText('Example Domain'). I keep the topic and recommend the newer locator.",
    example: {
      code: `const email = page.getByLabel('Email');
const search = page.getByPlaceholder('Search');
const submit = page.getByRole('button', { name: 'Sign in' });
await email.fill('qa@example.com');
await submit.click();`,
      output:
        "This is a snippet, not a full test. fill types into the labeled field, and click presses the named button. It was not executed here.",
    },
    sources: pdf("Playwright.pdf, page 2", "selectors"),
    related: ["pw-actions", "pw-dynamic", "pw-expect"],
  },
  {
    id: "pw-actions",
    group: "pw-locators",
    title: "How do you interact with input fields, buttons, and links?",
    aliases: ["fill", "click", "saucedemo", "sauce demo", "input fields"],
    basis: BASIS,
    summary:
      "fill() replaces the text in an input. click() presses a button or a link. I await each action, then assert the page that should appear. A login on the public SauceDemo site is a small functional example of that flow.",
    simple:
      "I find the field, type, click the button, and check the next page. I do not sleep between those steps.",
    points: [
      "fill() clears the field first. type() sends keys and does not clear it.",
      "click() waits until the target can receive the click.",
      "A link is getByRole('link', { name: 'Docs' }), then click().",
      "press('Enter') submits a field when the product uses the keyboard.",
      "The SauceDemo example below is a prepared illustration. The saved Playwright.pdf does not contain those steps.",
    ],
    how: "SauceDemo is a public practice site. standard_user and secret_sauce are the credentials printed on its login page. I use them only as the sample login. I do not treat this snippet as a test I have already run.",
    example: {
      code: `import { test, expect } from '@playwright/test';

test('SauceDemo login reaches the inventory', async ({ page }) => {
  await page.goto('https://www.saucedemo.com/');
  await page.getByPlaceholder('Username').fill('standard_user');
  await page.getByPlaceholder('Password').fill('secret_sauce');
  await page.getByRole('button', { name: 'Login' }).click();
  await expect(page).toHaveURL(/inventory/);
  await expect(page.getByText('Products')).toBeVisible();
});`,
      output:
        "This is a complete test file shape. A successful login leaves the inventory URL and shows Products. It was not executed here, and it is not copied from the saved PDF.",
    },
    sources: [],
    related: ["pw-locators", "pw-dropdowns", "pw-basic-test"],
  },
  {
    id: "pw-dropdowns",
    group: "pw-locators",
    title: "How do you select values from dropdowns and handle checkboxes?",
    aliases: ["dropdown", "selectOption", "checkbox", "checkboxes"],
    basis: BASIS,
    summary:
      "A native dropdown uses selectOption() with the label or the value. A checkbox uses check() or uncheck(), then toBeChecked(). I do not click a checkbox when I need it to end in a known state.",
    simple:
      "check() turns the box on even if it was already on. click() flips it, so the result depends on the old state.",
    points: [
      "selectOption('India') matches the visible label.",
      "selectOption({ value: 'IN' }) matches the option value.",
      "selectOption({ index: 1 }) is brittle because the order can change.",
      "getByRole('checkbox', { name: 'Remember me' }).check() sets it on.",
      "uncheck() sets it off.",
      "A custom dropdown built from divs is not a select. I click the trigger, then click the option.",
    ],
    example: {
      code: `await page.getByLabel('Country').selectOption('India');
const remember = page.getByRole('checkbox', { name: 'Remember me' });
await remember.check();
await expect(remember).toBeChecked();`,
      output:
        "This is a snippet. The country select changes, and the checkbox assertion passes only when the box is checked. It was not executed here.",
    },
    sources: [],
    related: ["pw-locators", "pw-actions", "pw-expect"],
  },
  {
    id: "pw-dynamic",
    group: "pw-locators",
    title: "How do you handle multiple elements and dynamic elements?",
    aliases: ["multiple elements", "dynamic elements", "locator.all", "nth"],
    basis: BASIS,
    summary:
      "One locator can match many elements. I assert the count, filter by text, or act on one row. For a list that loads late, I assert the visible result instead of guessing an index.",
    simple:
      "filter({ hasText: 'Pending' }) stays readable when the row order changes. nth(2) breaks when a new row appears above it.",
    points: [
      "getByRole('row') matches every row. toHaveCount() checks how many exist.",
      "filter({ hasText }) narrows that set.",
      "locator.nth(0) is zero-based and should be a last choice.",
      "A dynamic id is a poor locator. The role and the visible name usually stay stable.",
      "Auto-waiting still applies. I do not add a sleep because the list arrives slowly.",
    ],
    example: {
      code: `const rows = page.getByRole('row');
await expect(rows).toHaveCount(4);
const pending = page.getByRole('listitem').filter({ hasText: 'Pending' });
await pending.getByRole('button', { name: 'Open' }).click();`,
      output:
        "This is a snippet. The count assertion waits until four rows exist. The click targets the Open button inside the Pending item. It was not executed here.",
    },
    sources: [],
    related: ["pw-locators", "pw-autowait", "pw-timeouts"],
  },
  {
    id: "pw-expect",
    group: "pw-assertions",
    title: "How do you write assertions using Playwright's expect()?",
    aliases: ["expect", "toBeVisible", "toHaveText", "web first assertion"],
    basis: BASIS,
    summary:
      "expect() from @playwright/test is a web-first assertion. await expect(locator).toBeVisible() retries until the condition is true or the expect timeout ends. A plain toBe() on a fetched string checks once and does not retry.",
    simple:
      "I assert what the user should see. I let expect poll the page instead of reading the text once and comparing it myself.",
    points: [
      "Import expect from @playwright/test. The saved basic test uses expect without importing it.",
      "toBeVisible(), toBeHidden(), toHaveText(), and toContainText() check an element.",
      "toHaveValue() checks an input. toBeChecked() checks a checkbox.",
      "toHaveURL() and toHaveTitle() check the page.",
      "toHaveCount() checks how many matches a locator has.",
      "expect(await locator.textContent()).toBe('Saved') does not retry.",
    ],
    how: "The saved basic test writes expect(page.title()).toBe('Example Domain'). page.title() is a promise, and toBe does not wait for the title to change. The current assertion is await expect(page).toHaveTitle('Example Domain').",
    example: {
      code: `await expect(page).toHaveTitle('Example Domain');
await expect(page).toHaveURL(/inventory/);
await expect(page.getByRole('alert')).toHaveText('Saved');
await expect(page.getByRole('button', { name: 'Pay' })).toBeEnabled();`,
      output:
        "This is a snippet of web-first assertions. Each one retries until it passes or the expect timeout fails the test. It was not executed here.",
    },
    questions: [
      {
        prompt: "Which assertions come up most often in a UI test?",
        short: "I use toBeVisible, toHaveText, toHaveURL, toHaveTitle, toBeChecked, and toHaveCount.",
        detail: "The saved PDF does not list these names. They are the current expect matchers I would use for a page, a message, a checkbox, and a list.",
      },
    ],
    sources: pdf("Playwright.pdf, page 2", "basic test"),
    related: ["pw-autowait", "pw-async", "pw-basic-test"],
  },
  {
    id: "pw-autowait",
    group: "pw-assertions",
    title: "How does auto-waiting work in Playwright?",
    aliases: ["auto waiting", "auto-waiting", "actionability"],
    basis: BASIS,
    summary:
      "Before click, fill, or check, Playwright waits until the target is attached, visible, stable, enabled, and able to receive events. Assertions wait until the expected state appears. A fixed sleep is not the default wait.",
    simple:
      "I write the action I want. Playwright pauses only until that control is ready, or until the timeout says it will not become ready.",
    points: [
      "click() will not press a button that is hidden or covered.",
      "fill() waits for the input to be editable.",
      "expect() keeps checking until the timeout.",
      "goto() waits for the load state.",
      "page.waitForTimeout(3000) is a hard sleep. I do not use it as the normal wait.",
      "If an action times out, I fix the locator or the app state. I do not add a longer sleep first.",
    ],
    sources: [],
    related: ["pw-timeouts", "pw-expect", "pw-async"],
  },
  {
    id: "pw-timeouts",
    group: "pw-assertions",
    title: "How do you handle timeouts and flaky tests?",
    aliases: ["timeout", "timeouts", "flaky", "flaky tests", "waitForTimeout"],
    basis: BASIS,
    summary:
      "A timeout is the limit on a test, an action, or an assertion. I raise it only when the product is honestly slow. A flaky test usually has a bad locator or a race. A retry reruns it. A retry is not the fix.",
    simple:
      "I read the timeout error first. It names the line that waited too long. Then I check whether the locator matched the right element.",
    points: [
      "The default test timeout is 30 seconds. timeout in the config changes it.",
      "The default expect timeout is 5 seconds. expect.timeout in the config changes it.",
      "actionTimeout and navigationTimeout limit clicks and page loads.",
      "test.setTimeout(60000) changes one slow test.",
      "locator.waitFor() waits for a state such as visible. It is not a sleep.",
      "The saved note’s page.waitFor('selector:example') is not a current Playwright method.",
    ],
    how: "I keep the timeout topic from the saved note and replace the example. page.waitFor with a selector string is not the API. page.waitForTimeout is a sleep. The action already auto-waits. If I must wait for a condition, I use a web-first assertion or locator.waitFor().",
    example: {
      code: `import { defineConfig } from '@playwright/test';

export default defineConfig({
  timeout: 30000,
  expect: { timeout: 5000 },
  use: { actionTimeout: 10000 },
});`,
      output:
        "This is a config snippet, not a test. Actions fail after 10 seconds. Assertions fail after 5 seconds. The whole test fails after 30 seconds. It was not executed here.",
    },
    questions: [
      {
        prompt: "What do you do when a test passes alone and fails in the suite?",
        short: "I look for shared data, a leftover login, or a locator that matches more than one element.",
        detail: "A retry may pass the second time and hide that race. I use the trace from the failed attempt before I increase the timeout.",
      },
    ],
    sources: pdf("Playwright.pdf, page 2", "timeouts"),
    related: ["pw-autowait", "pw-parallel", "pw-debug"],
  },
  {
    id: "pw-basic-test",
    group: "pw-execution",
    title: "How do you write and run a basic Playwright test?",
    aliases: ["basic test", "npx playwright test", "example.com"],
    basis: BASIS,
    summary:
      "A test file imports test and expect, opens a page, and asserts one result. I run it with npx playwright test. The saved example uses require, calls expect without importing it, and leaves the test unclosed.",
    simple:
      "One file, one test, one page, one assertion. Then I run that file before I add more cases.",
    points: [
      "npx playwright test runs the suite.",
      "npx playwright test tests/example.spec.js runs one file.",
      "npx playwright test --grep login runs tests whose title matches.",
      "npx playwright test --project=chromium runs one browser project.",
      "The SauceDemo login in the actions lesson is a fuller functional example of the same shape.",
    ],
    how: "The saved test expects the title with toBe and does not await a web-first matcher. I close the braces and use toHaveTitle. The saved file also omits the expect import.",
    example: {
      code: `import { test, expect } from '@playwright/test';

test('basic test', async ({ page }) => {
  await page.goto('https://example.com');
  await expect(page).toHaveTitle('Example Domain');
});`,
      output:
        "This is a complete test. npx playwright test runs it headless. The title assertion replaces expect(page.title()).toBe from the saved note. It was not executed here.",
    },
    questions: [
      {
        prompt: "How do you run the test on one browser?",
        short: "npx playwright test --project=firefox runs the Firefox project defined in the config.",
        detail: "The default starter defines chromium, firefox, and webkit projects. The flag selects one. It does not install that browser if npx playwright install was skipped.",
      },
    ],
    sources: pdf("Playwright.pdf, page 2", "basic test"),
    related: ["pw-install", "pw-actions", "pw-expect"],
  },
  {
    id: "pw-parallel",
    group: "pw-execution",
    title: "How do you run tests in parallel and configure retries?",
    aliases: ["workers", "retries", "parallel", "playwright.config"],
    basis: BASIS,
    summary:
      "Playwright runs test files in parallel with workers. npx playwright test --workers=4 uses four workers. retries in the config reruns a failed test. The saved command npm playwright test --workers 4 is not the CLI I use.",
    simple:
      "Workers are separate processes. Each should use its own data, because they share the application but not the page.",
    points: [
      "The saved note says --workers runs tests in parallel.",
      "The current command is npx playwright test --workers=4.",
      "fullyParallel: true also allows tests inside one file to run together.",
      "retries: 2 reruns a failure up to two more times.",
      "A retry belongs in CI when the environment is noisy. It is not a substitute for a stable locator.",
      "workers on a small CI machine are often lower than on a laptop.",
    ],
    how: "npm playwright test only works if package.json defines that script. The direct command is npx playwright test. The saved note’s four workers are a local override, not a required config value.",
    example: {
      code: `import { defineConfig } from '@playwright/test';

export default defineConfig({
  fullyParallel: true,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  use: { trace: 'on-first-retry' },
});`,
      output:
        "This is a config snippet. Locally, retries are off and Playwright chooses the worker count. In CI, a failed test can retry twice and record a trace on the first retry. It was not executed here.",
    },
    sources: pdf("Playwright.pdf, page 2", "workers"),
    related: ["pw-timeouts", "pw-debug", "pw-basic-test"],
  },
  {
    id: "pw-debug",
    group: "pw-execution",
    title: "How do you debug failed tests using screenshots, Codegen, Trace Viewer, and HTML reports?",
    aliases: ["screenshot", "codegen", "trace viewer", "html report", "show-trace"],
    basis: BASIS,
    summary:
      "A failure should leave evidence. I use a screenshot, the HTML report, and a trace. Codegen helps me draft locators. Trace Viewer shows the actions, console, and network from the failed run.",
    simple:
      "I open the report first. If the picture is not enough, I open the trace and watch the step that timed out.",
    points: [
      "page.screenshot({ path: 'example.png' }) saves one picture. The saved note shows that call.",
      "screenshot: 'only-on-failure' in the config saves a picture when a test fails.",
      "npx playwright codegen https://example.com records a draft test.",
      "trace: 'on-first-retry' records a trace when a retry starts.",
      "npx playwright show-report opens the HTML report.",
      "npx playwright show-trace path/to/trace.zip opens Trace Viewer.",
    ],
    how: "The saved screenshot test uses require and does not close the test. I keep page.screenshot and write a complete test. Codegen, Trace Viewer, and the HTML report are not in the saved two-page PDF. The trace settings I would actually use are off, on, retain-on-failure, and on-first-retry.",
    example: {
      code: `import { test } from '@playwright/test';

test('take screenshot', async ({ page }) => {
  await page.goto('https://example.com');
  await page.screenshot({ path: 'example.png', fullPage: true });
});`,
      output:
        "This is a complete test. It saves example.png after the page opens. fullPage captures the full scroll height. It was not executed here.",
    },
    questions: [
      {
        prompt: "Which Codegen options are useful while learning?",
        short: "npx playwright codegen https://example.com opens the recorder. --browser firefox changes the browser. The generated JavaScript is a draft, not the final locator style.",
        detail: "I replace a brittle generated CSS locator with getByRole or getByLabel when the page has an accessible name.",
      },
      {
        prompt: "How do you record a trace?",
        short: "Set trace to on-first-retry or retain-on-failure in the config, or run npx playwright test --trace on.",
        detail: "on records every test and is heavy. on-first-retry records only when a test has already failed once. The zip file opens in Trace Viewer.",
      },
    ],
    sources: pdf("Playwright.pdf, page 2", "screenshot"),
    related: ["pw-headless", "pw-parallel", "pw-timeouts"],
  },
  ...PLAYWRIGHT_ADVANCED,
];

function plain(value: string): string {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, " ").trim();
}

export function playwrightById(id: string): ConceptLesson | undefined {
  return PLAYWRIGHT_CONCEPTS.find((lesson) => lesson.id === id);
}

export function playwrightInGroup(group: ConceptGroupId): ConceptLesson[] {
  return PLAYWRIGHT_CONCEPTS.filter((lesson) => lesson.group === group);
}

export function searchPlaywrightLessons(query: string): { id: string; title: string; group: ConceptGroupId; score: number }[] {
  const asked = plain(query);
  if (asked.length < 2) return [];
  return PLAYWRIGHT_CONCEPTS.map((lesson) => {
    const names = [lesson.title, ...lesson.aliases].map(plain).filter(Boolean);
    let score = 0;
    if (names.some((name) => name === asked)) score = 200;
    else if (names.some((name) => asked.includes(name))) score = 160;
    else {
      const tokens = asked.split(" ").filter((token) => token.length > 2);
      const blob = names.join(" ");
      const matched = tokens.filter((token) => blob.includes(token));
      if (tokens.length > 0 && matched.length === tokens.length) score = 70 + matched.length;
    }
    return { id: lesson.id, title: lesson.title, group: lesson.group, score };
  })
    .filter((item) => item.score >= 70)
    .sort((a, b) => b.score - a.score || a.title.localeCompare(b.title));
}
