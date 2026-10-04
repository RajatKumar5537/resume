import { createAccount } from "@/lib/account";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as { name?: string; email?: string; password?: string };
    const account = await createAccount({
      name: body.name || "",
      email: body.email || "",
      password: body.password || "",
    });
    return NextResponse.json({ ok: true, email: account.email });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Could not create the account.";
    const status = message.includes("already exists") ? 409 : 400;
    return NextResponse.json({ error: message }, { status });
  }
}
