import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { validateLicense } from "@/lib/license";

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
