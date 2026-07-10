"use client";

import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-xl text-sm font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 active:scale-[0.98]",
  {
    variants: {
      variant: {
        default: "bg-brand-600 text-white hover:bg-brand-700 shadow-md shadow-brand-600/20 hover:shadow-lg hover:shadow-brand-600/30",
        destructive: "bg-destructive-500 text-white hover:bg-destructive-600 shadow-md shadow-destructive-500/20 hover:shadow-lg hover:shadow-destructive-500/30",
        outline: "border-2 border-neutral-200 bg-transparent hover:bg-neutral-100 hover:border-neutral-300 dark:border-neutral-700 dark:hover:bg-neutral-800 dark:hover:border-neutral-600",
        secondary: "bg-neutral-100 text-neutral-900 hover:bg-neutral-200 dark:bg-neutral-800 dark:text-neutral-100 dark:hover:bg-neutral-700",
        ghost: "bg-transparent hover:bg-neutral-100 dark:hover:bg-neutral-800",
        link: "text-brand-600 underline-offset-4 hover:underline",
        success: "bg-success-500 text-white hover:bg-success-600 shadow-md shadow-success-500/20 hover:shadow-lg hover:shadow-success-500/30",
        warning: "bg-warning-500 text-white hover:bg-warning-600 shadow-md shadow-warning-500/20 hover:shadow-lg hover:shadow-warning-500/30",
        premium: "bg-gradient-to-r from-brand-600 to-brand-700 text-white hover:from-brand-700 hover:to-brand-800 shadow-lg shadow-brand-600/40 hover:shadow-xl hover:shadow-brand-600/50",
      },
      size: {
        xs: "h-8 px-3 text-xs gap-1",
        sm: "h-9 px-3.5 text-sm",
        default: "h-11 px-5 text-sm",
        lg: "h-12 px-7 text-base",
        xl: "h-14 px-10 text-lg",
        icon: "h-11 w-11",
        "icon-sm": "h-9 w-9",
        "icon-lg": "h-13 w-13",
      },
      fullWidth: {
        true: "w-full",
      },
      loading: {
        true: "relative cursor-wait",
      },
    },
    compoundVariants: [
      {
        variant: "premium",
        size: "xl",
        className: "shadow-xl shadow-brand-600/40 hover:shadow-2xl hover:shadow-brand-600/50",
      },
    ],
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  loading?: boolean;
  loadingText?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, fullWidth, loading, loadingText, leftIcon, rightIcon, asChild = false, disabled, children, ...props }, ref) => {
    const isLoading = loading || disabled;
    const Comp = asChild ? Slot : "button";

    return (
      <Comp
        ref={ref}
        className={cn(buttonVariants({ variant, size, fullWidth, loading: isLoading }), className)}
        disabled={isLoading}
        aria-busy={isLoading}
        aria-disabled={isLoading}
        {...props}
      >
        {isLoading ? (
          <>
            <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
            </svg>
            <span className="sr-only">{loadingText || "Loading..."}</span>
          </>
        ) : (
          <>
            {leftIcon && !isLoading && <span className="flex-shrink-0" aria-hidden="true">{leftIcon}</span>}
            <span className={cn("flex items-center", isLoading && "invisible")}>{children}</span>
            {rightIcon && !isLoading && <span className="flex-shrink-0" aria-hidden="true">{rightIcon}</span>}
          </>
        )}
      </Comp>
    );
  }
);
Button.displayName = "Button";

export { Button, buttonVariants };