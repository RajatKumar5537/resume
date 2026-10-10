import type { ConceptLesson } from "./concepts";

const BASIS = "Prepared interview explanation. It is not a quotation from the saved PDF.";

export const MANUAL_SCENARIOS: ConceptLesson[] = [
  {
    id: "mt-login",
    group: "mt-scenarios",
    title: "How would you test a login page?",
    aliases: ["login page", "test login", "sign in testing"],
    basis: BASIS,
    summary:
      "I learn the expected login rules first, then test the valid path, the invalid paths, and what the user can do after login. I also check lockout, logout, and the password-reset entry if the story includes them.",
    simple:
      "A login page is small, but it guards everything behind it. I treat a wrong password and a blocked account as part of the test, not as extras.",
    points: [
      "Confirm the rule: which field is the user id, what a valid password looks like, and whether the account locks.",
      "Happy path: valid user, correct password, user lands on the home screen, and the session belongs to that user.",
      "Empty fields, wrong password, unknown user, and password over the length limit.",
      "Leading spaces, different letter case, and the show-password control if it exists.",
      "After several bad attempts, check the lock or the error the requirement describes. Do not invent a lockout rule.",
      "Logout, browser Back, and a second login as another user.",
      "Evidence: the message text, the URL, and the account used. No real customer password in the bug report.",
    ],
    example: {
      code: `Scenario: Valid user signs in
Steps: Open login. Enter a known user and the right password. Submit.
Expected: Home page opens for that user. The password is not shown in the URL.

Scenario: Wrong password
Steps: Enter the same user and a wrong password. Submit.
Expected: Login stays closed. The message does not reveal whether the user id exists.`,
      output: "These are scenarios, not a pass result. The exact message comes from the requirement.",
    },
    sources: [],
    related: ["mt-positive-negative", "mt-write-case", "mt-bug-report"],
  },
  {
    id: "mt-payment",
    group: "mt-scenarios",
    title: "How would you test a payment or money-transfer workflow?",
    aliases: ["payment testing", "money transfer", "test a payment"],
    basis: BASIS,
    summary:
      "I follow one transfer from the amount screen to the confirmation, then check that a failure does not move money. Boundaries, a double submit, and the receipt matter more than the color of the button.",
    simple:
      "Money tests need a before and after balance. If I only look at the success message, I can miss a double charge.",
    points: [
      "Confirm the minimum, maximum, fee, and what a successful status is called.",
      "Use test accounts. Record the balance before the transfer.",
      "Valid amount inside the limit, then the minimum, one unit below the minimum, the maximum, and one unit above it.",
      "Insufficient funds, a closed receiver, and sending to the same account if the rule forbids it.",
      "Submit once and confirm the reference. Submit twice quickly and confirm one debit, not two.",
      "Failed payment: message is clear, balance is unchanged, and no success receipt is stored.",
      "Retest a failed transfer after the fix, then run one unchanged successful transfer as regression.",
    ],
    example: {
      code: `Test data: sender balance 1000, limit 500, fee 0
Valid: send 500. Expected balance 500. Status Paid. One reference id.
Boundary: send 0 and 501. Expected: both blocked, balance stays 1000.
Double submit: send 100 and press Pay twice. Expected: one debit of 100.`,
      output: "Sample data for a practice transfer. It is not a result from a live payment system.",
    },
    sources: [],
    related: ["mt-techniques", "mt-data-match", "mt-retest"],
  },
  {
    id: "mt-campaign",
    group: "mt-scenarios",
    title: "How would you test campaign creation and activation or pause?",
    aliases: ["campaign testing", "campaign activation", "pause campaign"],
    basis: BASIS,
    summary:
      "I test the campaign as a status flow: draft, active, and paused. Creation checks the required fields. Activation checks that it can start. Pause checks that it stops. I also check that a bad date or a zero budget cannot go live.",
    simple:
      "The risk is not the form alone. The risk is a campaign that says Active while it is not delivering, or a paused campaign that still spends.",
    points: [
      "List the required fields: name, dates, budget, and destination. Note which edits are allowed after activation.",
      "Create a draft with valid data and confirm it is not live yet.",
      "Leave a required field empty. A past end date and a budget of 0 stay drafts or show a clear error.",
      "Activate a valid draft. The status, start time, and any review banner match the rule.",
      "Pause it. Confirm new delivery stops and the status says Paused. Activate it again if the story allows that.",
      "Edit the name while it is active, if editing is allowed, and confirm the live record changes once.",
      "Check the list, the detail page, and the export or API for the same status.",
    ],
    sources: [],
    related: ["mt-filters", "mt-data-match", "mt-risk"],
  },
  {
    id: "mt-filters",
    group: "mt-scenarios",
    title: "How would you test filters, sorting, pagination, and CSV exports?",
    aliases: ["filters and sorting", "pagination", "csv export"],
    basis: BASIS,
    summary:
      "I compare the filtered list with a known set of rows. Sort has a direction. Pagination does not drop or repeat the last row. The CSV contains the filtered rows, not the whole table, unless the requirement says otherwise.",
    simple:
      "I seed a small set of rows whose status, date, and name I already know. Then the screen has something to prove.",
    points: [
      "Prepare rows that cover each filter value, including one that matches nothing.",
      "Apply one filter and count the rows. Apply two filters together.",
      "Clear filters and confirm the full list returns.",
      "Sort by name and by date, both directions. A tie should not shuffle the page into a missing row.",
      "Page size, first page, last page, and a page number past the end.",
      "Export after a filter. Open the file and match the row count and one known id.",
      "Empty export: headers are present and there are no leftover rows from the previous filter.",
    ],
    sources: [],
    related: ["mt-campaign", "mt-data-match", "mt-write-case"],
  },
  {
    id: "mt-data-match",
    group: "mt-scenarios",
    title: "How would you check that the UI matches the API and the database?",
    aliases: ["ui api database", "data mismatch", "api and database"],
    basis: BASIS,
    summary:
      "I pick one record id and compare the same fields in the UI, the API response, and the database. I watch status names, time zones, and amounts. A label on the screen can be right while the stored value is wrong, or the other way around.",
    simple:
      "I do not sample three different records and call that a match. One id, three places, the same fields.",
    points: [
      "Choose the fields that matter: status, amount, updated time, and owner.",
      "Read the UI. Call the API for that id. Read the database row for that id.",
      "Map names. The UI may say Paused while the API says PAUSED and the table says 2.",
      "Check time zone and currency. A date can look one day off and still be the same instant.",
      "Create or update from the UI, then read the API and the table again.",
      "Update the table only when the test environment allows it, then refresh the UI.",
      "File the defect against the layer that is wrong, and attach all three values.",
    ],
    sources: [],
    related: ["mt-mismatch", "mt-bug-report", "mt-campaign"],
  },
  {
    id: "mt-incomplete",
    group: "mt-scenarios",
    title: "How would you test a feature when the requirements are incomplete?",
    aliases: ["incomplete requirements", "changing requirements", "missing requirements"],
    basis: BASIS,
    summary:
      "I write down what is known, what is missing, and what I will assume. I test the agreed path. I do not invent a business rule and then fail the build for breaking it.",
    simple:
      "An open question is a test risk. I raise it early, keep testing the parts that are clear, and mark the rest as not covered.",
    points: [
      "List the decisions that block a test: who can click Activate, what the error text is, what happens to in-flight work.",
      "Ask the product owner in writing. Include a suggested default so the question is easy to answer.",
      "Test the paths that are already agreed.",
      "For a changing rule, mark the old cases and add the new ones. Do not keep both as expected.",
      "In the summary, separate tested, blocked, and assumed.",
      "If the rule arrives late, retest the affected cases and say which old results are no longer valid.",
    ],
    sources: [],
    related: ["mt-impact", "mt-team", "mt-risk"],
  },
  {
    id: "mt-bugfix",
    group: "mt-scenarios",
    title: "How would you test a bug fix without breaking existing behavior?",
    aliases: ["test a bug fix", "retest a defect", "fixed but fails again"],
    basis: BASIS,
    summary:
      "I retest the exact failed steps first. Then I test the nearby inputs and one unchanged path that uses the same code. If the original bug is back, I reopen it with the new evidence instead of filing a vague second bug.",
    simple:
      "A fix can solve the reported click and break the next click. Retesting and a small regression are both part of the check.",
    points: [
      "Read the original steps, data, and build. Use the build that contains the fix.",
      "Repeat the failed steps. The expected result is the one in the defect, not a new wish.",
      "Try the boundary next to the bug, such as one character less and one character more.",
      "Run the closest happy path that should still pass.",
      "If it fails again, reopen the same defect. Add the build number, the new actual result, and the screenshot.",
      "If a different behavior breaks, file a separate defect and link it to the fix.",
      "The saved note calls a retest manual only. A stable automated case can cover the same failed steps.",
    ],
    sources: [],
    related: ["mt-retest", "mt-regression", "mt-lifecycle"],
  },
  {
    id: "mt-prod",
    group: "mt-scenarios",
    title: "How would you test a production issue that cannot be reproduced in staging?",
    aliases: ["production issue", "cannot reproduce", "works in staging"],
    basis: BASIS,
    summary:
      "I collect the user, time, browser, request, and data before I keep retrying. Staging and production often differ by config, flag, or data. I do not change production records to force the bug.",
    simple:
      "Cannot reproduce is a result only after I have compared the environment. It is not the first answer.",
    points: [
      "Ask for the account id, the time, the browser, and what the user expected.",
      "Compare build version, feature flag, and config between staging and production.",
      "Read the log or the API response for that time. Look for a timeout, a 4xx, or a 5xx.",
      "Compare the production record with the staging copy: status, null fields, and dates.",
      "If policy allows, copy the record into a test environment and retry there.",
      "If it still cannot be reproduced, report what was compared and what evidence is missing.",
      "Add a regression check once the cause is known, so the next build covers it.",
    ],
    sources: [],
    related: ["mt-bug-report", "mt-mismatch", "mt-release"],
  },
  {
    id: "mt-time",
    group: "mt-scenarios",
    title: "How would you decide what to test when there is very little time?",
    aliases: ["little time", "not enough time", "what to test first"],
    basis: BASIS,
    summary:
      "I test the changed area, the money or access path, and the bugs that would stop a user. I say what I did not test. Cosmetic checks wait.",
    simple:
      "A short test pass is still a decision. I would rather cover login and payment than half of every screen.",
    points: [
      "Ask what changed and what the release must not break.",
      "Run a smoke of login, the main business path, and the changed screen.",
      "Retest open high-severity defects that are marked fixed.",
      "Skip layout polish unless the change is visual.",
      "Write the not-tested list in the summary: browsers, old reports, and admin-only screens.",
      "If a blocker appears, stop and tell the team. Do not quietly finish the rest of the list.",
    ],
    questions: [
      {
        prompt: "A critical defect is found just before release. What do you do?",
        short: "I confirm it on the release build, report severity and priority, and say whether the business path is blocked.",
        detail: "The release decision belongs to the product owner and the lead. My job is the evidence, the affected users, and a workaround if one exists. I do not close it to protect the date.",
      },
    ],
    sources: [],
    related: ["mt-release", "mt-risk", "mt-smoke"],
  },
  {
    id: "mt-mismatch",
    group: "mt-scenarios",
    title: "How would you investigate a mismatch between the frontend and the backend?",
    aliases: ["frontend backend mismatch", "ui and api mismatch"],
    basis: BASIS,
    summary:
      "I capture the request the screen sent and the response the server returned. Then I see whether the UI mapped that response correctly. The bug may be the payload, the mapping, or a stale screen.",
    simple:
      "I stop arguing from the screenshot alone. The network response is the contract for that click.",
    points: [
      "Note the field, the record id, and the value on the screen.",
      "Find the request in the browser network log. Save the status code and the body.",
      "If the response is already wrong, the backend or the data is the first place to look.",
      "If the response is right and the screen is wrong, the UI mapping, cache, or an old list is the first place to look.",
      "Refresh, hard reload, and a second user. A stale cache should not be filed as a data bug.",
      "Attach the screenshot and the response to the same defect.",
    ],
    sources: [],
    related: ["mt-data-match", "mt-bug-report", "mt-prod"],
  },
  {
    id: "mt-browsers",
    group: "mt-scenarios",
    title: "How would you plan testing for a new feature on desktop and mobile browsers?",
    aliases: ["cross browser plan", "desktop and mobile", "browser testing plan"],
    basis: BASIS,
    summary:
      "I run the full new-feature checks on the main desktop browser. I run the critical path on the other desktop browsers and on one phone-size browser. I do not repeat every negative case on every device unless the risk is layout or a device-only control.",
    simple:
      "Browser coverage is a risk choice. The business path must work. The rare browser does not need the entire suite.",
    points: [
      "Agree the set: usually Chrome, Firefox, Safari or Edge, plus one mobile width.",
      "Full cases on the primary browser, including negative and boundary checks.",
      "Smoke the same feature on the other browsers: open, complete the main action, see the result.",
      "On mobile, check the small screen, the keyboard covering a field, and a sticky button.",
      "File browser bugs with the browser name, version, and viewport.",
      "A layout issue can be minor. A blocked payment on Safari is not minor.",
    ],
    sources: [],
    related: ["mt-compatibility", "mt-risk", "mt-login"],
  },
];
