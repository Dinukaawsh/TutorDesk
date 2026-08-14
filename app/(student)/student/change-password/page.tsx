import { redirect } from "next/navigation";
import { Role } from "@prisma/client";
import { auth } from "@/auth";
import { ChangePasswordForm } from "@/components/auth/change-password-form";
import { PageHeader } from "@/components/layout/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default async function ChangePasswordPage() {
  const session = await auth();
  if (!session?.user || session.user.role !== Role.STUDENT) {
    redirect("/login");
  }

  if (!session.user.mustChangePassword) {
    redirect("/student/dashboard");
  }

  return (
    <>
      <PageHeader
        title="Change password"
        description="You must set a new password before continuing"
      />
      <Card className="max-w-lg">
        <CardHeader>
          <CardTitle>New password</CardTitle>
        </CardHeader>
        <CardContent>
          <ChangePasswordForm />
        </CardContent>
      </Card>
    </>
  );
}