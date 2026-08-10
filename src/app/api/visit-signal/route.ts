import { readFile } from "node:fs/promises";
import { headers } from "next/headers";
import { NextResponse } from "next/server";

export const runtime = "nodejs";

const DEFAULT_KEY_FILE = "/root/.visitor-signal-key";
const DEFAULT_MONITOR_URL = "http://127.0.0.1:4010/serve-monitor/api/browser-signals/site";
const DEFAULT_SITE_URL = "https://www.libidiamonds.co.il/";
const MAX_BODY_BYTES = 4096;

async function getSignalKey() {
  const environmentKey = process.env.VISITOR_SIGNAL_KEY?.trim();
  if (environmentKey) return environmentKey;
  try {
    return (await readFile(process.env.VISITOR_SIGNAL_KEY_FILE || DEFAULT_KEY_FILE, "utf8")).trim();
  } catch {
    return "";
  }
}

function isSameOriginRequest(origin: string | null, host: string | null) {
  if (!origin || !host) return false;
  try {
    return new URL(origin).host.toLowerCase() === host.toLowerCase();
  } catch {
    return false;
  }
}

export async function POST(request: Request) {
  const requestHeaders = await headers();
  if (!isSameOriginRequest(requestHeaders.get("origin"), requestHeaders.get("host"))) {
    return NextResponse.json({ error: "Invalid signal origin" }, { status: 403 });
  }
  const contentLength = Number(requestHeaders.get("content-length") || 0);
  if (contentLength > MAX_BODY_BYTES) {
    return NextResponse.json({ error: "Signal payload is too large" }, { status: 413 });
  }

  const key = await getSignalKey();
  if (!key) {
    return NextResponse.json({ error: "Signal integration is unavailable" }, { status: 503 });
  }

  let payload: unknown;
  try {
    const rawBody = await request.text();
    if (new TextEncoder().encode(rawBody).byteLength > MAX_BODY_BYTES) {
      return NextResponse.json({ error: "Signal payload is too large" }, { status: 413 });
    }
    payload = JSON.parse(rawBody);
  } catch {
    return NextResponse.json({ error: "Invalid signal payload" }, { status: 400 });
  }

  const visitorIp = (requestHeaders.get("x-real-ip") || requestHeaders.get("x-forwarded-for") || "")
    .split(",")[0]
    .trim();
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 3000);
  try {
    const response = await fetch(process.env.SERVER_MONITOR_SIGNAL_URL || DEFAULT_MONITOR_URL, {
      method: "POST",
      cache: "no-store",
      headers: {
        "Content-Type": "application/json",
        "X-Visitor-Signal-Key": key,
        "X-Visitor-IP": visitorIp,
        "X-Visitor-User-Agent": requestHeaders.get("user-agent") || "",
        "X-Visitor-Site-Url": process.env.SITE_URL || process.env.NEXT_PUBLIC_SITE_URL || DEFAULT_SITE_URL,
      },
      body: JSON.stringify(payload),
      signal: controller.signal,
    });
    if (!response.ok) {
      return NextResponse.json({ error: "Signal integration rejected the event" }, { status: 502 });
    }
    return new NextResponse(null, { status: 204 });
  } catch {
    return NextResponse.json({ error: "Signal integration is unavailable" }, { status: 503 });
  } finally {
    clearTimeout(timeout);
  }
}
