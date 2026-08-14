import { BrandLogo } from "@/components/layout/brand-logo";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default function LicenseErrorPage() {
  return (
    <div className="flex min-h-full flex-col items-center justify-center px-4 py-10">
      <BrandLogo className="mb-8" />
      <div className="w-full max-w-md">
        <Card>
          <CardHeader>
            <CardTitle>License invalid</CardTitle>
            <CardDescription>
              TutorDesk cannot start because the license key is missing, invalid,
              or expired.
            </CardDescription>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground">
            Contact your TutorDesk vendor to obtain a valid license key and set
            the <code className="text-foreground">TUTORDESK_LICENSE_KEY</code>{" "}
            environment variable, then restart the application.
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
