"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  Link as LinkIcon,
  Palette,
  Settings,
  LogOut,
  ExternalLink,
  X,
  Ellipsis,
  ChevronRight,
  User,
  FileText,
  Zap,
  Mail,
  Calendar,
  Users,
  MessageSquare,
  Layers,
  Shield,
  Key,
  Eye,
  EyeOff,
  Copy,
  Menu,
} from "lucide-react";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";

const navItems = [
  { href: "/dashboard", label: "Overview", icon: LayoutDashboard },
  { href: "/dashboard/links", label: "Links", icon: LinkIcon },
  { href: "/dashboard/pages", label: "Pages", icon: FileText },
  { href: "/dashboard/appearance", label: "Appearance", icon: Palette },
  { href: "/dashboard/settings", label: "Settings", icon: Settings },
];

export function Sidebar({ username }: { username: string }) {
  const pathname = usePathname();
  const [moreOpen, setMoreOpen] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    function handleEscape(e: KeyboardEvent) {
      if (e.key === "Escape" && sidebarOpen) {
        setSidebarOpen(false);
      }
    }
    if (sidebarOpen) {
      document.addEventListener("keydown", handleEscape);
      return () => document.removeEventListener("keydown", handleEscape);
    }
  }, [sidebarOpen]);

  return (
    <>
      {/* Mobile sidebar overlay */}
      <div className={cn("fixed inset-0 z-40 lg:hidden", !sidebarOpen && "pointer-events-none")}>
        {sidebarOpen && (
          <>
            <div
              className="fixed inset-0 bg-black/50 animate-in fade-in duration-200"
              onClick={() => setSidebarOpen(false)}
              aria-hidden="true"
            />
            <div
              className="fixed inset-y-0 left-0 z-50 w-72 bg-white dark:bg-neutral-950 border-r border-neutral-200 dark:border-neutral-800 shadow-xl animate-in slide-in-from-left duration-300"
            >
              <div className="flex flex-col h-full">
                {/* Header */}
                <div className="p-4 border-b border-neutral-200 dark:border-neutral-800 flex items-center justify-between">
                  <Link href="/dashboard" className="text-lg font-bold text-brand-600 dark:text-brand-400">
                    Flolio
                  </Link>
                  <button
                    onClick={() => setSidebarOpen(false)}
                    className="p-2 rounded-lg text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800"
                    aria-label="Close menu"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                {/* Navigation */}
                <nav className="flex-1 p-3 space-y-1 overflow-y-auto" aria-label="Main navigation">
                  {navItems.map((item) => {
                    const isActive = pathname === item.href || (item.href !== "/dashboard" && pathname.startsWith(item.href));
                    return (
                      <Link
                        key={item.href}
                        href={item.href}
                        onClick={() => setSidebarOpen(false)}
                        className={cn(
                          "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200",
                          isActive
                            ? "bg-brand-50 text-brand-600 dark:bg-brand-950/50 dark:text-brand-400"
                            : "text-neutral-600 hover:bg-neutral-100 hover:text-neutral-900 dark:text-neutral-400 dark:hover:bg-neutral-800 dark:hover:text-neutral-100"
                        )}
                        aria-current={isActive ? "page" : undefined}
                      >
                        <item.icon className="w-5 h-5 flex-shrink-0" />
                        {item.label}
                      </Link>
                    );
                  })}
                </nav>

                {/* Bottom actions */}
                <div className="p-3 border-t border-neutral-200 dark:border-neutral-800 space-y-2">
                  <a
                    href={`/${username}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-neutral-600 hover:bg-neutral-100 hover:text-neutral-900 dark:text-neutral-400 dark:hover:bg-neutral-800 dark:hover:text-neutral-100 transition-colors"
                  >
                    <ExternalLink className="w-5 h-5" />
                    View Page
                  </a>
                  <button
                    onClick={() => signOut({ callbackUrl: "/" })}
                    className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-neutral-600 hover:bg-neutral-100 hover:text-neutral-900 dark:text-neutral-400 dark:hover:bg-neutral-800 dark:hover:text-neutral-100 transition-colors w-full"
                  >
                    <LogOut className="w-5 h-5" />
                    Sign Out
                  </button>
                </div>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Mobile bottom navigation */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-white dark:bg-neutral-950 border-t border-neutral-200 dark:border-neutral-800" style={{ paddingBottom: "env(safe-area-inset-bottom, 0px)" }}>
        <div className="flex items-center justify-around h-16">
          {navItems.slice(0, 4).map((item) => {
            const isActive = pathname === item.href || (item.href !== "/dashboard" && pathname.startsWith(item.href));
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex flex-col items-center justify-center gap-1 px-2 min-w-0 flex-1 h-full",
                  isActive ? "text-brand-600 dark:text-brand-400" : "text-neutral-400 dark:text-neutral-500"
                )}
                aria-current={isActive ? "page" : undefined}
              >
                <item.icon className="w-5 h-5" />
                <span className="text-[10px] leading-tight truncate w-full text-center">{item.label}</span>
              </Link>
            );
          })}
          <button
            onClick={() => setSidebarOpen(true)}
            className="flex flex-col items-center justify-center gap-1 px-2 min-w-0 flex-1 h-full text-neutral-400 dark:text-neutral-500"
            aria-label="More options"
            aria-expanded={sidebarOpen}
          >
            <Menu className="w-5 h-5" />
            <span className="text-[10px] leading-tight truncate w-full text-center">More</span>
          </button>
        </div>
      </nav>

      {/* Desktop sidebar */}
      <div className="hidden lg:flex flex-col h-screen w-64 border-r bg-white/50 dark:bg-neutral-950/50 sticky top-0 shrink-0 backdrop-blur-sm">
        <div className="p-4 border-b border-neutral-200 dark:border-neutral-800">
          <Link href="/dashboard" className="text-lg font-bold text-brand-600 dark:text-brand-400">
            Flolio
          </Link>
        </div>
        <nav className="flex-1 p-3 space-y-1 overflow-y-auto" aria-label="Main navigation">
          {navItems.map((item) => {
            const isActive = pathname === item.href || (item.href !== "/dashboard" && pathname.startsWith(item.href));
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200",
                  isActive
                    ? "bg-brand-50 text-brand-600 dark:bg-brand-950/50 dark:text-brand-400"
                    : "text-neutral-600 hover:bg-neutral-100 hover:text-neutral-900 dark:text-neutral-400 dark:hover:bg-neutral-800 dark:hover:text-neutral-100"
                )}
                aria-current={isActive ? "page" : undefined}
              >
                <item.icon className="w-5 h-5 flex-shrink-0" />
                {item.label}
              </Link>
            );
          })}
        </nav>
        <div className="p-3 border-t border-neutral-200 dark:border-neutral-800 space-y-2">
          <a
            href={`/${username}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-neutral-600 hover:bg-neutral-100 hover:text-neutral-900 dark:text-neutral-400 dark:hover:bg-neutral-800 dark:hover:text-neutral-100 transition-colors"
          >
            <ExternalLink className="w-5 h-5" />
            View Page
          </a>
          <button
            onClick={() => signOut({ callbackUrl: "/" })}
            className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-neutral-600 hover:bg-neutral-100 hover:text-neutral-900 dark:text-neutral-400 dark:hover:bg-neutral-800 dark:hover:text-neutral-100 transition-colors w-full"
          >
            <LogOut className="w-5 h-5" />
            Sign Out
          </button>
        </div>
      </div>
    </>
  );
}