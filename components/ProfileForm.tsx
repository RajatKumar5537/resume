"use client";

import { useEffect, useState } from "react";
import { buildSummary } from "@/lib/tailor";
import { exportBackup, loadProfile, parseBackup, replaceAll, saveProfile } from "@/lib/storage";
import type { Education, LinkItem, Profile, Project, Role, SkillGroup } from "@/lib/types";

function newId(): string {
  return crypto.randomUUID();
}

export function ProfileForm() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    let cancel = false;
    loadProfile()
      .then((next) => {
        if (!cancel) setProfile(next);
      })
      .catch((caught) => {
        if (!cancel) setError(caught instanceof Error ? caught.message : "Could not load the profile.");
      });
    return () => {
      cancel = true;
    };
  }, []);

  function commit(next: Profile) {
    setProfile(next);
    saveProfile(next)
      .then(() => {
        setError("");
        setMessage("Saved.");
      })
      .catch((caught) => {
        setError(caught instanceof Error ? caught.message : "Could not save the profile.");
      });
  }

  function updateRole(id: string, patch: Partial<Role>) {
    if (!profile) return;
    commit({
      ...profile,
      experience: profile.experience.map((role) => (role.id === id ? { ...role, ...patch } : role)),
    });
  }

  function updateProject(id: string, patch: Partial<Project>) {
    if (!profile) return;
    commit({
      ...profile,
      projects: profile.projects.map((project) => (project.id === id ? { ...project, ...patch } : project)),
    });
  }

  function updateSchool(id: string, patch: Partial<Education>) {
    if (!profile) return;
    commit({
      ...profile,
      education: profile.education.map((school) => (school.id === id ? { ...school, ...patch } : school)),
    });
  }

  function updateGroup(id: string, patch: Partial<SkillGroup>) {
    if (!profile) return;
    commit({
      ...profile,
      skillGroups: profile.skillGroups.map((group) => (group.id === id ? { ...group, ...patch } : group)),
    });
  }

  function updateLink(id: string, patch: Partial<LinkItem>) {
    if (!profile) return;
    commit({
      ...profile,
      links: profile.links.map((link) => (link.id === id ? { ...link, ...patch } : link)),
    });
  }

  async function downloadBackup() {
    try {
      const payload = JSON.stringify(await exportBackup(), null, 2);
      const blob = new Blob([payload], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = "desk-backup.json";
      link.click();
      URL.revokeObjectURL(url);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Could not download the backup.");
    }
  }

  async function importBackup(file: File) {
    try {
      const backup = parseBackup(await file.text());
      await replaceAll(backup);
      setProfile(backup.profile);
      setError("");
      setMessage("Backup restored.");
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "That file could not be restored.");
    }
  }

  if (!profile) {
    return <p className={error ? "error" : "hint"}>{error || "Loading profile…"}</p>;
  }

  const preview = buildSummary(profile, profile.headline);

  return (
    <div className="narrow">
      <h1>Master profile</h1>
      <p className="lede">
        Imported from your 29 Sep 2026 resume. New job resumes use this copy. Nothing is invented, and later edits
        here apply to the next resume you write.
      </p>
      {message ? <p className="hint">{message}</p> : null}
      {error ? <p className="error">{error}</p> : null}

      <section className="editor-card">
        <h3>Contact</h3>
        <div className="field">
          <label htmlFor="name">Name</label>
          <input id="name" type="text" value={profile.name} onChange={(event) => commit({ ...profile, name: event.target.value })} />
        </div>
        <div className="split">
          <div className="field">
            <label htmlFor="email">Email</label>
            <input id="email" type="email" value={profile.email} onChange={(event) => commit({ ...profile, email: event.target.value })} />
          </div>
          <div className="field">
            <label htmlFor="phone">Phone</label>
            <input id="phone" type="text" value={profile.phone} onChange={(event) => commit({ ...profile, phone: event.target.value })} />
          </div>
        </div>
        <div className="field">
          <label htmlFor="location">Location</label>
          <input id="location" type="text" value={profile.location} onChange={(event) => commit({ ...profile, location: event.target.value })} />
        </div>
        {profile.links.map((link) => (
          <div className="split" key={link.id}>
            <div className="field">
              <label htmlFor={`label-${link.id}`}>Link label</label>
              <input id={`label-${link.id}`} type="text" value={link.label} onChange={(event) => updateLink(link.id, { label: event.target.value })} />
            </div>
            <div className="field">
              <label htmlFor={`url-${link.id}`}>URL</label>
              <input id={`url-${link.id}`} type="url" value={link.url} onChange={(event) => updateLink(link.id, { url: event.target.value })} />
            </div>
          </div>
        ))}
        <button
          className="btn secondary"
          type="button"
          onClick={() => commit({ ...profile, links: [...profile.links, { id: newId(), label: "Link", url: "https://" }] })}
        >
          Add link
        </button>
      </section>

      <section className="editor-card">
        <h3>How the summary is written</h3>
        <div className="field">
          <label htmlFor="headline">Default headline</label>
          <input id="headline" type="text" value={profile.headline} onChange={(event) => commit({ ...profile, headline: event.target.value })} />
          <p className="hint">Used under your name when a job title is empty.</p>
        </div>
        <div className="split">
          <div className="field">
            <label htmlFor="identity">Summary opening</label>
            <input id="identity" type="text" value={profile.identity} onChange={(event) => commit({ ...profile, identity: event.target.value })} />
          </div>
          <div className="field">
            <label htmlFor="years">Years of experience</label>
            <input id="years" type="text" value={profile.years} onChange={(event) => commit({ ...profile, years: event.target.value })} />
            <p className="hint">Write 5+ only. The word years is added for you.</p>
          </div>
        </div>
        <div className="field">
          <label htmlFor="closing">Closing line</label>
          <textarea id="closing" value={profile.closing} onChange={(event) => commit({ ...profile, closing: event.target.value })} />
        </div>
        <p className="hint">Base summary: {preview}</p>
      </section>

      <section className="editor-card">
        <h3>Skills</h3>
        {profile.skillGroups.map((group) => (
          <div className="field" key={group.id}>
            <label htmlFor={`group-${group.id}`}>Group name</label>
            <input id={`group-${group.id}`} type="text" value={group.name} onChange={(event) => updateGroup(group.id, { name: event.target.value })} />
            <label htmlFor={`items-${group.id}`} style={{ marginTop: 8 }}>
              Skills, separated by commas
            </label>
            <textarea
              id={`items-${group.id}`}
              value={group.items.join(", ")}
              onChange={(event) => updateGroup(group.id, { items: event.target.value.split(",").map((item) => item.trim()) })}
              onBlur={(event) => updateGroup(group.id, { items: event.target.value.split(",").map((item) => item.trim()).filter(Boolean) })}
            />
            <button
              className="btn danger"
              type="button"
              onClick={() => commit({ ...profile, skillGroups: profile.skillGroups.filter((item) => item.id !== group.id) })}
            >
              Remove group
            </button>
          </div>
        ))}
        <button
          className="btn secondary"
          type="button"
          onClick={() =>
            commit({
              ...profile,
              skillGroups: [...profile.skillGroups, { id: newId(), name: "New group", items: [] }],
            })
          }
        >
          Add skill group
        </button>
      </section>

      <section className="editor-card">
        <h3>Experience</h3>
        {profile.experience.map((role) => (
          <div className="editor-card" key={role.id}>
            <div className="field">
              <label htmlFor={`title-${role.id}`}>Title</label>
              <input id={`title-${role.id}`} type="text" value={role.title} onChange={(event) => updateRole(role.id, { title: event.target.value })} />
            </div>
            <div className="split">
              <div className="field">
                <label htmlFor={`company-${role.id}`}>Company</label>
                <input id={`company-${role.id}`} type="text" value={role.company} onChange={(event) => updateRole(role.id, { company: event.target.value })} />
              </div>
              <div className="field">
                <label htmlFor={`where-${role.id}`}>Location</label>
                <input id={`where-${role.id}`} type="text" value={role.location} onChange={(event) => updateRole(role.id, { location: event.target.value })} />
              </div>
            </div>
            <div className="split">
              <div className="field">
                <label htmlFor={`start-${role.id}`}>Start</label>
                <input id={`start-${role.id}`} type="text" value={role.start} onChange={(event) => updateRole(role.id, { start: event.target.value })} />
              </div>
              <div className="field">
                <label htmlFor={`end-${role.id}`}>End</label>
                <input id={`end-${role.id}`} type="text" value={role.end} onChange={(event) => updateRole(role.id, { end: event.target.value })} />
              </div>
            </div>
            <div className="field">
              <label htmlFor={`bullets-${role.id}`}>Bullets, one per line</label>
              <textarea
                id={`bullets-${role.id}`}
                value={role.bullets.join("\n")}
                onChange={(event) => updateRole(role.id, { bullets: event.target.value.split("\n") })}
                onBlur={(event) =>
                  updateRole(role.id, { bullets: event.target.value.split("\n").map((line) => line.trim()).filter(Boolean) })
                }
              />
            </div>
            <button
              className="btn danger"
              type="button"
              onClick={() => commit({ ...profile, experience: profile.experience.filter((item) => item.id !== role.id) })}
            >
              Remove role
            </button>
          </div>
        ))}
        <button
          className="btn secondary"
          type="button"
          onClick={() =>
            commit({
              ...profile,
              experience: [
                ...profile.experience,
                {
                  id: newId(),
                  title: "Role title",
                  company: "Company",
                  location: "",
                  start: "",
                  end: "Present",
                  bullets: ["What you did, the tools you used, and the result."],
                },
              ],
            })
          }
        >
          Add role
        </button>
      </section>

      <section className="editor-card">
        <h3>Projects</h3>
        {profile.projects.map((project) => (
          <div className="editor-card" key={project.id}>
            <div className="field">
              <label htmlFor={`project-${project.id}`}>Project</label>
              <input id={`project-${project.id}`} type="text" value={project.name} onChange={(event) => updateProject(project.id, { name: event.target.value })} />
            </div>
            <div className="field">
              <label htmlFor={`project-bullets-${project.id}`}>Bullets, one per line</label>
              <textarea
                id={`project-bullets-${project.id}`}
                value={project.bullets.join("\n")}
                onChange={(event) => updateProject(project.id, { bullets: event.target.value.split("\n") })}
                onBlur={(event) =>
                  updateProject(project.id, {
                    bullets: event.target.value.split("\n").map((line) => line.trim()).filter(Boolean),
                  })
                }
              />
            </div>
            <button
              className="btn danger"
              type="button"
              onClick={() => commit({ ...profile, projects: profile.projects.filter((item) => item.id !== project.id) })}
            >
              Remove project
            </button>
          </div>
        ))}
        <button
          className="btn secondary"
          type="button"
          onClick={() =>
            commit({
              ...profile,
              projects: [...profile.projects, { id: newId(), name: "Project", bullets: ["What you built or tested."] }],
            })
          }
        >
          Add project
        </button>
      </section>

      <section className="editor-card">
        <h3>Education</h3>
        {profile.education.map((school) => (
          <div className="editor-card" key={school.id}>
            <div className="field">
              <label htmlFor={`degree-${school.id}`}>Degree</label>
              <input id={`degree-${school.id}`} type="text" value={school.degree} onChange={(event) => updateSchool(school.id, { degree: event.target.value })} />
            </div>
            <div className="split">
              <div className="field">
                <label htmlFor={`school-${school.id}`}>School</label>
                <input id={`school-${school.id}`} type="text" value={school.school} onChange={(event) => updateSchool(school.id, { school: event.target.value })} />
              </div>
              <div className="field">
                <label htmlFor={`edu-where-${school.id}`}>Location</label>
                <input id={`edu-where-${school.id}`} type="text" value={school.location} onChange={(event) => updateSchool(school.id, { location: event.target.value })} />
              </div>
            </div>
            <div className="split">
              <div className="field">
                <label htmlFor={`edu-start-${school.id}`}>Start</label>
                <input id={`edu-start-${school.id}`} type="text" value={school.start} onChange={(event) => updateSchool(school.id, { start: event.target.value })} />
              </div>
              <div className="field">
                <label htmlFor={`edu-end-${school.id}`}>End</label>
                <input id={`edu-end-${school.id}`} type="text" value={school.end} onChange={(event) => updateSchool(school.id, { end: event.target.value })} />
              </div>
            </div>
          </div>
        ))}
      </section>

      <section className="editor-card">
        <h3>Backup</h3>
        <p className="hint">Each person has their own profile and resumes in the resume-builder database.</p>
        <div className="actions">
          <button className="btn" type="button" onClick={downloadBackup}>
            Download backup
          </button>
          <label className="btn secondary" htmlFor="backup-file">
            Restore backup
          </label>
          <input
            id="backup-file"
            type="file"
            accept="application/json,.json"
            hidden
            onChange={(event) => {
              const file = event.target.files?.[0];
              if (file) void importBackup(file);
              event.target.value = "";
            }}
          />
        </div>
      </section>
    </div>
  );
}
