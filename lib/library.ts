import { listInterviewFiles, readInterviewNote, type StoredNote } from "@/lib/interview-library";

export type LibraryFile = {
  path: string;
  name: string;
  kind: "java" | "pdf";
};

export type LibraryFolder = {
  id: string;
  label: string;
  files: LibraryFile[];
};

const FOLDERS: { id: string; label: string; match: (path: string) => boolean }[] = [
  { id: "java", label: "Java", match: (path) => path.startsWith("src/main/java/Java/") },
  { id: "pattern", label: "Pattern program", match: (path) => path.includes("/Pattern_Program/") },
  { id: "selenium", label: "Selenium", match: (path) => path.includes("/Selenium/") },
  { id: "sorting", label: "Sorting", match: (path) => path.includes("/Sorting/") },
  { id: "string", label: "String program", match: (path) => path.includes("/StringProgram/") },
  { id: "restassured", label: "Rest Assured", match: (path) => path.includes("/RestAssuredProgram/") },
  { id: "pdf", label: "PDF", match: (path) => path.startsWith("Interview_PDF/") },
];

export function foldersFromNotes(notes: { path: string; title?: string; kind: "java" | "pdf" }[]): LibraryFolder[] {
  return FOLDERS.map((folder) => ({
    id: folder.id,
    label: folder.label,
    files: notes
      .filter((note) => folder.match(note.path))
      .map((note) => ({
        path: note.path,
        name: note.path.split("/").pop() || note.title || note.path,
        kind: note.kind,
      }))
      .sort((a, b) => a.name.localeCompare(b.name, undefined, { sensitivity: "base" })),
  })).filter((folder) => folder.files.length > 0);
}

export async function libraryTree(): Promise<LibraryFolder[]> {
  return foldersFromNotes(await listInterviewFiles());
}

export async function libraryNote(path: string): Promise<StoredNote | null> {
  return readInterviewNote(path);
}
