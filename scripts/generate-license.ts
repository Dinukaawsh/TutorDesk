import "dotenv/config";
import { createHmac } from "node:crypto";

type LicensePayload = {
  clientName: string;
  expiresAt: string;
};

function base64UrlEncode(input: Buffer | string): string {
  const buffer = typeof input === "string" ? Buffer.from(input) : input;
  return buffer
    .toString("base64")
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");
}

function parseArgs(): { clientName: string; days: number } {
  const args = process.argv.slice(2);
  let clientName = "Development";
  let days = 365;

  for (let i = 0; i < args.length; i += 1) {
    const arg = args[i];
    if (arg === "--client" && args[i + 1]) {
      clientName = args[i + 1];
      i += 1;
    } else if (arg === "--days" && args[i + 1]) {
      days = Number.parseInt(args[i + 1], 10);
      i += 1;
    }
  }

  if (!Number.isFinite(days) || days <= 0) {
    throw new Error("--days must be a positive number");
  }

  return { clientName, days };
}

function signLicense(payload: LicensePayload, secret: string): string {
  const payloadPart = base64UrlEncode(JSON.stringify(payload));
  const signature = base64UrlEncode(
    createHmac("sha256", secret).update(payloadPart).digest(),
  );
  return `TD-${payloadPart}.${signature}`;
}

function main(): void {
  const secret = process.env.LICENSE_SIGNING_SECRET?.trim();
  if (!secret) {
    console.error("LICENSE_SIGNING_SECRET is required.");
    process.exit(1);
  }

  const { clientName, days } = parseArgs();
  const expiresAt = new Date(Date.now() + days * 24 * 60 * 60 * 1000).toISOString();
  const payload: LicensePayload = { clientName, expiresAt };
  const licenseKey = signLicense(payload, secret);

  console.log("Client:", clientName);
  console.log("Expires:", expiresAt);
  console.log("License key:");
  console.log(licenseKey);
}

main();
