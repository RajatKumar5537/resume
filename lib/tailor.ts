import type { Profile, ResumeDoc } from "@/lib/types";
import { firstIndex, humanJoin, textHas } from "@/lib/text";

const SOFT_SKILLS = new Set([
  "test planning",
  "test cases",
  "edge cases",
  "bug reporting",
  "code review",
  "cross-browser testing",
  "agile",
  "scrum",
  "jira",
]);

const GAP_TERMS: { name: string; aliases: string[] }[] = [
  { name: "Playwright", aliases: ["playwright"] },
  { name: "Selenium", aliases: ["selenium", "webdriver"] },
  { name: "Appium", aliases: ["appium"] },
  { name: "Cypress", aliases: ["cypress"] },
  { name: "WebdriverIO", aliases: ["webdriverio", "webdriver.io"] },
  { name: "Java", aliases: ["java"] },
  { name: "JavaScript", aliases: ["javascript"] },
  { name: "TypeScript", aliases: ["typescript"] },
  { name: "Python", aliases: ["python"] },
  { name: "C#", aliases: ["c#", "c sharp"] },
  { name: "TestNG", aliases: ["testng"] },
  { name: "JUnit", aliases: ["junit"] },
  { name: "Pytest", aliases: ["pytest"] },
  { name: "Jest", aliases: ["jest"] },
  { name: "REST Assured", aliases: ["rest assured", "rest-assured"] },
  { name: "Postman", aliases: ["postman"] },
  { name: "GraphQL", aliases: ["graphql"] },
  { name: "Kafka", aliases: ["kafka"] },
  { name: "SQL", aliases: ["sql"] },
  { name: "PostgreSQL", aliases: ["postgresql", "postgres"] },
  { name: "MySQL", aliases: ["mysql"] },
  { name: "MongoDB", aliases: ["mongodb", "mongo db"] },
  { name: "Redis", aliases: ["redis"] },
  { name: "Docker", aliases: ["docker"] },
  { name: "Kubernetes", aliases: ["kubernetes", "k8s"] },
  { name: "Jenkins", aliases: ["jenkins"] },
  { name: "GitHub Actions", aliases: ["github actions"] },
  { name: "GitLab CI", aliases: ["gitlab ci"] },
  { name: "Azure DevOps", aliases: ["azure devops"] },
  { name: "AWS", aliases: ["aws", "amazon web services"] },
  { name: "GCP", aliases: ["gcp", "google cloud"] },
  { name: "JMeter", aliases: ["jmeter"] },
  { name: "k6", aliases: ["k6"] },
  { name: "Gatling", aliases: ["gatling"] },
  { name: "BrowserStack", aliases: ["browserstack"] },
  { name: "Sauce Labs", aliases: ["sauce labs", "saucelabs"] },
  { name: "LambdaTest", aliases: ["lambdatest"] },
  { name: "Cucumber", aliases: ["cucumber"] },
  { name: "Next.js", aliases: ["next.js", "nextjs"] },
  { name: "React", aliases: ["react"] },
  { name: "Node.js", aliases: ["node.js", "nodejs"] },
  { name: "Socket.IO", aliases: ["socket.io", "socketio"] },
  { name: "TOSCA", aliases: ["tosca"] },
  { name: "Zephyr", aliases: ["zephyr"] },
  { name: "ISTQB", aliases: ["istqb"] },
];

function profileSkills(profile: Profile): string[] {
  return profile.skillGroups.flatMap((group) => group.items.map((item) => item.trim()).filter(Boolean));
}

function covers(skills: string[], name: string, aliases: string[]): boolean {
  const probes = [name, ...aliases];
  return skills.some((skill) => probes.some((probe) => textHas(skill, probe) || textHas(probe, skill)));
}

function domainOrder(jd: string, skills: string[]): { domains: string[]; performance: boolean } {
  const web = ["web", "frontend", "playwright", "selenium"].some((term) => textHas(jd, term));
  const mobile = ["mobile", "android", "ios", "appium"].some((term) => textHas(jd, term));
  const api = ["api", "rest", "backend", "microservice", "postman"].some((term) => textHas(jd, term));
  const flags: [string, boolean][] = [
    ["web", web],
    ["mobile", mobile],
    ["API", api],
  ];
  const hits = flags.filter(([, ok]) => ok).map(([name]) => name);
  const rest = flags.filter(([, ok]) => !ok).map(([name]) => name);
  const asksPerformance = textHas(jd, "performance") || textHas(jd, "jmeter") || textHas(jd, "load test");
  const hasPerformance = skills.some((skill) => textHas(skill, "JMeter"));
  return {
    domains: hits.length ? [...hits, ...rest] : ["web", "mobile", "API"],
    performance: asksPerformance && hasPerformance,
  };
}

function profileCorpus(profile: Profile): string {
  return [
    profile.identity,
    profile.closing,
    ...profileSkills(profile),
    ...profile.experience.flatMap((role) => role.bullets),
    ...profile.projects.flatMap((project) => project.bullets),
  ].join("\n");
}

function targetedSummary(profile: Profile, jd: string, targetTitle: string): string {
  const skills = profileSkills(profile);
  const corpus = profileCorpus(profile);
  const years = profile.years.trim() || "5+";
  const tools = skills
    .filter((skill) => textHas(jd, skill) && !SOFT_SKILLS.has(skill.toLowerCase()))
    .sort((a, b) => firstIndex(jd, a) - firstIndex(jd, b))
    .filter((skill, index, all) => all.findIndex((item) => item.toLowerCase() === skill.toLowerCase()) === index)
    .slice(0, 5);
  const themes = [
    { label: "test automation", jd: ["automation", "playwright", "selenium"], mine: ["automation", "playwright", "selenium"] },
    { label: "regression testing", jd: ["regression"], mine: ["regression"] },
    { label: "API testing", jd: ["api", "postman"], mine: ["api", "postman"] },
    { label: "quality assurance", jd: ["quality assurance", "qa engineer", "quality control"], mine: ["qa", "quality"] },
    { label: "performance testing", jd: ["performance", "jmeter"], mine: ["jmeter", "performance"] },
  ]
    .filter((theme) => theme.jd.some((term) => textHas(jd, term)) && theme.mine.some((term) => textHas(corpus, term)))
    .map((theme) => theme.label)
    .slice(0, 3);
  const actions: string[] = [];
  if (/automat/i.test(jd) && /automat/i.test(corpus)) actions.push("develops automated test scripts");
  if ((textHas(jd, "test case") || textHas(jd, "test plan") || textHas(jd, "test strategy")) && textHas(corpus, "test case")) {
    actions.push("prepares test cases");
  }
  if (/defect|bug/i.test(jd) && /bug|jira|defect/i.test(corpus)) actions.push("documents defects");
  if (/report|test result/i.test(jd) && /test result|report/i.test(corpus)) actions.push("reports test results");
  const role = targetTitle.trim() || profile.identity.trim() || "QA Engineer";
  const focus = themes.length ? humanJoin(themes) : "software testing";
  const handsOn = tools.length ? `Hands-on with ${humanJoin(tools)}.` : "";
  const doing = actions.length ? `${actions[0].charAt(0).toUpperCase()}${humanJoin(actions).slice(1)}.` : "";
  return [`${role} with ${years} years of experience in ${focus}.`, handsOn, doing].filter(Boolean).join(" ");
}

function resumeHeadline(profileHeadline: string, jobTitle: string): string {
  const fallback = profileHeadline.trim() || "QA Team Lead | SDET | Test Automation";
  const lead = fallback.split("|")[0]?.trim() || "QA Team Lead";
  const title = jobTitle.trim();
  if (!title) return fallback;
  const same = title.toLowerCase() === lead.toLowerCase();
  const already = title.toLowerCase().includes(lead.toLowerCase());
  if (same || already) return title;
  return `${lead} | ${title}`;
}

export function buildSummary(profile: Profile, jd: string, targetTitle = ""): string {
  if (targetTitle.trim()) return targetedSummary(profile, jd, targetTitle);
  const skills = profileSkills(profile);
  const tools = skills
    .filter((skill) => textHas(jd, skill) && !SOFT_SKILLS.has(skill.toLowerCase()))
    .sort((a, b) => firstIndex(jd, a) - firstIndex(jd, b))
    .filter((skill, index, all) => all.findIndex((item) => item.toLowerCase() === skill.toLowerCase()) === index)
    .slice(0, 5);
  const { domains, performance } = domainOrder(jd, skills);
  const years = profile.years.trim() || "5+";
  const identity = profile.identity.trim() || profile.headline.trim() || "QA Team Lead and SDET";
  const handsOn = tools.length
    ? `Hands-on with ${humanJoin(tools)}.`
    : "Hands-on with Playwright, Selenium, Appium, and API automation.";
  const focus = performance
    ? `testing ${humanJoin(domains)} applications, including performance`
    : `testing ${humanJoin(domains)} applications`;
  const closing = profile.closing.trim();
  return [`${identity} with ${years} years of experience ${focus}.`, handsOn, closing].filter(Boolean).join(" ");
}

function dutyScore(text: string, jd: string): number {
  const checks: [RegExp, RegExp, number][] = [
    [/regression/i, /regression/i, 4],
    [/defect|bug/i, /defect|bug/i, 3],
    [/test cases?/i, /test cases?/i, 3],
    [/test plans?|test strateg/i, /test plans?|test strateg/i, 3],
    [/status reports?|test results?/i, /reports?|test results?/i, 3],
  ];
  let score = checks.reduce((total, [inText, inJob, points]) => total + (inText.test(text) && inJob.test(jd) ? points : 0), 0);
  if (/automat/i.test(jd) && /automat/i.test(text) && /test|script|playwright|selenium|appium|postman|\bapi\b/i.test(text)) {
    score += 5;
  }
  return score;
}

function scoreText(text: string, jd: string, skills: string[]): number {
  let score = dutyScore(text, jd);
  for (const skill of skills) {
    if (SOFT_SKILLS.has(skill.toLowerCase())) continue;
    if (textHas(jd, skill) && textHas(text, skill)) score += 8;
  }
  if (/\d+%|\d+\+/.test(text) && score > 0) score += 1;
  return score;
}

function alignBullet(bullet: string, jd: string): string {
  let text = bullet.trim();
  if (/automat/i.test(jd)) {
    text = text.replace(/build and maintain (.+?) automation/i, "Develop automated test scripts with $1");
  }
  if (/report|test result/i.test(jd)) {
    text = text.replace(/share clear test results with the team/i, "produce status reports for the team");
  }
  if (/defect/i.test(jd)) {
    text = text.replace(/bug reports/i, "defect reports");
  }
  if (/regression/i.test(jd) && /feature/i.test(jd)) {
    text = text.replace(/functional, regression, and sanity checks/i, "regression and feature testing");
  }
  return text.replace(/\s{2,}/g, " ").trim();
}

function selectBullets(bullets: string[], jd: string, skills: string[], limit: number): string[] {
  const ranked = bullets
    .map((bullet, index) => ({ bullet, index, score: scoreText(bullet, jd, skills) }))
    .sort((a, b) => b.score - a.score || a.index - b.index);
  const strong = ranked.filter((item) => item.score >= 5);
  const picked = (strong.length ? strong : ranked.slice(0, 1)).slice(0, limit);
  const best = picked[0]?.bullet;
  const indexes = new Set(picked.map((item) => item.index));
  const inOrder = bullets.filter((_, index) => indexes.has(index));
  if (!best) return inOrder.map((bullet) => alignBullet(bullet, jd));
  return [best, ...inOrder.filter((bullet) => bullet !== best)].map((bullet) => alignBullet(bullet, jd));
}

function gapList(jd: string, skills: string[]): string[] {
  return GAP_TERMS.filter((term) => {
    const inJob = [term.name, ...term.aliases].some((alias) => textHas(jd, alias));
    return inJob && !covers(skills, term.name, term.aliases);
  })
    .map((term) => ({
      name: term.name,
      at: Math.min(
        ...[term.name, ...term.aliases].map((alias) => {
          const index = firstIndex(jd, alias);
          return index === Number.POSITIVE_INFINITY ? Number.MAX_SAFE_INTEGER : index;
        }),
      ),
    }))
    .sort((a, b) => a.at - b.at)
    .slice(0, 8)
    .map((term) => term.name);
}

export function tailor(input: {
  profile: Profile;
  jobText: string;
  jobTitle: string;
  company: string;
  jobUrl: string;
}): ResumeDoc {
  const jd = input.jobText.trim().slice(0, 20000);
  const skills = profileSkills(input.profile);
  const matched = skills
    .filter((skill) => textHas(jd, skill))
    .filter((skill, index, all) => all.findIndex((item) => item.toLowerCase() === skill.toLowerCase()) === index)
    .sort((a, b) => {
      const soft = (skill: string) => (SOFT_SKILLS.has(skill.toLowerCase()) ? 1 : 0);
      return soft(a) - soft(b) || firstIndex(jd, a) - firstIndex(jd, b);
    });

  const skillGroups = input.profile.skillGroups
    .map((group) => {
      const items = group.items
        .map((label) => label.trim())
        .filter(Boolean)
        .map((label) => ({ label, hit: textHas(jd, label) }));
      return {
        name: group.name,
        items: [...items.filter((item) => item.hit), ...items.filter((item) => !item.hit)],
      };
    })
    .filter((group) => group.items.length > 0);

  const experience = input.profile.experience.map((role, roleIndex) => ({
    title: role.title,
    company: role.company,
    location: role.location,
    start: role.start,
    end: role.end,
    bullets: selectBullets(role.bullets.filter(Boolean), jd, skills, roleIndex === 0 ? 4 : 3),
  }));

  const rankedProjects = input.profile.projects
    .map((project, index) => ({
      project,
      index,
      score: project.bullets.reduce((sum, bullet) => sum + scoreText(bullet, jd, skills), 0),
    }))
    .sort((a, b) => b.score - a.score || a.index - b.index);
  const chosenProjects = rankedProjects.filter((item) => item.score >= 6).slice(0, 3);

  const projects = chosenProjects.map(({ project }) => ({
    name: project.name,
    bullets: selectBullets(project.bullets.filter(Boolean), jd, skills, 4),
  }));

  const jobTitle = input.jobTitle.trim().slice(0, 90);
  const now = new Date().toISOString();

  return {
    id: crypto.randomUUID(),
    createdAt: now,
    updatedAt: now,
    jobTitle,
    company: input.company.trim().slice(0, 80),
    jobUrl: input.jobUrl.trim(),
    jobText: jd,
    matched,
    missing: gapList(jd, skills),
    headline: resumeHeadline(input.profile.headline, jobTitle),
    summary: buildSummary(input.profile, jd, jobTitle || input.profile.headline),
    skillGroups,
    experience,
    projects,
    education: input.profile.education,
    contact: {
      name: input.profile.name,
      email: input.profile.email,
      phone: input.profile.phone,
      location: input.profile.location,
      links: input.profile.links,
    },
  };
}
