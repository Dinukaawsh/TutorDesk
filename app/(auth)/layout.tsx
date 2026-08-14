import { BrandLogo } from "@/components/layout/brand-logo";
import { CloudBackground } from "@/components/layout/cloud-background";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <CloudBackground className="min-h-full">
      <div className="flex min-h-full flex-col items-center justify-center px-4 py-10">
        <BrandLogo className="mb-6" iconSize={40} />
        <div className="w-full max-w-md">{children}</div>
      </div>
    </CloudBackground>
  );
}
