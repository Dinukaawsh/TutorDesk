"use client";

import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

const iconButtonVariants = cva(
  "inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-[var(--radius-md)] text-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        default: "bg-transparent text-foreground hover:bg-muted",
        outline: "border border-border bg-card text-foreground hover:bg-muted",
        ghost: "text-foreground hover:bg-muted",
        destructive:
          "text-destructive hover:bg-destructive/10 focus-visible:ring-destructive/30",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  },
);

export type IconButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> &
  VariantProps<typeof iconButtonVariants> & {
    icon: React.ReactNode;
    label: string;
  };

export function IconButton({
  icon,
  label,
  variant,
  className,
  type = "button",
  ...props
}: IconButtonProps) {
  return (
    <TooltipProvider delayDuration={200}>
      <Tooltip>
        <TooltipTrigger asChild>
          <button
            type={type}
            aria-label={label}
            className={cn(iconButtonVariants({ variant }), className)}
            {...props}
          >
            {icon}
          </button>
        </TooltipTrigger>
        <TooltipContent side="top">{label}</TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

export { iconButtonVariants };
