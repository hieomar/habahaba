/**
 * Lightweight JWT utility using the Web Crypto API (crypto.subtle).
 * Works in both Node.js and Edge Runtime (Next.js middleware).
 */

const ALG = "HS256";
const SESSION_EXPIRY_SECONDS = 60 * 60 * 8; // 8 hours

function getSecret() {
  const secret = process.env.JWT_SECRET || "dev-secret-for-gtms-local-only";
  return secret;
}

/** Encode to base64url */
function b64url(buf) {
  return btoa(String.fromCharCode(...new Uint8Array(buf)))
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");
}

/** Decode from base64url to string */
function fromB64url(str) {
  const base64 = str.replace(/-/g, "+").replace(/_/g, "/");
  return atob(base64);
}

/** Import the HMAC-SHA256 key from the secret string */
async function importKey(secret) {
  const enc = new TextEncoder();
  return crypto.subtle.importKey(
    "raw",
    enc.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign", "verify"]
  );
}

/**
 * Sign a JWT payload with HS256.
 * @param {object} payload
 * @param {number} [expiresInSeconds]
 * @returns {Promise<string>} JWT token
 */
export async function signToken(payload, expiresInSeconds = SESSION_EXPIRY_SECONDS) {
  const secret = getSecret();
  const now = Math.floor(Date.now() / 1000);
  const enc = new TextEncoder();

  const header = b64url(enc.encode(JSON.stringify({ alg: ALG, typ: "JWT" })));
  const body = b64url(enc.encode(JSON.stringify({ ...payload, iat: now, exp: now + expiresInSeconds })));

  const key = await importKey(secret);
  const sigBuf = await crypto.subtle.sign("HMAC", key, enc.encode(`${header}.${body}`));
  const sig = b64url(sigBuf);

  return `${header}.${body}.${sig}`;
}

/**
 * Verify and decode a JWT token.
 * Throws if invalid or expired.
 * @param {string} token
 * @returns {Promise<object>} decoded payload
 */
export async function verifyToken(token) {
  const secret = getSecret();
  const parts = token.split(".");
  if (parts.length !== 3) throw new Error("Malformed token.");

  const [header, body, sig] = parts;
  const enc = new TextEncoder();

  const key = await importKey(secret);
  const sigBuf = Uint8Array.from(atob(sig.replace(/-/g, "+").replace(/_/g, "/")), (c) => c.charCodeAt(0));
  const valid = await crypto.subtle.verify("HMAC", key, sigBuf, enc.encode(`${header}.${body}`));
  if (!valid) throw new Error("Invalid token signature.");

  const payload = JSON.parse(fromB64url(body));
  const now = Math.floor(Date.now() / 1000);
  if (payload.exp && payload.exp < now) throw new Error("Token has expired.");

  return payload;
}

export const COOKIE_NAME = "nasfam_session";

export const COOKIE_OPTIONS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "strict",
  path: "/",
  maxAge: SESSION_EXPIRY_SECONDS,
};
