import type { ConceptGroupId, ConceptLesson } from "./concepts";
import { PLAYWRIGHT_ADVANCED_MORE } from "./playwright-advanced-more";

const BASIS = "Prepared senior interview explanation. It is not a quotation from the saved Playwright PDF.";
const NOT_RUN = "Illustrative example. It was not executed.";

export const PLAYWRIGHT_ADVANCED_GROUPS: { id: ConceptGroupId; title: string }[] = [
  { id: "pw-core", title: "Advanced: Core Playwright" },
  { id: "pw-framework", title: "Advanced: Framework Architecture" },
  { id: "pw-reliability", title: "Advanced: Debugging and Reliability" },
  { id: "pw-network", title: "Advanced: API, Network, and Backend" },
  { id: "pw-ci", title: "Advanced: CI/CD and Scalability" },
  { id: "pw-leadership", title: "Advanced: Senior SDET Scenarios" },
  { id: "pw-exercises", title: "Advanced: Practical Coding Exercises" },
];

type Seed = {
  id: string;
  group: ConceptGroupId;
  title: string;
  aliases: string[];
  summary: string;
  simple: string;
  points: string[];
  related: string[];
  example?: { code: string; output: string };
  questions?: { prompt: string; short: string; detail: string }[];
};

function lesson(seed: Seed): ConceptLesson {
  return { ...seed, basis: BASIS, sources: [] };
}

export const PLAYWRIGHT_ADVANCED: ConceptLesson[] = [
  lesson({
    id: "pw-a-what",
    group: "pw-core",
    title: "What is Playwright, and how does it differ from Selenium?",
    aliases: ["playwright versus selenium senior", "why playwright over selenium"],
    summary:
      "Playwright is a browser automation library for Chromium, Firefox, and WebKit. Compared with Selenium, I get auto-waiting, an isolated browser context per test, a built-in test runner, tracing, and network routing in the same tool. Selenium remains a solid WebDriver choice, especially where the company already has a large Java grid.",
    simple:
      "Both tools drive a real browser. Playwright waits for the element to be ready before it clicks, and each test can start from a clean browser profile. That removes a lot of the wait and session problems I used to handle by hand.",
    points: [
      "I do not say Playwright makes every test faster or that Selenium cannot be stable. The difference is the default model.",
      "A browser context is cheaper than launching a new browser for every test, and it isolates cookies.",
      "The migration cost is real: locators, waits, and the runner all change. I would not rewrite a stable suite only for the name.",
    ],
    questions: [
      {
        prompt: "Does Playwright use WebDriver?",
        short: "No. It talks to the browser over its own protocol.",
        detail: "That is why the waiting and tracing feel different. I do not mix Selenium ExpectedConditions into a Playwright test.",
      },
    ],
    related: ["pw-what", "pw-vs-selenium", "pw-a-context"],
  }),
  lesson({
    id: "pw-a-locators",
    group: "pw-core",
    title: "What is the difference between locator(), getByRole(), and getByText()?",
    aliases: ["locator versus getbyrole versus getbytext"],
    summary:
      "locator() is the general finder. I pass a CSS or XPath selector, or I use it to chain from another locator. getByRole() finds an element by its accessibility role and name, which is how a user and a screen reader see the control. getByText() finds visible text. I start with the role, then the label, and I use text or CSS when the page has no accessible name.",
    simple:
      "A button named Sign in should be found as a button, not as a CSS class that the next redesign will change. Text is useful for a message. A raw CSS locator is the fallback.",
    points: [
      "getByText matches a substring unless I pass exact: true. That can hit the wrong row.",
      "getByRole('button', { name: 'Sign in' }) is stricter and usually more stable.",
      "All three return a Locator. The action still auto-waits. The choice is about how I describe the element.",
    ],
    example: {
      code: `await page.getByRole('button', { name: 'Sign in' }).click();
await page.getByText('Order saved', { exact: true }).waitFor();
await page.locator('css=.legacy-banner').click();`,
      output: `${NOT_RUN} The role click is the one I would keep if the button has an accessible name.`,
    },
    questions: [
      {
        prompt: "When is getByLabel a better choice?",
        short: "For an input that has a visible label.",
        detail: "getByLabel('Email') survives a class rename. I use it for fields and getByRole for buttons and links.",
      },
    ],
    related: ["pw-locators", "pw-a-strict", "pw-a-dollar"],
  }),
  lesson({
    id: "pw-a-dollar",
    group: "pw-core",
    title: "What is the difference between locator() and page.$()?",
    aliases: ["page dollar versus locator", "elementhandle versus locator"],
    summary:
      "locator() describes the element and finds it again at action time, with auto-waiting. page.$() asks for an element handle immediately and returns null if it is not there yet. I use locators. Element handles go stale when the page re-renders.",
    simple:
      "A locator is a question I can ask again. page.$() is a snapshot. If the list refreshes, the snapshot can point at a node that is already gone.",
    points: [
      "page.$() and page.$$() do not retry. A missing element becomes null, not a wait.",
      "Playwright discourages element handles for normal tests.",
      "If I need a count right now, locator.count() is the current API. It also does not wait for the count to change.",
    ],
    example: {
      code: `const handle = await page.$('.row');
const row = page.locator('.row').first();
await row.click();`,
      output: `${NOT_RUN} The handle is an immediate lookup. The locator click waits until that row is actionable.`,
    },
    related: ["pw-locators", "pw-a-autowait", "pw-a-strict"],
  }),
  lesson({
    id: "pw-a-autowait",
    group: "pw-core",
    title: "How does Playwright's auto-waiting work?",
    aliases: ["how auto waiting retries an action"],
    summary:
      "Before a click, fill, or check, Playwright waits until the locator matches an element that is visible, stable, enabled, and able to receive the event. Assertions such as toBeVisible retry until they pass or the expect timeout ends. I do not add a sleep to get that behavior.",
    simple:
      "The click does not fire on the first millisecond if the button is still hidden. Playwright keeps checking during the timeout. If the button never becomes ready, the test fails with the locator and the timeout, which is the evidence I want.",
    points: [
      "Auto-waiting is per action. It does not know my business rule, such as 'wait until the order id appears'.",
      "A locator that matches two elements fails strict mode instead of clicking one at random.",
      "Navigation has its own wait. goto waits for the load state I asked for, usually load.",
    ],
    related: ["pw-autowait", "pw-a-explicit", "pw-a-visible"],
  }),
  lesson({
    id: "pw-a-explicit",
    group: "pw-core",
    title: "What is the difference between auto-waiting and an explicit wait?",
    aliases: ["explicit wait versus auto wait"],
    summary:
      "Auto-waiting is built into actions and web-first assertions. An explicit wait is a condition I name: a URL, a response, a load state, or a locator state. waitForTimeout is neither. It only burns a fixed number of milliseconds.",
    simple:
      "I let the click wait by itself. I add an explicit wait when the next step depends on a network call or a navigation that the click alone does not express.",
    points: [
      "page.waitForResponse and locator.waitFor({ state: 'visible' }) are explicit conditions.",
      "I start a response wait before the click that triggers it, or I can miss a fast response.",
      "A longer timeout is not a design. I first ask what event I am actually waiting for.",
    ],
    example: {
      code: `const responsePromise = page.waitForResponse(
  (response) => response.url().includes('/api/orders') && response.status() === 201
);
await page.getByRole('button', { name: 'Place order' }).click();
await responsePromise;`,
      output: `${NOT_RUN} The listener is registered before the click. The test then continues only after that 201, or it times out.`,
    },
    related: ["pw-a-autowait", "pw-c-sleep", "pw-d-wait-response"],
  }),
  lesson({
    id: "pw-a-visible",
    group: "pw-core",
    title: "What is the difference between toBeVisible() and isVisible()?",
    aliases: ["tobevisible versus isvisible"],
    summary:
      "await expect(locator).toBeVisible() retries until the element is visible or the assertion times out, and a timeout fails the test. await locator.isVisible() returns true or false immediately. It does not wait, and a false result does not fail the test unless I assert that boolean myself.",
    simple:
      "toBeVisible is the check I use when the element must appear. isVisible is a snapshot I might use to branch, and branching on a snapshot is usually the wrong test.",
    points: [
      "expect(await locator.isVisible()).toBe(true) checks once. It will not wait for a spinner to finish.",
      "isVisible returns false when the element is missing. It does not throw.",
      "Hidden by CSS is not the same as removed from the DOM. I match the product's real state.",
    ],
    example: {
      code: `await expect(page.getByRole('alert')).toBeVisible();
const showing = await page.getByRole('alert').isVisible();`,
      output: `${NOT_RUN} The expect retries. showing is a single true or false from that moment.`,
    },
    related: ["pw-expect", "pw-a-webfirst", "pw-a-autowait"],
  }),
  lesson({
    id: "pw-a-webfirst",
    group: "pw-core",
    title: "Why should you prefer web-first assertions?",
    aliases: ["web first assertions why"],
    summary:
      "A web-first assertion receives a locator and retries. expect(locator).toHaveText('Saved') keeps looking until the text matches. expect(await locator.textContent()).toBe('Saved') reads once and fails if the text arrives a moment later. The retrying form also reports the locator and the last value.",
    simple:
      "The page is still moving after a click. I want the assertion to watch for the final text, not to sample whatever was on screen at that instant.",
    points: [
      "toBeVisible, toHaveText, toHaveURL, and toHaveCount are web-first when I pass a locator or a page.",
      "A one-shot expect on a string is fine for a value I already extracted from a finished API response.",
      "I do not wrap a web-first assertion in a manual retry loop.",
    ],
    example: {
      code: `await expect(page.getByRole('status')).toHaveText('Saved');`,
      output: `${NOT_RUN} Playwright retries the text check until it passes or the expect timeout ends.`,
    },
    related: ["pw-expect", "pw-a-visible", "pw-a-autowait"],
  }),
  lesson({
    id: "pw-a-context",
    group: "pw-core",
    title: "What is the difference between a browser, browser context, and page?",
    aliases: ["browser versus context versus page"],
    summary:
      "The browser is the launched engine. A browser context is an isolated session inside it: its own cookies, storage, and permissions, like a fresh profile. A page is a tab in that context. The Playwright test runner gives each test its own context and page, which is why tests do not share logins unless I ask them to.",
    simple:
      "I can open two contexts in one browser and be two different users. Pages in the same context share cookies. Pages in different contexts do not.",
    points: [
      "Launching a browser is expensive. Creating a context is the normal isolation boundary.",
      "context.close() closes its pages. I close a context I created myself.",
      "browserName tells me which engine the project is using. It is not a second browser object.",
    ],
    questions: [
      {
        prompt: "Why not one shared context for the whole file?",
        short: "Because one test's cookies and storage leak into the next test.",
        detail: "beforeAll that reuses a page is a common source of order-dependent failures. I keep the default: a new context per test.",
      },
    ],
    related: ["pw-what", "pw-a-tabs", "pw-b-isolation"],
  }),
  lesson({
    id: "pw-a-tabs",
    group: "pw-core",
    title: "How do you handle multiple tabs or windows?",
    aliases: ["multiple tabs popup window"],
    summary:
      "I register page.waitForEvent('popup') or context.waitForEvent('page') before the click that opens the tab. I await that promise to get the new Page, then I assert on that page. The original page is still there.",
    simple:
      "The new tab is another page in the same context, so it shares the login. I must catch the event before I click, or a fast popup can open before I am listening.",
    points: [
      "window.open and target=_blank both surface as a popup event.",
      "I do not guess the tab from context.pages()[1] unless I have a clear reason. The event gives me the page that just opened.",
      "When I am done, I can close the popup and continue on the first page.",
    ],
    example: {
      code: `const popupPromise = page.waitForEvent('popup');
await page.getByRole('link', { name: 'Terms' }).click();
const popup = await popupPromise;
await expect(popup.getByRole('heading', { name: 'Terms' })).toBeVisible();`,
      output: `${NOT_RUN} popup is the new tab. The heading assertion runs there, not on the original page.`,
    },
    related: ["pw-a-context", "pw-a-iframe", "pw-a-dialog"],
  }),
  lesson({
    id: "pw-a-iframe",
    group: "pw-core",
    title: "How do you handle iframes?",
    aliases: ["frame locator iframe"],
    summary:
      "I use page.frameLocator() with a selector for the iframe, then I call getByRole or getByLabel on that frame locator. Locators inside it auto-wait. I do not click the iframe's inner controls on the parent page, because they are a separate document.",
    simple:
      "A payment form inside an iframe is a page inside the page. I step into the frame first, then I fill the field the way I would on any other page.",
    points: [
      "A nested iframe needs a frame locator inside a frame locator.",
      "The iframe element can load late. The inner locator's action waits for it.",
      "If the product uses a web component with a shadow root, that is not an iframe. I use the locators Playwright pierces, or a selector the app exposes.",
    ],
    example: {
      code: `const payment = page.frameLocator('#payment-frame');
await payment.getByLabel('Card number').fill('4242424242424242');`,
      output: `${NOT_RUN} The fill runs inside the frame. The card number is a test placeholder, not a real card.`,
    },
    related: ["pw-a-tabs", "pw-locators", "pw-a-dynamic"],
  }),
  lesson({
    id: "pw-a-dialog",
    group: "pw-core",
    title: "How do you handle JavaScript alerts, confirmations, and prompts?",
    aliases: ["dialog alert confirm prompt"],
    summary:
      "I listen for the dialog event before the action that opens it. dialog.accept() continues an alert or confirm. dialog.dismiss() cancels a confirm. For a prompt I pass the text to accept. If nobody handles the dialog, the action waits and then times out.",
    simple:
      "The browser dialog blocks the page. Playwright must answer it. I decide accept or dismiss from the case I am testing, and I assert the message when the text is part of the contract.",
    points: [
      "page.once runs for one dialog. page.on would catch later dialogs too, which can hide a second unexpected dialog.",
      "I register the listener first, then click.",
      "A custom HTML modal is not a JavaScript dialog. I treat that as a normal locator.",
    ],
    example: {
      code: `page.once('dialog', async (dialog) => {
  expect(dialog.type()).toBe('confirm');
  await dialog.accept();
});
await page.getByRole('button', { name: 'Delete' }).click();`,
      output: `${NOT_RUN} The confirm is accepted. A dismiss path would call dialog.dismiss() and then assert that the record remains.`,
    },
    related: ["pw-a-tabs", "pw-a-explicit", "pw-c-timeout"],
  }),
  lesson({
    id: "pw-a-files",
    group: "pw-core",
    title: "How do you upload and download files?",
    aliases: ["setinputfiles download event"],
    summary:
      "I upload with locator.setInputFiles(path). That sets the file input directly, so I do not drive the operating-system dialog. I download by waiting for the download event before the click, then I read the suggested filename. The file path in the example is a fixture, not a user document.",
    simple:
      "The upload control is still an input of type file, even when the page styles a button on top of it. I target that input. For a download, I catch the file event the same way I catch a new tab.",
    points: [
      "setInputFiles can take multiple paths when the input allows it.",
      "I wait for the download before I click, or a fast download can be missed.",
      "I do not commit the downloaded file. I assert the name or a small fixture checksum, then the test workspace can be discarded.",
    ],
    example: {
      code: `await page.getByLabel('Resume').setInputFiles('fixtures/sample.txt');
const downloadPromise = page.waitForEvent('download');
await page.getByRole('button', { name: 'Export' }).click();
const download = await downloadPromise;
expect(download.suggestedFilename()).toBe('orders.csv');`,
      output: `${NOT_RUN} sample.txt is a fixture name. orders.csv is the filename the example contract would send.`,
    },
    related: ["pw-a-explicit", "pw-a-dialog", "pw-b-data"],
  }),
  lesson({
    id: "pw-a-dynamic",
    group: "pw-core",
    title: "How do you handle dynamic elements?",
    aliases: ["elements that rerender"],
    summary:
      "I locate dynamic elements by role, label, or stable text, not by a generated id or a position that changes. A locator is re-evaluated on each action, so a re-render does not leave me holding a dead node. I wait for the state I care about with a web-first assertion.",
    simple:
      "A row that appears after a search is still a row with a name. I describe the name. I do not save an element handle before the search and click it afterwards.",
    points: [
      "nth() and first() depend on order. I use them only when the order is the behavior under test.",
      "A loading skeleton can match a sloppy text locator. I assert the final value, not the skeleton.",
      "If the list is virtualized, an off-screen row may not be in the DOM. I scroll or search until the row exists.",
    ],
    example: {
      code: `await page.getByRole('searchbox', { name: 'Users' }).fill('Amit');
await expect(page.getByRole('row', { name: /Amit/ })).toBeVisible();`,
      output: `${NOT_RUN} The row assertion retries until Amit's row is visible or the timeout ends.`,
    },
    related: ["pw-dynamic", "pw-a-dollar", "pw-c-disappear"],
  }),
  lesson({
    id: "pw-a-await",
    group: "pw-core",
    title: "How do you use async/await, and what happens if you forget await?",
    aliases: ["forgot await playwright"],
    summary:
      "The test function is async. goto, click, fill, and expect return promises, so I await each one. If I forget await, the test function can finish while that action is still running. The failure then shows up as a later timeout, a closed page, or a step that never really happened.",
    simple:
      "await means 'do this, then continue'. Without it I have only started the work. The next line does not wait for the click.",
    points: [
      "await is not a sleep. It ends when that promise settles or times out.",
      "I await expect as well. An assertion that is not awaited may not fail the test in time.",
      "A floating promise can also reject after the test has already been marked, which makes the report harder to trust.",
    ],
    example: {
      code: `test('account heading', async ({ page }) => {
  await page.goto('https://shop.example/account');
  await expect(page.getByRole('heading', { name: 'Account' })).toBeVisible();
});`,
      output: `${NOT_RUN} Dropping either await lets the test move on before the page or the assertion is finished.`,
    },
    questions: [
      {
        prompt: "Can I await two independent actions with Promise.all?",
        short: "Only when they do not depend on each other and do not touch the same page state.",
        detail: "Two clicks on the same page in parallel are a race. Two API calls through the request fixture can run together when the contract allows it.",
      },
    ],
    related: ["pw-async", "pw-a-autowait", "pw-c-race"],
  }),
  lesson({
    id: "pw-a-strict",
    group: "pw-core",
    title: "How do you select an element when multiple elements match the same locator?",
    aliases: ["strict mode multiple matches"],
    summary:
      "Playwright refuses to click if the locator matches more than one element. I narrow it with a role name, a filter, or a parent row. I reach for first() or nth() only when the product contract really is 'the first item'.",
    simple:
      "Two Save buttons are not one locator. I say which Save I mean: the one in Amit's row, or the button named Save profile.",
    points: [
      "The error lists the matches. That is the debugging clue.",
      "filter({ hasText }) or a chained getByRole keeps the locator user-facing.",
      "first() hides the ambiguity. I treat it as a smell unless the order is specified.",
    ],
    example: {
      code: `await page
  .getByRole('row', { name: /Amit/ })
  .getByRole('button', { name: 'Edit' })
  .click();`,
      output: `${NOT_RUN} The click targets the Edit button inside Amit's row, even if other rows also have Edit.`,
    },
    related: ["pw-dynamic", "pw-a-locators", "pw-c-strict"],
  }),
  lesson({
    id: "pw-b-design",
    group: "pw-framework",
    title: "How would you design a Playwright framework from scratch?",
    aliases: ["playwright framework from scratch"],
    summary:
      "I start with the risk, not the folders. A small runner needs a config, a base URL per environment, tests that own their data, page objects or helpers only where a flow is reused, fixtures for login and API setup, and a CI job that installs browsers and keeps the trace when a test fails. I add layers after the first critical path is stable.",
    simple:
      "The first version is one config, a few independent tests, and a way to log in without repeating the form. I do not build a custom reporting platform before the login test is trustworthy.",
    points: [
      "The runner is @playwright/test. I do not wrap it in another runner without a reason.",
      "UI tests cover journeys. API checks cover rules. I do not click through the UI to create every fixture.",
      "Secrets stay in the CI environment. The repo holds example names, not passwords.",
    ],
    questions: [
      {
        prompt: "What would you postpone?",
        short: "A shared library for every application, visual baselines, and a custom reporter.",
        detail: "Those pay off after the suite has owners, tags, and a pipeline. Doing them first creates a framework nobody can run.",
      },
    ],
    related: ["pw-basic-test", "pw-b-pom", "pw-x-framework"],
  }),
  lesson({
    id: "pw-b-pom",
    group: "pw-framework",
    title: "How do you implement Page Object Model in Playwright?",
    aliases: ["playwright page object model"],
    summary:
      "A page object holds the locators and the actions for one page. The test calls signIn(email, password) and then asserts the outcome. I keep assertions in the test, or in a very thin flow, so a page object does not hide what the test is proving.",
    simple:
      "The class is a map of the page plus the clicks I repeat. It is not a place to store test data or to sleep.",
    points: [
      "Locators are fields created from the page, so they stay lazy.",
      "Methods return the next page object when the action navigates, if that helps the reader.",
      "A page object that exposes raw CSS for everything is only a relocation of brittle selectors.",
    ],
    example: {
      code: `class LoginPage {
  constructor(page) {
    this.page = page;
    this.email = page.getByLabel('Email');
    this.password = page.getByLabel('Password');
    this.submit = page.getByRole('button', { name: 'Sign in' });
  }
  async signIn(email, password) {
    await this.email.fill(email);
    await this.password.fill(password);
    await this.submit.click();
  }
}`,
      output: `${NOT_RUN} The test supplies the user and then asserts the next page. This class was not executed.`,
    },
    related: ["pw-b-pom-vs-helper", "pw-locators", "pw-x-login"],
  }),
  lesson({
    id: "pw-b-fixtures",
    group: "pw-framework",
    title: "What are fixtures, and why are they useful?",
    aliases: ["playwright fixtures why"],
    summary:
      "A fixture is a prepared value the test asks for by name, such as page, request, or a custom logged-in page. Playwright creates it for the test, passes it in, and tears it down afterwards. I use fixtures so setup is explicit, reusable, and not copied into every beforeEach.",
    simple:
      "The test lists what it needs. It does not inherit a hidden base class. If it asks for an admin page, that fixture logs in as an admin and closes the context when the test ends.",
    points: [
      "The test signature is the documentation: async ({ page, account }).",
      "Fixtures can depend on other fixtures.",
      "A fixture that mutates a shared user makes the suite order-dependent. I create data inside the fixture and delete it on the way out.",
    ],
    related: ["pw-b-builtin", "pw-b-login-fixture", "pw-b-hooks"],
  }),
  lesson({
    id: "pw-b-builtin",
    group: "pw-framework",
    title: "What is the difference between a built-in fixture and a custom fixture?",
    aliases: ["builtin fixture versus custom fixture"],
    summary:
      "Built-in fixtures come with the runner: browser, context, page, request, and browserName. A custom fixture is one I add with test.extend, such as a logged-in page or an API user. Custom fixtures are built from the built-in ones. I do not replace page unless I have a reason.",
    simple:
      "page is already a fresh tab. I add account or adminPage beside it. The test opts in by naming the fixture.",
    points: [
      "Worker-scoped fixtures are shared by tests on the same worker. I use that only for expensive read-only setup.",
      "Test-scoped fixtures run per test. That is the safe default for users and pages.",
      "Overriding the built-in context is how storageState is applied without a custom page fixture.",
    ],
    related: ["pw-b-fixtures", "pw-b-login-fixture", "pw-d-storage"],
  }),
  lesson({
    id: "pw-b-reuse",
    group: "pw-framework",
    title: "How do you share reusable setup without duplicating code?",
    aliases: ["reusable setup without copy paste"],
    summary:
      "I put repeated setup in a fixture or a setup project, not in a copied block. Login that every test needs becomes a storage state produced once. Data that one test needs is created through the API in that test's fixture and removed afterwards.",
    simple:
      "Copying the login steps into fifty files means fifty places to update the label. One fixture is the place I change.",
    points: [
      "A helper function is enough for a short sequence used by two tests.",
      "A base test class gets hard to follow once people override beforeEach.",
      "I still keep a test free of setup it does not need. Not every test should log in.",
    ],
    related: ["pw-b-fixtures", "pw-b-auth", "pw-b-pom-vs-helper"],
  }),
  lesson({
    id: "pw-b-config",
    group: "pw-framework",
    title: "How do you manage test configuration across environments?",
    aliases: ["baseurl environment config"],
    summary:
      "playwright.config.js reads the environment. baseURL, the auth file, and retries come from the environment name, not from edits inside each test. Local can point at a dev host. CI points at staging through BASE_URL. I never commit a production password to switch environments.",
    simple:
      "The test calls page.goto('/login'). The host comes from the config. Changing the host does not require a code change in the test.",
    points: [
      "Projects can override baseURL when one suite hits a second application.",
      "I print the host in CI logs. I do not print the token.",
      "A missing BASE_URL should fail at startup with a clear message, not at the first timeout.",
    ],
    example: {
      code: `use: {
  baseURL: process.env.BASE_URL || 'https://shop.example',
  trace: 'on-first-retry',
}`,
      output: `${NOT_RUN} shop.example is a placeholder host. A real job would set BASE_URL in the pipeline.`,
    },
    related: ["pw-parallel", "pw-b-secrets", "pw-e-env"],
  }),
  lesson({
    id: "pw-b-data",
    group: "pw-framework",
    title: "How do you handle test data creation and cleanup?",
    aliases: ["test data cleanup playwright"],
    summary:
      "I create the record through an API call when the product allows it, use a unique email or name, and delete that id in the fixture teardown. If delete is not allowed, I use a unique value and I say the row was left in that environment. I do not reuse a shared user that another test can edit.",
    simple:
      "The test brings its own data and takes it away. Then a failure in one test does not change the next test's expected name.",
    points: [
      "UI setup is slow and brittle. API setup is the default. UI is what I use when the creation screen is the thing under test.",
      "Cleanup belongs in finally or the fixture's after-use block so a failed assertion still cleans up.",
      "I do not delete by a broad query that could match a real user's data.",
    ],
    related: ["pw-b-isolation", "pw-d-request", "pw-x-login"],
  }),
  lesson({
    id: "pw-b-isolation",
    group: "pw-framework",
    title: "How do you prevent tests from depending on each other?",
    aliases: ["test independence playwright"],
    summary:
      "Each test gets a new context, its own data, and assertions that do not assume an earlier test ran. I do not store state in a module-level variable that the next test reads. Parallel workers make that leak fail in CI even when the file passes alone.",
    simple:
      "If I have to run the file from the top for one test to pass, the tests are coupled. I split the setup into the test that needs it.",
    points: [
      "test.describe.serial is a last resort for a wizard I cannot split. I treat it as a risk.",
      "A shared account with a fixed email will collide when two workers create it.",
      "Skipped cleanup is the usual way the next run fails.",
    ],
    related: ["pw-b-data", "pw-a-context", "pw-c-flaky"],
  }),
  lesson({
    id: "pw-b-hooks",
    group: "pw-framework",
    title: "What is the difference between beforeEach, beforeAll, and fixtures?",
    aliases: ["beforeeach versus beforeall versus fixtures"],
    summary:
      "beforeEach runs before every test in that scope. beforeAll runs once for the worker's slice of the file, so a page created there is shared and can leak state. A fixture is created when the test asks for it, can depend on other fixtures, and has a defined teardown. I prefer fixtures for login and data. I use beforeEach for a small step that truly belongs to every test in one file.",
    simple:
      "beforeAll looks efficient and then two tests share a dirty page. A fixture makes the setup and the cleanup part of the same object.",
    points: [
      "beforeAll plus fullyParallel is easy to misuse because each worker runs its own beforeAll.",
      "Hooks hide dependencies. The test signature shows fixture dependencies.",
      "I do not open a browser in beforeAll and hope every test resets it.",
    ],
    related: ["pw-b-fixtures", "pw-b-isolation", "pw-b-builtin"],
  }),
  lesson({
    id: "pw-b-pom-vs-helper",
    group: "pw-framework",
    title: "When would you use POM, and when would a simple helper function be enough?",
    aliases: ["pom versus helper function"],
    summary:
      "I use a page object when a screen has several locators and more than one test uses that screen. I use a helper function when the step is a few lines and has no state. A page object for a single click adds files without making the test clearer.",
    simple:
      "The goal is a test a reviewer can read. If the class has one method and one caller, a function is enough.",
    points: [
      "Neither pattern replaces good locators.",
      "I do not put assertions, sleeps, or environment secrets inside the page object.",
      "A flow helper can call two page objects when the journey crosses pages.",
    ],
    related: ["pw-b-pom", "pw-b-reuse", "pw-b-review"],
  }),
  lesson({
    id: "pw-b-modules",
    group: "pw-framework",
    title: "How would you structure a framework for multiple applications or modules?",
    aliases: ["multiple applications playwright"],
    summary:
      "I give each application a project or a folder with its own baseURL, auth setup, and page objects. Shared code is limited to fixtures and conventions, not a single page object that knows every app. Tests are named and tagged by module so a pipeline can run one product without the other.",
    simple:
      "Shop and admin are different sites. They can share the runner and the way we store secrets. They should not share a login page class if the screens differ.",
    points: [
      "projects in the config is the switch for browser and for baseURL.",
      "A change in the shop locator should not force the admin suite to fail review.",
      "I keep test data prefixes per app so cleanup cannot cross a boundary by accident.",
    ],
    related: ["pw-b-config", "pw-e-projects", "pw-b-design"],
  }),
  lesson({
    id: "pw-b-secrets",
    group: "pw-framework",
    title: "How do you manage secrets and environment variables?",
    aliases: ["playwright secrets environment variables"],
    summary:
      "Passwords and tokens live in CI secrets or a local file that is not committed. The test reads process.env.QA_USER and fails fast if it is missing. I never write the value into a screenshot annotation, a console log, or an assertion message.",
    simple:
      "The pipeline knows the password. The git history does not. A new teammate uses a local env file that the gitignore already excludes.",
    points: [
      "storageState can contain a session token. I gitignore that directory.",
      "Traces can capture headers. I treat a trace from a real user session as sensitive.",
      "I use a test account, not my personal login and not a customer account.",
    ],
    related: ["pw-b-config", "pw-d-secrets-log", "pw-b-auth"],
  }),
  lesson({
    id: "pw-b-auth",
    group: "pw-framework",
    title: "How do you implement reusable authentication?",
    aliases: ["storage state reusable login"],
    summary:
      "I log in once in a setup project, save context.storageState to a file, and point the other projects at that file. The browser tests then start already signed in. I still keep one UI test that performs the login form, because the setup path would hide a broken form.",
    simple:
      "Most tests need a session, not a lesson in the login page. I reuse the session file and let it expire in CI on a schedule I control.",
    points: [
      "The setup test depends on the same baseURL as the suite.",
      "If the token expires mid-run, the symptom is a redirect to login. I refresh the state rather than clicking Login in every test.",
      "An admin and a regular user are two storage files, not one account that changes role.",
    ],
    example: {
      code: `await page.context().storageState({ path: 'playwright/.auth/user.json' });`,
      output: `${NOT_RUN} The file would hold the session after a successful login. It should not be committed.`,
    },
    related: ["pw-b-login-fixture", "pw-d-storage", "pw-b-secrets"],
  }),
  lesson({
    id: "pw-b-login-fixture",
    group: "pw-framework",
    title: "How do you design a custom fixture for a logged-in user?",
    aliases: ["logged in user fixture"],
    summary:
      "I extend the base test with a fixture that opens a context using the saved storage state, creates a page, and closes the context after the test. The test asks for userPage instead of repeating login. Teardown runs even when the assertion fails.",
    simple:
      "The fixture is a short lifecycle: open a signed-in browser, hand the page to the test, then close it. The test stays focused on the behavior.",
    points: [
      "I depend on the browser fixture and I close what I open.",
      "Worker scope would share one login across tests and leak carts or drafts. I keep this test-scoped.",
      "The example password is not in this fixture. The session file was created earlier.",
    ],
    example: {
      code: `const test = base.extend({
  userPage: async ({ browser }, use) => {
    const context = await browser.newContext({
      storageState: 'playwright/.auth/user.json',
    });
    const page = await context.newPage();
    await use(page);
    await context.close();
  },
});`,
      output: `${NOT_RUN} A test would be written as async ({ userPage }) and would start already signed in.`,
    },
    related: ["pw-b-fixtures", "pw-b-auth", "pw-x-login"],
  }),
  lesson({
    id: "pw-b-review",
    group: "pw-framework",
    title: "How do you review a Playwright automation pull request?",
    aliases: ["review playwright pull request"],
    summary:
      "I read the test as a specification first. Then I check the locator, the assertion, the data, and the cleanup. I look for a fixed sleep, a shared user, a secret, test.only, and a locator that matches more than one element. I ask what fails if the button text changes for a good product reason.",
    simple:
      "A green run is not the whole review. I want a test the next person can change without learning a private framework.",
    points: [
      "Web-first assertions should be awaited.",
      "The diff should not weaken a check only to make CI green.",
      "I comment on the risk, and I point at the line. I do not rewrite the author's style for no reason.",
    ],
    questions: [
      {
        prompt: "What do you do about a flaky test added in the same pull request?",
        short: "I do not merge it as a known flake.",
        detail: "We either fix the wait or the data, or we leave the test out until it is stable. A retry count is not the fix.",
      },
    ],
    related: ["pw-b-pom", "pw-c-sleep", "pw-f-standards"],
  }),
  lesson({
    id: "pw-c-flaky",
    group: "pw-reliability",
    title: "What makes a Playwright test flaky?",
    aliases: ["causes of a flaky playwright test"],
    summary:
      "A flake passes and fails without a product change. The usual causes are a fixed sleep, a locator that matches the wrong element, shared data, a race with a response, animation, and an environment that is slower than the laptop. I treat a retry pass as a clue, not as a fix.",
    simple:
      "If the same commit is red and then green, I do not call the suite healthy. I find which assumption was only true on the fast machine.",
    points: [
      "Shared users and leftover rows make the next worker fail.",
      "first() on a list that reorders is a flake.",
      "A timeout that is long enough locally and too short in CI is still a timing assumption.",
    ],
    related: ["pw-timeouts", "pw-c-sleep", "pw-c-jenkins"],
  }),
  lesson({
    id: "pw-c-jenkins",
    group: "pw-reliability",
    title: "A test passes locally but fails in Jenkins. How would you investigate?",
    aliases: ["passes locally fails in jenkins"],
    summary:
      "I compare the evidence before I change the test. I look at the trace, the base URL, the browser build, the viewport, the timezone, and whether the CI secret and test data exist. Local often runs headed, one worker, and a warm cache. Jenkins runs headless, in parallel, on a clean agent.",
    simple:
      "I ask what is different, not whether Playwright is broken. The trace from the agent is the first artifact I open.",
    points: [
      "A missing npx playwright install means the browser is not there. That is an environment failure.",
      "BASE_URL pointing at the wrong host looks like a missing button.",
      "I do not raise the timeout until I know the step is actually slow for a fair reason.",
    ],
    questions: [
      {
        prompt: "What do you collect from the failed job?",
        short: "The HTML report, the trace, the URL, and the worker log. Not the password.",
        detail: "If the job did not keep artifacts, I fix that first so the next failure is diagnosable.",
      },
    ],
    related: ["pw-c-timeout", "pw-e-pipeline", "pw-c-triage"],
  }),
  lesson({
    id: "pw-c-sleep",
    group: "pw-reliability",
    title: "Why should you avoid fixed waitForTimeout() calls?",
    aliases: ["avoid waitfortimeout"],
    summary:
      "waitForTimeout waits a fixed time even when the page was ready sooner, and it still fails when CI is slower than that number. It hides the real condition. I wait for a locator, a URL, or a response instead.",
    simple:
      "A two-second sleep is a guess. The product does not promise two seconds. It promises that the status becomes Saved.",
    points: [
      "Sleeps add up across hundreds of tests and make the suite late.",
      "They also make failures harder, because the trace shows a pause instead of the missing element.",
      "A timeout option on expect is different. That is the maximum wait for a condition, not a mandatory pause.",
    ],
    example: {
      code: `await expect(page.getByRole('status')).toHaveText('Saved');`,
      output: `${NOT_RUN} This waits only until the status is Saved, up to the expect timeout.`,
    },
    related: ["pw-timeouts", "pw-a-explicit", "pw-c-flaky"],
  }),
  lesson({
    id: "pw-c-timeout",
    group: "pw-reliability",
    title: "How do you debug a timeout error?",
    aliases: ["debug a timeout error"],
    summary:
      "I read which call timed out: action, navigation, or expect. Then I open the trace at that step and see the locator, the screenshot, and the network. A locator timeout means the element never became actionable. A navigation timeout means the load did not finish. I fix the condition or the locator before I increase the number.",
    simple:
      "The error already names the step. I do not start by doubling every timeout in the config.",
    points: [
      "Strict-mode and timeout errors are different. One found too many elements. The other found none that were ready.",
      "A spinner that never leaves is an application or data problem if the API failed.",
      "The actionability log tells me if the element was hidden, covered, or detached.",
    ],
    related: ["pw-debug", "pw-c-trace", "pw-c-strict"],
  }),
  lesson({
    id: "pw-c-trace",
    group: "pw-reliability",
    title: "How do you use Trace Viewer?",
    aliases: ["use trace viewer senior"],
    summary:
      "A trace is a zip of the steps, DOM snapshots, network, console, and screenshots. I open it with npx playwright show-trace path.zip, or from the HTML report. I move to the failing action and compare the locator with the snapshot.",
    simple:
      "It is the recording of one attempt. I can see the request that returned 500 and the screen the user would have seen, without rerunning the job first.",
    points: [
      "trace: 'on-first-retry' records after the first failure and keeps CI lighter than tracing every pass.",
      "retain-on-failure keeps the trace when the test stays red.",
      "A trace can contain tokens and personal data. I do not post it in a public channel.",
    ],
    example: {
      code: `// npx playwright show-trace test-results/.../trace.zip`,
      output: `${NOT_RUN} The command opens the local viewer for a trace the test run produced.`,
    },
    related: ["pw-debug", "pw-c-timeout", "pw-c-artifacts"],
  }),
  lesson({
    id: "pw-c-artifacts",
    group: "pw-reliability",
    title: "What is the purpose of screenshots and video recordings?",
    aliases: ["screenshots and video purpose"],
    summary:
      "A screenshot shows the page at the failure. A video shows the path that got there. I turn both on for failures in CI so I can see a covered button or a wrong page. I do not record every passing test, because the files are large and can contain user data.",
    simple:
      "The assertion tells me the text was wrong. The picture tells me why: a modal, an error banner, or the wrong environment.",
    points: [
      "screenshot: 'only-on-failure' and video: 'retain-on-failure' are the usual CI settings.",
      "fullPage is useful when the error is below the fold. It is heavier.",
      "Artifacts must be uploaded by the job or they disappear with the agent.",
    ],
    related: ["pw-debug", "pw-c-trace", "pw-e-report"],
  }),
  lesson({
    id: "pw-c-retries",
    group: "pw-reliability",
    title: "How do you configure retries?",
    aliases: ["configure playwright retries"],
    summary:
      "I set retries in the config, usually higher in CI than on my laptop. retries: 2 means the runner repeats a failed test up to two more times. I can also pass --retries on the command line. A trace on first retry gives me the second attempt.",
    simple:
      "The setting is a safety net for a noisy agent. It is not the way I make a bad locator pass.",
    points: [
      "Local retries hide flakes from the person writing the test. I keep local retries at 0.",
      "The report shows every attempt. I read the failed one, not only the green retry.",
      "Retries multiply runtime when the suite is unhealthy.",
    ],
    example: {
      code: `retries: process.env.CI ? 2 : 0,
trace: 'on-first-retry',`,
      output: `${NOT_RUN} On CI a failed test can run again. The first retry is the one that records a trace.`,
    },
    related: ["pw-parallel", "pw-c-retry-policy", "pw-c-trace"],
  }),
  lesson({
    id: "pw-c-retry-policy",
    group: "pw-reliability",
    title: "Should retries be used to fix flaky tests? Why or why not?",
    aliases: ["retries do not fix flakes"],
    summary:
      "No. A retry can get the build through a one-off agent glitch, but it does not repair a race or shared data. If the test is red and then green on the same commit, I still open a defect or a test fix. I would rather quarantine a known flake with an owner than teach the team to ignore it.",
    simple:
      "Green on the third try is not the same as a test that passed once. The product or the script is still unsteady.",
    points: [
      "I separate an infrastructure blip from a product race. The trace decides.",
      "Raising retries to five makes the pipeline slow and the signal weak.",
      "A flake that blocks release gets a fix before new feature tests.",
    ],
    related: ["pw-c-retries", "pw-c-flaky", "pw-f-rerun"],
  }),
  lesson({
    id: "pw-c-strict",
    group: "pw-reliability",
    title: "How do you debug a strict-mode violation?",
    aliases: ["debug strict mode violation"],
    summary:
      "The error means the locator matched more than one element. I read the two matches in the message, then I narrow the locator with a name, a row, or a filter. I do not turn strict mode off.",
    simple:
      "Playwright is refusing to guess. I tell it which Save button I meant.",
    points: [
      "A page with two nav bars, desktop and mobile, often matches both in a wide viewport.",
      "getByText without exact can match a button and a heading.",
      "The snapshot in the trace shows both nodes.",
    ],
    related: ["pw-a-strict", "pw-c-timeout", "pw-a-locators"],
  }),
  lesson({
    id: "pw-c-disappear",
    group: "pw-reliability",
    title: "How do you handle a test that intermittently fails because an element disappears?",
    aliases: ["element disappears intermittently"],
    summary:
      "An element that vanishes mid-click was usually detached by a re-render. Locators retry, but a condition that is true only between two renders still flakes. I assert the settled state, often after the response that refreshes the list, and I avoid holding an element handle across that refresh.",
    simple:
      "The row was there, the app replaced the table, and the click hit a node that was already gone. I wait until the refresh finishes, then I click the row that exists after it.",
    points: [
      "The error text often says the element detached.",
      "Waiting for the network response that feeds the table removes the gap.",
      "If the product flickers because of a defect, I file that. I do not paper over a broken render with a sleep.",
    ],
    related: ["pw-a-dynamic", "pw-c-race", "pw-a-dollar"],
  }),
  lesson({
    id: "pw-c-race",
    group: "pw-reliability",
    title: "How do you investigate a race condition between a UI action and an API response?",
    aliases: ["ui action api race"],
    summary:
      "I start waiting for the request or response, then I do the click. In the trace I check whether the call happened, what status it returned, and whether the UI updated after it. If the UI reads stale state, that is a product race. If my assertion ran before the call, that is a test race.",
    simple:
      "The order is listen, then click, then assert. The reverse order misses a fast API.",
    points: [
      "waitForResponse with a URL predicate is the explicit condition.",
      "I also check the payload when the bug is 'we saved the wrong body'.",
      "A loading flag that never clears is different from a response that already returned 200.",
    ],
    example: {
      code: `const done = page.waitForResponse((response) =>
  response.url().includes('/api/users') && response.request().method() === 'POST'
);
await page.getByRole('button', { name: 'Save' }).click();
expect((await done).status()).toBe(201);`,
      output: `${NOT_RUN} The status check runs on the response that the click triggered. 201 must match the contract.`,
    },
    related: ["pw-a-explicit", "pw-d-wait-response", "pw-c-disappear"],
  }),
  lesson({
    id: "pw-c-triage",
    group: "pw-reliability",
    title: "How do you identify whether a failure comes from the application, test script, environment, or test data?",
    aliases: ["triage app script environment data"],
    summary:
      "I separate the layers with one question each. Can I do the same step by hand on that environment? Does the API return the same bad result? Does it fail only on one host or one browser? Does the record I expected exist? A wrong locator that the manual step does not hit is a script defect. A 500 that the UI only displays is an application defect.",
    simple:
      "I do not assign blame from the assertion text alone. The same timeout can be a missing button, a down service, or a user that was never created.",
    points: [
      "Application: the API or the manual flow fails the same way.",
      "Script: the element is on screen under a different role or name.",
      "Environment: only CI, only one browser, or the wrong base URL.",
      "Data: the id is missing, duplicated, or left dirty by an earlier run.",
    ],
    related: ["pw-c-jenkins", "pw-c-flaky", "pw-d-ui-api"],
  }),
  lesson({
    id: "pw-d-request",
    group: "pw-network",
    title: "How do you send API requests using Playwright's APIRequestContext?",
    aliases: ["apirequestcontext request fixture"],
    summary:
      "The request fixture is an API client. It can post JSON to the same base URL without opening a browser. I use it to set up data and to check the contract. It does not run the page's JavaScript and it does not prove the button is wired, unless I also drive the UI.",
    simple:
      "A browser test clicks. An APIRequestContext call talks to the server directly. Both belong in the suite. They answer different questions.",
    points: [
      "request.newContext() can take extra headers or storageState when I am outside a test.",
      "The built-in request fixture already uses the config baseURL.",
      "A 201 from request.post does not mean the screen shows the new user.",
    ],
    example: {
      code: `const response = await request.post('/users', {
  data: { name: 'Rajat', job: 'QA' },
});
expect(response.status()).toBe(201);`,
      output: `${NOT_RUN} This bypasses the UI. 201 is only correct when the contract says created.`,
    },
    related: ["pw-d-assert", "pw-b-data", "pw-d-ui-api"],
  }),
  lesson({
    id: "pw-d-assert",
    group: "pw-network",
    title: "How do you validate status codes and response bodies?",
    aliases: ["validate api status and body"],
    summary:
      "I assert the status the contract names, then I read response.json() and check the fields that matter. toMatchObject checks a subset. I also check a field that must not change when the case is an update. I do not assume every success is 200.",
    simple:
      "Status first, then the body. A 200 with an error object is still a failed contract if the contract forbids that shape.",
    points: [
      "response.ok() is any 2xx. I use it only when the exact code does not matter.",
      "Types matter. The id may be a number in JSON and a string in the UI.",
      "I do not log the whole body if it contains a token or personal data.",
    ],
    example: {
      code: `expect(response.status()).toBe(200);
expect(await response.json()).toMatchObject({
  name: 'Rajat',
  job: 'QA',
});`,
      output: `${NOT_RUN} Extra fields in the JSON would still pass toMatchObject.`,
    },
    related: ["pw-d-request", "pw-d-payload", "pw-d-error"],
  }),
  lesson({
    id: "pw-d-route",
    group: "pw-network",
    title: "How do you mock an API response using page.route()?",
    aliases: ["page route fulfill mock"],
    summary:
      "page.route matches a URL pattern. route.fulfill supplies the status, content type, and body, so the browser never needs the real service for that call. I use it to force an empty list, a known user, or an error. I still keep one test against the real service for the path we ship.",
    simple:
      "The page thinks the server answered. I chose the answer. That lets me test the screen without waiting for a backend that is down or hard to put into an error state.",
    points: [
      "I register the route before goto or before the click that fetches.",
      "A mock that never matches the real URL gives me a silent pass against the wrong call.",
      "Fulfill is not proof the server works.",
    ],
    example: {
      code: `await page.route('**/api/users', (route) =>
  route.fulfill({
    status: 200,
    contentType: 'application/json',
    body: JSON.stringify([{ name: 'Amit' }]),
  })
);
await page.goto('/users');
await expect(page.getByRole('cell', { name: 'Amit' })).toBeVisible();`,
      output: `${NOT_RUN} The table renders the mocked Amit row. The real /api/users service is not called.`,
    },
    related: ["pw-what", "pw-d-mock-vs-intercept", "pw-d-error"],
  }),
  lesson({
    id: "pw-d-mock-vs-intercept",
    group: "pw-network",
    title: "What is the difference between mocking a response and intercepting a request?",
    aliases: ["mock versus intercept request"],
    summary:
      "Mocking replaces the response with route.fulfill. Intercepting lets me observe or change the request and still reach the server with route.continue, or fetch the real response and then adjust it. I mock when I need a controlled UI state. I intercept when I need to prove what the browser sent.",
    simple:
      "Fulfill is a stand-in. Continue is the real backend, with me looking at the envelope first.",
    points: [
      "route.request().postDataJSON() is how I read the payload during an intercept.",
      "If I forget continue or fulfill, the call hangs until timeout.",
      "A test can both assert the payload and let the real server answer.",
    ],
    related: ["pw-d-route", "pw-d-payload", "pw-d-wait-response"],
  }),
  lesson({
    id: "pw-d-wait-response",
    group: "pw-network",
    title: "How do you wait for an API response triggered by a button click?",
    aliases: ["wait for response before click"],
    summary:
      "I create the waitForResponse promise first, then I click, then I await the response. The predicate checks the URL and method so a different call does not satisfy it. After that I assert status and the UI.",
    simple:
      "Listening after the click is too late when the response returns quickly. The click and the listener have to overlap.",
    points: [
      "I include the HTTP method. A GET and a POST can share a URL.",
      "I still assert the screen. A 200 that the UI ignores is a defect.",
      "This was not run against a live service.",
    ],
    example: {
      code: `const responsePromise = page.waitForResponse(
        (response) => response.url().includes('/api/orders') && response.request().method() === 'POST'
      );
await page.getByRole('button', { name: 'Place order' }).click();
const response = await responsePromise;
expect(response.status()).toBe(201);`,
      output: `${NOT_RUN} The test continues after the matching POST response, or it times out.`,
    },
    related: ["pw-c-race", "pw-a-explicit", "pw-d-payload"],
  }),
  lesson({
    id: "pw-d-storage",
    group: "pw-network",
    title: "How do you reuse authentication state?",
    aliases: ["reuse authentication storage state"],
    summary:
      "After a real login, I save storageState from the context. Later contexts load that file and skip the form. The API request context can take the same storageState when the API uses the session cookie. I refresh the file when the session expires.",
    simple:
      "The file is a saved browser session. Reusing it is faster and avoids typing the password in every test. It is still a secret.",
    points: [
      "Two roles mean two files.",
      "I gitignore the auth directory.",
      "A UI login test must remain, or a broken form will be hidden by the saved session.",
    ],
    related: ["pw-b-auth", "pw-b-login-fixture", "pw-b-secrets"],
  }),
  lesson({
    id: "pw-d-error",
    group: "pw-network",
    title: "How do you test an error response without depending on a real backend failure?",
    aliases: ["mock an error response"],
    summary:
      "I fulfill the route with the status and body the UI must handle, such as 500 or 401. Then I assert the message and that the user is not shown a success state. This checks the front end's error path. A separate test, or a monitoring check, covers the real server failure.",
    simple:
      "I should not have to break production to see whether the page shows a useful error. I hand the page a controlled failure.",
    points: [
      "The mocked body should follow the error shape the UI parses. An empty body can hide a second bug.",
      "I assert that the save did not pretend to succeed.",
      "I label the test as a mocked error so nobody thinks the API was down.",
    ],
    example: {
      code: `await page.route('**/api/users', (route) =>
  route.fulfill({
    status: 500,
    contentType: 'application/json',
    body: JSON.stringify({ message: 'Unavailable' }),
  })
);`,
      output: `${NOT_RUN} The next UI action should show the error state for this mocked 500.`,
    },
    related: ["pw-d-route", "pw-d-assert", "pw-d-mock-vs-intercept"],
  }),
  lesson({
    id: "pw-d-ui-api",
    group: "pw-network",
    title: "How do you validate UI data against an API response?",
    aliases: ["compare ui with api response"],
    summary:
      "I capture the response that filled the screen, or I call the same endpoint with the request fixture. Then I compare the fields the user sees: name, status, count. I account for formatting. A date can be ISO in JSON and a local string in the table. The row count should match the list length, not a page size, unless I am testing one page.",
    simple:
      "The table is a view. The response is the source for that view. I check they agree, and I check the type so a string id is not compared with a number by accident.",
    points: [
      "Pagination means the UI may show ten rows while the API total is fifty. I compare the page, then the total.",
      "A mocked response only proves the UI can render that JSON.",
      "I do not scrape the whole DOM when three fields carry the risk.",
    ],
    related: ["pw-d-assert", "pw-d-wait-response", "pw-x-data"],
  }),
  lesson({
    id: "pw-d-mongo",
    group: "pw-network",
    title: "How would you validate API data against MongoDB?",
    aliases: ["playwright api against mongodb"],
    summary:
      "I create or update through the API, keep the id and the fields I sent, then I read that document with a MongoDB query in the test data layer. I compare values and types. An API id string and an ObjectId are a common mismatch. These lessons do not connect to a database, and the sample query was not run.",
    simple:
      "The HTTP response can lie by echoing my body. The document is the stored result. I read it with the database's own query, not with another guess at the UI.",
    points: [
      "I check one changed field and one field that should stay the same.",
      "A missing document, a duplicate email, and a stale document are different defects.",
      "I do not put a production connection string in the test or the log.",
    ],
    example: {
      code: `// After the API returns the new user. Illustrative only.
db.users.findOne({ email: 'amit@example.com' })`,
      output: `${NOT_RUN} I would compare name and job with the API body. This is not a live record.`,
    },
    related: ["pw-d-ui-api", "pw-d-request", "pw-b-data"],
  }),
  lesson({
    id: "pw-d-async-job",
    group: "pw-network",
    title: "How do you test a UI flow that triggers asynchronous backend processing?",
    aliases: ["async backend processing ui"],
    summary:
      "I assert the immediate accepted state, then I wait for the finished state with a web-first assertion and a timeout that matches the contract. If the UI polls, I can wait for the later GET that returns completed. I do not sleep for a guessed number of seconds, and I do not fail the test on the first pending response.",
    simple:
      "Place order can return before the warehouse step finishes. The test needs a definition of done: the status text, or a completed flag from the API.",
    points: [
      "I separate 202 Accepted from the later success.",
      "A longer expect timeout is fair when the product is eventually consistent. An infinite retry is not.",
      "If it stays pending, I look at the job and the data, not only the button.",
    ],
    related: ["pw-d-wait-response", "pw-c-race", "pw-a-webfirst"],
  }),
  lesson({
    id: "pw-d-payload",
    group: "pw-network",
    title: "How do you verify that a network request was sent with the expected payload?",
    aliases: ["assert request payload"],
    summary:
      "I wait for the request, then I read postDataJSON() and compare it with the fields I entered. I register the wait before the click. This proves the browser sent the contract. It does not, by itself, prove the server stored it.",
    simple:
      "The form can show Saved while the request omitted a field. I look at the body that left the browser.",
    points: [
      "I assert the important fields, not a snapshot of every generated timestamp, unless the timestamp is the bug.",
      "A file upload is multipart. postDataJSON is the wrong reader for that.",
      "I redact the assertion output if the payload contains a password.",
    ],
    example: {
      code: `const requestPromise = page.waitForRequest(
  (req) => req.url().includes('/api/users') && req.method() === 'POST'
);
await page.getByRole('button', { name: 'Save' }).click();
expect((await requestPromise).postDataJSON()).toMatchObject({ job: 'QA' });`,
      output: `${NOT_RUN} The POST body must include job QA. Other fields may also be present.`,
    },
    related: ["pw-d-mock-vs-intercept", "pw-d-wait-response", "pw-c-race"],
  }),
  lesson({
    id: "pw-d-secrets-log",
    group: "pw-network",
    title: "How do you prevent sensitive tokens and user data from appearing in test logs?",
    aliases: ["redact tokens in playwright logs"],
    summary:
      "I do not console.log the storage state, the Authorization header, or the password. I avoid attaching a full trace from a real customer session to a ticket. CI secrets stay in the secret store. If a report must show a user, I use a synthetic account and I still strip the token.",
    simple:
      "The report is there to explain a failure. It is not a place to store a session that can call the API.",
    points: [
      "A screenshot of a profile page can be personal data. I use test users.",
      "request.post data should not include a real card or a live token in the repository.",
      "I review failure artifacts before I paste them into chat.",
    ],
    related: ["pw-b-secrets", "pw-c-trace", "pw-d-storage"],
  }),
  ...PLAYWRIGHT_ADVANCED_MORE,
];
