import { NextResponse } from "next/server";
import { SESSION_COOKIE, verifySessionToken } from "@/lib/auth";

// Pages that don't require a session. Everything else under the matcher
// below redirects to /login if there's no valid session cookie.
const PUBLIC_PATHS = new Set(["/login", "/signup"]);

// Deliberately thin: this only checks whether the JWT is present and
// correctly signed (no database call), and only decides page-level
// redirects. Every API route that actually touches data (src/app/api/user/*,
// src/app/api/gemini) re-verifies the session and re-derives userId itself
// -- proxy.js is a first pass, not the only check.
export async function proxy(request) {
  const { pathname } = request.nextUrl;
  const token = request.cookies.get(SESSION_COOKIE)?.value;
  const payload = await verifySessionToken(token);
  const isAuthed = Boolean(payload);
  const isPublicPath = PUBLIC_PATHS.has(pathname);

  if (!isAuthed && !isPublicPath) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    return NextResponse.redirect(url);
  }

  if (isAuthed && isPublicPath) {
    const url = request.nextUrl.clone();
    url.pathname = "/";
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  // Everything except API routes (which handle their own auth) and Next's
  // internal static/image assets.
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
