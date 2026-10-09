import { requireUser } from "@/lib/auth";
import { writeOriginal, writeProfile } from "@/lib/desk-store";
import { profileFromResume } from "@/lib/import-resume";
import { NextResponse } from "next/server";

function safeName(name: string): string {
  const cleaned = name.replace(/[/\\?%*:|"<>]/g, "").replace(/\s+/g, " ").trim();
  return (cleaned || "resume.pdf").slice(0, 120);
}

export const dynamic = "force-dynamic";
export const maxDuration = 60;

export async function POST(request: Request) {
  try {
    const userId = await requireUser();
    if (!userId) return NextResponse.json({ error: "Sign in to continue." }, { status: 401 });
    const form = await request.formData();
    const file = form.get("resume");
    if (!(file instanceof File)) return NextResponse.json({ error: "Choose a resume file." }, { status: 400 });
    const bytes = Buffer.from(await file.arrayBuffer());
    const upload = new File([bytes], file.name, { type: file.type || "application/octet-stream" });
    const profile = await profileFromResume(upload);
    const pdf = file.name.toLowerCase().endsWith(".pdf") || file.type === "application/pdf";
    await writeProfile(userId, profile);
    await writeOriginal(userId, {
      fileName: safeName(file.name),
      mime: pdf ? "application/pdf" : "text/plain",
      data: bytes.toString("base64"),
    });
    return NextResponse.json({ profile, originalName: safeName(file.name) });
  } catch (caught) {
    const message = caught instanceof Error ? caught.message : "That resume could not be read.";
    const status = message === "Sign in to continue." ? 401 : 400;
    return NextResponse.json({ error: message }, { status });
  }
}
