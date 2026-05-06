import { ProficiencyLevel, VALID_PROFICIENCY_LEVELS } from "./types";

export interface KvBinding {
  put(key: string, value: string, options?: { expirationTtl?: number }): Promise<void>;
  list(options?: { prefix?: string; cursor?: string; limit?: number }): Promise<KvListResult>;
  get(key: string): Promise<string | null>;
}

interface KvListKey {
  name: string;
}

interface KvListResult {
  keys: KvListKey[];
  list_complete: boolean;
  cursor?: string;
}

const MAX_RES_ID_LENGTH = 128;

export function sanitizeResId(resId?: string): string {
  return (resId ?? "")
    .trim()
    .slice(0, MAX_RES_ID_LENGTH)
    .replace(/[^A-Za-z0-9_-]/g, "");
}

export function normalizeProficiencyLevel(value: unknown): ProficiencyLevel | undefined {
  if (typeof value !== "string") {
    return undefined;
  }
  const normalized = value.toUpperCase() as ProficiencyLevel;
  return VALID_PROFICIENCY_LEVELS.includes(normalized) ? normalized : undefined;
}

// --- HMAC signing for feedback endpoint auth ---

const SIGNING_SECRET = (process.env.KAGAMI_EXPORT_TOKEN ?? "").trim();

async function hmacKey(): Promise<CryptoKey | null> {
  if (!SIGNING_SECRET) return null;
  const encoder = new TextEncoder();
  return crypto.subtle.importKey(
    "raw",
    encoder.encode(SIGNING_SECRET),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign", "verify"]
  );
}

export async function signResId(resId: string): Promise<string | null> {
  const key = await hmacKey();
  if (!key) return null;
  const encoder = new TextEncoder();
  const sig = await crypto.subtle.sign("HMAC", key, encoder.encode(resId));
  return Array.from(new Uint8Array(sig))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("")
    .slice(0, 32);
}

export async function verifyResIdSignature(resId: string, sig: string): Promise<boolean> {
  if (!SIGNING_SECRET) return true; // no secret configured = skip verification
  if (!resId || !sig) return false;
  const expected = await signResId(resId);
  if (!expected) return false;
  // Constant-time comparison
  if (expected.length !== sig.length) return false;
  let result = 0;
  for (let i = 0; i < expected.length; i++) {
    result |= expected.charCodeAt(i) ^ sig.charCodeAt(i);
  }
  return result === 0;
}
