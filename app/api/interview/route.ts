import { answerInterview } from "@/lib/interview";
import { requireUser } from "@/lib/auth";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    const userId = await requireUser();
    if (!userId) return NextResponse.json({ error: "Sign in to continue." }, { status: 401 });
    const body = (await request.json()) as { question?: string };
    const question = (body.question || "").trim();
    if (question.length > 1000) {
      return NextResponse.json({ error: "Keep the question under 1000 characters." }, { status: 400 });
    }
    const result = await answerInterview(question);
    return NextResponse.json(result);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Could not answer that question.";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
