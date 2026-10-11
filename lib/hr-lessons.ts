import type { ConceptGroupId, ConceptLesson } from "./concepts";

export const HR_GROUPS: { id: ConceptGroupId; title: string }[] = [
  { id: "hr-introduction", title: "Self Introduction" },
];

export const HR_LESSONS: ConceptLesson[] = [
  {
    id: "hr-self-introduction",
    group: "hr-introduction",
    title: "Tell me about yourself",
    aliases: ["self introduction", "introduce yourself", "tell me about yourself", "hr introduction"],
    basis: "Prepared from Rajat Kumar Pradhan's own introduction.",
    summary: `Hi, I'm Rajat Kumar Pradhan. I'm originally from Odisha and currently staying in Delhi.

I have more than five years of experience in QA and Test Automation. I joined my current organization as a QA Team Lead, where I mentored a team of four members. After one year, I was promoted to QA Manager.

Currently, I'm handling QA activities across eight projects. My responsibilities include test planning, preparing test cases and identifying edge cases, reviewing automation code, managing defects, and guiding my team.

Technically, I work with Playwright and JavaScript for UI automation, Axios and Postman for API testing, Appium for Android automation, Socket.IO for real-time communication testing, and JMeter for performance testing.

I also coordinate with developers and stakeholders to understand requirements, prioritize testing activities, and ensure we deliver stable, high-quality products.

That's a brief introduction about me.`,
    simple:
      "Keep the answer in this order: location, experience, career growth, current scope, technical tools, teamwork, and quality outcome.",
    points: [
      "Experience: more than five years in QA and test automation.",
      "Leadership growth: joined as QA Team Lead, mentored four team members, and was promoted to QA Manager after one year.",
      "Current scope: handles QA activities across eight projects.",
      "Responsibilities: test planning, test cases, edge cases, automation code review, defect management, and team guidance.",
      "UI automation: Playwright with JavaScript.",
      "API, mobile, realtime, and performance: Axios, Postman, Appium, Socket.IO, and JMeter.",
      "Collaboration: works with developers and stakeholders to understand requirements, prioritize testing, and deliver stable products.",
    ],
    how:
      "Speak naturally and keep the main introduction near 60–90 seconds. Pause after the current role and after the tools. Do not add project claims, metrics, or responsibilities that are not part of this introduction.",
    questions: [
      {
        prompt: "How did your role change after becoming QA Manager?",
        short: "My scope expanded from leading one team to coordinating QA across eight projects.",
        detail: "I still stay involved technically through planning, edge-case review, automation code review, defect management, and team guidance.",
      },
      {
        prompt: "What tools do you use most often?",
        short: "Playwright with JavaScript for UI and Axios or Postman for APIs.",
        detail: "I also use Appium for Android, Socket.IO for real-time communication testing, and JMeter for performance testing.",
      },
      {
        prompt: "How do you manage quality across multiple projects?",
        short: "I prioritize by requirement risk, release need, and defect impact.",
        detail: "I coordinate with developers and stakeholders, plan the coverage, review edge cases and automation, and guide the team on the highest-risk work.",
      },
    ],
    sources: [],
    related: [],
  },
];

export function hrById(id: string): ConceptLesson | undefined {
  return HR_LESSONS.find((lesson) => lesson.id === id);
}

export function hrInGroup(group: ConceptGroupId): ConceptLesson[] {
  return HR_LESSONS.filter((lesson) => lesson.group === group);
}

function plain(value: string): string {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, " ").trim();
}

export function searchHrLessons(query: string): { id: string; title: string; group: ConceptGroupId; score: number }[] {
  const asked = plain(query);
  if (asked.length < 2) return [];
  return HR_LESSONS.map((lesson) => {
    const names = [lesson.title, ...lesson.aliases].map(plain);
    let score = 0;
    if (names.some((name) => name === asked)) score = 200;
    else if (names.some((name) => asked.includes(name))) score = 160;
    else {
      const tokens = asked.split(" ").filter((token) => token.length > 2);
      const blob = names.join(" ");
      if (tokens.length && tokens.every((token) => blob.includes(token))) score = 70 + tokens.length;
    }
    return { id: lesson.id, title: lesson.title, group: lesson.group, score };
  })
    .filter((item) => item.score >= 70)
    .sort((a, b) => b.score - a.score || a.title.localeCompare(b.title));
}
