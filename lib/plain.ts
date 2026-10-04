import type { ResumeDoc } from "@/lib/types";
import { shortUrl } from "@/lib/text";

function dates(start: string, end: string): string {
  return [start, end].filter(Boolean).join(" – ");
}

export function toPlainText(doc: ResumeDoc): string {
  const lines: string[] = [];
  lines.push(doc.contact.name);
  lines.push(doc.headline);
  lines.push([doc.contact.location, doc.contact.email, doc.contact.phone].filter(Boolean).join(" | "));
  if (doc.contact.links.length) {
    lines.push(doc.contact.links.map((link) => shortUrl(link.url)).join(" | "));
  }
  lines.push("");
  lines.push("PROFESSIONAL SUMMARY");
  lines.push(doc.summary);
  lines.push("");
  lines.push("SKILLS");
  for (const group of doc.skillGroups) {
    const labels = group.items.map((item) => item.label).join(", ");
    lines.push(group.name && group.name.toLowerCase() !== "skills" ? `${group.name}: ${labels}` : labels);
  }
  lines.push("");
  lines.push("WORK EXPERIENCE");
  for (const role of doc.experience) {
    lines.push(`${role.title} | ${dates(role.start, role.end)}`);
    lines.push([role.company, role.location].filter(Boolean).join(" | "));
    for (const bullet of role.bullets) lines.push(`- ${bullet}`);
    lines.push("");
  }
  if (doc.projects.length) {
    lines.push("CURRENT PROJECTS");
    for (const project of doc.projects) {
      lines.push(project.name);
      for (const bullet of project.bullets) lines.push(`- ${bullet}`);
      lines.push("");
    }
  }
  if (doc.education.length) {
    lines.push("EDUCATION");
    for (const school of doc.education) {
      lines.push(`${school.degree} | ${dates(school.start, school.end)}`);
      lines.push([school.school, school.location].filter(Boolean).join(" | "));
      lines.push("");
    }
  }
  return lines.join("\n").replace(/\n{3,}/g, "\n\n").trim() + "\n";
}

export function resumeFilename(doc: ResumeDoc, extension: string): string {
  const parts = [doc.contact.name, doc.company, doc.jobTitle || doc.headline]
    .join(" ")
    .replace(/[^a-z0-9]+/gi, "_")
    .replace(/^_|_$/g, "")
    .slice(0, 80);
  return `${parts || "resume"}.${extension}`;
}
