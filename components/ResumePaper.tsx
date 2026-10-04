import type { ResumeDoc, ResumeSkillGroup } from "@/lib/types";
import { shortUrl } from "@/lib/text";

function dates(start: string, end: string): string {
  return [start, end].filter(Boolean).join(" – ");
}

function Icon({ kind }: { kind: "mail" | "phone" | "pin" | "link" | "in" | "git" }) {
  const common = {
    width: 13,
    height: 13,
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 2,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
    "aria-hidden": true,
  };
  if (kind === "mail") {
    return (
      <svg {...common}>
        <rect x="3" y="5" width="18" height="14" rx="1.5" />
        <path d="m4 7 8 6 8-6" />
      </svg>
    );
  }
  if (kind === "phone") {
    return (
      <svg {...common}>
        <path d="M6 3h4l2 5-3 2a12 12 0 0 0 5 5l2-3 5 2v4a2 2 0 0 1-2 2A16 16 0 0 1 4 5a2 2 0 0 1 2-2z" />
      </svg>
    );
  }
  if (kind === "pin") {
    return (
      <svg {...common}>
        <path d="M12 21s7-6 7-11a7 7 0 1 0-14 0c0 5 7 11 7 11z" />
        <circle cx="12" cy="10" r="2.5" />
      </svg>
    );
  }
  if (kind === "in") {
    return (
      <svg {...common}>
        <rect x="3" y="3" width="18" height="18" rx="2" />
        <path d="M8 10v7M8 7h.01M12 17v-4.5a2.5 2.5 0 0 1 5 0V17" />
      </svg>
    );
  }
  if (kind === "git") {
    return (
      <svg {...common}>
        <path d="M9 19c-4 1.5-4-2.5-6-3m12 6v-3.9a3.4 3.4 0 0 0-.9-2.6c3-.3 6.1-1.5 6.1-6.6a5 5 0 0 0-1.4-3.5 4.7 4.7 0 0 0-.1-3.5s-1.1-.3-3.5 1.3a12 12 0 0 0-6.2 0C6.4 2.6 5.3 2.9 5.3 2.9a4.7 4.7 0 0 0-.1 3.5 5 5 0 0 0-1.4 3.6c0 5 3.1 6.2 6.1 6.6a3.4 3.4 0 0 0-.9 2.6V22" />
      </svg>
    );
  }
  return (
    <svg {...common}>
      <path d="M10 13a5 5 0 0 0 7.5.5l2.5-2.5a5 5 0 0 0-7-7L11 6" />
      <path d="M14 11a5 5 0 0 0-7.5-.5L4 13a5 5 0 0 0 7 7l2-2" />
    </svg>
  );
}

function linkKind(label: string): "link" | "in" | "git" {
  const name = label.toLowerCase();
  if (name.includes("linked")) return "in";
  if (name.includes("git")) return "git";
  return "link";
}

function SkillColumn({ groups }: { groups: ResumeSkillGroup[] }) {
  return (
    <div>
      {groups.map((group) => (
        <div className="skill-block" key={group.name}>
          <p className="skill-name">{group.name}</p>
          <p className="skill-items">
            {group.items.map((item) => item.label).join(", ")}
          </p>
        </div>
      ))}
    </div>
  );
}

export function ResumePaper({ doc }: { doc: ResumeDoc }) {
  const left = doc.skillGroups.filter((_, index) => index % 2 === 0);
  const right = doc.skillGroups.filter((_, index) => index % 2 === 1);

  return (
    <article className="paper" id="resume-paper">
      <header className="resume-top">
        <h1 className="name">{doc.contact.name}</h1>
        <p className="target">{doc.headline}</p>
        <p className="contact-line">
          {doc.contact.email ? (
            <span>
              <Icon kind="mail" /> {doc.contact.email}
            </span>
          ) : null}
          {doc.contact.phone ? (
            <span>
              <Icon kind="phone" /> {doc.contact.phone}
            </span>
          ) : null}
          {doc.contact.location ? (
            <span>
              <Icon kind="pin" /> {doc.contact.location}
            </span>
          ) : null}
        </p>
        {doc.contact.links.some((link) => linkKind(link.label) !== "git") ? (
          <p className="contact-line">
            {doc.contact.links
              .filter((link) => linkKind(link.label) !== "git")
              .map((link) => (
                <a key={link.id} href={link.url}>
                  <Icon kind={linkKind(link.label)} /> {shortUrl(link.url)}
                </a>
              ))}
          </p>
        ) : null}
        {doc.contact.links.some((link) => linkKind(link.label) === "git") ? (
          <p className="contact-line">
            {doc.contact.links
              .filter((link) => linkKind(link.label) === "git")
              .map((link) => (
                <a key={link.id} href={link.url}>
                  <Icon kind="git" /> {shortUrl(link.url)}
                </a>
              ))}
          </p>
        ) : null}
      </header>

      <h2>Professional Summary</h2>
      <p className="summary">{doc.summary}</p>

      <h2>Skills</h2>
      <div className="skill-columns">
        <SkillColumn groups={left} />
        <SkillColumn groups={right} />
      </div>

      <h2>Work Experience</h2>
      {doc.experience.map((role) => (
        <section className="role" key={`${role.company}-${role.start}`}>
          <div className="role-head">
            <h3>{role.title}</h3>
            <span className="dates">{dates(role.start, role.end)}</span>
          </div>
          <div className="role-sub">
            <p className="where">{role.company}</p>
            {role.location ? <p className="where place">{role.location}</p> : null}
          </div>
          <ul>
            {role.bullets.map((bullet, index) => (
              <li key={`${role.company}-${index}`}>{bullet}</li>
            ))}
          </ul>
        </section>
      ))}

      {doc.projects.length ? (
        <>
          <h2>Current Projects</h2>
          {doc.projects.map((project) => (
            <section className="role" key={project.name}>
              <h3>{project.name}</h3>
              <ul>
                {project.bullets.map((bullet, index) => (
                  <li key={`${project.name}-${index}`}>{bullet}</li>
                ))}
              </ul>
            </section>
          ))}
        </>
      ) : null}

      {doc.education.length ? (
        <>
          <h2>Education</h2>
          {doc.education.map((school) => (
            <section className="role" key={school.id}>
              <div className="edu-head">
                <h3>{school.degree}</h3>
                <span className="dates">{dates(school.start, school.end)}</span>
              </div>
              <div className="role-sub">
                <p className="where">{school.school}</p>
                {school.location ? <p className="where place">{school.location}</p> : null}
              </div>
            </section>
          ))}
        </>
      ) : null}
    </article>
  );
}
