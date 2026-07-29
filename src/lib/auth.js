import "server-only";
import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";

const JWT_SECRET = process.env.JWT_SECRET;
const key = JWT_SECRET ? new TextEncoder().encode(JWT_SECRET) : null;

export const SESSION_COOKIE = "fd_session";
// Separate, non-sensitive cookie (readable by JS, not httpOnly) that only
// ever holds "dark" or "light". It exists purely so the theme-init script in
// the root layout can avoid a flash of the wrong theme before the real
// dashboard data has loaded from the API -- see the guide for why.
export const THEME_COOKIE = "fd_theme";

const SESSION_MAX_AGE = 60 * 60 * 24 * 7; // 7 days, in seconds

function requireKey() {
  if (!key) {
    throw new Error("Please define the JWT_SECRET environment variable in .env.local");
  }
  return key;
}

export async function signSessionToken(payload) {
  return new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(`${SESSION_MAX_AGE}s`)
    .sign(requireKey());
}

/**
 * Verifies a raw token string and returns its payload, or null if missing/
 * invalid/expired. Takes a plain string (not a cookie jar) so it works the
 * same way whether the caller read the cookie via next/headers' cookies()
 * (Route Handlers, Server Components) or via request.cookies (proxy.js) --
 * those two APIs are different, but by the time we get here it's just a string.
 */
export async function verifySessionToken(token) {
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, requireKey(), { algorithms: ["HS256"] });
    return payload;
  } catch {
    return null;
  }
}

export async function setSessionCookies(token, darkMode) {
  const store = await cookies();
  store.set(SESSION_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: SESSION_MAX_AGE,
  });
  store.set(THEME_COOKIE, darkMode ? "dark" : "light", {
    httpOnly: false,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: SESSION_MAX_AGE,
  });
}

export async function updateThemeCookie(darkMode) {
  const store = await cookies();
  store.set(THEME_COOKIE, darkMode ? "dark" : "light", {
    httpOnly: false,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: SESSION_MAX_AGE,
  });
}

export async function clearSessionCookies() {
  const store = await cookies();
  store.delete(SESSION_COOKIE);
  store.delete(THEME_COOKIE);
}

/** Convenience used by Route Handlers / Server Components. */
export async function getSessionUserId() {
  const store = await cookies();
  const token = store.get(SESSION_COOKIE)?.value;
  const payload = await verifySessionToken(token);
  return payload?.userId ?? null;
}
