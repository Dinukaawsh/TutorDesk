import type { NextAuthConfig } from "next-auth";

type Role = "TEACHER" | "STUDENT";

export const authConfig = {
  pages: {
    signIn: "/login",
  },
  session: {
    strategy: "jwt",
    maxAge: 24 * 60 * 60,
  },
  callbacks: {
    authorized({ auth, request }) {
      const { pathname } = request.nextUrl;
      const isTeacherRoute = pathname.startsWith("/teacher");
      const isStudentRoute = pathname.startsWith("/student");

      if (!isTeacherRoute && !isStudentRoute) {
        return true;
      }

      if (!auth?.user) {
        return false;
      }

      if (isTeacherRoute && auth.user.role !== "TEACHER") {
        return false;
      }

      if (isStudentRoute && auth.user.role !== "STUDENT") {
        return false;
      }

      if (
        auth.user.role === "STUDENT" &&
        auth.user.mustChangePassword &&
        !pathname.startsWith("/student/change-password")
      ) {
        return Response.redirect(
          new URL("/student/change-password", request.nextUrl),
        );
      }

      return true;
    },
    jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = user.role;
        token.mustChangePassword = user.mustChangePassword;
      }
      return token;
    },
    session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.role = token.role as Role;
        session.user.mustChangePassword = Boolean(token.mustChangePassword);
      }
      return session;
    },
  },
  providers: [],
  trustHost: true,
} satisfies NextAuthConfig;
