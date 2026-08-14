import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { authConfig } from "@/auth.config";
import { prisma } from "@/lib/prisma";
import { verifyPassword } from "@/lib/auth";
import { loginSchema } from "@/schemas/auth.schema";
import {
  checkRateLimit,
  incrementRateLimit,
  rateLimitKey,
  resetRateLimit,
} from "@/lib/rate-limit";

function getClientIp(request: Request): string {
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) {
    const first = forwarded.split(",")[0]?.trim();
    if (first) {
      return first;
    }
  }

  const realIp = request.headers.get("x-real-ip")?.trim();
  if (realIp) {
    return realIp;
  }

  return "unknown";
}

export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,
  providers: [
    Credentials({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials, request) {
        const parsed = loginSchema.safeParse(credentials);
        if (!parsed.success) {
          return null;
        }

        const { email, password } = parsed.data;
        const limitKey = rateLimitKey(getClientIp(request), email);
        const rateLimit = checkRateLimit(limitKey);
        if (!rateLimit.allowed) {
          throw new Error("RATE_LIMIT");
        }

        const user = await prisma.user.findUnique({ where: { email } });

        if (!user) {
          incrementRateLimit(limitKey);
          return null;
        }

        if (user.isDisabled) {
          incrementRateLimit(limitKey);
          const reason = user.disableReason ?? "Your account has been disabled.";
          throw new Error(`DISABLED:${reason}`);
        }

        const valid = await verifyPassword(password, user.passwordHash);
        if (!valid) {
          incrementRateLimit(limitKey);
          return null;
        }

        resetRateLimit(limitKey);

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
          mustChangePassword: user.mustChangePassword,
        };
      },
    }),
  ],
});
