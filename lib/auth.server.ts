import crypto from "crypto";
import { cookies } from "next/headers";
import { createSessionToken, verifySessionToken } from "@/lib/session";

const COOKIE = "klp-admin-session";
const EXPIRY_HOURS = 24;

// ── Password hashing (Node.js crypto — server only) ────────────────────────

export function hashPassword(password: string): string {
  const salt = crypto.randomBytes(16).toString("hex");
  const hash = crypto.scryptSync(password, salt, 64).toString("hex");
  return `${salt}:${hash}`;
}

export function verifyPassword(password: string, stored: string): boolean {
  const [salt, hash] = stored.split(":");
  const attempt = crypto.scryptSync(password, salt, 64).toString("hex");
  return crypto.timingSafeEqual(
    Buffer.from(hash, "hex"),
    Buffer.from(attempt, "hex")
  );
}

// ── Cookie helpers ──────────────────────────────────────────────────────────

export async function setSessionCookie(usuarioId: number): Promise<void> {
  const token = await createSessionToken(usuarioId);
  const store = await cookies();
  store.set(COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: EXPIRY_HOURS * 60 * 60,
    path: "/",
  });
}

export async function clearSessionCookie(): Promise<void> {
  const store = await cookies();
  store.delete(COOKIE);
}

export async function getSessionUserId(): Promise<number | null> {
  const store = await cookies();
  const token = store.get(COOKIE)?.value;
  if (!token) return null;
  return verifySessionToken(token);
}
