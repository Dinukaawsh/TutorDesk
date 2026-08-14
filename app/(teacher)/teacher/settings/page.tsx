import { redirect } from "next/navigation";
import { getTeacherProfile } from "@/actions/settings.actions";
import { PageHeader } from "@/components/layout/page-header";
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
        description="Teacher profile and currency preferences"
      />
      <Card className="border-border bg-white/80 backdrop-blur">
        <CardHeader>
          <CardTitle>Profile</CardTitle>
        </CardHeader>
        <CardContent>
          <TeacherSettingsForm teacher={teacher} />
        </CardContent>
      </Card>
    </>
  );
}
