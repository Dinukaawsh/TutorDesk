import { BrandLogo } from "@/components/layout/brand-logo";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-full flex-col items-center justify-center px-4 py-10">
      <BrandLogo className="mb-8" />
      <div className="w-full max-w-md">{children}</div>
    </div>
  );
}
