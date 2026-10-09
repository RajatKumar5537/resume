import { writeFreshResume } from "@/lib/ai-resume";
import { requireUser } from "@/lib/auth";
import { needsMasterResume } from "@/lib/default-profile";
import { pruneExpiredResumes, readProfile, writeResume } from "@/lib/desk-store";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

export async function POST(request: Request) {
  try {
    const userId = await requireUser();
    if (!userId) return NextResponse.json({ error: "Sign in to continue." }, { status: 401 });
    const profile = await readProfile(userId);
    if (!profile || needsMasterResume(profile)) {
      return NextResponse.json({ error: "Upload your resume on the master profile first." }, { status: 400 });
    }
    const body = (await request.json()) as {
      jobText?: unknown;
      jobTitle?: unknown;
      company?: unknown;
      jobUrl?: unknown;
    };
    const jobText = typeof body.jobText === "string" ? body.jobText : "";
    if (jobText.trim().length < 80) {
      return NextResponse.json({ error: "Paste more of the job description so the resume can match it." }, { status: 400 });
    }
    const doc = await writeFreshResume({
      profile,
      jobText,
      jobTitle: typeof body.jobTitle === "string" ? body.jobTitle : "",
      company: typeof body.company === "string" ? body.company : "",
      jobUrl: typeof body.jobUrl === "string" ? body.jobUrl : "",
    });
    await pruneExpiredResumes(userId);
    await writeResume(userId, doc);
    return NextResponse.json({ resume: doc });
  } catch (caught) {
    const message = caught instanceof Error ? caught.message : "Could not write this resume.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
