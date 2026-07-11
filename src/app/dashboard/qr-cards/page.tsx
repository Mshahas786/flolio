"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { QRCard, QRCardGrid, qrTemplates } from "@/components/dashboard/qr-card"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { QrCode, ExternalLink } from "lucide-react"
import { Button } from "@/components/ui/button"
import Link from "next/link"

export default function QRCardsPage() {
  const { data: session } = useSession()
  const username = (session?.user as any)?.username || ""

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || process.env.NEXT_PUBLIC_VERCEL_URL || "https://flolio.vercel.app"
  const profileUrl = `${siteUrl}/${username}`

  const [selectedTemplate, setSelectedTemplate] = useState("minimal")
  const [customLabel, setCustomLabel] = useState("")
  const template = qrTemplates.find((t) => t.id === selectedTemplate) || qrTemplates[0]

  useEffect(() => {
    if (username && !customLabel) {
      setCustomLabel(`@${username}`)
    }
  }, [username, customLabel])

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold">QR Cards</h1>
        <p className="text-muted-foreground mt-1">
          Create beautiful QR code cards to share your Flolio page like a business card.
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-5">
        <div className="lg:col-span-3 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Choose a Template</CardTitle>
              <CardDescription>
                Pick a style that matches your brand or personality.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <QRCardGrid
                url={profileUrl}
                label={customLabel || `@${username}`}
                selectedTemplate={selectedTemplate}
                onSelectTemplate={setSelectedTemplate}
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Card Details</CardTitle>
              <CardDescription>
                Customize the label that appears on your QR card.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="label">Display Label</Label>
                <Input
                  id="label"
                  value={customLabel}
                  onChange={(e) => setCustomLabel(e.target.value)}
                  placeholder={`@${username}`}
                />
                <p className="text-xs text-muted-foreground">
                  This text appears on the card below the QR code.
                </p>
              </div>
              <div className="space-y-2">
                <Label>QR Code URL</Label>
                <div className="flex items-center gap-2">
                  <code className="flex-1 text-sm bg-neutral-100 dark:bg-neutral-800 px-3 py-2 rounded-lg truncate">
                    {profileUrl}
                  </code>
                  <Button
                    variant="outline"
                    size="icon-sm"
                    asChild
                  >
                    <Link href={profileUrl} target="_blank" rel="noopener noreferrer">
                      <ExternalLink className="w-4 h-4" />
                    </Link>
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground">
                  This is the URL your QR code points to.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="lg:col-span-2">
          <div className="sticky top-24 space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <QrCode className="w-5 h-5 text-primary" />
                  Preview
                </CardTitle>
              </CardHeader>
              <CardContent className="flex flex-col items-center">
                <QRCard
                  url={profileUrl}
                  label={customLabel || `@${username}`}
                  template={template}
                  size={280}
                />
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
