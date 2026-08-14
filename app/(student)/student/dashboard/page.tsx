import { PageHeader } from "@/components/layout/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function StudentDashboardPage() {
  return (
    <>
      <PageHeader
        title="Student dashboard"
        description="Your lessons, assignments, and fees"
      />
      <Card>
        <CardHeader>
          <CardTitle>Coming soon</CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground">
          Phase 1 auth is ready. Your learning workspace will appear here soon.
        </CardContent>
      </Card>
    </>
  );
}