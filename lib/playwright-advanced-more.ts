import type { ConceptGroupId, ConceptLesson } from "./concepts";

const BASIS = "Prepared senior interview explanation. It is not a quotation from the saved Playwright PDF.";
const NOT_RUN = "Illustrative example. It was not executed.";

function lesson(seed: {
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
}): ConceptLesson {
  return { ...seed, basis: BASIS, sources: [] };
}

export const PLAYWRIGHT_ADVANCED_MORE: ConceptLesson[] = [
  lesson({
    id: "pw-e-parallel",
    group: "pw-ci",
    title: "How do you run Playwright tests in parallel?",
    aliases: ["run playwright tests in parallel"],
    summary: "The runner uses worker processes. fullyParallel lets tests in the same file run together. The workers setting caps how many run at once. Tests must own their data, because two workers will hit the app at the same time.",
    simple: "Parallel means more than one browser context is busy. It saves time only when a test does not depend on another test's rows.",
    points: [
      "Locally I use fewer workers than CI if the laptop cannot carry the load.",
      "A shared login user that both workers edit will flake.",
      "npx playwright test is the command. The config decides the default workers.",
    ],
    example: {
      code: `fullyParallel: true,
workers: process.env.CI ? 4 : undefined,`,
      output: `${NOT_RUN} Undefined locally lets Playwright pick a worker count from the machine.`,
    },
    related: ["pw-parallel", "pw-e-shard", "pw-b-isolation"],
  }),
  lesson({
    id: "pw-e-shard",
    group: "pw-ci",
    title: "What is the difference between workers and sharding?",
    aliases: ["workers versus sharding"],
    summary: "Workers are processes on one machine sharing one test run. Sharding splits the suite across machines or jobs. --shard=1/4 runs one quarter of the tests. I use workers until one agent is full, then I shard. Sharded HTML reports need a blob report and a merge step.",
    simple: "Workers fill one computer. Shards use several computers. Both require tests that can run in any order.",
    points: [
      "Shard 2 of 4 does not know what shard 1 did. Setup cannot live in a single test that only one shard runs, unless every shard has its own setup.",
      "Merging reports is part of the design, or each job shows only its own quarter.",
      "I do not shard a suite that still shares one user account.",
    ],
    related: ["pw-e-parallel", "pw-e-report", "pw-e-scale"],
  }),
  lesson({
    id: "pw-e-projects",
    group: "pw-ci",
    title: "How do you configure Chromium, Firefox, and WebKit projects?",
    aliases: ["chromium firefox webkit projects"],
    summary: "A project is a named configuration. The starter config has one project per browser using devices from @playwright/test. I can run one with --project=chromium. On a pull request I often run Chromium, and I run Firefox and WebKit on a schedule, unless the product promises all three on every change.",
    simple: "The same test file runs three times if three projects are enabled. That is coverage, and it is also three times the cost.",
    points: [
      "A browser-specific failure belongs in the report under that project name.",
      "WebKit on Linux CI needs the Playwright system dependencies. It is not the same as desktop Safari, but it catches engine issues.",
      "I do not copy the test into three files.",
    ],
    example: {
      code: `projects: [
  { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
  { name: 'firefox', use: { ...devices['Desktop Firefox'] } },
  { name: 'webkit', use: { ...devices['Desktop Safari'] } },
],`,
      output: `${NOT_RUN} devices comes from @playwright/test. This config was not executed.`,
    },
    related: ["pw-headless", "pw-e-pipeline", "pw-b-modules"],
  }),
  lesson({
    id: "pw-e-tags",
    group: "pw-ci",
    title: "How do you run only smoke tests or regression tests?",
    aliases: ["grep smoke versus regression"],
    summary: "I tag tests, for example @smoke and @regression, and I run npx playwright test --grep @smoke. Smoke is the small set I trust before a release. Regression is the wider set. A test can carry both tags. I keep the smoke list short enough that people will actually run it.",
    simple: "The tag is a promise about purpose. If every test is smoke, the word no longer helps me choose.",
    points: [
      "--grep-invert can exclude a slow tag on a pull request.",
      "The tag lives next to the test title so a review can see it.",
      "I do not maintain a second copy of the suite for smoke.",
    ],
    example: {
      code: `test('user can sign in', { tag: '@smoke' }, async ({ page }) => {
  await page.goto('/login');
});`,
      output: `${NOT_RUN} npx playwright test --grep @smoke would select this test. The body is only a sketch.`,
    },
    related: ["pw-e-pipeline", "pw-f-prioritize", "pw-basic-test"],
  }),
  lesson({
    id: "pw-e-pipeline",
    group: "pw-ci",
    title: "How do you run tests in Jenkins or Azure Pipelines?",
    aliases: ["jenkins or azure pipelines playwright"],
    summary: "The job checks out the repo, installs npm dependencies, runs npx playwright install --with-deps, then npx playwright test. BASE_URL and the test password come from the pipeline secret store. I publish the HTML report and the test-results folder on failure. The same steps fit Jenkins or Azure. The buttons differ, the commands do not.",
    simple: "CI is a clean machine running the same command I run locally, plus the browser install and the secret host.",
    points: [
      "The Playwright version in package-lock and the installed browsers must match.",
      "I fail the job on test failure. I do not convert a red suite into a warning without a decision.",
      "I do not echo the secret in the pipeline script.",
    ],
    related: ["pw-c-jenkins", "pw-e-browsers", "pw-e-report"],
  }),
  lesson({
    id: "pw-e-report",
    group: "pw-ci",
    title: "How do you publish an HTML report and preserve test artifacts?",
    aliases: ["html report and artifacts"],
    summary: "The HTML reporter writes playwright-report. Traces, screenshots, and videos land in test-results. The job must upload both directories, or the agent deletes them. For shards I use the blob reporter and npx playwright merge-reports so one HTML report covers every machine.",
    simple: "A failure without a saved report is a failure I cannot explain tomorrow. Publishing the artifact is part of the pipeline, not an extra.",
    points: [
      "npx playwright show-report serves the HTML locally.",
      "I retain artifacts for the failed attempt, not an unlimited history of videos.",
      "Reports can contain session data. Access to the artifact store should match the environment's sensitivity.",
    ],
    related: ["pw-debug", "pw-c-artifacts", "pw-e-shard"],
  }),
  lesson({
    id: "pw-e-browsers",
    group: "pw-ci",
    title: "How do you manage browser installation in CI?",
    aliases: ["playwright install with deps"],
    summary: "npx playwright install --with-deps downloads the browsers that match the installed package and the OS libraries they need. I cache that download between jobs when the lockfile has not changed. I do not rely on a browser that happened to be installed on the agent image.",
    simple: "The npm package and the browser build are a pair. Updating one without the other is a broken run, not a product bug.",
    points: [
      "A Docker image from the Playwright team already contains the browsers. Then I pin the image to the same version as the dependency.",
      "Installing only Chromium is fair when the pipeline only runs the Chromium project.",
      "A failed install should be visible as setup, not as a test timeout.",
    ],
    related: ["pw-install", "pw-e-pipeline", "pw-e-projects"],
  }),
  lesson({
    id: "pw-e-speed",
    group: "pw-ci",
    title: "How do you reduce execution time without reducing test coverage unnecessarily?",
    aliases: ["reduce suite time keep coverage"],
    summary: "I remove waits that are sleeps, create data through the API, reuse auth state, and run independent tests in parallel. I run the smoke tag on every change and the full browser matrix on a schedule. I do not delete a failing assertion to save minutes.",
    simple: "The minutes I can honestly remove are duplicate UI setup and idle sleeps. The minutes I should not remove are the checks that would have caught the release bug.",
    points: [
      "A trace on every passing test costs time and disk. on-first-retry is enough.",
      "Sharding helps after the tests are isolated.",
      "I measure the slowest tests before I add hardware.",
    ],
    related: ["pw-e-parallel", "pw-b-auth", "pw-c-sleep"],
  }),
  lesson({
    id: "pw-e-env",
    group: "pw-ci",
    title: "How do you handle environment-specific failures?",
    aliases: ["environment specific failures"],
    summary: "I confirm the base URL, the data, and the feature flag for that environment. A test that passes on staging and fails on a preview host may be a missing seed, a flag, or a build that did not include the button. I do not special-case the assertion until I know the contract differs on purpose.",
    simple: "The same test, two hosts. I write down which host failed and what that host was running. Then I decide if the product or the setup is wrong.",
    points: [
      "I keep environment differences in config, not in if (env) scattered through tests.",
      "A feature flag that hides a button is data or config, and the test should know the flag.",
      "Production is not the place I debug a locator.",
    ],
    related: ["pw-b-config", "pw-c-triage", "pw-c-jenkins"],
  }),
  lesson({
    id: "pw-e-scale",
    group: "pw-ci",
    title: "How would you scale a suite containing thousands of tests?",
    aliases: ["scale thousands of tests"],
    summary: "I split by risk and by owner. API tests carry the business rules. UI tests carry critical journeys. Tags and shards keep the pull-request run small. Flakes get an owner and a fix, not a silent skip. I watch duration and failure rate, not only the count of tests.",
    simple: "A thousand tests that nobody can run before release are not a safety net. I make the important slice fast and I keep the rest scheduled.",
    points: [
      "Quarantine without a ticket becomes a junk drawer.",
      "Each module should be runnable alone.",
      "More workers do not help if the application falls over. I load the environment on purpose, not by accident.",
    ],
    related: ["pw-e-shard", "pw-e-tags", "pw-f-prioritize"],
  }),
  lesson({
    id: "pw-f-prioritize",
    group: "pw-leadership",
    title: "You have 1,000 tests and only 20 minutes before release. How do you prioritize them?",
    aliases: ["twenty minutes before release"],
    summary: "I run the smoke set that covers login, the money or data path, and the change in this release. I do not start a thousand-test run that cannot finish. I say what was not run. If smoke fails, I stop the release discussion and look at that failure. If smoke passes and the rest has not run, the release decision includes that gap.",
    simple: "Twenty minutes is a selection problem. I would rather finish the risky paths with evidence than start everything and cancel it.",
    points: [
      "The smoke list has to exist before the deadline. I do not invent it in the last five minutes.",
      "I name the areas with no automated result so the release owner can accept the risk or wait.",
      "I do not claim a pass rate I did not measure.",
    ],
    questions: [
      {
        prompt: "What if smoke itself takes longer than twenty minutes?",
        short: "Then the smoke set is too big for a release gate, and I cut it by risk before the next release.",
        detail: "For this release I run the subset tied to the change and the payment or data path, and I record the rest as not run.",
      },
    ],
    related: ["pw-e-tags", "pw-f-release", "pw-e-speed"],
  }),
  lesson({
    id: "pw-f-two-hours",
    group: "pw-leadership",
    title: "Your regression suite takes two hours. How would you reduce the execution time?",
    aliases: ["regression takes two hours"],
    summary: "I find the slowest tests and the duplicated UI setup. I move setup to the API, reuse authentication, remove sleeps, and run workers or shards. I split smoke from the full regression so a change does not wait two hours. I keep the coverage that protects the release and I drop duplicate clicks that assert the same rule.",
    simple: "I buy back time from waste first. Hardware and shards come after the tests are isolated. Deleting a check is the last option, and I say which risk I am dropping.",
    points: [
      "A two-hour run that is mostly login screens is a design problem.",
      "Parallelism without unique data makes the run faster and redder.",
      "I would report duration before and after, on the same environment, before I call it an improvement.",
    ],
    related: ["pw-e-speed", "pw-e-shard", "pw-f-maintain"],
  }),
  lesson({
    id: "pw-f-rerun",
    group: "pw-leadership",
    title: "A critical test fails in CI, but rerunning it passes. What do you do?",
    aliases: ["rerun passes critical test"],
    summary: "I do not treat the green rerun as the end. I keep the failed trace, decide whether the release can wait, and look for a race, bad data, or an agent difference. If we must ship, I state that the evidence is mixed and what we will watch. Then I assign the flake so it does not become normal.",
    simple: "A critical test that fails once has already told me something. Rerunning until it is green throws that evidence away.",
    points: [
      "I compare the failed attempt with the passed one in Trace Viewer.",
      "I do not raise retries and close the incident.",
      "The release owner hears the risk in plain language: it failed once on this build.",
    ],
    related: ["pw-c-retry-policy", "pw-c-trace", "pw-f-release"],
  }),
  lesson({
    id: "pw-f-dev-dispute",
    group: "pw-leadership",
    title: "A developer says your automation test is wrong. How do you investigate?",
    aliases: ["developer says the test is wrong"],
    summary: "I assume the test might be wrong and I check it. I compare the assertion with the ticket, repeat the step manually, and look at the request the browser sent. If the product matches the agreed contract, I change the test and I say so. If the product changed without a contract change, I keep the failure and I show the response or the screenshot.",
    simple: "The argument is settled by the expected behavior and the evidence, not by who wrote the test. I am willing to fix a bad locator.",
    points: [
      "A brittle text assertion can be wrong even when the feature works.",
      "A 500 behind a green button is not a wrong test.",
      "I update the test in the same change as the product when the contract was intentionally updated.",
    ],
    related: ["pw-c-triage", "pw-b-review", "pw-d-payload"],
  }),
  lesson({
    id: "pw-f-what-to-automate",
    group: "pw-leadership",
    title: "How do you decide which test cases should be automated?",
    aliases: ["what to automate"],
    summary: "I automate a case that is important, repeatable, and stable enough to trust. I start with the paths that hurt when they break and that we retest every release. I leave one-off exploratory checks, a screen that changes daily, and a judgment call to a person. Automation is a cost I can explain.",
    simple: "If I cannot say what a failure means, it is too early to automate. If I run the same check every week by hand, it is a candidate.",
    points: [
      "High risk and high repetition come first.",
      "A case that needs a human eye, such as layout taste, is a poor first UI test.",
      "I would rather have thirty trustworthy tests than three hundred that nobody believes.",
    ],
    related: ["pw-f-pyramid", "pw-f-maintain", "pw-e-tags"],
  }),
  lesson({
    id: "pw-f-pyramid",
    group: "pw-leadership",
    title: "How do you balance UI automation, API automation, and lower-level tests?",
    aliases: ["balance ui api and unit tests"],
    summary: "Rules and data combinations belong in API or unit tests, where a failure is fast and precise. UI tests cover a few journeys: sign in, the main task, and the error the user must see. I do not click through the UI for every field validation the API already rejects.",
    simple: "The UI suite is the expensive layer. I spend it on what only a browser can prove, and I let the API tests carry the matrix of inputs.",
    points: [
      "A UI test that only checks a status code is in the wrong layer.",
      "An API test cannot see a disabled button. That stays in the UI.",
      "I talk about the gap. If there are no unit tests, the API layer still should not be replaced by a hundred browser tests.",
    ],
    related: ["pw-d-request", "pw-f-what-to-automate", "pw-e-speed"],
  }),
  lesson({
    id: "pw-f-maintain",
    group: "pw-leadership",
    title: "How do you prevent automation from becoming difficult to maintain?",
    aliases: ["keep automation maintainable"],
    summary: "I keep locators user-facing, setup in fixtures, and assertions in the test. I delete a test that no longer matches the product. I review new tests for sleeps and shared data. A framework helper needs a caller, or I do not add it. Ownership is per folder so a broken login has a person.",
    simple: "The suite gets hard when every test invents its own wait and its own user. Conventions and review are how I stop that, not a bigger framework.",
    points: [
      "I rename a locator once in the page object, not in forty files.",
      "I track flakes and slow tests the way I track defects.",
      "Unowned tests become the ones everyone is afraid to touch.",
    ],
    related: ["pw-b-review", "pw-f-standards", "pw-b-pom"],
  }),
  lesson({
    id: "pw-f-migrate",
    group: "pw-leadership",
    title: "How would you migrate an existing Selenium framework to Playwright?",
    aliases: ["migrate selenium to playwright"],
    summary: "I would not stop the old suite on day one. I pick a new or high-maintenance flow, rewrite it in Playwright with locators and fixtures, and run it in CI beside Selenium. I move the next flow when the new one is stable. Shared test data and the pipeline stay, but ExpectedConditions and WebDriver waits do not get translated line by line.",
    simple: "A big-bang rewrite leaves us with two half suites. A thin slice proves the new runner, the report, and the login approach before we touch the rest.",
    points: [
      "I map the risk, not the page-object count.",
      "People need a short standard: how we locate, how we wait, how we log in.",
      "I keep Selenium for the areas we have not moved, and I say so in the release check.",
    ],
    related: ["pw-vs-selenium", "pw-a-what", "pw-b-design"],
  }),
  lesson({
    id: "pw-f-measure",
    group: "pw-leadership",
    title: "How do you measure automation effectiveness beyond the number of tests?",
    aliases: ["measure automation effectiveness"],
    summary: "I look at whether failures are believed, how long the gate takes, how often a release bug escaped the suite, and how much time we spend nursing flakes. The count of tests does not tell me any of that. I would track flake rate, duration of the smoke run, and defects found by automation versus escaped after a green run.",
    simple: "A larger number can be a worse suite. I care that a red build means something and that a green smoke run finishes in time to be used.",
    points: [
      "I do not invent a percentage from a project I have not measured.",
      "An escaped defect is a prompt to ask which layer should have caught it.",
      "Time spent rerunning CI is a cost, even when the final badge is green.",
    ],
    related: ["pw-f-what-to-automate", "pw-e-scale", "pw-c-retry-policy"],
  }),
  lesson({
    id: "pw-f-release",
    group: "pw-leadership",
    title: "How do you decide whether a release is safe when some tests are failing?",
    aliases: ["release with failing tests"],
    summary: "I sort the failures. A red test on the changed path or on payments is a stop until we understand it. A known flake with a trace and a workaround is a risk the release owner can accept in writing. I do not hide red tests under a retry. I say what passed, what failed, and what did not run.",
    simple: "Safe enough is a decision with evidence. My job is to make the evidence clear, including the holes.",
    points: [
      "I separate a product failure from a bad test before the meeting.",
      "Accepting a failure means an owner and a follow-up, not a muted job.",
      "I would not sign a release by pointing at last week's green run.",
    ],
    related: ["pw-f-prioritize", "pw-f-rerun", "pw-c-triage"],
  }),
  lesson({
    id: "pw-f-mentor",
    group: "pw-leadership",
    title: "How do you mentor a team member who writes brittle automation?",
    aliases: ["mentor brittle automation"],
    summary: "I review one test with them and we rewrite the locator and the wait together. I show the trace of the flake and the web-first assertion that replaces the sleep. I do not collect their tests in a private fix branch. The next pull request is theirs, with a checklist they can reuse.",
    simple: "Brittle usually means they were trying to make it pass. I teach the condition to wait for, and I stay for the next review so the lesson sticks.",
    points: [
      "I point at the user-facing locator, not at a long lecture.",
      "I praise the case selection when the idea was right and the script was fragile.",
      "A team standard helps so it is not only my preference.",
    ],
    related: ["pw-f-standards", "pw-b-review", "pw-c-sleep"],
  }),
  lesson({
    id: "pw-f-standards",
    group: "pw-leadership",
    title: "How do you introduce coding standards and framework conventions across a QA team?",
    aliases: ["qa coding standards playwright"],
    summary: "I write a short page: how we locate, how we wait, where secrets go, and how a test cleans up. I apply it in review on new code first. I do not freeze the team for a month to restyle old files. When a convention is awkward, I change the convention. The examples live in the repo next to a good test.",
    simple: "A standard nobody can find will not be used. A few rules in the pull-request template, plus one sample test, are enough to start.",
    points: [
      "I invite the people who write the tests to edit the rules.",
      "Lint can catch a forgotten await or test.only. It cannot judge a bad locator. Review still matters.",
      "I measure adoption by the new tests, not by a renamed folder.",
    ],
    related: ["pw-b-review", "pw-f-mentor", "pw-f-maintain"],
  }),
  lesson({
    id: "pw-x-login",
    group: "pw-exercises",
    title: "Exercise: Login automation",
    aliases: ["exercise login success and failure"],
    summary: "I write two independent tests against an illustrative shop. One signs in with the test user and expects the account heading. The other uses a wrong password and expects the error, still on the login URL. There is no sleep. The password is a placeholder.",
    simple: "Success and failure are different tests so a broken error message cannot hide inside the happy path. Each test starts from a fresh page.",
    points: [
      "I assert the destination, not only that the URL changed.",
      "I do not share a page between the two tests.",
      "A real suite would read the user from the environment and would still not print it.",
    ],
    example: {
      code: `import { test, expect } from '@playwright/test';

test('successful login reaches the account page', async ({ page }) => {
  await page.goto('https://shop.example/login');
  await page.getByLabel('Email').fill('qa.user@example.com');
  await page.getByLabel('Password').fill('example-password');
  await page.getByRole('button', { name: 'Sign in' }).click();
  await expect(page.getByRole('heading', { name: 'Account' })).toBeVisible();
});

test('wrong password shows an error', async ({ page }) => {
  await page.goto('https://shop.example/login');
  await page.getByLabel('Email').fill('qa.user@example.com');
  await page.getByLabel('Password').fill('wrong-password');
  await page.getByRole('button', { name: 'Sign in' }).click();
  await expect(page.getByRole('alert')).toContainText('Email or password is incorrect');
  await expect(page).toHaveURL(/\\/login/);
});`,
      output: `${NOT_RUN} The first test waits for the Account heading. The second stays on login and shows the error alert.`,
    },
    questions: [
      {
        prompt: "How would you avoid typing the password in every file?",
        short: "A storage-state setup for the success path, and one remaining UI test that still submits the form.",
        detail: "The failure test must still type a bad password, or it no longer tests the form.",
      },
    ],
    related: ["pw-b-pom", "pw-b-auth", "pw-a-webfirst"],
  }),
  lesson({
    id: "pw-x-data",
    group: "pw-exercises",
    title: "Exercise: Data validation",
    aliases: ["exercise filter sort pagination"],
    summary: "I select a status filter, wait for the response that returns the filtered page, and check the visible rows against that JSON. Then I check the sort order and that pagination does not claim the full total is on one page. The host and the payload are illustrative.",
    simple: "The filter, the API list, and the table should tell the same story. Sorting and the next page are part of that story, not a separate guess.",
    points: [
      "I compare the page length with the rows, and the reported total with the API total.",
      "A string status in the table may differ in case from the JSON. I assert the contract, not an accident of CSS.",
      "This was not executed.",
    ],
    example: {
      code: `const filtered = page.waitForResponse(
  (response) => response.url().includes('/api/orders') && response.request().method() === 'GET'
);
await page.getByLabel('Status').selectOption('open');
const body = await (await filtered).json();
await expect(page.getByRole('row')).toHaveCount(body.items.length + 1);
await page.getByRole('button', { name: 'Sort by total' }).click();
await expect(page.getByRole('status')).toContainText(String(body.total));`,
      output: `${NOT_RUN} The row count allows a header row. The status text should include the API total. A stronger sort check would read only the total column and compare the numbers.`,
    },
    questions: [
      {
        prompt: "Why is reading every cell a weak sort check?",
        short: "It mixes columns. I would read only the total column and compare the numbers.",
        detail: "A follow-up is to scope the cells to that column and assert the sequence is descending.",
      },
    ],
    related: ["pw-d-ui-api", "pw-d-wait-response", "pw-a-dynamic"],
  }),
  lesson({
    id: "pw-x-flake",
    group: "pw-exercises",
    title: "Exercise: Debug a flaky test",
    aliases: ["exercise debug a timeout flake"],
    summary: "The failing test sleeps, then clicks Save, and sometimes times out. I separate a bad locator, a slow response, a detached row, and missing data. The trace shows which of those happened. The corrected test listens for the PUT and asserts the status text. It does not sleep.",
    simple: "I do not start by adding five more seconds. I name the condition that was late, then I wait for that condition.",
    points: [
      "Locator problem: the trace shows no matching control, or more than one.",
      "Synchronization: the button appears after the response. A sleep only works on a fast day.",
      "Network: the PUT is pending or failed. The UI wait cannot pass.",
      "Data: the user id in the URL was deleted by another test.",
    ],
    example: {
      code: `const saved = page.waitForResponse(
  (response) => response.url().includes('/api/profile') && response.request().method() === 'PUT'
);
await page.getByRole('button', { name: 'Save' }).click();
expect((await saved).ok()).toBeTruthy();
await expect(page.getByRole('status')).toHaveText('Saved');`,
      output: `${NOT_RUN} If this still times out, the trace should show a missing button, a failed PUT, or a status that never becomes Saved.`,
    },
    questions: [
      {
        prompt: "What tool do you open first?",
        short: "The trace of the failed attempt, then the network row for the save call.",
        detail: "A screenshot alone cannot show that the PUT returned after the sleep ended.",
      },
    ],
    related: ["pw-c-timeout", "pw-c-trace", "pw-c-race"],
  }),
  lesson({
    id: "pw-x-framework",
    group: "pw-exercises",
    title: "Exercise: Design a CI-ready framework",
    aliases: ["exercise ci ready framework"],
    summary: "I keep a small layout: config, a setup project for auth, page objects, fixtures, and tests tagged smoke or regression. CI installs browsers, runs the suite, and uploads the report and traces. Parallel workers are safe because each test uses its own context and data.",
    simple: "The design is something I can explain on a whiteboard and then show in the repo. It is not a second framework wrapped around Playwright.",
    points: [
      "playwright.config.js holds projects, retries, trace, and baseURL.",
      "tests/auth.setup.js writes storage state. Other tests load it.",
      "pages/ holds locators. fixtures/ creates data. tests/ holds the assertions.",
      "The pipeline command is install, test, then publish playwright-report and test-results.",
    ],
    example: {
      code: `tests/
  auth.setup.js
  login.spec.js
pages/
  login-page.js
fixtures/
  account.js
playwright.config.js
// CI: npx playwright install --with-deps
//     npx playwright test
// Upload playwright-report/ and test-results/`,
      output: `${NOT_RUN} This is a folder sketch. The auth file is gitignored. The pipeline must not print secrets.`,
    },
    questions: [
      {
        prompt: "What would you add only after the first pipeline is green?",
        short: "Sharding, an extra browser project, and a blob-report merge.",
        detail: "I add them when one machine is the bottleneck and the tests are already isolated.",
      },
    ],
    related: ["pw-b-design", "pw-e-pipeline", "pw-b-login-fixture"],
  }),
];
