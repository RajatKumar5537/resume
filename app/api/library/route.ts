import { requireUser } from "@/lib/auth";
import { foldersFromNotes } from "@/lib/library";
import { listInterviewFiles, notesRevision } from "@/lib/interview-library";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  try {
    const userId = await requireUser();
    if (!userId) return NextResponse.json({ error: "Sign in to continue." }, { status: 401 });
    const known = new URL(request.url).searchParams.get("revision")?.trim() || "";
    const revision = await notesRevision();
    if (known && revision && known === revision) {
      return NextResponse.json({ revision, unchanged: true });
    }
    const files = await listInterviewFiles();
    return NextResponse.json({
      revision,
      folders: foldersFromNotes(files),
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Could not open the programs.";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
