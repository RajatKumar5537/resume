import { requireUser } from "@/lib/auth";
import { writeProfile } from "@/lib/desk-store";
import { profileFromResume } from "@/lib/import-resume";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

export async function POST(request: Request) {
  try {
    const userId = await requireUser();
    if (!userId) return NextResponse.json({ error: "Sign in to continue." }, { status: 401 });
    const form = await request.formData();
    const file = form.get("resume");
    if (!(file instanceof File)) return NextResponse.json({ error: "Choose a resume file." }, { status: 400 });
    const profile = await profileFromResume(file);
    await writeProfile(userId, profile);
    return NextResponse.json({ profile });
  } catch (caught) {
    const message = caught instanceof Error ? caught.message : "That resume could not be read.";
    const status = message === "Sign in to continue." ? 401 : 400;
    return NextResponse.json({ error: message }, { status });
  }
}
