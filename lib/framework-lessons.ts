import type { ConceptGroupId, ConceptLesson } from "./concepts";

const REVIEW_NOTE =
  "Interview-ready answer. Documented counts and timings were not rerun for this review.";

export const FRAMEWORK_GROUPS: { id: ConceptGroupId; title: string }[] = [
  { id: "fw-pixel", title: "Pixel Checker" },
  { id: "fw-discord", title: "Discord Bot" },
  { id: "fw-afs", title: "AFS Monitoring" },
  { id: "fw-nexus-ui", title: "Nexus Campaign Validation" },
  { id: "fw-nexus-api", title: "Nexus AI Policy API Testing" },
  { id: "fw-chatkit", title: "ChatKit Astro" },
  { id: "fw-meteor", title: "Meteor Blast API Testing" },
  { id: "fw-hybrid", title: "Hybrid Driven Framework — Previous Project" },
];

export const FRAMEWORK_LESSONS: ConceptLesson[] = [
  {
    id: "fw-pixel-checker",
    group: "fw-pixel",
    title: "Pixel Checker framework design",
    aliases: ["pixel checker", "pixel verification framework", "meta pixel checker"],
    basis: `${REVIEW_NOTE} Source: unibots/pixel-checker.`,
    summary:
      "Pixel Checker is a Next.js verification service. The API receives a landing-page URL, Playwright opens the page, and the framework reads Meta and Google pixels from the page and network. Results are cached for five minutes. People use session authentication, while n8n uses an API key and can post a formatted result to Discord.",
    simple:
      "Its purpose is to reproduce a real ad visit and prove which tracking events fired, without launching a browser again for every repeated request.",
    points: [
      "Architecture: Next.js App Router UI and APIs → Playwright Chromium verification → in-memory VerificationCacheManager → Discord embed formatter.",
      "Execution flow: check the URL cache; otherwise load the page, hook fbq, inspect Meta and Google requests, extract value, currency, publisher id and style id, then cache the result.",
      "Tools: Next.js 16, React 19, Playwright as a browser library, Tailwind CSS 4, Docker, n8n, and Discord embeds.",
      "Design decisions: a 5-minute TTL keeps repeat checks fast; force refresh bypasses it; warm-up supports 5 to 200 visits; cookie and x-api-key authentication serve different callers.",
      "Validation: Meta pixel id and event, Google conversion value and currency, publisher/style ids, cache behavior, force refresh, and warm-up.",
      "Reporting: the dashboard displays results and the API can return a Discord embed for n8n.",
    ],
    how:
      "Challenge and limitation: browser verification costs more time than a normal HTTP call, which is why the short cache exists. The Jenkins shared-library call remains commented out, so Jenkins must not be described as an active integration for this repository.",
    questions: [
      {
        prompt: "Why is Playwright inside the API?",
        short: "The tracking code fires in a real browser.",
        detail: "A plain HTTP request would not reproduce the iframe, JavaScript fbq calls, or browser network requests.",
      },
      {
        prompt: "How do you avoid starting Chromium for every request?",
        short: "Use a five-minute URL cache.",
        detail: "A force-refresh option bypasses the cache when a fresh browser check is required.",
      },
      {
        prompt: "Is Jenkins running this framework?",
        short: "Not from the code reviewed.",
        detail: "The Jenkinsfile contains only a commented shared-library call.",
      },
    ],
    sources: [],
    related: ["fw-discord-bot", "fw-afs-monitoring"],
  },
  {
    id: "fw-discord-bot",
    group: "fw-discord",
    title: "Discord Bot framework design",
    aliases: ["discord bot", "discord pixel bot", "slash command framework"],
    basis: `${REVIEW_NOTE} Source: unibots/discord-bot.`,
    summary:
      "The Discord Bot is a thin command layer for pixel checks, cache creation, and verification. discord.js receives a slash command, routes it to a separate command module, checks channel restrictions, and replies with a Discord embed.",
    simple:
      "The bot does not contain the main verification architecture. It gives operations users a controlled Discord entry point to those actions.",
    points: [
      "Architecture: bot index and interaction router → pixel, cache_create, and verify command modules → Discord reply or embed.",
      "Execution flow: receive the slash command, read its options and user, validate the channel id, perform the command, and return the result.",
      "Tools: discord.js 14 and dotenv. The token and allowed verification channels come from environment variables.",
      "Design decision: command modules separate the actions, and ALLOWED_VERIFY_CHANNELS prevents verify from running in every server channel.",
      "Validation: command routing, required URL input, approved-channel behavior, and rejection outside approved channels.",
      "Reporting: the visible output is a Discord message or embed; no automated test report is documented.",
    ],
    how:
      "Challenge and limitation: the README still contains create-next-app starter content and Next.js files remain under src/app. package.json starts node src/bot/index.js, so the bot is the runtime described here; the leftover Next material is not presented as a completed integration.",
    questions: [
      {
        prompt: "Why restrict the verify command by channel?",
        short: "It keeps operational verification in approved channels.",
        detail: "The handler checks interaction.channelId before it performs the request.",
      },
      {
        prompt: "What does npm start run?",
        short: "node src/bot/index.js.",
        detail: "That script is the evidence for the runtime even though the README still describes Next.js.",
      },
    ],
    sources: [],
    related: ["fw-pixel-checker", "fw-afs-monitoring"],
  },
  {
    id: "fw-afs-monitoring",
    group: "fw-afs",
    title: "AFS Monitoring framework design",
    aliases: ["afs monitoring", "kafka monitoring framework", "iframe monitoring"],
    basis: `${REVIEW_NOTE} Source: unibots/afs-monitoring.`,
    summary:
      "AFS Monitoring receives ad iframe events, validates them with Zod, sends them through Kafka, and correlates URL health in Redis. It stores the health result in MongoDB and sends Discord outage or recovery alerts.",
    simple:
      "The HTTP endpoint accepts the signal quickly. A Kafka consumer performs the state tracking and notification work separately.",
    points: [
      "Architecture: Express ingest route → Zod event schema → Kafka producer and consumer → Redis correlator → MongoDB HealthResult → Discord notification.",
      "Data flow: POST /track-event validates the body; the consumer normalizes the URL; Redis stores the failure state; five failures trigger an outage; iframe_rendered or iframe_stable can trigger recovery.",
      "Tools: Express 5, Zod, KafkaJS, ioredis, Mongoose, Pino, Docker Compose, Zookeeper, Kafka, Redis, MongoDB, and Discord.",
      "Design decisions: validate before publishing; use Redis for live correlation; use MongoDB for persistent status; keep Discord as notification rather than source of truth.",
      "Validation strategy should cover invalid schemas, the five-failure threshold, a single alert, and recovery after a healthy event.",
      "Reporting: Discord outage and recovery notifications. No automated test report is documented.",
    ],
    how:
      "Challenges and limitations: no test suite is documented and npm test exits with code 1. The schema contains iframe_failed while the correlator also checks iframe_not_created, so those event names should not be claimed to be fully aligned.",
    questions: [
      {
        prompt: "Why use Kafka instead of writing Redis in the route?",
        short: "It separates ingestion from processing.",
        detail: "A slow correlator or Discord request does not have to hold the tracking request open.",
      },
      {
        prompt: "What automated suite is available?",
        short: "None is documented.",
        detail: "The package test script deliberately exits with code 1, so a passing suite must not be claimed.",
      },
    ],
    sources: [],
    related: ["fw-pixel-checker", "fw-discord-bot"],
  },
  {
    id: "fw-nexus-campaign",
    group: "fw-nexus-ui",
    title: "Nexus Campaign Validation framework design",
    aliases: ["nexus campaign validation", "nexus dashboard framework", "nexus playwright"],
    basis: `${REVIEW_NOTE} Source: unibots/Nexus_Campaign_validation.`,
    summary:
      "Nexus Campaign Validation is a Playwright Page Object Model framework. Login, dashboard, and campaign pages have their own classes. Smoke tests verify that pages and controls work, while data tests verify dashboard totals and profit, ROI, and margin formulas. GitHub Actions runs Playwright and stores the HTML report.",
    simple:
      "Smoke answers whether the dashboard opened. Data validation answers whether the financial numbers displayed by that dashboard are correct.",
    points: [
      "Architecture: Playwright specs → shared helpers → BasePage, LoginPage, DashboardPage and CampaignPage → Nexus UI and channel API.",
      "Execution flow: log in from environment config, wait for the dashboard, select dates and filters, parse cards, rows and footer values, then compare the displayed metrics.",
      "Tools: Playwright on Chromium, dotenv, HTML reporter, Tesseract, pdf-parse, and GitHub Actions.",
      "Design decisions: smoke and data suites stay separate; formatted AED and percentages are parsed by helpers; full client reconciliation allows a documented 1 AED tolerance.",
      "Scenarios: sidebar routes, dashboard controls, users/profile/placement/creative pages, campaign controls, cards versus footer, profit = revenue − spend, ROI, margin, column toggles, and client reconciliation.",
      "Reporting and CI: two retries and one worker in CI, trace on first retry, HTML report uploaded for 30 days.",
    ],
    how:
      "Challenges and limitations: the full client reconciliation is documented at about 12 minutes, so fast data scripts exclude it. Smoke is documented at about 42 seconds. These timings were not rerun. Firefox, WebKit, and mobile projects are present in config but commented out.",
    questions: [
      {
        prompt: "Why separate smoke and data validation?",
        short: "They answer different failure questions.",
        detail: "Smoke detects a broken page or control. Data validation detects a wrong total or formula.",
      },
      {
        prompt: "How are formatted financial values compared?",
        short: "A helper removes commas, currency text, and percent signs.",
        detail: "The parsed numbers can then be checked against totals and formulas.",
      },
      {
        prompt: "Were the documented timings rerun?",
        short: "No.",
        detail: "They come from the repository framework summary and are identified as documented values.",
      },
    ],
    sources: [],
    related: ["fw-nexus-policy"],
  },
  {
    id: "fw-nexus-policy",
    group: "fw-nexus-api",
    title: "Nexus AI Policy API Testing framework design",
    aliases: ["nexus ai policy api", "policy api testing", "policy review framework"],
    basis: `${REVIEW_NOTE} Source: unibots/nexus-ai-policy-api-testing.`,
    summary:
      "The Nexus Policy harness treats the policy PDF as the source of truth. Every API execution receives a unique run folder containing the exact request, fresh response, and validation. The expected and actual verdicts are compared, secrets are redacted, and Jenkins can publish Allure and audit reports.",
    simple:
      "The framework is designed for evidence: it must prove what was sent, what came back in that exact run, and why the verdict passed or failed.",
    points: [
      "Architecture: authoritative PDFs and permanent payloads → campaign runner → policy API client → immutable run evidence → preflight gate → Allure, CTO and technical reports.",
      "Execution flow: load payload, create run id, save request.json, POST the API, save response.json and validation.json, then update authoritative_runs.json.",
      "Tools: Node built-in test runner, Allure, pdf-parse, pdfjs, Tesseract, @napi-rs/canvas, and Jenkins.",
      "Design decisions: never reuse an old response; require payload/request parity; preserve historical folders; read the token from environment variables; scan artifacts for token leakage.",
      "Validation: 59 campaigns—29 approve, 23 reject and 7 escalate. Verdict match passes, mismatch fails, and blocked cases skip. Harness tests cover execution, source paths, pre-API and source integrity.",
      "Reporting and CI: timestamped CTO and technical PDF/HTML reports, Allure attachments, and Jenkins modes for report-only, all, section, or single campaign.",
    ],
    how:
      "Critical limitation: APP-10 has no destination URL in the source PDF. It is recorded as BLOCKED without dispatching a request or inventing a response. API tokens must be redacted from evidence. The documented campaign counts were not independently rerun.",
    questions: [
      {
        prompt: "Why preserve every run folder?",
        short: "New evidence must not overwrite old evidence.",
        detail: "The registry points to the authoritative current run while older executions remain available for audit.",
      },
      {
        prompt: "How is APP-10 handled?",
        short: "It is blocked before the API.",
        detail: "There is no destination URL, so the runner records the blocked state and creates no fake response.",
      },
      {
        prompt: "How are tokens protected?",
        short: "Read them from the environment and redact reports.",
        detail: "Preflight also scans generated artifacts for exposed authorization values.",
      },
    ],
    sources: [],
    related: ["fw-nexus-campaign"],
  },
  {
    id: "fw-chatkit-astro",
    group: "fw-chatkit",
    title: "ChatKit Astro framework design",
    aliases: ["chatkit astro", "chat socket testing", "chatkit framework"],
    basis: `${REVIEW_NOTE} Source: unibots/chatKit_Astro.`,
    summary:
      "ChatKit Astro uses service objects for authentication, rooms, messages and wallet operations, plus Socket.IO clients for chat and calls. Jest scenarios exercise REST and real-time behavior in sequence, and Allure and Jenkins publish the results.",
    simple:
      "The test describes a conversation while service objects hide request construction and socket clients hide connection and acknowledgement handling.",
    points: [
      "Architecture: Jest scenario → auth/room/message/wallet services or chat/call socket client → staging ChatKit and Astro services → Allure.",
      "Execution flow: authenticate, create or load a room, connect with JWT, send a message, assert the acknowledgement and receiver event, then verify history or billing state.",
      "Tools: Jest 30, Axios, socket.io-client, dotenv, jest-allure2-reporter, and Jenkins.",
      "Design decisions: runInBand avoids shared staging-user collisions; clientMessageId provides idempotency; MongoDB is source of truth while Redis is the low-latency projection described by the service README.",
      "Scenarios: one pair, one astrologer with two users, four-room matrix, block/unblock, offline cursor sync, unlock modes, moderation, duplicate prevention, FCM lifecycle, rate limiting, and call billing.",
      "Reporting: Allure results and HTML dashboard from the Jenkins pipeline.",
    ],
    how:
      "Challenge: shared users and rooms make parallel tests unsafe. Paid-message scenarios also depend on the Astro authorization service. The playbook documents 10 suites and 94 tests; that count was not rerun for this review.",
    questions: [
      {
        prompt: "Why does Jest run in band?",
        short: "The scenarios share staging users and rooms.",
        detail: "Parallel files could block, bill, or message the same room and make the result unreliable.",
      },
      {
        prompt: "How is duplicate sending tested?",
        short: "Send the same clientMessageId twice.",
        detail: "The second acknowledgement should report a duplicate and the unread count should not increase again.",
      },
      {
        prompt: "What happens if Redis is unavailable?",
        short: "MongoDB remains the source of truth.",
        detail: "The service documentation says Redis misses should not fail send, read, or history operations.",
      },
    ],
    sources: [],
    related: ["fw-meteor-blast"],
  },
  {
    id: "fw-meteor-blast",
    group: "fw-meteor",
    title: "Meteor Blast API Testing framework design",
    aliases: ["meteor blast", "meteor blast api", "tournament testing framework"],
    basis: `${REVIEW_NOTE} Source: unibots/Meteor_Blast_API_Testing.`,
    summary:
      "Meteor Blast uses Axios for account, wallet and tournament setup, then Socket.IO for the live match lifecycle. Jest covers API behavior and tournament scenarios. Stress workers run multiple tournaments and report p50 and p95 match durations, with Allure and Jenkins used for reporting.",
    simple:
      "REST prepares the players and tournament. Sockets reproduce the part of the game that happens live.",
    points: [
      "Architecture: Jest spec or stress runner → Axios API client and auth/tournament helpers → REST APIs plus Socket.IO match events → Allure.",
      "Execution flow: create or log in players, credit wallets, join through REST, subscribe to the tournament socket, start matches, submit scores, and validate completion and rewards.",
      "Tools: Jest 30, Axios, socket.io-client, dotenv, Allure, and Jenkins. Every request sends an app-version header.",
      "Design decisions: Axios accepts every HTTP status so the test asserts it; Authorization is replaced with Bearer *** in Allure; exhausted guest players are replaced and saved back to the stress data.",
      "Scenarios: health, auth, guest flow, profile, wallet, leagues, leaderboard, protected routes, tournament discovery, score, forfeit, full lifecycle, malformed API input, concurrent join and parallel tournaments.",
      "Reporting: Jest Allure report plus stress summaries with p50, p95 and max match durations.",
    ],
    how:
      "Challenges: guest accounts have play limits. Parallel groups must wait for the current tournament to become active before joining the next group, or the backend can pool all human players into one room. The walkthrough documents 13 suites, 30 passed and 1 skipped; those results were not rerun.",
    questions: [
      {
        prompt: "Why is the match tested over Socket.IO?",
        short: "The product moved the match lifecycle to socket events.",
        detail: "The helper follows tournament subscribe, match start, and submit score instead of using the old REST match calls.",
      },
      {
        prompt: "What are p50 and p95?",
        short: "They are latency percentiles.",
        detail: "p50 is the middle match duration. p95 means 95 percent of measured matches completed at or below that duration.",
      },
      {
        prompt: "How are tokens protected in reports?",
        short: "Sanitize the request headers before attaching them.",
        detail: "Authorization is replaced with Bearer *** in the Allure attachment.",
      },
    ],
    sources: [],
    related: ["fw-chatkit-astro"],
  },
  {
    id: "fw-hybrid-driven",
    group: "fw-hybrid",
    title: "Hybrid Driven Automation Framework — Previous Project",
    aliases: ["hybrid framework", "hybrid driven automation", "selenium framework design"],
    basis:
      "This previous Java/Selenium framework is separate from the seven newer Node.js repositories.",
    summary:
      "My previous framework is hybrid: Excel and properties files supply data and configuration, reusable methods supply common actions, and modules keep scripts separate. TestNG manages browser, login, test, logout and close lifecycle. Maven builds it, Extent Reports and listeners record results and failure screenshots, and Jenkins or Azure Pipelines can run it from version control.",
    simple:
      "Data-driven means the inputs are outside the script. Method-driven means common actions are reusable. Modular-driven means each business area has separate scripts.",
    points: [
      "Architecture: Maven project and pom.xml → generic Base Class → page objects and reusable utilities → modular test scripts → Excel and properties data → reports and screenshots.",
      "Execution flow: TestNG XML starts the suite; BeforeTest opens the browser; BeforeMethod logs in; Test executes; AfterMethod logs out; AfterTest closes the browser.",
      "Tools: Java, Selenium, TestNG, Apache POI, Excel, properties files, Maven, POM, Extent Reports, listeners, Git, Bitbucket, Jenkins, and Azure Pipelines.",
      "Design decisions: remove hardcoding; use Apache POI for multiple data sets; separate locators with POM; centralize waits, assertions and logging; capture failure screenshots through listeners.",
      "Testing: functional, regression, cross-browser, API, data-driven, smoke, integration and end-to-end. Exploratory, one-time, highly dynamic, usability and subtle visual checks remain manual.",
      "Reporting and CI: TestNG HTML plus Extent Reports; listeners save screenshots; Maven runs from a Jenkins or Azure YAML job triggered by a commit, pull request, schedule, or manual action.",
    ],
    how:
      "Challenges are flaky tests, long execution time, environment dependency, and parallel conflicts. Improve the framework with stable waits, reusable methods, config separation and CI. Handle NoSuchElementException and TimeoutException with targeted exception handling and report the details. Coordinate larger teams through divided work and regular stand-ups.",
    questions: [
      {
        prompt: "What did you refactor?",
        short: "I introduced page objects and reusable utilities and removed hardcoded data.",
        detail: "Inputs moved to Excel and properties; waits, logs and assertions moved to common methods.",
      },
      {
        prompt: "What is Maven's role?",
        short: "Maven builds and manages the Java project.",
        detail: "pom.xml declares dependencies and plugins for compilation, test execution and reports.",
      },
      {
        prompt: "How does Azure Pipelines run it?",
        short: "A YAML pipeline defines stages, jobs and Maven steps.",
        detail: "A push, pull request, schedule, or manual trigger starts an agent and the job logs show any failure.",
      },
      {
        prompt: "What should remain manual?",
        short: "Exploratory, one-time, unstable UI, usability and subtle visual checks.",
        detail: "Those cases depend on human judgment or change too often to repay automation maintenance.",
      },
    ],
    sources: [],
    related: ["fw-nexus-campaign"],
  },
];

export function frameworkById(id: string): ConceptLesson | undefined {
  return FRAMEWORK_LESSONS.find((lesson) => lesson.id === id);
}

export function frameworkInGroup(group: ConceptGroupId): ConceptLesson[] {
  return FRAMEWORK_LESSONS.filter((lesson) => lesson.group === group);
}

function plain(value: string): string {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, " ").trim();
}

export function searchFrameworkLessons(query: string): { id: string; title: string; group: ConceptGroupId; score: number }[] {
  const asked = plain(query);
  if (asked.length < 2) return [];
  return FRAMEWORK_LESSONS.map((lesson) => {
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
