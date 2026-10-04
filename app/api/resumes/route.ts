import { isProfile, isResume, listResumes, removeResume, replaceDesk, writeResume } from "@/lib/desk-store";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const resumes = await listResumes();
    return NextResponse.json({ resumes });
  } catch {
    return NextResponse.json({ error: "Could not load your resumes from the database." }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const body = (await request.json()) as { resume?: unknown; profile?: unknown; resumes?: unknown };
    if (body.resume) {
      if (!isResume(body.resume)) {
        return NextResponse.json({ error: "That resume could not be saved." }, { status: 400 });
      }
      await writeResume(body.resume);
      return NextResponse.json({ ok: true });
    }
    if (body.profile && Array.isArray(body.resumes)) {
      if (!isProfile(body.profile) || !body.resumes.every(isResume)) {
        return NextResponse.json({ error: "That backup could not be restored." }, { status: 400 });
      }
      await replaceDesk(body.profile, body.resumes);
      return NextResponse.json({ ok: true });
    }
    return NextResponse.json({ error: "Nothing to save." }, { status: 400 });
  } catch {
    return NextResponse.json({ error: "Could not save to the database." }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const id = new URL(request.url).searchParams.get("id")?.trim() || "";
    if (!id) return NextResponse.json({ error: "Missing resume." }, { status: 400 });
    await removeResume(id);
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Could not delete that resume." }, { status: 500 });
  }
}
