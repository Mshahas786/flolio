"use client"

import { useState, useEffect, useRef } from "react"
import { useSession } from "next-auth/react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Modal } from "@/components/ui/modal"
import { SkeletonCard, SkeletonText } from "@/components/ui/skeleton"
import { Link as LinkIcon, MousePointerClick, Crown, QrCode, ExternalLink, Sparkles, ArrowRight, BarChart3, Palette } from "lucide-react"
import Link from "next/link"
import QRCode from "qrcode"

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
  const maxClicks = Math.max(...links.map((l) => l.clicks), 1)

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || process.env.NEXT_PUBLIC_VERCEL_URL || "https://flolio.vercel.app"

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <p className="text-muted-foreground mt-1">Welcome back! Here&apos;s your overview.</p>
      </div>

      {links.length === 0 && (
        <Card className="border-primary/20 bg-gradient-to-br from-primary/[0.06] to-primary/[0.02]">
          <CardContent className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-6">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
                <Sparkles className="w-5 h-5" />
              </div>
              <div>
                <p className="font-semibold">Start with a pre-made template</p>
                <p className="text-sm text-muted-foreground mt-0.5 max-w-md">
                  Pick a template for your niche and we&apos;ll set your style and drop in a few starter links — you can change everything later.
                </p>
              </div>
            </div>
            <Link href="/dashboard/appearance" className="shrink-0">
              <Button>
                Browse Templates
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </Link>
          </CardContent>
        </Card>
      )}

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
            <div className="flex items-center gap-2">
              <span className="text-2xl font-bold">{totalClicks}</span>
            </div>
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

      <div className="flex items-center gap-2 pt-2">
        <BarChart3 className="w-5 h-5 text-primary" />
        <h2 className="text-xl font-semibold">Analytics</h2>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Per-Link Performance</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="space-y-4">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="space-y-2">
                  <SkeletonText lines={1} />
                  <div className="h-2 rounded-full bg-muted" />
                </div>
              ))}
            </div>
          ) : links.length === 0 ? (
            <p className="text-muted-foreground text-sm">
              No links yet.{" "}
              <Link href="/dashboard/links" className="text-primary hover:underline">Add your first link</Link>
            </p>
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
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7"
                        disabled={!isPro}
                        onClick={() => isPro && setQrLink({ id: link.id, title: link.title, url: link.url })}
                        title={isPro ? "QR Code" : "Upgrade to Pro for QR codes"}
                      >
                        <QrCode className="w-3.5 h-3.5" />
                      </Button>
                      <a href={link.url} target="_blank" rel="noopener noreferrer">
                        <Button variant="ghost" size="icon" className="h-7 w-7">
                          <ExternalLink className="w-3.5 h-3.5" />
                        </Button>
                      </a>
                    </div>
                  </div>
                  <div className="w-full bg-muted rounded-full h-2">
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

      <QRProfileCard url={`${siteUrl}/${username || ""}`} username={username || ""} siteUrl={siteUrl} />

      {qrLink && (
        <Modal open={!!qrLink} onClose={() => setQrLink(null)} title="QR Code" size="sm">
          <QRCodeModalContent url={qrLink.url} title={qrLink.title} />
        </Modal>
      )}
    </div>
  )
}

function QRProfileCard({ url, username, siteUrl }: { url: string; username: string; siteUrl: string }) {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    if (canvasRef.current) {
      QRCode.toCanvas(canvasRef.current, url, {
        width: 200,
        margin: 2,
        color: { dark: "#171717", light: "#ffffff" },
      })
    }
  }, [url])

  const download = () => {
    if (!canvasRef.current) return
    const link = document.createElement("a")
    link.download = `flolio-${username}-qr.png`
    link.href = canvasRef.current.toDataURL("image/png")
    link.click()
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg flex items-center gap-2">
          <QrCode className="w-5 h-5 text-primary" />
          Profile QR Code
        </CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col sm:flex-row items-start gap-6">
        <canvas ref={canvasRef} className="w-32 h-32 rounded-xl border" />
        <div className="space-y-3">
          <p className="text-sm text-muted-foreground">
            Scan or download this QR code to share your Flolio page instantly.
          </p>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={download}>
              <QrCode className="w-4 h-4 mr-2" />
              Download QR Code
            </Button>
            <Button variant="default" size="sm" asChild>
              <Link href="/dashboard/qr-cards">
                <Palette className="w-4 h-4 mr-2" />
                Business Cards
              </Link>
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

function QRCodeModalContent({ url, title }: { url: string; title: string }) {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    if (canvasRef.current) {
      QRCode.toCanvas(canvasRef.current, url, {
        width: 250,
        margin: 2,
        color: { dark: "#171717", light: "#ffffff" },
      })
    }
  }, [url])

  const download = () => {
    if (!canvasRef.current) return
    const link = document.createElement("a")
    link.download = `flolio-${title.toLowerCase().replace(/\s+/g, "-")}-qr.png`
    link.href = canvasRef.current.toDataURL("image/png")
    link.click()
  }

  return (
    <div className="text-center space-y-4">
      <p className="text-sm font-medium">{title}</p>
      <canvas ref={canvasRef} className="mx-auto rounded-lg" />
      <Button variant="outline" size="sm" className="w-full" onClick={download}>
        <QrCode className="w-4 h-4 mr-2" />
        Download QR Code
      </Button>
    </div>
  )
}
