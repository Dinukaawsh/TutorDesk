import { PageHeader } from "@/components/layout/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function TeacherDashboardPage() {
  return (
    <>
      <PageHeader
        title="Teacher dashboard"
        description="Overview of your classes and students"
      />
      <Card>
        <CardHeader>
          <CardTitle>Coming soon</CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground">
          Phase 1 auth is ready. Teacher tools will appear here in the next phases.
        </CardContent>
      </Card>
    </>
  );
}