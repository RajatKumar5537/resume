import type { ConceptGroupId, ConceptLesson } from "./concepts";
import { MANUAL_SCENARIOS } from "./manual-scenarios";

const BASIS = "Prepared interview explanation. It is not a quotation from the saved PDF.";
const PDF = "Interview_PDF/Manual Testing.pdf";

export const MANUAL_GROUPS: { id: ConceptGroupId; title: string }[] = [
  { id: "mt-fundamentals", title: "Testing Fundamentals" },
  { id: "mt-types", title: "Testing Types and Execution" },
  { id: "mt-design", title: "Test Case Design" },
  { id: "mt-defects", title: "Defect Management" },
  { id: "mt-agile", title: "Agile and Project Workflow" },
  { id: "mt-scenarios", title: "Practical QA Scenarios" },
];

export const MANUAL_PATHS = [PDF];

function pdf(page: string, focus: string): ConceptLesson["sources"] {
  return [{ label: `M- Manual Testing.pdf, ${page}`, path: PDF, kind: "pdf", focus }];
}

const CORE: ConceptLesson[] = [
  {
    id: "mt-what",
    group: "mt-fundamentals",
    title: "What is software testing, and why is it required?",
    aliases: ["what is software testing", "why testing"],
    basis: BASIS,
    summary:
      "Software testing checks whether the product behaves as agreed and whether a change has broken something else. It reduces the chance of a bad release. It does not prove that the software has no defects.",
    simple:
      "I compare what the product does with what it was supposed to do. The result is evidence: passed, failed, or not tested.",
    points: [
      "A test level is where we test: unit, integration, system, or acceptance.",
      "A test type is what quality we look at: functional, performance, usability, and so on.",
      "A test technique is how we choose inputs: equivalence classes, boundaries, or error guessing.",
      "Smoke, regression, and retesting are ways of executing tests. They are not extra types of quality.",
      "The saved note describes manual testing as executing cases by hand to find defects and check the requirement. That is one way to test, not the definition of all testing.",
    ],
    sources: pdf("page 1", "Manual testing"),
    related: ["mt-manual-auto", "mt-qa-qc", "mt-func-nonfunc"],
  },
  {
    id: "mt-manual-auto",
    group: "mt-fundamentals",
    title: "What is the difference between manual testing and automation testing?",
    aliases: ["manual and automation", "automation testing", "manual testing"],
    basis: BASIS,
    summary:
      "Manual testing is a person executing the checks and judging the result. Automation is a script, in a tool such as Selenium or Playwright, that repeats those checks and reports pass or fail. I automate the stable, repeated cases. I explore and judge new behavior by hand.",
    simple:
      "The tool is faster at the same path. The person is better at a new screen, a confusing message, and a one-time investigation.",
    points: [
      "The saved note says the engineer writes a script and the tool returns pass or fail.",
      "Automation still needs a person to choose the case, the data, and what pass means.",
      "A failing script is a signal. I still confirm whether the product is wrong or the script is out of date.",
      "Manual and automated checks can cover the same scenario. The difference is who performs the steps.",
    ],
    sources: pdf("page 1", "Automation Testing"),
    related: ["mt-what", "mt-smoke", "mt-retest"],
  },
  {
    id: "mt-qa-qc",
    group: "mt-fundamentals",
    title: "What is the difference between QA, QC, and software testing?",
    aliases: ["qa qc", "quality assurance", "quality control"],
    basis: BASIS,
    summary:
      "Quality assurance is how the team prevents defects: reviews, clear stories, and a stable process. Quality control looks at the product and finds defects. Software testing is the main QC activity I do: design cases, execute them, and report what failed.",
    simple:
      "QA asks whether we are working in a way that builds the right product. QC asks whether this build actually behaves correctly.",
    points: [
      "A test case review and a requirement question are QA-style prevention.",
      "Executing the case and filing the defect are QC.",
      "In a small team the same person does both. The words still describe different goals.",
      "Testing is not a guarantee of quality. It is evidence about the areas I covered.",
    ],
    sources: [],
    related: ["mt-what", "mt-vv", "mt-review"],
  },
  {
    id: "mt-vv",
    group: "mt-fundamentals",
    title: "What are verification and validation?",
    aliases: ["verification and validation", "verification", "validation"],
    basis: BASIS,
    summary:
      "Verification asks whether we are building the product right: reviews of the requirement, the design, and the cases. Validation asks whether we built the right product: running it against user scenarios. Reviews are static. Execution is dynamic.",
    simple:
      "I can find a wrong rule in a document before anyone codes it. I can find a wrong screen only by using the build.",
    points: [
      "The saved note checks CRS, SRS, HLD, and LLD during verification, before the software is built.",
      "The same note calls validation executing cases after coding.",
      "The useful phrase matches the note: verification is building the product right, validation is building the right product.",
      "Reviews are not done only by testers. Developers, the product owner, and the customer review as well.",
      "Verification is not limited to the start of the project. A story can be reviewed again when the rule changes.",
    ],
    how: "The saved note says verification is done by test engineers before construction, and validation by test engineers after coding. That is the note’s wording. In a project, more roles join both activities.",
    sources: pdf("page 12", "Verification"),
    related: ["mt-qa-qc", "mt-review", "mt-acceptance"],
  },
  {
    id: "mt-func-nonfunc",
    group: "mt-fundamentals",
    title: "What is the difference between functional and non-functional testing?",
    aliases: ["functional and non-functional", "non-functional", "functional testing"],
    basis: BASIS,
    summary:
      "Functional testing checks what the system does: login, create, pay, pause. Non-functional testing checks how it does that: speed, load, usability, reliability, and recovery. Both can be tested manually at a basic level. Load and soak usually need a tool.",
    simple:
      "Functional asks: did the campaign pause? Non-functional asks: was the page understandable, and did it stay up under the expected users?",
    points: [
      "The saved note calls functional testing a check of each component.",
      "The same note then lists donkey, under, and optimize testing as the three types of functional testing. Those names are specific to this note. They are not standard industry types.",
      "Donkey, in the note, means a repeated or meaningless scenario. Under means too few scenarios. Optimize means a sufficient, sensible set.",
      "I use the standard types in an interview: functional, and non-functional such as performance, usability, reliability, and compatibility.",
      "Performance in the note, load through soak, is non-functional. It is not a functional type.",
    ],
    sources: pdf("page 5", "Functional Testing"),
    related: ["mt-performance", "mt-usability", "mt-black-white"],
  },
  {
    id: "mt-black-white",
    group: "mt-fundamentals",
    title: "What is the difference between black-box and white-box testing?",
    aliases: ["black box", "white box", "white-box"],
    basis: BASIS,
    summary:
      "Black-box testing uses the requirement and the screen. I do not need the source code. White-box testing uses the internal structure: branches, queries, and conditions. The saved note says white-box is checking internal code lines, done by a developer or a white-box tester, after coding.",
    simple:
      "Black-box asks what the user sees. White-box asks which path inside the code ran. A tester can do either one. White-box is not reserved for developers.",
    points: [
      "The note also calls black-box functional or behavioral testing. Functional is a test type. Black-box is a way of testing without the code. They overlap, but they are not the same word.",
      "The note already says a white-box tester, not only a developer, can do this work.",
      "A QA engineer can review a condition, an SQL filter, or an API rule without owning the product design.",
      "Gray-box uses both: I know the status values in the API and I still test from the screen.",
      "Yellow box and red box appear later in the note. I treat those as names from this note, not as standard box types.",
    ],
    sources: pdf("page 1", "Black Box"),
    related: ["mt-func-nonfunc", "mt-techniques", "mt-data-match"],
  },
  {
    id: "mt-smoke",
    group: "mt-types",
    title: "What is smoke testing, and how is it different from sanity testing?",
    aliases: ["smoke testing", "sanity testing", "smoke and sanity"],
    basis: BASIS,
    summary:
      "Smoke is a shallow check across the critical features to see if the build is worth testing. Sanity is a narrow check of one changed area to see if it is stable enough for deeper testing. The saved note first treats them as the same health check, then gives a difference.",
    simple:
      "Smoke asks: is the build alive? Sanity asks: is this fix or this feature stable enough to continue?",
    points: [
      "The note also calls smoke a dry run and a health check, and says it finds blocker defects early.",
      "The note’s table says smoke is shallow and wide, and sanity is deep and narrow.",
      "The note says smoke uses only valid input. I keep the critical happy path in smoke. A full negative suite is not smoke.",
      "The note says sanity cannot be automated. I do not use that as a rule. A stable sanity check can be a script.",
      "The note says sanity has no test cases. A short checklist is still useful. It does not have to be the full suite.",
      "Developers can run smoke. Testers can run both.",
    ],
    compare: {
      title: "Smoke and sanity",
      leftLabel: "Smoke",
      left: "Broad and shallow. Critical features, mostly valid paths. Decides whether the build can be tested.",
      rightLabel: "Sanity",
      right: "Narrow and deeper. One fix or one area, including a relevant negative check. Decides whether that area is ready for more testing.",
    },
    how: "The note says there is no difference, and then the table lists differences. I use the table’s shallow-versus-narrow idea. I do not repeat the line that sanity cannot be automated.",
    sources: pdf("page 1", "Smoke Testing"),
    related: ["mt-regression", "mt-retest", "mt-time"],
  },
  {
    id: "mt-regression",
    group: "mt-types",
    title: "What is regression testing, and how do we select the cases?",
    aliases: ["regression testing", "select regression", "full regression"],
    basis: BASIS,
    summary:
      "Regression checks that a change did not break behavior that should still work. I select cases from the impact, the changed module, and the critical business path. I do not rerun the entire suite for every small fix unless the risk needs it.",
    simple:
      "The fix is retested on its own. Regression is the neighboring behavior I am afraid the fix touched.",
    points: [
      "The note says a change is adding, modifying, removing a feature, or fixing a bug.",
      "The note’s page 2 goal is to make sure the unchanged feature is not broken.",
      "Unit regression, in the note, means testing only the change or the fix. That overlaps retesting. I call that the retest, not the regression.",
      "Regional regression, in the note, is the change plus the impacted area. That is the set I usually run.",
      "Full regression, in the note, includes the remaining features. I use it for a release candidate, not for every story.",
      "The page 3 table says regression makes sure the feature is affected. That wording fights page 2. The goal is to show it is not broken.",
      "The table also says regression uses pass test cases. I start from cases that passed before, then add the impacted ones.",
    ],
    sources: pdf("page 2", "Regression Testing"),
    related: ["mt-retest", "mt-impact", "mt-smoke"],
  },
  {
    id: "mt-retest",
    group: "mt-types",
    title: "What is retesting, and how is it different from regression?",
    aliases: ["retesting", "retest", "retest versus regression"],
    basis: BASIS,
    summary:
      "Retesting runs the failed steps again on the build that claims to fix them. Regression checks other behavior that the fix might have changed. I do both after a defect fix. Retesting is not limited to manual execution.",
    simple:
      "Retest answers: is the reported bug gone? Regression answers: did the repair break something else?",
    points: [
      "The note says retesting checks that the fixed defect is really fixed, using the failed cases.",
      "The note says regression is generic and retesting is planned. Both should be planned. The retest plan is the original defect.",
      "The note says retesting can be only manual. A stable failed case can be automated and run again.",
      "If the same bug returns, I reopen that defect with the new build and the new actual result.",
      "If a different path breaks, that is a new defect, linked to the fix.",
    ],
    sources: pdf("page 3", "Retesting"),
    related: ["mt-regression", "mt-bugfix", "mt-lifecycle"],
  },
  {
    id: "mt-exploratory",
    group: "mt-types",
    title: "What are exploratory, ad hoc, and negative testing?",
    aliases: ["exploratory testing", "ad hoc", "adhoc", "negative testing"],
    basis: BASIS,
    summary:
      "Exploratory testing is learning the product and designing the next check in the same session, then writing down what I tried. Ad hoc testing, in the note, is random testing without formal cases. Negative testing is a designed check with invalid input. They are not three names for the same thing.",
    simple:
      "Exploratory has a mission. Ad hoc is unscripted. Negative is a planned invalid case, such as a bad amount or a missing card.",
    points: [
      "The note’s exploratory flow is: understand, identify scenarios, prioritize, document, then execute.",
      "The note groups ad hoc with gorilla, monkey, negative, and out-of-the-box testing. I do not treat those as synonyms.",
      "Buddy testing in the note is a tester with a developer. Pair testing is a tester with another tester. Monkey testing is input without a logical case.",
      "The note’s examples are useful negatives: pay an unregistered number, same pickup and drop, withdraw without a card.",
      "I keep those as negative or exploratory ideas. I do not call every negative test ad hoc.",
    ],
    sources: pdf("page 7", "Exploratory"),
    related: ["mt-positive-negative", "mt-techniques", "mt-smoke"],
  },
  {
    id: "mt-integration",
    group: "mt-types",
    title: "What is integration testing?",
    aliases: ["integration testing", "top down", "bottom up"],
    basis: BASIS,
    summary:
      "Integration testing checks the data moving between modules. I can add modules one by one, or test the connected set together. The point is the handoff: the request, the response, and the saved result.",
    simple:
      "A screen can be right and still send the wrong status to the next service. Integration is that join.",
    points: [
      "The note defines it as testing the data flow between modules.",
      "Incremental means adding modules and testing as they are added.",
      "Top-down, in the note, adds a child of the previous module. Bottom-up adds a parent of the previous module.",
      "Non-incremental, in the note, gathers the modules and tests them in one shot. The note says taste. It means test. This is often called big-bang.",
      "Stubs or drivers stand in for a module that is not ready. The note does not name them. I mention them only as the usual support for top-down or bottom-up.",
    ],
    sources: pdf("page 5", "Integration Testing"),
    related: ["mt-system", "mt-data-match", "mt-mismatch"],
  },
  {
    id: "mt-system",
    group: "mt-types",
    title: "What are system testing and end-to-end testing?",
    aliases: ["system testing", "end to end", "end-to-end testing"],
    basis: BASIS,
    summary:
      "System testing exercises the integrated product in an environment close to production, against the requirements. End-to-end testing follows a business journey across features, and sometimes across systems. The note treats system testing as that end-to-end check. I keep the journey idea, and I still separate the whole-system check from one business path.",
    simple:
      "System testing asks whether this build, in a production-like setup, meets the requirement. End-to-end asks whether a user can finish the journey.",
    points: [
      "The note says system testing starts when a minimum set of features is ready.",
      "A development server is for building. A testing server is for test. Pre-production is close to production and can carry a partial business run.",
      "I do not run destructive tests on production.",
      "End-to-end, in the note, navigates the features and checks that the final feature works.",
      "A login-to-report journey can pass while a separate admin screen is still untested. I say which journey I covered.",
    ],
    sources: pdf("page 7", "System Testing"),
    related: ["mt-integration", "mt-acceptance", "mt-browsers"],
  },
  {
    id: "mt-acceptance",
    group: "mt-types",
    title: "What are acceptance, alpha, and beta testing?",
    aliases: ["acceptance testing", "alpha testing", "beta testing", "uat"],
    basis: BASIS,
    summary:
      "Acceptance testing checks real business scenarios before the customer takes the product. Alpha is the team’s test before that wider acceptance. Beta is use by end users, and their feedback decides whether it is ready for the market. Alpha does not mean the product has no defects.",
    simple:
      "Alpha is inside, before we hand it over. UAT is the business using real scenarios. Beta is a wider user group.",
    points: [
      "The note calls acceptance red box testing. That name is specific to this note. I say acceptance or UAT in an interview.",
      "The note gives four approaches: an engineer at the customer site, the end user over a period, our engineer at the customer site with their scenarios, and our engineer at our site with their scenarios.",
      "UAT in the note is the end user running the business on the software for a period.",
      "The note says alpha is done by the test engineer before acceptance, and it adds No Defect. Defects are expected in alpha. No Defect is not part of the definition.",
      "Beta, in the note, is end-user testing, and the product is released to the market from that feedback.",
    ],
    sources: pdf("page 8", "Acceptance Testing"),
    related: ["mt-system", "mt-vv", "mt-release"],
  },
  {
    id: "mt-usability",
    group: "mt-types",
    title: "What are usability and accessibility testing?",
    aliases: ["usability testing", "accessibility", "yellow box"],
    basis: BASIS,
    summary:
      "Usability checks whether a person can understand and finish the task: labels, navigation, and feedback. Accessibility checks whether people with different abilities can do that task, including keyboard use, labels, and contrast. The note’s 508 and ADA line is the accessibility topic.",
    simple:
      "Usability asks: is this easy? Accessibility asks: can someone who does not use a mouse, or who cannot see the color, still finish it?",
    points: [
      "The note’s usability list is accessible, navigation, look and feel, easy language, and easy to understand.",
      "Its checklist includes a forgot-password path, alt text for links and diagrams, a home link, and navigation on every page.",
      "The note says this feedback comes from end users.",
      "The note’s accessibility wording is about a physically challenged person. I also include vision, hearing, motor, and cognitive access, without special tools in this lesson.",
      "Yellow box, on page 8, means testing warning messages and is called a subset of usability. On page 4 the note also calls usability itself yellow box. I use usability and warning-message checks, not yellow box, as the interview terms.",
    ],
    sources: pdf("page 4", "Usability Testing"),
    related: ["mt-login", "mt-browsers", "mt-func-nonfunc"],
  },
  {
    id: "mt-performance",
    group: "mt-types",
    title: "What are load, stress, volume, soak, reliability, and recovery testing?",
    aliases: ["load testing", "stress testing", "soak testing", "recovery testing"],
    basis: BASIS,
    summary:
      "These checks ask how the system behaves under pressure. Load stays at or under the designed users. Stress goes beyond that. Volume moves a large amount of data. Soak keeps the load running for a long time. Reliability asks if it keeps working. Recovery asks how it comes back after a crash.",
    simple:
      "I do not need a performance lab to explain the difference. I do need the designed user count before I call a run load or stress.",
    points: [
      "The note defines performance as response time and stability under load.",
      "Load is less than or equal to the designed users. Stress is more than that number.",
      "Volume is a huge data transfer. Soak is continuous load for a period.",
      "Reliability, in the note, is the same function running for a long time. It is close to soak. I describe reliability as continued correct behavior, and soak as the long load run.",
      "Recovery, in the note, is how fast the software recovers from a crash. The note says crass. It means crash.",
      "These are types of non-functional testing, not functional subtypes.",
    ],
    sources: pdf("page 4", "Load Testing"),
    related: ["mt-func-nonfunc", "mt-risk", "mt-release"],
  },
  {
    id: "mt-compatibility",
    group: "mt-types",
    title: "What are compatibility, cross-browser, and globalization testing?",
    aliases: ["compatibility testing", "cross browser", "globalization", "localization"],
    basis: BASIS,
    summary:
      "Compatibility checks the product on the browsers, devices, and configurations we support. Globalization is the wider effort for more than one language and locale. Internationalization prepares the product so a locale can be added. Localization adapts it for one language, format, and currency.",
    simple:
      "Cross-browser asks: does this flow work in Chrome and Safari? Localization asks: does the Hindi or Arabic screen still show the amount and the date correctly?",
    points: [
      "The note’s comparison, or parallel, testing checks a new product against an existing one, such as two cab apps. That is a feature comparison, not browser compatibility.",
      "The note uses globalization both for developing multiple languages and for testing them.",
      "It names internationalization as I18N and localization as L10N. The 18 and 10 count the letters between the first and last letter.",
      "I test one primary browser fully and the critical path on the others.",
      "Text length, date format, currency, and right-to-left layout are the localization risks. I do not need a separate tool lesson for that.",
    ],
    sources: pdf("page 9", "Globalization"),
    related: ["mt-browsers", "mt-usability", "mt-system"],
  },
  {
    id: "mt-scenario-case",
    group: "mt-design",
    title: "What is a test scenario, and how is it different from a test case?",
    aliases: ["test scenario", "scenario versus test case", "rtm"],
    basis: BASIS,
    summary:
      "A scenario is one business situation, such as a user pausing an active campaign. A test case is the detailed check for that situation: data, steps, and the expected result. One scenario usually needs several cases.",
    simple:
      "The scenario is the story. The test case is the script for one version of that story.",
    points: [
      "I write scenarios from the requirement before I write steps.",
      "A case that cannot be failed is not a case. It needs an expected result.",
      "A traceability row links the requirement to the scenario and the case, so a change shows which checks to revisit.",
    ],
    example: {
      code: `Requirement: CAMP-12 Pause an active campaign
Scenario: User pauses a campaign that is currently active
Cases: valid pause, pause a draft, pause twice, paused campaign is not billed

RTM: CAMP-12 | Pause active campaign | TC-14, TC-15 | Status: In test`,
      output: "A planning sample. It is not a result from a project.",
    },
    sources: [],
    related: ["mt-write-case", "mt-review", "mt-campaign"],
  },
  {
    id: "mt-write-case",
    group: "mt-design",
    title: "How do you write an effective test case?",
    aliases: ["write a test case", "test case template", "effective test case"],
    basis: BASIS,
    summary:
      "An effective case has an id, a clear title, the setup, the data, numbered steps, and a result I can observe. Another tester should be able to run it without asking me what I meant.",
    simple:
      "I write the expected result before I execute. If I invent the expected result after I see the screen, I am not testing the requirement.",
    points: [
      "One case, one purpose. Do not mix login and payment in the same case.",
      "Steps are actions. Expected results are what the user or the data should show.",
      "Name the account and the build in the execution record, not only in my memory.",
      "A case review checks the name, the precondition, and the data, not only the spelling.",
    ],
    example: {
      code: `ID: TC-LOGIN-01
Title: Valid user reaches the home page
Precondition: User qa.login exists and is not locked
Data: qa.login / the test password for this environment
Steps:
1. Open the login page.
2. Enter the user and password.
3. Submit.
Expected: Home page opens. The URL does not contain the password.
Actual: filled during execution
Status: Pass or Fail`,
      output: "A login case template. The actual result is empty until the case is run.",
    },
    sources: [],
    related: ["mt-scenario-case", "mt-review", "mt-login"],
  },
  {
    id: "mt-positive-negative",
    group: "mt-design",
    title: "What are positive and negative test cases?",
    aliases: ["positive and negative", "positive testing", "invalid input"],
    basis: BASIS,
    summary:
      "A positive case uses valid input and expects the success path. A negative case uses invalid or missing input and expects a controlled rejection. The system should not crash, save bad data, or show a success message.",
    simple:
      "Positive proves the feature works. Negative proves it refuses the wrong use.",
    points: [
      "The note ties positive testing to smoke. Smoke is mostly the valid critical path. Positive testing is bigger than smoke.",
      "Negative testing is designed. It is not the same as the note’s ad hoc or monkey testing.",
      "Empty, too long, the wrong type, and a duplicate submit are typical negative ideas.",
      "The expected result of a negative case is the error or the unchanged data, not a blank actual column.",
    ],
    sources: [],
    related: ["mt-exploratory", "mt-techniques", "mt-login"],
  },
  {
    id: "mt-techniques",
    group: "mt-design",
    title: "What are equivalence partitioning, boundary values, and error guessing?",
    aliases: ["equivalence partitioning", "boundary value", "error guessing", "bva"],
    basis: BASIS,
    summary:
      "Equivalence partitioning picks one value from a group that should behave the same, plus invalid groups. Boundary analysis tests the edges of a range, just inside and just outside. Error guessing uses experience: empty submit, double click, and a copy-paste into a number field.",
    simple:
      "I do not test every number from 1 to 1000. I test a valid middle, the edges, and a value outside.",
    points: [
      "The note’s first Pressman rule: for a range, one valid and two invalid inputs.",
      "The second rule: for a set, all valid members and two invalid inputs.",
      "The third rule: for a Boolean, both true and false.",
      "Boundary analysis in the note: for A to B, test A, A+1, A-1, B, B+1, and B-1.",
      "Error guessing in the note is guessing possible errors and testing those. It adds ideas. It does not replace the range rules.",
      "These are design techniques. They are not test levels and they are not smoke or regression.",
    ],
    example: {
      code: `Amount must be 1 to 500
Equivalence: 100 valid, 0 invalid, 501 invalid
Boundaries: 0, 1, 2, 499, 500, 501
Error guess: blank amount, 500.5 if decimals are not allowed, Pay pressed twice`,
      output: "A design sample for a transfer limit. It was not executed.",
    },
    how: "The note says these techniques improve coverage. I still keep a business scenario around the numbers so the case is not only a table of inputs.",
    sources: pdf("page 9", "Equivalence"),
    related: ["mt-positive-negative", "mt-payment", "mt-write-case"],
  },
  {
    id: "mt-risk",
    group: "mt-design",
    title: "How do you prioritize test cases based on risk?",
    aliases: ["prioritize test cases", "risk based testing", "test priority"],
    basis: BASIS,
    summary:
      "I put first the cases where a failure costs money, blocks a user, or sits in the code that just changed. Layout and rare admin paths wait. I say which risks I did not have time to cover.",
    simple:
      "Priority of a case is about damage and likelihood. It is not the same as the priority field on a defect, though both ask what should happen first.",
    points: [
      "Changed code plus a payment or login path is at the top.",
      "A new validation on an amount needs the boundaries, not every old report.",
      "I keep a short not-tested list when the time is cut.",
      "Impact analysis from the team is the input. I do not guess the impact alone if the developer can point to the module.",
    ],
    sources: [],
    related: ["mt-impact", "mt-time", "mt-regression"],
  },
  {
    id: "mt-review",
    group: "mt-design",
    title: "How do you review test cases for completeness and quality?",
    aliases: ["test case review", "review checklist", "peer review"],
    basis: BASIS,
    summary:
      "I review the case against the requirement, the technique, and the header. A peer reads it before execution. Review comments are written down and then folded back into the case.",
    simple:
      "A case with no expected result, no data, or a name that does not match the steps is not ready to run.",
    points: [
      "The page 14 review asks whether the case matches the template and the standards.",
      "It asks whether the cases cover the testing techniques.",
      "It checks the header: naming, precondition, and severity. The image spells that word seviority.",
      "Mistakes go into a review template. Spelling and grammar are on the list.",
      "The reviewer checks that a team member captured the test data.",
      "After the peer review, the comments have to be incorporated. A review that nobody applies does not change the case.",
      "I also check that the expected result can be observed and that the case maps to a requirement.",
    ],
    how: "Page 14 is an image, so the saved text extract of the library PDF may not contain this checklist. The fields above are what that image shows.",
    sources: pdf("page 14", "Test Case Review"),
    related: ["mt-write-case", "mt-techniques", "mt-team"],
  },
  {
    id: "mt-bug-report",
    group: "mt-defects",
    title: "What is a defect, and what should a bug report contain?",
    aliases: ["defect report", "bug report", "good bug report"],
    basis: BASIS,
    summary:
      "A defect is a difference between the expected behavior and what the build did. A useful report lets another person reproduce it: id, project, module, version, environment, steps, expected result, actual result, severity, priority, and evidence.",
    simple:
      "I write the report for the developer who was not watching my screen. If they cannot follow the steps, the bug will bounce back.",
    points: [
      "Page 14 lists defect id, project name, module name, release or version, status, severity, priority, environment, test case id, brief description, detailed steps, precondition, test date, and found by.",
      "The image spells severity as seviority. I spell it severity in the report I file.",
      "The image says the module name is the name of the project. That repeats the project field. The module should be the feature, such as Login or Campaigns.",
      "Precondition and test date are blank on the image. I still fill both.",
      "Expected result, actual result, screenshots or logs, and the assignee are not separate lines on that image. I include them because a developer needs them.",
      "Status on the image is illustrated as an open bug. The real status follows the team’s workflow.",
    ],
    example: {
      code: `Defect ID: DEF-104
Project: Campaign desk
Module: Campaign activation
Release: 2.4.0, test environment
Status: New
Severity: Critical
Priority: P1
Test case: TC-CAMP-03
Found by: QA, 10 Oct 2026
Precondition: Campaign C-18 is a valid draft
Steps: Open C-18. Click Activate.
Expected: Status becomes Active
Actual: Status stays Draft and no error is shown
Evidence: screen recording and the API response for C-18`,
      output: "A sample report built from the page 14 fields, with expected, actual, and evidence added. It is not a defect from a live project.",
    },
    how: "Page 14 is an image of the form. The library text extract may not include it. The sample uses the image’s fields and fills the gaps the image leaves blank.",
    sources: pdf("page 14", "Defect Report"),
    related: ["mt-severity", "mt-lifecycle", "mt-rejected"],
  },
  {
    id: "mt-severity",
    group: "mt-defects",
    title: "What is the difference between severity and priority?",
    aliases: ["severity and priority", "severity", "blocker defect"],
    basis: BASIS,
    summary:
      "Severity is the impact on the business or on testing. Priority is how soon the team should fix it. A severe defect is often high priority, but a minor defect on the home page can also be high priority, and a severe defect in a rare admin path can wait.",
    simple:
      "Severity asks how bad it is. Priority asks how fast we fix it. The names and the scale change by company.",
    points: [
      "The note decides severity from the impact on the customer’s business workflow.",
      "Blocker, or show stopper: testing is blocked and the business flow is affected.",
      "Critical: the business is affected and the tester can still test other features.",
      "Major: we are not sure of the business impact. Minor: we are sure the business flow is not affected. The note’s minor examples are spelling, alignment, overlap, and color.",
      "The ATM examples: withdraw without a PIN is critical in the note, a valid PIN that cannot withdraw is a blocker, a missing confirmation is major, and a spelling mistake is minor.",
      "Priority in the note is P1 now, P2 in a later cycle of the same release, and P3 in a later release.",
      "The login failure is blocker and P1. A message sent to the wrong person is critical and P1. Remember-password failing is major and P2.",
      "I use the team’s scale in the report. I do not insist that every company has exactly these four names.",
    ],
    sources: pdf("page 10", "Severity"),
    related: ["mt-bug-report", "mt-release", "mt-risk"],
  },
  {
    id: "mt-lifecycle",
    group: "mt-defects",
    title: "What is the defect life cycle?",
    aliases: ["defect life cycle", "bug life cycle", "reopen a bug"],
    basis: BASIS,
    summary:
      "A defect moves from new, to assigned, to fixed, to retest, and then to closed. It can also be rejected, deferred, marked duplicate, or reopened. The exact names depend on the tool and the team. I follow the board we actually use.",
    simple:
      "I own the report until a developer owns the fix. I own it again when I retest. Closed means the original steps now pass.",
    points: [
      "New: I found it and the report is complete.",
      "Assigned or open: a developer is looking at it.",
      "Fixed: the developer says the build contains the repair. That is not the same as closed.",
      "Retest: I run the original steps. Closed only if they pass.",
      "Reopen if the same failure returns. A different failure is a new defect.",
      "Rejected and deferred need a reason. I do not delete the evidence.",
      "The saved note does not draw this cycle. Teams rename the states. The idea of report, fix, retest, and close stays.",
    ],
    sources: [],
    related: ["mt-retest", "mt-rejected", "mt-bug-report"],
  },
  {
    id: "mt-rejected",
    group: "mt-defects",
    title: "What do you do when a developer rejects a bug?",
    aliases: ["developer rejects a bug", "bug rejected", "not a bug"],
    basis: BASIS,
    summary:
      "I read the reason. If I missed a step or used the wrong data, I correct the report or close it as not a defect. If the build still fails the requirement, I add the evidence and ask for another look. I do not argue from memory.",
    simple:
      "A rejection is a claim that the behavior is acceptable. I compare that claim with the requirement and the recording.",
    points: [
      "Check the build, the user, and the steps they used. I may have tested an old build.",
      "If the requirement agrees with the developer, I update the case and close the defect with that note.",
      "If the requirement agrees with the report, I attach the line from the story, the response, and the screen.",
      "Ask the product owner when the expected behavior itself is disputed.",
      "Keep the status history. Reopening with new proof is better than a second copy of the same bug.",
    ],
    sources: [],
    related: ["mt-lifecycle", "mt-bug-report", "mt-team"],
  },
  {
    id: "mt-release",
    group: "mt-defects",
    title: "How do you decide whether a build is ready for release?",
    aliases: ["release readiness", "release sign-off", "test summary"],
    basis: BASIS,
    summary:
      "A build is ready when the agreed scope is tested, the open defects are known, and the remaining risk is accepted by the product owner. I do not hide a blocker to keep the date. I also do not block a release for a spelling fix unless the business says that matters.",
    simple:
      "My sign-off is a summary of coverage and open risk. The go or no-go is a team decision that uses that summary.",
    points: [
      "Smoke has passed on the release build.",
      "Stories in the scope are passed, blocked, or explicitly deferred.",
      "Fixed high-severity defects are retested.",
      "Open defects are listed with severity and a workaround if one exists.",
      "The not-tested list is visible: browsers, old modules, or missing data.",
      "A critical defect on the main path means I recommend not to release until it is fixed or the owner accepts the risk in writing.",
    ],
    example: {
      code: `Build 2.4.0 test summary
Scope: campaign pause and the login fix
Passed: 18  Failed: 1  Blocked: 2  Not run: mobile Safari
Open: DEF-104 Activate stays Draft, Critical, P1
Recommendation: do not release the activation story. Login fix is retested and can go.`,
      output: "A sign-off sample. The numbers are an illustration, not a project result.",
    },
    sources: [],
    related: ["mt-severity", "mt-time", "mt-smoke"],
  },
  {
    id: "mt-agile",
    group: "mt-agile",
    title: "What is Agile, and what happens in the Scrum meetings?",
    aliases: ["what is agile", "story point", "spill over", "spillover", "sprint review", "retrospective"],
    basis: BASIS,
    summary:
      "Agile builds the product in short cycles. A sprint is one of those cycles. Planning chooses the stories. The daily meeting surfaces blockers. The review shows what is done. The retrospective writes what to repeat and what to stop.",
    simple:
      "I do not wait for the whole product. I test the stories in this sprint and carry unfinished work honestly into the next one.",
    points: [
      "The note says Agile is incremental and iterative, and a large product is split into sprints.",
      "A story point, in the note, is the time to develop and test a story. In practice it is a relative size for the team, not a promise of hours.",
      "Spillover, in the note, is a story that does not release in this sprint and moves to the next one.",
      "The retrospective includes the team and sometimes the customer. Good and bad points are written down and used in the next sprint.",
      "The sprint review is a demo. The product owner says what is done and what is not, and the next planning is set.",
      "Planning, which the note points to at the end of the review, is where the team commits to the next set of stories. QA speaks up if the test effort is missing.",
      "A daily stand-up is the short blocker meeting. The note does not describe it. I use it to raise a blocked case the same day.",
    ],
    sources: pdf("page 13", "Agile"),
    related: ["mt-impact", "mt-team", "mt-release"],
  },
  {
    id: "mt-impact",
    group: "mt-agile",
    title: "What is impact analysis, and how do you estimate testing?",
    aliases: ["impact analysis", "estimate testing", "testing effort"],
    basis: BASIS,
    summary:
      "Impact analysis names the areas a change can break. I use that list to choose the retest and the regression. I estimate from the cases, the data setup, the browsers, and the time already lost to unclear rules.",
    simple:
      "A one-line code change can touch payment and email. The estimate follows the impact, not the size of the diff alone.",
    points: [
      "The note’s impact meeting includes the testing team, the test lead, and sometimes the customer. They document the affected area.",
      "I ask the developer which module, API, and table changed.",
      "I list the direct cases, the neighboring cases, and the smoke path.",
      "Estimation is the hours for design, data, execution, retest, and a small buffer. I do not hide the buffer.",
      "A story point is not my personal hour estimate. I still give hours when the lead asks for capacity.",
      "If the impact is unknown, I say the estimate is incomplete instead of picking a small number.",
    ],
    sources: pdf("page 13", "impact analysis"),
    related: ["mt-regression", "mt-risk", "mt-incomplete"],
  },
  {
    id: "mt-team",
    group: "mt-agile",
    title: "How do you coordinate testing with developers and the product owner?",
    aliases: ["coordinate testing", "work with developers", "product owner"],
    basis: BASIS,
    summary:
      "I share the risk and the blocked questions early. Developers get reproducible defects. The product owner gets scope, open severity, and the release recommendation. Other testers get the cases and the data so the work is not stuck with one person.",
    simple:
      "I do not save a surprise for the last day. A missing rule found on Monday is a planning problem. The same gap found on release day is a release problem.",
    points: [
      "In planning I ask for acceptance examples and the impact.",
      "In the daily meeting I name the case that is blocked and who can unblock it.",
      "A defect goes to the developer with steps and evidence, not a screenshot alone.",
      "A disputed expected result goes to the product owner.",
      "Pairing with a developer, which the note calls buddy testing, is useful when the bug cannot be reproduced.",
      "I hand another tester the data and the environment notes, not only the case title.",
    ],
    sources: [],
    related: ["mt-agile", "mt-rejected", "mt-incomplete"],
  },
];

export const MANUAL_CONCEPTS: ConceptLesson[] = [...CORE, ...MANUAL_SCENARIOS];

function plain(value: string): string {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, " ").trim();
}

export function manualById(id: string): ConceptLesson | undefined {
  return MANUAL_CONCEPTS.find((lesson) => lesson.id === id);
}

export function manualInGroup(group: ConceptGroupId): ConceptLesson[] {
  return MANUAL_CONCEPTS.filter((lesson) => lesson.group === group);
}

export function searchManualLessons(query: string): { id: string; title: string; group: ConceptGroupId; score: number }[] {
  const asked = plain(query);
  if (asked.length < 2) return [];
  return MANUAL_CONCEPTS.map((lesson) => {
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
