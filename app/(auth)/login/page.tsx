import { getLoginBranding, hasTeacherAccount } from "@/actions/auth.actions";
import { LoginForm } from "@/components/auth/login-form";
import { WhatsAppButton } from "@/components/layout/whatsapp-button";
import { auth } from "@/auth";
import { Role } from "@prisma/client";
import { redirect } from "next/navigation";

export default async function LoginPage() {
  const teacherExists = await hasTeacherAccount();
  if (!teacherExists) {
    redirect("/setup");
  }

  const session = await auth();
  if (session?.user) {
    redirect(
      session.user.role === Role.TEACHER
        ? "/teacher/dashboard"
        : session.user.mustChangePassword
          ? "/student/change-password"
          : "/student/dashboard",
    );
  }

  const { teacher, institutes, subjects } = await getLoginBranding();

  return (
    <div className="overflow-hidden rounded-[var(--radius-md)] border border-border bg-white shadow-lg">
      {/* Teacher branding hero */}
      <div className="relative border-b border-border bg-gradient-to-br from-primary/10 via-white to-primary/5 px-6 py-8 text-center">
        <div className="mx-auto flex max-w-sm flex-col items-center">
          {teacher?.avatarUrl ? (
            <img
              src={teacher.avatarUrl}
              alt=""
              className="mb-4 h-20 w-20 rounded-full border-2 border-white object-cover shadow-md ring-2 ring-primary/20"
            />
          ) : (
            <div className="mb-4 flex h-20 w-20 items-center justify-center rounded-full border-2 border-white bg-primary/10 text-2xl font-semibold text-primary shadow-md ring-2 ring-primary/20">
              {teacher?.name?.charAt(0)?.toUpperCase() ?? "T"}
            </div>
          )}
          <h1 className="text-2xl font-semibold tracking-tight text-foreground">
            {teacher?.name ?? "Welcome"}
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Student portal — sign in to access your classes
          </p>
        </div>
      </div>

      {/* Institutes showcase */}
      {institutes.length > 0 ? (
        <div className="border-b border-border bg-muted/30 px-6 py-5">
          <p className="mb-3 text-center text-xs font-medium uppercase tracking-wide text-muted-foreground">
            Our institutes
          </p>
          <div className="flex flex-wrap items-center justify-center gap-4">
            {institutes.map((institute) => (
              <div
                key={institute.id}
                className="flex flex-col items-center gap-1.5 text-center"
              >
                {institute.logoUrl ? (
                  <img
                    src={institute.logoUrl}
                    alt=""
                    className="h-12 w-12 rounded-lg border border-border bg-white object-cover shadow-sm"
                  />
                ) : (
                  <div className="flex h-12 w-12 items-center justify-center rounded-lg border border-border bg-white text-xs font-medium text-muted-foreground shadow-sm">
                    {institute.name.charAt(0)}
                  </div>
                )}
                <div>
                  <p className="text-xs font-medium leading-tight">{institute.name}</p>
                  <p className="text-[10px] text-muted-foreground">{institute.location}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : null}

      {/* Subjects offered */}
      {subjects.length > 0 ? (
        <div className="border-b border-border px-6 py-5">
          <p className="mb-3 text-center text-xs font-medium uppercase tracking-wide text-muted-foreground">
            Classes offered
          </p>
          <div className="flex flex-wrap items-center justify-center gap-2">
            {subjects.map((subject) => (
              <span
                key={subject.id}
                className="inline-flex items-center rounded-full border border-border bg-white px-3 py-1 text-xs font-medium shadow-sm"
                style={
                  subject.color
                    ? {
                        borderColor: `${subject.color}40`,
                        backgroundColor: `${subject.color}12`,
                        color: subject.color,
                      }
                    : undefined
                }
              >
                {subject.name}
              </span>
            ))}
          </div>
        </div>
      ) : null}

      {/* Login form */}
      <div className="space-y-5 px-6 py-6">
        <LoginForm />
        {teacher?.whatsapp ? (
          <div className="border-t border-border pt-4">
            <p className="mb-2 text-center text-xs text-muted-foreground">Need help signing in?</p>
            <WhatsAppButton teacherName={teacher.name} whatsapp={teacher.whatsapp} />
          </div>
        ) : null}
      </div>
    </div>
  );
}
