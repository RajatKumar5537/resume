import { extractJob } from "@/lib/extract-job";
import { requireUser } from "@/lib/auth";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

function isBlockedHost(hostname: string): boolean {
  const host = hostname.toLowerCase().replace(/\.+$/, "");
  if (host === "localhost" || host.endsWith(".localhost") || host.endsWith(".local")) return true;
  if (host === "::1" || host === "0.0.0.0") return true;
  const bare = host.startsWith("[") && host.endsWith("]") ? host.slice(1, -1) : host;
  const match = /^(\d{1,3})\.(\d{1,3})\.(\d{1,3})\.(\d{1,3})$/.exec(bare);
  if (!match) return false;
  const a = Number(match[1]);
  const b = Number(match[2]);
  if ([a, b, Number(match[3]), Number(match[4])].some((part) => part > 255)) return true;
  if (a === 10 || a === 127 || a === 0) return true;
  if (a === 169 && b === 254) return true;
  if (a === 172 && b >= 16 && b <= 31) return true;
  if (a === 192 && b === 168) return true;
  if (a === 100 && b >= 64 && b <= 127) return true;
  return false;
}

async function fetchPublic(url: string): Promise<Response> {
  let current = url;
  for (let hop = 0; hop < 4; hop += 1) {
    const parsed = new URL(current);
    if (!["http:", "https:"].includes(parsed.protocol) || isBlockedHost(parsed.hostname)) {
      throw new Error("That link cannot be read. Paste the job description instead.");
    }
    const response = await fetch(parsed, {
      redirect: "manual",
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36",
        Accept: "text/html,application/xhtml+xml",
      },
      signal: AbortSignal.timeout(12000),
    });
    if (response.status >= 300 && response.status < 400) {
      const location = response.headers.get("location");
      if (!location) throw new Error("That link cannot be read. Paste the job description instead.");
      current = new URL(location, parsed).toString();
      continue;
    }
    return response;
  }
  throw new Error("That link cannot be read. Paste the job description instead.");
}

export async function POST(request: Request) {
  if (!(await requireUser())) return NextResponse.json({ error: "Sign in to continue." }, { status: 401 });
  let url = "";
  try {
    const body = (await request.json()) as { url?: unknown };
    url = typeof body.url === "string" ? body.url.trim() : "";
  } catch {
    return NextResponse.json({ error: "Paste a job link or the job description." }, { status: 400 });
  }

  if (!url) {
    return NextResponse.json({ error: "Paste a job link or the job description." }, { status: 400 });
  }

  try {
    const response = await fetchPublic(url);
    if (!response.ok) {
      return NextResponse.json(
        { error: "That page did not open. Paste the job description instead." },
        { status: 422 },
      );
    }
    const html = (await response.text()).slice(0, 1_500_000);
    const job = extractJob(html);
    const warning =
      job.text.length < 280
        ? "The page did not include the full description. Paste the job text below."
        : "";
    return NextResponse.json({
      title: job.title,
      company: job.company,
      text: job.text,
      warning,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "That link cannot be read. Paste the job description instead.";
    return NextResponse.json({ error: message }, { status: 422 });
  }
}
