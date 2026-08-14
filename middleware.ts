export { auth as middleware } from "@/auth";

export const config = {
  matcher: ["/teacher/:path*", "/student/:path*"],
};