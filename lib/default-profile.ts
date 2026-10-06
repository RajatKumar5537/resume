import type { Education, Profile, Project, Role, SkillGroup } from "@/lib/types";

function group(id: string, name: string, items: string[]): SkillGroup {
  return { id, name, items };
}

function role(
  id: string,
  title: string,
  company: string,
  location: string,
  start: string,
  end: string,
  bullets: string[],
): Role {
  return { id, title, company, location, start, end, bullets };
}

function project(id: string, name: string, bullets: string[]): Project {
  return { id, name, bullets };
}

function school(
  id: string,
  degree: string,
  schoolName: string,
  location: string,
  start: string,
  end: string,
): Education {
  return { id, degree, school: schoolName, location, start, end };
}

export const DEFAULT_PROFILE: Profile = {
  name: "Rajat Kumar Pradhan",
  headline: "QA Team Lead | SDET | Test Automation",
  identity: "QA Team Lead and SDET",
  years: "5+",
  closing:
    "Lead test planning, automation work, and code reviews, and work with teams to find issues early and release with confidence.",
  email: "kumarrajatpradhan5364@gmail.com",
  phone: "+91 8810455929",
  location: "Delhi, India",
  links: [
    {
      id: "portfolio",
      label: "Portfolio",
      url: "https://rajatkumar5537.github.io/Portfolio_Rajat/",
    },
    {
      id: "linkedin",
      label: "LinkedIn",
      url: "https://linkedin.com/in/rajat-kumar-204974257",
    },
    {
      id: "github",
      label: "GitHub",
      url: "https://github.com/RajatKumar5537",
    },
  ],
  skillGroups: [
    group("ui", "UI and mobile automation", [
      "Playwright",
      "Selenium WebDriver",
      "Appium",
      "TestNG",
      "Java",
      "JavaScript",
      "TypeScript",
    ]),
    group("api", "API and event testing", [
      "Axios",
      "Postman",
      "REST APIs",
      "REST Assured",
      "Socket.IO",
    ]),
    group("data", "Performance and data", ["JMeter", "SQL", "MongoDB", "Redis", "Kafka"]),
    group("web", "Web development and delivery", [
      "Next.js",
      "React",
      "Node.js",
      "Git",
      "GitHub Actions",
      "Jenkins",
      "Docker",
    ]),
    group("ways", "Ways of working", [
      "Test planning",
      "Test cases",
      "Edge cases",
      "Bug reporting",
      "Code review",
      "Cross-browser testing",
      "Jira",
      "Agile",
      "Scrum",
    ]),
  ],
  experience: [
    role(
      "somo",
      "Software Quality Assurance Team Lead",
      "SOMO MEDIA PVT LTD",
      "Delhi, India",
      "Dec 2024",
      "Present",
      [
        "Contribute to QA across 10+ projects covering web, API, Android, gaming, video, and chat; prepare test cases and edge cases based on project needs.",
        "Build and maintain Playwright UI and Axios API automation, review test code, and share clear test results with the team.",
        "Built an AFS dashboard for site and campaign verification. Automated validation helped reduce manual campaign and site checking effort by 95%.",
        "Automated Nexus AI Policy Review API checks, reducing manual API testing effort by 90%.",
        "Test campaign spend and revenue workflows; use Appium for Android checks, Socket.IO and Postman for event flows, and JMeter for performance checks.",
      ],
    ),
    role(
      "jivi",
      "Quality Assurance Automation Engineer",
      "JIVI (JIVIEWS PRIVATE LIMITED)",
      "Bengaluru, India",
      "Sep 2023",
      "Nov 2024",
      [
        "Built and maintained Selenium, Java, and TestNG checks for workforce management software.",
        "Tested APIs with REST Assured and Postman, checked data with SQL, and covered Chrome, Firefox, and Edge.",
      ],
    ),
    role(
      "testwell",
      "Test Automation Engineer",
      "TEST WELL TECHNOLOGIES PVT LTD",
      "Bengaluru, India",
      "Dec 2020",
      "Sep 2023",
      [
        "Automated functional, regression, and sanity checks for CRM applications using Java and Selenium WebDriver.",
        "Prepared test cases and Jira bug reports; checked REST APIs with Postman and data with SQL.",
      ],
    ),
  ],
  projects: [
    project("afs", "AFS Tracking Dashboard and AdSense API Visitor", [
      "Built and tested the AFS tracking dashboard for campaign, site, and pixel checks using Playwright and JavaScript; reduced manual effort by 95%.",
      "Developed and tested landing pages across 40+ domains for AFS campaigns.",
      "For AdSense API Visitor, tested APIs with Axios and checked user flows with Playwright.",
    ]),
    project("nexus", "Nexus Campaign Dashboard and AI Policy Review", [
      "Tested the role-based dashboard for Google and Meta campaign budgets, spend, and revenue, user access, and the AI-assisted Launchpad.",
      "Automated AI Policy Review API checks with Axios, reducing manual API testing effort by 90%; used Playwright for UI checks and Postman for manual checks.",
    ]),
    project("chatkit", "ChatKit Backend and API Testing", [
      "Performed backend and API testing for the in-house ChatKit service used for chat features across products.",
    ]),
    project("dekho", "Dekho P2P", [
      "Tested video calls manually and with Appium; checked APIs, Socket.IO events, call flows, and video quality. The app uses Agora for video calls.",
    ]),
    project("astrologer", "Astrologer", [
      "Upcoming app planned to use the ChatKit service for chat conversations.",
    ]),
    project("meteor", "Meteor Blast", [
      "Tested game journeys, leagues, tournaments, player events, and APIs; maintained test cases and bug lists.",
    ]),
    project("drama", "DramaShorts / Flicker", [
      "Tested the content dashboard and Android app, including series and episode management, APIs, and video playback.",
    ]),
    project("tracker", "Personal Tracker", [
      "Independently built and currently use a mobile-friendly Next.js and TypeScript tracker for expenses, wellness logs, and learning roadmaps; added login and Playwright checks.",
    ]),
    project("chatapp", "Chat Message Web App", [
      "Independently built a mobile-friendly web chat app that works in browsers on Android and iOS devices.",
    ]),
  ],
  education: [
    school(
      "bca",
      "Bachelor of Computer Applications (BCA)",
      "Berhampur University",
      "Odisha",
      "2015",
      "2018",
    ),
  ],
};

export function blankProfile(): Profile {
  return {
    name: "",
    headline: "",
    identity: "",
    years: "",
    closing: "",
    email: "",
    phone: "",
    location: "",
    links: [],
    skillGroups: [],
    experience: [],
    projects: [],
    education: [],
  };
}

export function needsMasterResume(profile: Profile): boolean {
  const hasWork = profile.experience.some((role) => role.title.trim() || role.company.trim() || role.bullets.some((bullet) => bullet.trim()));
  const hasSkills = profile.skillGroups.some((group) => group.items.some((item) => item.trim()));
  return !profile.name.trim() || (!hasWork && !hasSkills);
}
