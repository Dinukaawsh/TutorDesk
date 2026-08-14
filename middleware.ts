import { NextResponse } from "next/server";
import NextAuth from "next-auth";
import { authConfig } from "@/auth.config";
import { validateLicense } from "@/lib/license";

const { auth } = NextAuth(authConfig);

const LICENSE_CACHE_MS = 60_000;
let licenseCache: { valid: boolean; checkedAt: number } | null = null;

function isLicenseExempt(pathname: string): boolean {
  if (pathname.startsWith("/license-error")) {
    return true;
  }
  if (pathname.startsWith("/api/auth")) {
    return true;
  }
  if (pathname.startsWith("/_next")) {
    return true;
  }
  if (pathname === "/favicon.ico") {
    return true;
  }
  return false;
}

async function isLicenseValid() {
  const now = Date.now();
  if (licenseCache && now - licenseCache.checkedAt < LICENSE_CACHE_MS) {
    return licenseCache.valid;
  }

  const result = await validateLicense();
  licenseCache = { valid: result.valid, checkedAt: now };
  return result.valid;
}

export default auth(async (req) => {
  const { pathname } = req.nextUrl;

  if (!isLicenseExempt(pathname)) {
    const valid = await isLicenseValid();
    if (!valid) {
      return NextResponse.redirect(new URL("/license-error", req.nextUrl));
    }
  }
});

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)",
  ],
};
