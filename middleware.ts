import NextAuth from "next-auth";
import { NextResponse } from "next/server";
import { authConfig } from "@/auth.config";
import { validateLicense } from "@/lib/license";

const { auth } = NextAuth(authConfig);

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

export default auth(async (req) => {
  const { pathname } = req.nextUrl;

  if (!isLicenseExempt(pathname)) {
    const license = await validateLicense();
    if (!license.valid) {
      return NextResponse.redirect(new URL("/license-error", req.nextUrl));
    }
  }
});

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)",
  ],
};
