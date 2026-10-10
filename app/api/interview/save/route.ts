import { requireUser } from "@/lib/auth";
import { saveGeneratedProgram } from "@/lib/save-program";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    const userId = await requireUser();
    if (!userId) return NextResponse.json({ error: "Sign in to continue." }, { status: 401 });
    const body = (await request.json()) as {
      title?: string;
      language?: string;
      code?: string;
      explanation?: string;
      aliases?: string[];
    };
    const saved = await saveGeneratedProgram(userId, {
      title: body.title || "",
      language: body.language || "java",
      code: body.code || "",
      explanation: body.explanation,
      aliases: body.aliases,
    });
    return NextResponse.json({
      path: saved.path,
      duplicate: saved.duplicate,
      message: saved.duplicate ? "This program is already in your library." : "Saved to your library.",
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Could not save that program.";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
