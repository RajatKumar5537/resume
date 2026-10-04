import { planLibrarySync, saveLibraryFile } from "@/lib/sync-library";
import { requireUser } from "@/lib/auth";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

export async function POST(request: Request) {
  try {
    const userId = await requireUser();
    if (!userId) return NextResponse.json({ error: "Sign in to continue." }, { status: 401 });
    const body = (await request.json().catch(() => ({}))) as { path?: string; sha?: string };
    if (body.path) {
      const name = await saveLibraryFile(body.path, body.sha || "");
      return NextResponse.json({ name });
    }
    const plan = await planLibrarySync();
    return NextResponse.json({
      pending: plan.pending,
      removed: plan.removed,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Could not update the notes.";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
