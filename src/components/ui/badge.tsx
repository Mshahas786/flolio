"use client";

import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium transition-colors",
  {
    variants: {
      variant: {
        default: "bg-neutral-100 text-neutral-700 dark:bg-neutral-800 dark:text-neutral-300",
        primary: "bg-brand-50 text-brand-700 dark:bg-brand-950 dark:text-brand-300",
        secondary: "bg-neutral-200 text-neutral-700 dark:bg-neutral-700 dark:text-neutral-300",
        success: "bg-success-50 text-success-700 dark:bg-success-950 dark:text-success-300",
        warning: "bg-warning-50 text-warning-700 dark:bg-warning-950 dark:text-warning-300",
        destructive: "bg-destructive-50 text-destructive-700 dark:bg-destructive-950 dark:text-destructive-300",
        outline: "border border-neutral-300 text-neutral-700 dark:border-neutral-600 dark:text-neutral-300",
        brand: "bg-brand-100 text-brand-700 dark:bg-brand-900 dark:text-brand-300",
      },
      size: {
        sm: "px-2 py-0.5 text-[10px]",
        md: "px-2.5 py-0.5 text-xs",
        lg: "px-3 py-1 text-sm",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "md",
    },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, size, ...props }: BadgeProps) {
  return <span className={cn(badgeVariants({ variant, size, className }))} {...props} />;
}

export { Badge, badgeVariants };