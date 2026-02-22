import { NextResponse } from "next/server";

export async function POST(req) {
  try {
    const { id, password } = await req.json();

    const ADMIN_ID = process.env.ADMIN_ID || "admin";
    const ADMIN_PW = process.env.ADMIN_PW || "password";

    if (id === ADMIN_ID && password === ADMIN_PW) {
      return NextResponse.json({ ok: true });
    }

    return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
  } catch (err) {
    return NextResponse.json({ error: "Bad request" }, { status: 400 });
  }
}
