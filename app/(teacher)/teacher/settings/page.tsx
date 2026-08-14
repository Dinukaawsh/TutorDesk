import { redirect } from "next/navigation";
import { getTeacherProfile } from "@/actions/settings.actions";
import { PageHeader } from "@/components/layout/page-header";
import { TeacherPasswordForm } from "@/components/settings/teacher-password-form";
import { TeacherSettingsForm } from "@/components/settings/teacher-settings-form";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default async function TeacherSettingsPage() {
  const teacher = await getTeacherProfile();
  if (!teacher) {
    redirect("/login");
  }

  return (
    <>
      <PageHeader
        title="Settings"
        description="Teacher profile, login details, and currency preferences"
      />
      <div className="grid gap-4 lg:grid-cols-2">
        <Card className="border-border bg-white/80 backdrop-blur">
          <CardHeader>
            <CardTitle>Profile</CardTitle>
          </CardHeader>
          <CardContent>
            <TeacherSettingsForm teacher={teacher} />
          </CardContent>
        </Card>
        <Card className="border-border bg-white/80 backdrop-blur">
          <CardHeader>
            <CardTitle>Password</CardTitle>
          </CardHeader>
          <CardContent>
            <TeacherPasswordForm />
          </CardContent>
        </Card>
      </div>
    </>
  );
}
