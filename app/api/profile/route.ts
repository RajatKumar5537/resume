import { isProfile, readProfile, writeProfile } from "@/lib/desk-store";
import { requireUser } from "@/lib/auth";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    if (!(await requireUser())) return NextResponse.json({ error: "Sign in to continue." }, { status: 401 });
    const profile = await readProfile();
    return NextResponse.json({ profile });
  } catch {
    return NextResponse.json({ error: "Could not load your profile from the database." }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    if (!(await requireUser())) return NextResponse.json({ error: "Sign in to continue." }, { status: 401 });
    const body = (await request.json()) as { profile?: unknown };
    if (!isProfile(body.profile)) {
      return NextResponse.json({ error: "That profile could not be saved." }, { status: 400 });
    }
    await writeProfile(body.profile);
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Could not save your profile to the database." }, { status: 500 });
  }
}
