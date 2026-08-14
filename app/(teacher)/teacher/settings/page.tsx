import { PageHeader } from "@/components/layout/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function TeacherSettingsPage() {
  return (
    <>
      <PageHeader
        title="Settings"
        description="Teacher profile and currency preferences"
      />
      <Card className="border-border bg-white/80 backdrop-blur">
        <CardHeader>
          <CardTitle>Coming soon</CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground">
          Profile details, WhatsApp contact, and default currency will be configurable here.
        </CardContent>
      </Card>
    </>
  );
}
