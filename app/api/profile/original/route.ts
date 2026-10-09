import { requireUser } from "@/lib/auth";
import { readOriginal } from "@/lib/desk-store";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const userId = await requireUser();
  if (!userId) return NextResponse.json({ error: "Sign in to continue." }, { status: 401 });
  const file = await readOriginal(userId);
  if (new URL(request.url).searchParams.get("meta") === "1") {
    return NextResponse.json({ fileName: file?.fileName || "" });
  }
  if (!file) {
    return NextResponse.json(
      { error: "Upload your resume on the master profile to keep the original file." },
      { status: 404 },
    );
  }
  const mime = file.mime === "text/plain" ? "text/plain" : "application/pdf";
  const encoded = encodeURIComponent(file.fileName);
  const quoted = file.fileName.replace(/"/g, "");
  return new NextResponse(new Uint8Array(Buffer.from(file.data, "base64")), {
    headers: {
      "Content-Type": mime,
      "Content-Disposition": `attachment; filename="${quoted}"; filename*=UTF-8''${encoded}`,
      "Cache-Control": "no-store",
    },
  });
}
