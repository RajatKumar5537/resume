const LIBRARY_KEY = "desk-library-list";

export type LibraryListFile = {
  path: string;
  name: string;
  kind: "java" | "pdf";
};

export type LibraryListResponse = {
  revision?: string;
  folders?: { id: string; label: string; files: LibraryListFile[] }[];
  unchanged?: boolean;
  error?: string;
};

function savedRevision(): string {
  if (typeof window === "undefined") return "";
  try {
    const raw = localStorage.getItem(LIBRARY_KEY);
    if (!raw) return "";
    const data = JSON.parse(raw) as { revision?: string; folders?: unknown[] };
    if (!data.revision || !Array.isArray(data.folders) || !data.folders.length) return "";
    return data.revision;
  } catch {
    return "";
  }
}

let pending: { revision: string; request: Promise<LibraryListResponse> } | null = null;

function requestLibrary(revision: string): Promise<LibraryListResponse> {
  if (pending?.revision === revision) return pending.request;
  const request = fetch(`/api/library?revision=${encodeURIComponent(revision)}`).then(async (response) => {
    const data = (await response.json()) as LibraryListResponse;
    if (!response.ok) throw new Error(data.error || "Could not open the programs.");
    return data;
  });
  pending = { revision, request };
  return request;
}

export function prefetchLibraryList(): void {
  if (typeof window === "undefined") return;
  void requestLibrary(savedRevision()).catch(() => {
    pending = null;
  });
}

export function loadLibraryList(revision: string, fresh = false): Promise<LibraryListResponse> {
  if (fresh) pending = null;
  return requestLibrary(revision);
}
