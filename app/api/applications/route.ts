import { isApplication, listApplications, removeApplication, writeApplication } from "@/lib/applications";
import { requireUser } from "@/lib/auth";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const userId = await requireUser();
    if (!userId) return NextResponse.json({ error: "Sign in to continue." }, { status: 401 });
    const rounds = await listApplications(userId);
    return NextResponse.json({ rounds });
  } catch {
    return NextResponse.json({ error: "Could not load your applications." }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const userId = await requireUser();
    if (!userId) return NextResponse.json({ error: "Sign in to continue." }, { status: 401 });
    const body = (await request.json()) as { round?: unknown };
    if (!isApplication(body.round)) {
      return NextResponse.json({ error: "Add the company name before saving." }, { status: 400 });
    }
    await writeApplication(userId, body.round);
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Could not save that round." }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const userId = await requireUser();
    if (!userId) return NextResponse.json({ error: "Sign in to continue." }, { status: 401 });
    const id = new URL(request.url).searchParams.get("id")?.trim() || "";
    if (!id) return NextResponse.json({ error: "Choose a round to delete." }, { status: 400 });
    await removeApplication(userId, id);
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Could not delete that round." }, { status: 500 });
  }
}
