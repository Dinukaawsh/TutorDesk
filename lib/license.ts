/** Must match LICENSE_SIGNING_SECRET used by scripts/generate-license.ts */
export const LICENSE_VERIFY_SECRET = "cw2QZLtS8c2twJJjyLAVAwCUCLPvzvK2hq3fqW45234";

export type LicenseValidationResult = {
  valid: boolean;
  reason?: string;
  clientName?: string;
};

type LicensePayload = {
  clientName: string;
  expiresAt: string;
};

function base64UrlEncode(bytes: Uint8Array): string {
  let binary = "";
  for (const byte of bytes) {
    binary += String.fromCharCode(byte);
  }
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

function base64UrlDecode(value: string): Uint8Array {
  const padded = value.replace(/-/g, "+").replace(/_/g, "/");
  const padLen = (4 - (padded.length % 4)) % 4;
  const base64 = padded + "=".repeat(padLen);
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i += 1) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes;
}

function timingSafeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) {
    return false;
  }
  let mismatch = 0;
  for (let i = 0; i < a.length; i += 1) {
    mismatch |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }
  return mismatch === 0;
}

async function signPayload(payloadPart: string, secret: string): Promise<string> {
  const encoder = new TextEncoder();
  const key = await crypto.subtle.importKey(
    "raw",
    encoder.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  const signature = await crypto.subtle.sign(
    "HMAC",
    key,
    encoder.encode(payloadPart),
  );
  return base64UrlEncode(new Uint8Array(signature));
}

export async function validateLicense(): Promise<LicenseValidationResult> {
  const licenseKey = process.env.TUTORDESK_LICENSE_KEY?.trim();

  if (!licenseKey) {
    return { valid: false, reason: "License key is not configured." };
  }

  if (!licenseKey.startsWith("TD-")) {
    return { valid: false, reason: "License key format is invalid." };
  }

  const body = licenseKey.slice(3);
  const dotIndex = body.lastIndexOf(".");
  if (dotIndex <= 0) {
    return { valid: false, reason: "License key format is invalid." };
  }

  const payloadPart = body.slice(0, dotIndex);
  const providedSignature = body.slice(dotIndex + 1);

  const expectedSignature = await signPayload(payloadPart, LICENSE_VERIFY_SECRET);
  if (!timingSafeEqual(expectedSignature, providedSignature)) {
    return { valid: false, reason: "License signature is invalid." };
  }

  let payload: LicensePayload;
  try {
    const json = new TextDecoder().decode(base64UrlDecode(payloadPart));
    payload = JSON.parse(json) as LicensePayload;
  } catch {
    return { valid: false, reason: "License payload is invalid." };
  }

  if (!payload.clientName || !payload.expiresAt) {
    return { valid: false, reason: "License payload is incomplete." };
  }

  const expiresAt = new Date(payload.expiresAt);
  if (Number.isNaN(expiresAt.getTime())) {
    return { valid: false, reason: "License expiry date is invalid." };
  }

  if (expiresAt.getTime() < Date.now()) {
    return { valid: false, reason: "License has expired." };
  }

  return { valid: true, clientName: payload.clientName };
}
