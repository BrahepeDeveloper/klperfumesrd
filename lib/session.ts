// Edge-compatible session tokens using Web Crypto API (no Node.js Buffer)

const EXPIRY_HOURS = 24;

function getSecret(): string {
  return process.env.SESSION_SECRET ?? "dev-secret-change-in-production";
}

async function getHmacKey(): Promise<CryptoKey> {
  return crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(getSecret()),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign", "verify"]
  );
}

function bytesToHex(buf: ArrayBuffer): string {
  return Array.from(new Uint8Array(buf))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

function hexToBytes(hex: string): Uint8Array<ArrayBuffer> {
  const buf = new ArrayBuffer(hex.length / 2);
  const arr = new Uint8Array(buf);
  for (let i = 0; i < hex.length; i += 2) {
    arr[i / 2] = parseInt(hex.slice(i, i + 2), 16);
  }
  return arr;
}

function b64urlEncode(str: string): string {
  return btoa(str).replace(/\+/g, "-").replace(/\//g, "_").replace(/=/g, "");
}

function b64urlDecode(str: string): string {
  const base64 = str.replace(/-/g, "+").replace(/_/g, "/");
  const padded = base64 + "=".repeat((4 - (base64.length % 4)) % 4);
  return atob(padded);
}

export async function createSessionToken(usuarioId: number): Promise<string> {
  const expiry = Date.now() + EXPIRY_HOURS * 60 * 60 * 1000;
  const payload = `${usuarioId}.${expiry}`;
  const key = await getHmacKey();
  const sig = await crypto.subtle.sign(
    "HMAC",
    key,
    new TextEncoder().encode(payload)
  );
  return b64urlEncode(`${payload}.${bytesToHex(sig)}`);
}

export async function verifySessionToken(token: string): Promise<number | null> {
  try {
    const decoded = b64urlDecode(token);
    const lastDot = decoded.lastIndexOf(".");
    const payload = decoded.slice(0, lastDot);
    const sigHex = decoded.slice(lastDot + 1);

    const key = await getHmacKey();
    const valid = await crypto.subtle.verify(
      "HMAC",
      key,
      hexToBytes(sigHex),
      new TextEncoder().encode(payload)
    );

    if (!valid) return null;

    const [idStr, expiryStr] = payload.split(".");
    if (Date.now() > parseInt(expiryStr, 10)) return null;

    return parseInt(idStr, 10);
  } catch {
    return null;
  }
}
