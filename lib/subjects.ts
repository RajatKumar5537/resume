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
  { id: "rest-assured", title: "REST Assured", status: "later", note: "Not converted yet." },
  { id: "postman", title: "Postman", status: "later", note: "Not converted yet." },
  { id: "manual-testing", title: "Manual Testing", status: "later", note: "Not converted yet." },
  { id: "playwright", title: "Playwright", status: "later", note: "Not converted yet." },
  { id: "bdd", title: "BDD", status: "later", note: "Not converted yet." },
  { id: "framework", title: "Framework", status: "later", note: "Not converted yet." },
  { id: "test-cases", title: "Test Cases", status: "later", note: "Not converted yet." },
  { id: "hr", title: "HR Round", status: "later", note: "Not converted yet." },
  { id: "cultural", title: "Cultural Round", status: "later", note: "Not converted yet." },
];

export function subjectById(id: string): StudySubject | undefined {
  return STUDY_SUBJECTS.find((subject) => subject.id === id);
}
