export type SubjectStatus = "ready" | "later";

export type StudySubject = {
  id: string;
  title: string;
  status: SubjectStatus;
  note: string;
};

export const STUDY_SUBJECTS: StudySubject[] = [
  { id: "java", title: "Java", status: "ready", note: "OOP, arrays, collections, strings, exceptions, and saved Java programs." },
  { id: "selenium", title: "Selenium", status: "ready", note: "Locators, waits, popups, TestNG, and the saved Selenium programs." },
  { id: "sql", title: "SQL", status: "later", note: "Not converted yet." },
  { id: "mongodb", title: "MongoDB", status: "ready", note: "Filters, CRUD, aggregation, and QA checks against documents." },
  { id: "rest-assured", title: "REST Assured", status: "ready", note: "Requests, validation, auth, and API checks for SDET interviews." },
  { id: "postman", title: "Postman", status: "later", note: "Not converted yet." },
  { id: "manual-testing", title: "Manual Testing", status: "ready", note: "Test design, defects, Agile workflow, and practical QA scenarios." },
  { id: "playwright", title: "Playwright", status: "ready", note: "Locators, assertions, and senior SDET interview questions." },
  { id: "bdd", title: "BDD", status: "later", note: "Not converted yet." },
  { id: "framework", title: "Framework", status: "later", note: "Not converted yet." },
  { id: "test-cases", title: "Test Cases", status: "later", note: "Not converted yet." },
  { id: "hr", title: "HR Round", status: "later", note: "Not converted yet." },
  { id: "cultural", title: "Cultural Round", status: "later", note: "Not converted yet." },
];

export function subjectById(id: string): StudySubject | undefined {
  return STUDY_SUBJECTS.find((subject) => subject.id === id);
}
