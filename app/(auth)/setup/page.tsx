import { redirect } from "next/navigation";
import { BrandLogo } from "@/components/layout/brand-logo";
import { hasTeacherAccount } from "@/actions/auth.actions";
import { SetupForm } from "@/components/auth/setup-form";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default async function SetupPage() {
  const teacherExists = await hasTeacherAccount();
  if (teacherExists) {
    redirect("/login");
  }

  return (
    <>
      <BrandLogo className="mb-6" iconSize={40} />
      <Card>
      <CardHeader>
        <CardTitle>Set up TutorDesk</CardTitle>
        <CardDescription>Create the first teacher account to get started</CardDescription>
      </CardHeader>
      <CardContent>
        <SetupForm />
      </CardContent>
    </Card>
    </>
  );
}