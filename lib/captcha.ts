import "server-only";
import crypto from "node:crypto";

// A stateless math captcha: the challenge (a, b) is signed with a server secret so we
// can verify it wasn't tampered with, without needing session/DB storage for anonymous
// public form submissions. This stops generic spam scripts that fill in arbitrary text,
// not a targeted attacker who reads the page source — that's the deliberate, accepted
// trade-off for a "simple math captcha" versus a full challenge service.

const SECRET = process.env.AUTH_SECRET ?? "dev-only-fallback-secret-change-me";

export interface MathCaptcha {
  a: number;
  b: number;
  token: string;
}

function sign(a: number, b: number): string {
  return crypto.createHmac("sha256", SECRET).update(`${a}:${b}`).digest("hex");
}

export function generateMathCaptcha(): MathCaptcha {
  const a = Math.floor(Math.random() * 10) + 1;
  const b = Math.floor(Math.random() * 10) + 1;
  return { a, b, token: sign(a, b) };
}

export function verifyMathCaptcha(a: number, b: number, token: string, answer: number): boolean {
  if (!Number.isFinite(a) || !Number.isFinite(b) || !Number.isFinite(answer)) return false;

  const expected = sign(a, b);
  const expectedBuf = Buffer.from(expected);
  const givenBuf = Buffer.from(String(token ?? ""));
  const tokenValid =
    expectedBuf.length === givenBuf.length && crypto.timingSafeEqual(expectedBuf, givenBuf);

  return tokenValid && answer === a + b;
}
