"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Link as LinkIcon, MousePointerClick, Crown, QrCode, BarChart3, ExternalLink, X } from "lucide-react"

interface LinkData {
  id: string
  title: string
  url: string
  clicks: number
  isActive: boolean
  createdAt: string
}

export default function DashboardPage() {
  const { data: session } = useSession()
  const isPro = (session?.user as any)?.isPro
  const username = (session?.user as any)?.username

  const [tab, setTab] = useState<"overview" | "analytics">("overview")
  const [links, setLinks] = useState<LinkData[]>([])
  const [loading, setLoading] = useState(true)
  const [qrLink, setQrLink] = useState<{ id: string; title: string; url: string } | null>(null)

  useEffect(() => {
    fetch("/api/links")
      .then((r) => r.json())
      .then((data: LinkData[]) => setLinks(data))
      .finally(() => setLoading(false))
  }, [])

  const totalClicks = links.reduce((sum, l) => sum + l.clicks, 0)
  const recentLinks = links.slice(0, 5)
  const maxClicks = Math.max(...links.map((l) => l.clicks), 1)

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || process.env.NEXT_PUBLIC_VERCEL_URL || "https://flolio.vercel.app"

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <p className="text-muted-foreground mt-1">Welcome back! Here&apos;s your overview.</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-0 border-b">
        <button
          onClick={() => setTab("overview")}
          className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium border-b-2 transition-colors ${
            tab === "overview"
              ? "border-primary text-primary"
              : "border-transparent text-muted-foreground hover:text-foreground"
          }`}
        >
          <LinkIcon className="w-4 h-4" />
          Overview
        </button>
        <button
          onClick={() => setTab("analytics")}
          className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium border-b-2 transition-colors ${
            tab === "analytics"
              ? "border-primary text-primary"
              : "border-transparent text-muted-foreground hover:text-foreground"
          }`}
        >
          <BarChart3 className="w-4 h-4" />
          Analytics
        </button>
      </div>

      {/* Overview tab */}
      {tab === "overview" && (
        <>
          <div className="grid gap-4 md:grid-cols-3">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Total Links</CardTitle>
                <LinkIcon className="w-4 h-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <span className="text-2xl font-bold">{links.length}</span>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Total Clicks</CardTitle>
                <MousePointerClick className="w-4 h-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <span className="text-2xl font-bold">{totalClicks}</span>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Plan</CardTitle>
                <Crown className="w-4 h-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-2">
                  <span className="text-2xl font-bold">{isPro ? "Pro" : "Free"}</span>
                  <Badge variant={isPro ? "success" : "secondary"}>{isPro ? "Pro" : "Free"}</Badge>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Recent Links</CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <p className="text-muted-foreground text-sm">Loading...</p>
              ) : recentLinks.length === 0 ? (
                <p className="text-muted-foreground text-sm">
                  No links yet.{" "}
                  <a href="/dashboard/links" className="text-primary hover:underline">Add your first link</a>
                </p>
              ) : (
                <div className="space-y-3">
                  {recentLinks.map((link) => (
                    <div key={link.id} className="flex items-center justify-between py-2 border-b last:border-0 gap-2">
                      <div className="min-w-0">
                        <p className="font-medium text-sm truncate">{link.title}</p>
                        <p className="text-xs text-muted-foreground truncate max-w-[180px] sm:max-w-[300px]">{link.url}</p>
                      </div>
                      <div className="flex items-center gap-2 sm:gap-3 text-sm text-muted-foreground shrink-0">
                        <span className="text-xs sm:text-sm">{link.clicks} clicks</span>
                        <Badge variant={link.isActive ? "success" : "secondary"}>
                          {link.isActive ? "Active" : "Paused"}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <QrCode className="w-5 h-5 text-primary" />
                Profile QR Code
              </CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col sm:flex-row items-start gap-6">
              <img
                src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(`${siteUrl}/${username || ""}`)}`}
                alt="Profile QR Code"
                className="w-32 h-32 rounded-xl border"
              />
              <div className="space-y-3">
                <p className="text-sm text-muted-foreground">
                  Scan or download this QR code to share your Flolio page instantly.
                </p>
                <a
                  href={`https://api.qrserver.com/v1/create-qr-code/?size=1000x1000&data=${encodeURIComponent(`${siteUrl}/${username || ""}`)}`}
                  download
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Button variant="outline" size="sm">
                    <QrCode className="w-4 h-4 mr-2" />
                    Download QR Code
                  </Button>
                </a>
              </div>
            </CardContent>
          </Card>
        </>
      )}

      {/* Analytics tab */}
      {tab === "analytics" && (
        <>
          <Card className="bg-primary/10 border-primary/20">
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <MousePointerClick className="w-8 h-8 text-primary" />
                <div>
                  <p className="text-sm text-primary font-medium">Total Clicks</p>
                  <p className="text-3xl font-bold text-primary">{totalClicks}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Per-Link Performance</CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <p className="text-muted-foreground text-sm">Loading...</p>
              ) : links.length === 0 ? (
                <p className="text-muted-foreground text-sm">No links to track yet.</p>
              ) : (
                <div className="space-y-4">
                  {links.map((link) => (
                    <div key={link.id}>
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-1 gap-1 sm:gap-0">
                        <div className="flex items-center gap-2 min-w-0">
                          <span className="text-sm font-medium truncate">{link.title}</span>
                          <Badge variant={link.isActive ? "success" : "secondary"} className="shrink-0">
                            {link.isActive ? "Active" : "Paused"}
                          </Badge>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-semibold text-primary">{link.clicks} clicks</span>
                          {isPro && (
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-7 w-7"
                              onClick={() => setQrLink({ id: link.id, title: link.title, url: link.url })}
                            >
                              <QrCode className="w-3.5 h-3.5" />
                            </Button>
                          )}
                          <a href={link.url} target="_blank" rel="noopener noreferrer">
                            <Button variant="ghost" size="icon" className="h-7 w-7">
                              <ExternalLink className="w-3.5 h-3.5" />
                            </Button>
                          </a>
                        </div>
                      </div>
                      <div className="w-full bg-gray-100 rounded-full h-2">
                        <div
                          className="bg-primary h-2 rounded-full transition-all"
                          style={{ width: `${(link.clicks / maxClicks) * 100}%` }}
                        />
                      </div>
                      <p className="text-xs text-muted-foreground mt-0.5 truncate">{link.url}</p>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {qrLink && (
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={() => setQrLink(null)}>
              <Card className="max-w-sm w-full" onClick={(e) => e.stopPropagation()}>
                <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle className="text-lg">QR Code</CardTitle>
                  <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setQrLink(null)}>
                    <X className="w-4 h-4" />
                  </Button>
                </CardHeader>
                <CardContent className="text-center space-y-4">
                  <p className="text-sm font-medium">{qrLink.title}</p>
                  <img
                    src={`https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${encodeURIComponent(qrLink.url)}`}
                    alt={`QR for ${qrLink.title}`}
                    className="mx-auto rounded-lg"
                  />
                  <a
                    href={`https://api.qrserver.com/v1/create-qr-code/?size=1000x1000&data=${encodeURIComponent(qrLink.url)}`}
                    download
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <Button variant="outline" size="sm" className="w-full">
                      <QrCode className="w-4 h-4 mr-2" />
                      Download QR Code
                    </Button>
                  </a>
                </CardContent>
              </Card>
            </div>
          )}
        </>
      )}
    </div>
  )
}
