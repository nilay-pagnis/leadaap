import { NextResponse } from "next/server";

const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function POST(req: Request) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  if (!body || typeof body !== "object") {
    return NextResponse.json({ error: "Invalid body" }, { status: 400 });
  }

  const { name, email, message } = body as Record<string, unknown>;
  const n = typeof name === "string" ? name.trim() : "";
  const e = typeof email === "string" ? email.trim().toLowerCase() : "";
  const m = typeof message === "string" ? message.trim() : "";

  if (!n || !e || !m) {
    return NextResponse.json({ error: "Name, email, and message are required." }, { status: 400 });
  }
  if (n.length > 200 || m.length > 8000) {
    return NextResponse.json({ error: "Message too long." }, { status: 400 });
  }
  if (!emailRe.test(e)) {
    return NextResponse.json({ error: "Invalid email address." }, { status: 400 });
  }

  if (process.env.NODE_ENV === "development") {
    console.info("[contact]", { name: n, email: e, messagePreview: m.slice(0, 120) });
  }

  return NextResponse.json({ ok: true });
}
