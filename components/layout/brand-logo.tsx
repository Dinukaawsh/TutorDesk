import Image from "next/image";
import Link from "next/link";
import { cn } from "@/lib/utils";

type BrandLogoProps = {
  className?: string;
  href?: string;
  showText?: boolean;
  iconSize?: number;
};

export function BrandLogo({
  className,
  href,
  showText = true,
  iconSize = 32,
}: BrandLogoProps) {
  const content = (
    <div className={cn("flex items-center gap-2.5", className)}>
      <Image
        src="/brand/logo-icon.png"
        alt=""
        width={iconSize}
        height={iconSize}
        className="shrink-0 rounded-md"
        priority
      />
      {showText ? (
        <span className="text-lg font-semibold tracking-tight text-foreground">
          TutorDesk
        </span>
      ) : null}
    </div>
  );

  if (href) {
    return (
      <Link href={href} className="inline-flex rounded-md outline-offset-2 focus-visible:outline focus-visible:outline-2 focus-visible:outline-primary">
        {content}
      </Link>
    );
  }

  return content;
}
