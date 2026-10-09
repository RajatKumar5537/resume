export type ExtractedJob = {
  title: string;
  company: string;
  text: string;
};

function decode(text: string): string {
  return text
    .replace(/&nbsp;/gi, " ")
    .replace(/&amp;/gi, "&")
    .replace(/&lt;/gi, "<")
    .replace(/&gt;/gi, ">")
    .replace(/&quot;/gi, '"')
    .replace(/&#39;|&apos;/gi, "'")
    .replace(/&#(\d+);/g, (_, value: string) => String.fromCharCode(Number(value)))
    .replace(/&#x([0-9a-f]+);/gi, (_, value: string) => String.fromCharCode(parseInt(value, 16)));
}

export function stripHtml(html: string): string {
  const withoutNoise = html
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<noscript[\s\S]*?<\/noscript>/gi, " ");
  const text = decode(withoutNoise)
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<\/(p|div|li|h1|h2|h3|h4|tr|section|article)>/gi, "\n")
    .replace(/<li[^>]*>/gi, "\n- ")
    .replace(/<[^>]+>/g, " ");
  return text
    .replace(/\r/g, "")
    .replace(/[ \t]+\n/g, "\n")
    .replace(/[ \t]{2,}/g, " ")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

function asRecords(value: unknown): Record<string, unknown>[] {
  if (!value) return [];
  if (Array.isArray(value)) return value.flatMap((item) => asRecords(item));
  if (typeof value === "object") {
    const record = value as Record<string, unknown>;
    if (record["@graph"]) return asRecords(record["@graph"]);
    return [record];
  }
  return [];
}

function isJobPosting(node: Record<string, unknown>): boolean {
  const kind = node["@type"];
  const types = Array.isArray(kind) ? kind : [kind];
  return types.some((type) => String(type).toLowerCase().includes("jobposting"));
}

function organizationName(value: unknown): string {
  if (typeof value === "string") return value.trim();
  if (value && typeof value === "object" && "name" in value) {
    const name = (value as { name?: unknown }).name;
    return typeof name === "string" ? name.trim() : "";
  }
  return "";
}

function fromJsonLd(html: string): ExtractedJob | null {
  const blocks = html.matchAll(/<script[^>]*type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi);
  let best: ExtractedJob | null = null;
  for (const block of blocks) {
    try {
      const parsed: unknown = JSON.parse(block[1]);
      for (const node of asRecords(parsed)) {
        if (!isJobPosting(node)) continue;
        const description = typeof node.description === "string" ? stripHtml(node.description) : "";
        if (!best || description.length > best.text.length) {
          best = {
            title: typeof node.title === "string" ? node.title.trim() : "",
            company: organizationName(node.hiringOrganization),
            text: description,
          };
        }
      }
    } catch {
      continue;
    }
  }
  return best;
}

function firstLine(html: string): string {
  return stripHtml(html)
    .split("\n")
    .map((line) => line.trim())
    .find(Boolean) ?? "";
}

function pageMeta(html: string): { title: string; company: string } {
  const title = firstLine(html.match(/<h1[^>]*topcard__title[^>]*>([\s\S]*?)<\/h1>/i)?.[1] ?? "");
  const company = firstLine(html.match(/<a[^>]*topcard__org-name-link[^>]*>([\s\S]*?)<\/a>/i)?.[1] ?? "");
  return { title, company };
}

function descriptionHtml(html: string): string {
  const markup = html.match(/<div class="show-more-less-html__markup[^"]*"[^>]*>([\s\S]*?)<\/div>/i)?.[1];
  if (markup && stripHtml(markup).length >= 80) return markup;
  const block = html.match(
    /<(?:div|section)[^>]*class="[^"]*(?:jobs-description__content|job-description|posting-description)[^"]*"[^>]*>([\s\S]*?)<\/(?:div|section)>/i,
  )?.[1];
  return block && stripHtml(block).length >= 80 ? block : "";
}

const STOP_MARKERS = [
  "\nsimilar jobs",
  "\npeople also viewed",
  "\nsimilar searches",
  "\nexplore top content",
  "\nshow more jobs like this",
  "\nreferrals increase your chances",
  "\nget notified about new",
];

function trimJobText(text: string): string {
  const aboutAt = ["about the job", "company description", "job description"]
    .map((marker) => text.toLowerCase().indexOf(marker))
    .filter((index) => index >= 0)
    .sort((a, b) => a - b)[0];
  const body = aboutAt !== undefined && aboutAt > 400 ? text.slice(aboutAt) : text;
  const lower = body.toLowerCase();
  let end = body.length;
  for (const marker of STOP_MARKERS) {
    const at = lower.indexOf(marker);
    if (at > 200 && at < end) end = at;
  }
  return body
    .slice(0, end)
    .split("\n")
    .map((line) => line.trim())
    .filter((line) => line && !/^(apply|save|show|sign in|show more|show less|report this job)$/i.test(line))
    .join("\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim()
    .slice(0, 14000);
}

export function extractJob(html: string): ExtractedJob {
  const structured = fromJsonLd(html);
  const meta = pageMeta(html);
  const posted = descriptionHtml(html);
  const main = html.match(/<main[\s\S]*?<\/main>/i)?.[0] ?? html.match(/<article[\s\S]*?<\/article>/i)?.[0] ?? html;
  const description = posted
    ? trimJobText(stripHtml(posted))
    : trimJobText(stripHtml(main));
  const structuredText = structured ? trimJobText(structured.text) : "";
  const text =
    structuredText.length > description.length && structuredText.length >= 200 ? structuredText : description || structuredText;

  return {
    title: meta.title || structured?.title || "",
    company: meta.company || structured?.company || "",
    text: text.slice(0, 14000),
  };
}
