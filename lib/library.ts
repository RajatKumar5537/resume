import { listInterviewFiles, readInterviewNote, type StoredNote } from "@/lib/interview-library";
import { BUILT_IN_PROGRAMS, builtInProgram } from "@/lib/built-in-programs";

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
  {
    id: "array",
    label: "Array",
    match: (path) =>
      path.includes("/Sorting/") ||
      /\/(CountPrimeNumberInArray|LargestElement|SecondLargest|RemoveDuplicateNumberArray|SumOfArray|SumOfEvenOddIndex|UniqueCombinations|nthBigestElement_Array|nthSmallestElement_Array)\.java$/i.test(path),
  },
  {
    id: "string",
    label: "String",
    match: (path) => path.includes("/StringProgram/") || /\/(RemoveDuplicateAlphabate|ReplaceCharacter)\.java$/i.test(path),
  },
  {
    id: "collection",
    label: "Collection",
    match: (path) =>
      path.startsWith("built-in/collection/") ||
      path.includes("/Collection/") ||
      /\/(?:HashMap|ArrayList|LinkedList|HashSet|TreeSet|PriorityQueue|Queue|Stack)[^/]*\.java$/i.test(path),
  },
  { id: "pattern", label: "Pattern", match: (path) => path.includes("/Pattern_Program/") },
  { id: "number", label: "Number", match: (path) => path.startsWith("src/main/java/Java/") },
  { id: "selenium", label: "Selenium", match: (path) => path.includes("/Selenium/") },
  { id: "restassured", label: "REST Assured", match: (path) => path.includes("/RestAssuredProgram/") },
  { id: "pdf", label: "PDF", match: (path) => path.startsWith("Interview_PDF/") },
];

export function foldersFromNotes(notes: { path: string; title?: string; kind: "java" | "pdf" }[]): LibraryFolder[] {
  const folderFor = (path: string) => FOLDERS.find((folder) => folder.match(path));
  return FOLDERS.map((folder) => ({
    id: folder.id,
    label: folder.label,
    files: notes
      .filter((note) => folderFor(note.path)?.id === folder.id)
      .map((note) => ({
        path: note.path,
        name: note.path.split("/").pop() || note.title || note.path,
        kind: note.kind,
      }))
      .sort((a, b) => a.name.localeCompare(b.name, undefined, { sensitivity: "base" })),
  })).filter((folder) => folder.files.length > 0);
}

export async function libraryTree(): Promise<LibraryFolder[]> {
  return foldersFromNotes([...(await listInterviewFiles()), ...BUILT_IN_PROGRAMS]);
}

export async function libraryNote(path: string): Promise<StoredNote | null> {
  const builtIn = builtInProgram(path);
  if (builtIn) return builtIn;
  return readInterviewNote(path);
}
