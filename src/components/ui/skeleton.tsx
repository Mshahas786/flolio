"use client";

import { cn } from "@/lib/utils";

function Skeleton({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      aria-hidden="true"
      className={cn("animate-pulse rounded bg-neutral-200 dark:bg-neutral-700", className)}
      {...props}
    />
  );
}

export function SkeletonText({ lines = 3, className, ...props }: React.HTMLAttributes<HTMLDivElement> & { lines?: number }) {
  return (
    <div className={cn("space-y-2", className)} {...props}>
      {Array.from({ length: lines }).map((_, i) => (
        <Skeleton key={i} className="h-4 rounded" style={{ width: i === lines - 1 ? "60%" : "100%" }} />
      ))}
    </div>
  );
}

export function SkeletonCard({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <Skeleton className={cn("rounded-2xl border border-neutral-200 dark:border-neutral-800 p-6", className)} {...props} />
  );
}

export function SkeletonLink({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <Skeleton className={cn("h-12 rounded-xl", className)} {...props} />
  );
}

export function SkeletonAvatar({ className, size = "md", ...props }: React.HTMLAttributes<HTMLDivElement> & { size?: "sm" | "md" | "lg" | "xl" }) {
  const sizes = {
    sm: "w-8 h-8",
    md: "w-16 h-16",
    lg: "w-24 h-24",
    xl: "w-32 h-32",
  };
  return <Skeleton className={cn("rounded-full", sizes[size], className)} {...props} />;
}

export function SkeletonButton({ className, size = "md", ...props }: React.HTMLAttributes<HTMLDivElement> & { size?: "sm" | "md" | "lg" }) {
  const sizes = {
    sm: "h-9 w-24",
    md: "h-11 w-32",
    lg: "h-12 w-40",
  };
  return <Skeleton className={cn("rounded-xl", sizes[size], className)} {...props} />;
}

export function SkeletonInput({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <Skeleton className={cn("h-11 rounded-xl", className)} {...props} />;
}

export function SkeletonTable({ rows = 5, columns = 4, className, ...props }: React.HTMLAttributes<HTMLDivElement> & { rows?: number; columns?: number }) {
  return (
    <div className={cn("space-y-3", className)} {...props}>
      <div className="flex gap-4">
        {Array.from({ length: columns }).map((_, i) => (
          <Skeleton key={i} className="h-4 w-24 rounded" />
        ))}
      </div>
      {Array.from({ length: rows }).map((_, row) => (
        <div key={row} className="flex gap-4">
          {Array.from({ length: columns }).map((_, col) => (
            <Skeleton key={col} className="h-12 flex-1 rounded-xl" />
          ))}
        </div>
      ))}
    </div>
  );
}

export function SkeletonDashboard({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cn("space-y-6", className)} {...props}>
      <div className="grid gap-4 md:grid-cols-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <SkeletonCard key={i} />
        ))}
      </div>
      <SkeletonCard />
      <SkeletonCard />
    </div>
  );
}

export function SkeletonAppearancePage({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cn("space-y-6", className)} {...props}>
      <SkeletonText lines={2} />
      <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-5">
        {Array.from({ length: 10 }).map((_, i) => (
          <Skeleton key={i} className="h-20 rounded-lg" />
        ))}
      </div>
      {Array.from({ length: 5 }).map((_, i) => (
        <SkeletonCard key={i} />
      ))}
    </div>
  );
}

export function SkeletonLinksPage({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cn("space-y-6", className)} {...props}>
      <div className="flex items-center justify-between">
        <SkeletonText lines={1} className="w-48" />
        <SkeletonButton />
      </div>
      <div className="space-y-3">
        {Array.from({ length: 5 }).map((_, i) => (
          <SkeletonLink key={i} />
        ))}
      </div>
    </div>
  );
}