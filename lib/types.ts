export type SkillGroup = {
  id: string;
  name: string;
  items: string[];
};

export type Role = {
  id: string;
  title: string;
  company: string;
  location: string;
  start: string;
  end: string;
  bullets: string[];
};

export type Project = {
  id: string;
  name: string;
  bullets: string[];
};

export type Education = {
  id: string;
  degree: string;
  school: string;
  location: string;
  start: string;
  end: string;
};

export type LinkItem = {
  id: string;
  label: string;
  url: string;
};

export type Profile = {
  name: string;
  headline: string;
  identity: string;
  years: string;
  closing: string;
  email: string;
  phone: string;
  location: string;
  links: LinkItem[];
  skillGroups: SkillGroup[];
  experience: Role[];
  projects: Project[];
  education: Education[];
};

export type SkillItem = {
  label: string;
  hit: boolean;
};

export type ResumeSkillGroup = {
  name: string;
  items: SkillItem[];
};

export type ResumeRole = {
  title: string;
  company: string;
  location: string;
  start: string;
  end: string;
  bullets: string[];
};

export type ResumeProject = {
  name: string;
  bullets: string[];
};

export type ResumeDoc = {
  id: string;
  createdAt: string;
  updatedAt: string;
  jobTitle: string;
  company: string;
  jobUrl: string;
  jobText: string;
  matched: string[];
  missing: string[];
  headline: string;
  summary: string;
  skillGroups: ResumeSkillGroup[];
  experience: ResumeRole[];
  projects: ResumeProject[];
  education: Education[];
  contact: {
    name: string;
    email: string;
    phone: string;
    location: string;
    links: LinkItem[];
  };
};
