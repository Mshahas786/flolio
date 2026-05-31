"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { signOut } from "next-auth/react"
import { cn } from "@/lib/utils"
import {
  LayoutDashboard,
  Link as LinkIcon,
  Palette,
  Settings,
  LogOut,
  ExternalLink,
  FileText,
  X,
  Ellipsis,
} from "lucide-react"
import { useState } from "react"

const navItems = [
  { href: "/dashboard", label: "Overview", icon: LayoutDashboard },
  { href: "/dashboard/links", label: "Links & Social", icon: LinkIcon },
  { href: "/dashboard/pages", label: "Pages", icon: FileText },
  { href: "/dashboard/appearance", label: "Appearance", icon: Palette },
  { href: "/dashboard/settings", label: "Settings", icon: Settings },
]

const bottomNavItems = navItems.slice(0, 5)
const moreNavItems = navItems.slice(5)

export function Sidebar({ username }: { username: string }) {
  const pathname = usePathname()
  const [moreOpen, setMoreOpen] = useState(false)

  return (
    <>
      {/* Mobile bottom nav */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-background border-t" style={{ paddingBottom: "env(safe-area-inset-bottom, 0px)" }}>
        <div className="flex items-center justify-around h-16">
          {bottomNavItems.map((item) => {
            const isActive = pathname === item.href
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex flex-col items-center justify-center gap-0.5 px-1 min-w-0 flex-1 h-full",
                  isActive ? "text-primary" : "text-muted-foreground"
                )}
              >
                <item.icon className="w-5 h-5" />
                <span className="text-[10px] leading-tight truncate w-full text-center">{item.label}</span>
              </Link>
            )
          })}
          {moreNavItems.length > 0 && (
            <button
              onClick={() => setMoreOpen(true)}
              className="flex flex-col items-center justify-center gap-0.5 px-1 min-w-0 flex-1 h-full text-muted-foreground"
            >
              <Ellipsis className="w-5 h-5" />
              <span className="text-[10px] leading-tight truncate w-full text-center">More</span>
            </button>
          )}
        </div>
      </nav>

      {/* Mobile bottom sheet for More */}
      {moreNavItems.length > 0 && moreOpen && (
        <div className="fixed inset-0 z-50 md:hidden flex flex-col justify-end" onClick={() => setMoreOpen(false)}>
          <div className="fixed inset-0 bg-black/50 animate-in fade-in duration-200" />
          <div
            className="relative z-10 bg-card border-t rounded-t-2xl shadow-2xl animate-in slide-in-from-bottom duration-300 max-h-[70vh] flex flex-col"
            style={{ paddingBottom: "env(safe-area-inset-bottom, 0px)" }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Drag handle */}
            <div className="flex justify-center pt-3 pb-1 shrink-0">
              <div className="w-10 h-1 rounded-full bg-muted-foreground/30" />
            </div>

            {/* Header */}
            <div className="flex items-center justify-between px-5 pb-3 shrink-0">
              <h2 className="text-sm font-semibold text-muted-foreground">More</h2>
              <button onClick={() => setMoreOpen(false)} className="p-2 rounded-lg hover:bg-accent" aria-label="Close">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Nav items */}
            <nav className="flex-1 overflow-y-auto px-3 pb-2 space-y-0.5">
              {moreNavItems.map((item) => {
                const isActive = pathname === item.href
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setMoreOpen(false)}
                    className={cn(
                      "flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-colors",
                      isActive
                        ? "bg-primary/10 text-primary"
                        : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                    )}
                  >
                    <item.icon className="w-5 h-5" />
                    {item.label}
                  </Link>
                )
              })}
            </nav>

            {/* Bottom actions */}
            <div className="px-3 pb-3 pt-2 border-t space-y-0.5">
              <a
                href={`/${username}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm text-muted-foreground hover:bg-accent hover:text-accent-foreground transition-colors"
                onClick={() => setMoreOpen(false)}
              >
                <ExternalLink className="w-5 h-5" />
                View Page
              </a>
              <button
                onClick={() => signOut({ callbackUrl: "/" })}
                className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm text-muted-foreground hover:bg-accent hover:text-accent-foreground transition-colors w-full"
              >
                <LogOut className="w-5 h-5" />
                Sign Out
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Desktop sidebar */}
      <div className="hidden md:flex flex-col h-screen w-64 border-r bg-card/50 sticky top-0 shrink-0">
        <div className="p-4 border-b">
          <Link href="/dashboard" className="text-lg font-bold text-primary">
            Flolio
          </Link>
        </div>
        <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
          {navItems.map((item) => {
            const isActive = pathname === item.href
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors",
                  isActive
                    ? "bg-primary/10 text-primary"
                    : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                )}
              >
                <item.icon className="w-4 h-4" />
                {item.label}
              </Link>
            )
          })}
        </nav>
        <div className="p-3 border-t space-y-2">
          <a
            href={`/${username}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-muted-foreground hover:bg-accent hover:text-accent-foreground transition-colors"
          >
            <ExternalLink className="w-4 h-4" />
            View Page
          </a>
          <button
            onClick={() => signOut({ callbackUrl: "/" })}
            className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-muted-foreground hover:bg-accent hover:text-accent-foreground transition-colors w-full"
          >
            <LogOut className="w-4 h-4" />
            Sign Out
          </button>
        </div>
      </div>
    </>
  )
}
