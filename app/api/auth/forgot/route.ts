import { resetPassword } from "@/lib/account";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as { email?: string; password?: string; confirm?: string };
    const password = body.password || "";
    if (password !== (body.confirm || "")) {
      return NextResponse.json({ error: "The two passwords do not match." }, { status: 400 });
    }
    const account = await resetPassword(body.email || "", password);
    return NextResponse.json({ ok: true, email: account.email });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Could not reset the password.";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
