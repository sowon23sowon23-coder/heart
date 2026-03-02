import { NextResponse } from "next/server";

export async function POST(req) {
  try {
    const { id, password } = await req.json();

    const ADMIN_ID = process.env.ADMIN_USERNAME || process.env.ADMIN_ID || "admin";
    const ADMIN_PW = process.env.ADMIN_PASSWORD || process.env.ADMIN_PW || "password";

    if (id === ADMIN_ID && password === ADMIN_PW) {
      const token = Buffer.from(`${ADMIN_ID}:${ADMIN_PW}`).toString("base64");
      const res = NextResponse.json({ ok: true });
      res.cookies.set("admin_auth", token, {
        httpOnly: true,
        sameSite: "lax",
        secure: process.env.NODE_ENV === "production",
        path: "/",
        maxAge: 60 * 60 * 8,
      });
      return res;
    }

    return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
  } catch (err) {
    return NextResponse.json({ error: "Bad request" }, { status: 400 });
  }
}
