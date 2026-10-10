import { libraryNote } from "@/lib/library";
import { requireUser } from "@/lib/auth";
import { ownerSlug } from "@/lib/save-program";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  try {
    const userId = await requireUser();
    if (!userId) return NextResponse.json({ error: "Sign in to continue." }, { status: 401 });
    const path = new URL(request.url).searchParams.get("path")?.trim() || "";
    if (path.startsWith("library/") && !path.startsWith(`library/${ownerSlug(userId)}/`)) {
      return NextResponse.json({ error: "That file is not saved." }, { status: 404 });
    }
    const note = path ? await libraryNote(path) : null;
    if (!note) return NextResponse.json({ error: "That file is not saved." }, { status: 404 });
    return NextResponse.json({
      path: note.path,
      name: note.path.split("/").pop() || note.title,
      kind: note.kind,
      text: note.text,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Could not open that file.";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
