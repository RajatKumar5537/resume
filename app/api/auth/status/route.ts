import { accountExists } from "@/lib/account";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const ready = await accountExists();
    return NextResponse.json({ needsSetup: !ready });
  } catch {
    return NextResponse.json({ error: "Could not reach the database." }, { status: 500 });
  }
}
