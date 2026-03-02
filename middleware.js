import { NextResponse } from "next/server";

function makeToken(username, password) {
  return btoa(`${username}:${password}`);
}

function parseBasicAuth(authHeader) {
  if (!authHeader || !authHeader.startsWith("Basic ")) return null;
  try {
    const base64 = authHeader.slice(6).trim();
    const decoded = atob(base64);
    const sep = decoded.indexOf(":");
    if (sep < 0) return null;
    return {
      username: decoded.slice(0, sep),
      password: decoded.slice(sep + 1),
    };
  } catch {
    return null;
  }
}

export function middleware(req) {
  if (req.nextUrl.pathname === "/api/admin/check") {
    return NextResponse.next();
  }
  const expectedUser = process.env.ADMIN_USERNAME;
  const expectedPass = process.env.ADMIN_PASSWORD;

  const unauthorized = () =>
    new NextResponse("Authentication required.", {
      status: 401,
      headers: { "WWW-Authenticate": 'Basic realm="Admin Area"' },
    });

  if (!expectedUser || !expectedPass) return unauthorized();

  const expectedToken = makeToken(expectedUser, expectedPass);
  const cookieToken = req.cookies.get("admin_auth")?.value;
  if (cookieToken === expectedToken) return NextResponse.next();

  const auth = parseBasicAuth(req.headers.get("authorization"));
  if (!auth) return unauthorized();

  if (auth.username !== expectedUser || auth.password !== expectedPass) {
    return unauthorized();
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*", "/api/admin/:path*"],
};
