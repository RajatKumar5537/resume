import type { ConceptLesson } from "./concepts";

const BASIS =
  "Prepared senior-level interview explanation. It is not a quotation from a saved PDF. Customize any project names before you use this answer.";

export const ADVANCED: ConceptLesson[] = [
  {
    id: "se-framework",
    group: "se-advanced",
    title: "How would you explain your Selenium framework?",
    aliases: ["automation framework", "framework architecture", "design framework from scratch"],
    basis: BASIS,
    summary:
      "I describe a small set of layers. Tests call page methods. Pages hold locators. A base class starts and closes the browser. Config and test data stay outside the test methods.",
    simple:
      "This is a sample shape, not a description of one employer project. I replace the class names with the names from the framework I am actually using.",
    example: {
      code: `public class BaseTest {
    @BeforeMethod
    public void setUp() {
        DriverFactory.set(new ChromeDriver());
    }

    @AfterMethod(alwaysRun = true)
    public void tearDown() {
        DriverFactory.quit();
    }
}`,
      output: "Each test method receives a browser in setUp. tearDown closes that browser even when the test fails. This sample was not executed here.",
    },
    points: [
      "BaseTest creates the driver and quits it.",
      "A page class holds locators and user actions for one screen.",
      "A utility class holds a shared wait, a screenshot helper, or a file reader. It does not hold test assertions.",
      "Environment values such as the URL and browser come from config, not from hardcoded strings in every test.",
      "Test data is created for that run and is not a permanent shared account when tests run together.",
      "A failure saves a screenshot, the exception, and enough log context to diagnose it.",
      "I add a layer only when several tests need it.",
    ],
    questions: [
      {
        prompt: "How would you design an automation framework from scratch?",
        short: "I start with one stable path, a page class, a driver setup, and one assertion. I add reporting, parallel execution, and data helpers after that path is reliable.",
        detail: "The first goal is a test that another person can run. Extra folders do not make the framework better.",
      },
      {
        prompt: "Why do we use the Page Object Model?",
        short: "The locator and the click live in the page class. The test describes the scenario. A UI change is fixed in one class.",
        detail: "The Page Factory lesson shows @FindBy. The design is still a page object if the class calls findElement itself.",
      },
      {
        prompt: "What is the difference between Page Object Model and Page Factory?",
        short: "Page Object Model is the structure. Page Factory is an optional way to initialize @FindBy fields. It does not replace waits or assertions.",
        detail: "I use the Page Factory lesson when the interviewer wants the annotation. I use this lesson when they want the framework shape.",
      },
      {
        prompt: "What should belong in BaseTest, BasePage, and utility classes?",
        short: "BaseTest owns setup and teardown. BasePage owns actions that every page shares, such as a wait or a visible-text check. Utilities own file, config, and screenshot helpers.",
        detail: "A base page should not become a class that knows every screen. A utility should not assert business results.",
      },
      {
        prompt: "How do you manage configuration across environments?",
        short: "I keep the URL, browser, and account names in environment config. The test reads that config. I do not copy the test class for QA and staging.",
        detail: "A property such as env=qa selects the file or the values. Secrets stay outside the Git history.",
      },
      {
        prompt: "How do you manage test data and reusable components?",
        short: "Reusable data builders create the record the test needs. Page methods are the reusable UI actions. A test does not copy a long click sequence.",
        detail: "The test-data lesson covers isolation and cleanup. This answer only places those helpers in the framework.",
      },
      {
        prompt: "How do you integrate reporting, screenshots, and logs?",
        short: "The test report shows pass or fail. A failure attaches the screenshot and the exception. The log shows the URL, browser, and the step that failed.",
        detail: "I do not turn on a heavy report tool before the tests produce a trustworthy pass and fail.",
      },
      {
        prompt: "How do you keep a framework maintainable as the number of tests grows?",
        short: "I keep tests independent, locators in page classes, and shared code in one helper. I remove a duplicate path instead of copying it into a new test.",
        detail: "A large suite fails in maintenance when five tests own five copies of the same locator.",
      },
      {
        prompt: "How do you avoid overengineering an automation framework?",
        short: "I add a feature when a real test needs it. I do not add a plugin, a custom runner, or a new layer for a problem I do not have.",
        detail: "A reviewer should be able to run one test and see where the locator, the data, and the assertion live.",
      },
    ],
    how: "The saved Selenium notes show Page Factory, TestNG, screenshots, Excel, properties, and parallel browsers. They do not describe a complete framework. Before an interview I swap ChromeDriver, the config file name, and the report tool for the ones in my project. I do not claim a tool I have not used.",
    sources: [],
    related: ["se-page-factory", "se-screenshot", "se-parallel", "se-test-data"],
  },
  {
    id: "se-ci-failure",
    group: "se-advanced",
    title: "A test passes locally but fails in Jenkins. How would you investigate?",
    aliases: ["fails in jenkins", "flaky test", "local versus ci"],
    basis: BASIS,
    summary:
      "I read the failure log and the screenshot first. Then I compare the local run with the CI run. I check the browser, the data, the waits, the config, and the network. I fix the cause I can prove.",
    simple:
      "A CI failure is not automatically a product defect. It can be timing, data, configuration, or the automation itself.",
    points: [
      "I keep the first screenshot, the stack trace, and the URL.",
      "I do not add a sleep before I know which step failed.",
      "I do not retry the job and call the failure gone.",
      "I rerun the same test after the fix, then the small group around it.",
    ],
    questions: [
      {
        prompt: "How do you identify the root cause of a flaky test?",
        short: "I look for a step that sometimes finds the element and sometimes does not. I compare several failing logs. A flake usually clusters on one wait, one shared user, or one animation.",
        detail: "If the same assertion fails the same way every time, I treat it as a stable defect until the evidence says otherwise.",
      },
      {
        prompt: "How do you handle StaleElementReferenceException?",
        short: "I find the element again after the DOM update. I wait for the new element to be ready. I do not keep the old reference.",
        detail: "The exception lesson states the meaning. One retry can cover a refresh. A locator that always goes stale still needs a better wait or a better locator.",
      },
      {
        prompt: "How do you investigate TimeoutException?",
        short: "I identify the condition that expired. I check whether the element was missing, covered, or simply late. I then change the condition or report the slow behavior.",
        detail: "Increasing the timeout hides a slow page. It does not explain the failure.",
      },
      {
        prompt: "How do you debug failures caused by dynamic elements?",
        short: "I compare the locator with the markup at the time of the failure. I look for a generated id, a delayed render, or a replaced node.",
        detail: "A partial stable attribute plus an explicit wait is the usual fix. The dynamic-element lesson shows that pattern.",
      },
      {
        prompt: "How do you capture screenshots, browser logs, and useful failure evidence?",
        short: "On failure I save the screenshot, the exception, the current URL, and the browser console when it is available. The report names the test method.",
        detail: "Evidence taken after quit() is often a blank page. I capture it before the driver closes.",
      },
      {
        prompt: "When should a failed test be retried?",
        short: "I retry once when the failure is a known infrastructure blip and the test is otherwise stable. I still keep the first failure.",
        detail: "A retry is a temporary shield for the pipeline. It is not the defect fix.",
      },
      {
        prompt: "Why is retrying a failed test not a complete solution?",
        short: "A retry can turn a red build green while the race condition remains. The team then stops trusting the suite.",
        detail: "I track tests that need the retry. I remove the retry after the cause is fixed.",
      },
      {
        prompt: "How do you distinguish an application defect from an automation defect or an environment issue?",
        short: "I reproduce the step as a user. If the product behaves wrongly, it is an application defect. If only the script cannot find a stable control, it is automation. If the service or data exists only on one machine, it is the environment.",
        detail: "I say which of the three I proved. I do not label every red test as a product bug.",
      },
      {
        prompt: "How do you prevent repeated flaky tests from reducing confidence in the regression suite?",
        short: "I quarantine a test that fails for an unfixed automation reason, and I keep it visible. The main suite should stay a signal the team believes.",
        detail: "A quarantined test still has an owner and a fix date. Hiding it forever removes coverage without saying so.",
      },
    ],
    how: "Headless mode can fail when a click needs a real viewport or when a rendering difference changes the layout. I compare a headed local run with the CI browser version before I change the test. The saved notes do not include a Jenkinsfile. I describe the investigation this way and then name the CI tool I actually use.",
    sources: [],
    related: ["se-exceptions", "se-waits", "se-dynamic", "se-screenshot", "se-cicd"],
  },
  {
    id: "se-thread-local",
    group: "se-advanced",
    title: "What is ThreadLocal for a WebDriver?",
    aliases: ["threadlocal", "thread local webdriver", "thread safe driver"],
    basis: BASIS,
    summary:
      "ThreadLocal stores a separate driver for each thread. A parallel test calls get() and receives only its own browser. remove() drops that driver after quit().",
    simple:
      "A normal static driver field is shared. Two threads would overwrite it. ThreadLocal keeps the value with the thread that set it.",
    example: {
      code: `public final class DriverFactory {
    private static final ThreadLocal<WebDriver> DRIVERS = new ThreadLocal<>();

    private DriverFactory() {
    }

    public static void set(WebDriver driver) {
        DRIVERS.set(driver);
    }

    public static WebDriver get() {
        return DRIVERS.get();
    }

    public static void quit() {
        WebDriver driver = DRIVERS.get();
        if (driver != null) {
            driver.quit();
            DRIVERS.remove();
        }
    }
}`,
      output: "Each thread keeps its own driver. quit() closes that browser and remove() clears the thread copy. This sample was not executed here.",
    },
    points: [
      "set() stores the driver on the current thread.",
      "get() returns that same driver.",
      "quit() must run in the thread that created the driver.",
      "remove() prevents a finished thread from holding a closed browser.",
      "The parallel lesson already creates a local driver inside one method. ThreadLocal helps when page classes need the driver later.",
    ],
    questions: [
      {
        prompt: "Why should parallel tests not share one mutable WebDriver?",
        short: "The second thread can replace the field while the first thread is still clicking. Both tests become invalid.",
        detail: "Isolation is the rule. ThreadLocal is one implementation of that rule.",
      },
      {
        prompt: "How do you create and clean up independent browser sessions?",
        short: "The setup method creates the driver and stores it. The teardown method quits it and removes it, including when the test fails.",
        detail: "alwaysRun = true on the TestNG teardown helps the browser close after a failure.",
      },
      {
        prompt: "How do you prevent parallel tests from conflicting over test data?",
        short: "Each test creates its own user, order, or file name. Tests do not edit one shared record at the same time.",
        detail: "A unique suffix from the thread or a UUID is enough for many cases. Cleanup still belongs to the test that created the data.",
      },
      {
        prompt: "How do you handle thread-safe reporting?",
        short: "Each thread records its own result. The build publishes one report after the threads finish. A shared writer needs synchronization if threads call it directly.",
        detail: "I do not assume a report object is safe just because the tests are safe. I name the report tool only if I have used it.",
      },
      {
        prompt: "What problems can occur when tests run concurrently?",
        short: "They can share a driver, share a user, exhaust the machine, or write logs that are hard to match to a test. The application can also reject too many sessions.",
        detail: "I read a mixed log by test name and thread. I do not guess which browser failed.",
      },
      {
        prompt: "How would you execute tests across Chrome, Firefox, and Edge?",
        short: "I select the driver from a browser parameter, with one session per thread. The parallel lesson shows the TestNG layout.",
        detail: "ThreadLocal stores whichever driver that thread created. It does not choose the browser by itself.",
      },
      {
        prompt: "When should parallel execution be limited?",
        short: "I limit it when data is shared, the environment falls over, or the extra threads add failures instead of saving time.",
        detail: "A stable serial smoke run is more useful than a fast red parallel run.",
      },
      {
        prompt: "How do you decide the appropriate thread count?",
        short: "I match the thread count to independent tests and free capacity. I measure duration and failure rate before I increase it.",
        detail: "I do not pick 20 threads because the machine has idle CPU. The browser and the application also have limits.",
      },
    ],
    how: "This class is a sample. I connect it to the browser choice in my project. I do not say a team uses ThreadLocal unless that team actually does. The saved popup note uses a driver field in the original snippet. That field is the problem this pattern avoids.",
    sources: [],
    related: ["se-parallel", "se-test-data", "se-cicd"],
  },
  {
    id: "se-cicd",
    group: "se-advanced",
    title: "How do you integrate Selenium tests with Jenkins?",
    aliases: ["jenkins", "azure pipeline", "headless", "smoke and regression"],
    basis: BASIS,
    summary:
      "Jenkins checks out the code and runs the tagged tests with Maven or the project build. The job publishes the TestNG result and the failure screenshots. A failed smoke run stops the promotion.",
    simple:
      "Smoke tests cover the critical path and stay short. Regression covers the wider agreed set and takes longer. I run smoke after a deployment. I run regression on a schedule or before a release candidate.",
    example: {
      code: `ChromeOptions options = new ChromeOptions();
options.addArguments("--headless=new");
WebDriver driver = new ChromeDriver(options);`,
      output: "Current Chrome can start with --headless=new and no visible window. This snippet was not executed here.",
    },
    points: [
      "The pipeline passes the environment and the browser. The tests do not hardcode the CI machine path.",
      "Headless mode is for the agent. I still debug a UI failure in a normal window when the screenshot is unclear.",
      "The job archives the report and the screenshots.",
      "A smoke failure fails the pipeline. I do not start a long regression on a build that already failed smoke.",
      "An Azure Pipeline can call the same Maven goal. The YAML is different. The test command can stay the same.",
      "CI-only failures are investigated with the local-versus-Jenkins lesson.",
    ],
    questions: [
      {
        prompt: "How would you configure Selenium tests in an Azure Pipeline?",
        short: "I use a pool with the browser I need, then I run the same test command I trust locally. I publish the test results and the screenshot folder.",
        detail: "I do not rewrite the tests for Azure. I change the agent image, the variables, and the publish step.",
      },
      {
        prompt: "What is the difference between smoke and regression execution?",
        short: "Smoke checks that the build is usable. Regression checks the broader set of risks we agreed to cover.",
        detail: "Smoke should finish quickly. Regression can be slower because it protects more paths.",
      },
      {
        prompt: "Which tests should run after deployment?",
        short: "I run the smoke set against the environment that was just deployed. I add a deeper check only for the area that changed when the risk is high.",
        detail: "A full regression after every small deploy can be too slow. The release lesson is where I decide whether the risk needs that cost.",
      },
      {
        prompt: "How do you run tests in headless mode?",
        short: "I add the headless argument for Chrome, or the matching Firefox option, when the agent has no display. I keep the window size explicit.",
        detail: "A missing window size can change layout and clicks. I set a size such as 1920 by 1080 when the page depends on it.",
      },
      {
        prompt: "How do you publish test reports and screenshots?",
        short: "The build stores the TestNG output and the image folder. A developer can open the failed test without logging into the agent.",
        detail: "I name files with the test name so two failures do not overwrite one screenshot.",
      },
      {
        prompt: "What should happen when smoke tests fail?",
        short: "The pipeline stops. I do not deploy further or call the build green. I share the failed check and the evidence.",
        detail: "The team fixes or reverts the cause. A waiver is a decision with an owner, not a silent rerun.",
      },
      {
        prompt: "How do you manage browser and environment configuration?",
        short: "The pipeline sets env and browser. The test reads them. QA and staging differ by config, not by a copied test class.",
        detail: "The browser version on the agent should be known. A silent browser update can change a passing test.",
      },
      {
        prompt: "How do you investigate failures that occur only in CI?",
        short: "I use the CI log, screenshot, browser version, data, and config. I compare them with the local run before I change the test.",
        detail: "The Jenkins investigation lesson is the step-by-step version of this answer.",
      },
      {
        prompt: "How do you reduce pipeline execution time without compromising useful coverage?",
        short: "I keep smoke small, run independent tests in parallel, and leave rare checks in the scheduled regression. I do not delete a critical path to save minutes.",
        detail: "I measure the slowest tests before I add threads. Parallel execution does not fix a test that waits for no reason.",
      },
    ],
    how: "The saved notes mention Jenkins and Maven as integration points. They do not include a Jenkinsfile or an Azure YAML file. I describe the command and the published evidence. I name Jenkins or Azure only for the pipeline I have actually configured. --headless=new is the current Chrome argument. Older notes sometimes say --headless alone.",
    sources: [],
    related: ["se-ci-failure", "se-parallel", "se-suite-speed", "se-batch-groups"],
  },
  {
    id: "se-suite-speed",
    group: "se-advanced",
    title: "How do you reduce the execution time of a large regression suite?",
    aliases: ["slow tests", "regression time", "automation effectiveness"],
    basis: BASIS,
    summary:
      "I find the slow tests first. I remove extra browser startups, fixed sleeps, and duplicated setup. I parallelize only the tests that are already independent.",
    simple:
      "A faster suite is not automatically a better suite. I keep the checks that protect the release, and I stop paying for setup that every test repeats.",
    points: [
      "I rank tests by duration before I change the framework.",
      "One login helper is better than fifty copied login scripts.",
      "I start the browser once per test class only when the tests can safely share that session. I do not share it across threads.",
      "A stable locator needs fewer retries and less debug time.",
      "An explicit wait ends when the condition is true. A sleep always spends the full time.",
      "I automate a case that is repeated, important, and stable enough. I leave a one-time visual check manual.",
      "I judge the suite by the defects it catches and by how often a red build is real.",
    ],
    questions: [
      {
        prompt: "How do you identify slow tests?",
        short: "I read the TestNG duration report. I inspect the tests at the top of that list before I tune anything else.",
        detail: "A three-minute test often hides a sleep, a broad setup, or a page that never reached the expected state.",
      },
      {
        prompt: "How do you reduce unnecessary browser setup and teardown?",
        short: "I create the data through the fastest reliable path. I do not open the browser to prepare a record the API or database can prepare.",
        detail: "I still isolate tests. Saving a browser by sharing one logged-in session is useful only when the tests cannot affect each other.",
      },
      {
        prompt: "How do you improve locator stability?",
        short: "I prefer an id or a stable attribute. I avoid an index that changes when the page adds a button.",
        detail: "A stable locator shortens failures. It does not need a new framework layer.",
      },
      {
        prompt: "How do you use explicit waits correctly?",
        short: "I wait for the next real condition. I keep the timeout close to the product's response time.",
        detail: "The waits lesson has the Selenium 4 methods. This answer is about not using those methods as hidden sleeps.",
      },
      {
        prompt: "How do you reduce duplicate code?",
        short: "I move a repeated action into a page method or a data helper the second time I need it. I do not build a helper for one call.",
        detail: "Duplicate locators are the usual maintenance cost in a growing suite.",
      },
      {
        prompt: "When should a test be automated, and when should it remain manual?",
        short: "I automate a repeated high-risk path. I keep manual testing for a new design, a one-time check, or a judgment a script cannot make.",
        detail: "An unstable feature can be automated later. Automating it on day one often creates a flake.",
      },
      {
        prompt: "How do you measure automation effectiveness?",
        short: "I look at critical paths covered, defects found before release, and how often a failure is a true product issue. I do not use test count as the result.",
        detail: "I avoid a percentage I have not measured. I describe the signal the team uses.",
      },
      {
        prompt: "How do you keep tests independent and repeatable?",
        short: "Each test prepares what it needs and cleans up what it creates. The result does not depend on the previous test.",
        detail: "A test that passes only after another test is not safe in parallel and not safe alone.",
      },
      {
        prompt: "How do you balance execution speed, maintainability, and test coverage?",
        short: "I protect the critical paths first. I speed up the suite by removing waste. I refuse a speed change that makes the next failure impossible to understand.",
        detail: "Coverage of every screen is weaker than reliable coverage of the paths that block a release.",
      },
    ],
    how: "I do not promise a minutes-saved number in an interview unless I have measured that suite. The method is evidence first, then the smallest change. The saved notes do not include timing results.",
    sources: [],
    related: ["se-waits", "se-locators", "se-cicd", "se-test-data"],
  },
  {
    id: "se-test-data",
    group: "se-advanced",
    title: "How do you create independent test data?",
    aliases: ["test data", "api setup", "database validation"],
    basis: BASIS,
    summary:
      "Each test creates the record it needs, with a unique value. It does not depend on a row left by another test. It removes or retires that record when the product allows cleanup.",
    simple:
      "Parallel tests collide when they edit the same user. Unique data prevents that collision. Cleanup prevents the next run from tripping over leftovers.",
    example: {
      code: `String orderId = testData.createOrder();
String apiStatus = orderApi.status(orderId);
String uiStatus = orderPage.displayedStatus();
Assert.assertEquals(uiStatus, apiStatus);`,
      output: "The UI status is compared with the API status for the same new order. This sample was not executed here.",
    },
    points: [
      "A unique email or order id keeps tests apart.",
      "Cleanup belongs to the test that created the data, in a finally or AfterMethod step.",
      "API setup is better when the UI path is long and the test is not about that setup.",
      "I still use the UI when the setup itself is the behavior under test.",
      "A database read can confirm that the screen saved the expected row. I do not treat the screen as the only proof for stored data.",
      "Duplicate records need a rule: reuse a stable fixture, or create a new row and assert that row.",
      "Environment-specific ids belong in config. They do not belong in the assertion text of every test.",
    ],
    questions: [
      {
        prompt: "How do you prevent data conflicts during parallel execution?",
        short: "I give every test its own data. I do not let two threads update one shared account.",
        detail: "A login user can be shared only for read-only steps. A write needs its own record.",
      },
      {
        prompt: "How do you clean up test data after execution?",
        short: "I delete or cancel the record in teardown. If the product cannot delete it, I mark it with a test prefix and a timestamp so the next run can ignore it.",
        detail: "A failed test should still reach cleanup. alwaysRun helps.",
      },
      {
        prompt: "How do you validate UI data against an API response?",
        short: "I create or read the entity once. I compare the value on the screen with the value from the API for that same id.",
        detail: "This is a UI test with an API check. It is not a separate API test suite.",
      },
      {
        prompt: "How do you validate data against a database?",
        short: "After the UI action, I read the row by the id the test created. I assert the column the story cares about.",
        detail: "I use a read query. I do not change production data from an assertion.",
      },
      {
        prompt: "When is API-based setup better than creating all data through the UI?",
        short: "API setup is better when the test is about a later screen and the UI setup is slow or brittle. UI setup is better when the creation flow is the risk.",
        detail: "I say which part is under test. I do not click through ten pages to prepare one checkbox.",
      },
      {
        prompt: "How do you test workflows that depend on multiple services?",
        short: "I name the service each step needs. I prepare the upstream state in the fastest safe way, then I assert the UI state the user sees.",
        detail: "If one service is down, I report an environment failure. I do not mark the UI script as the defect.",
      },
      {
        prompt: "How do you handle duplicate records and environment-specific data?",
        short: "I decide whether the test must create a new record or must find an existing one. I read environment ids from config.",
        detail: "A hardcoded QA id fails in staging. A duplicate email fails the next create.",
      },
      {
        prompt: "How do you avoid tests depending on the order in which they execute?",
        short: "Each test arranges its own starting state. None of them require a previous method to leave data behind.",
        detail: "dependsOnMethods is for a real sequence inside one scenario. It is not a way to build a hidden chain across the suite.",
      },
    ],
    how: "I do not invent a company database schema in the interview. I describe the id I created and the value I compared. SQL and API details stay at the level of the check. They are not a separate course in this lesson.",
    sources: [],
    related: ["se-thread-local", "se-framework", "se-testng-controls"],
  },
  {
    id: "se-automation-strategy",
    group: "se-advanced",
    title: "How do you decide which test cases to automate first?",
    aliases: ["what to automate", "automation roadmap", "estimate automation"],
    basis: BASIS,
    summary:
      "I automate the repeated, high-risk paths first. I estimate from the flows, the data, and the stability of the UI. I leave new or judgment-heavy checks manual until they settle.",
    simple:
      "A roadmap is an order of work. It is not a promise to automate every case. I say what is first, what waits, and why.",
    points: [
      "First coverage is the path that blocks a user or a release.",
      "I estimate in flows and unknowns, not only in a count of test cases.",
      "Regression priority follows product risk and how often the area changes.",
      "Exploratory testing stays for new behavior and for questions a script will not ask.",
      "I review the plan with the team before I turn it into a large backlog.",
    ],
    questions: [
      {
        prompt: "How do you estimate automation effort?",
        short: "I break the work into setup, page objects, data, and the risky checks. I add time for an unstable UI or missing test data.",
        detail: "I give a range when the UI is still moving. A single exact day count pretends the scope is finished.",
      },
      {
        prompt: "How do you prioritize regression coverage?",
        short: "I rank by user impact and by the chance of a break. A rare cosmetic case waits. A checkout or login path does not.",
        detail: "I revisit the ranking when the product changes. Last year's list is not automatically this release's list.",
      },
      {
        prompt: "How do you balance automation coverage with exploratory testing?",
        short: "Automation guards the known paths. Exploratory testing looks for the behavior we did not predict. I schedule both.",
        detail: "A release that only reruns old scripts can miss a new defect beside the happy path.",
      },
      {
        prompt: "How do you build an automation roadmap for a growing product?",
        short: "I list the critical journeys, the current gaps, and the next small slice. I deliver that slice before I expand the framework.",
        detail: "The roadmap names owners and what done means. It does not start with a six-month tool rewrite.",
      },
      {
        prompt: "How do you measure the effectiveness of a QA automation team?",
        short: "I look at critical paths that are protected, defects found before release, and whether a red build is trusted. I do not measure the team by the number of scripts alone.",
        detail: "I use numbers only when the team has them. I do not invent a coverage percentage.",
      },
    ],
    how: "These answers show how I would prioritize. They are not a claim about a particular release or a particular metric. I add a real example from my own work only when I can describe it accurately.",
    sources: [],
    related: ["se-suite-speed", "se-release-lead", "se-framework"],
  },
  {
    id: "se-release-lead",
    group: "se-advanced",
    title: "How do you define release readiness?",
    aliases: ["release readiness", "block a release", "critical defect"],
    basis: BASIS,
    summary:
      "A release is ready when the agreed critical paths pass, open defects are understood, and the remaining risk is accepted by the people who own the decision. I state the risk in user impact, not only in a test count.",
    simple:
      "I bring evidence. I say what passed, what failed, and what we did not test. I recommend a ship or a stop. The decision can still belong to the release owner.",
    points: [
      "Smoke on the release candidate is the minimum signal.",
      "A critical broken path with no workaround is a reason I recommend blocking the release.",
      "A defect found late gets a clear severity, a reproduction, and a choice: fix, mitigate, or defer with an owner.",
      "I tell developers, product, and leadership the same facts. I change the level of detail, not the risk.",
      "Automation work beside a deadline protects the release first. New framework work waits.",
    ],
    questions: [
      {
        prompt: "How do you review automation code written by teammates?",
        short: "I check that the test is independent, the locator is stable, the assertion matches the story, and the failure will be diagnosable. I ask why a sleep or a shared user is there.",
        detail: "I review the risk, not the formatting alone. I leave a specific change, not only a comment that the code is bad.",
      },
      {
        prompt: "How do you mentor junior automation engineers?",
        short: "I pair on one real failure. I show how to read the log, choose the locator, and keep the test small. I let them make the next change.",
        detail: "I do not rewrite their test without explaining the reason. The goal is a second person who can debug without me.",
      },
      {
        prompt: "How do you handle recurring flaky tests across the team?",
        short: "I make the flakes visible, assign an owner, and keep them out of the trusted suite until they are fixed. I look for one shared cause before I treat them as separate bugs.",
        detail: "A weekly list no one owns does not change the suite. The CI failure lesson is the technical half of this answer.",
      },
      {
        prompt: "How do you manage automation work alongside release deadlines?",
        short: "I finish the checks that protect this release. I defer framework cleanup that does not change the release risk.",
        detail: "I say what will not be automated in time. A silent gap is worse than a named gap.",
      },
      {
        prompt: "How do you communicate quality risks to developers, product managers, and leadership?",
        short: "I name the user path, the evidence, and the choice. Developers get the reproduction. Product and leadership get the impact and the recommendation.",
        detail: "I avoid a long tool lecture in that update. I attach the screenshot or the failing check.",
      },
      {
        prompt: "When would you recommend blocking a release?",
        short: "I recommend a block when a critical path fails and there is no acceptable workaround, or when we cannot tell whether that path works.",
        detail: "I do not block a release for a low-impact defect with a clear deferral. I do not approve a release by staying silent.",
      },
      {
        prompt: "How do you handle a critical defect found just before release?",
        short: "I confirm the reproduction, the user impact, and whether it exists on the release build. I recommend fix-forward or stop, and I retest the fix on that build.",
        detail: "I do not expand the moment into a framework discussion. The immediate job is the defect and the release decision.",
      },
    ],
    how: "I do not borrow a story from a company I cannot describe accurately. If I use an example, it is one I handled, with the real impact and without invented counts. The recommendation is still the same shape: evidence, impact, and a clear choice.",
    sources: [],
    related: ["se-automation-strategy", "se-ci-failure", "se-cicd"],
  },
];
