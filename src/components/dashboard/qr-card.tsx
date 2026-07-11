"use client"

import { useRef, useEffect, useState, useCallback } from "react"
import QRCode from "qrcode"
import { cn } from "@/lib/utils"
import { Download, Check, Copy } from "lucide-react"
import { Button } from "@/components/ui/button"

export interface QRCardTemplate {
  id: string
  name: string
  bg: string
  fg: string
  qrColor: string
  qrBg: string
  accent: string
  labelColor: string
  desc: string
}

export const qrTemplates: QRCardTemplate[] = [
  {
    id: "minimal",
    name: "Minimal",
    bg: "#ffffff",
    fg: "#171717",
    qrColor: "#171717",
    qrBg: "#ffffff",
    accent: "#f5f5f5",
    labelColor: "#737373",
    desc: "Clean white card",
  },
  {
    id: "dark",
    name: "Dark",
    bg: "#171717",
    fg: "#ffffff",
    qrColor: "#ffffff",
    qrBg: "#171717",
    accent: "#262626",
    labelColor: "#a3a3a3",
    desc: "Sleek dark card",
  },
  {
    id: "brand",
    name: "Brand",
    bg: "linear-gradient(135deg, #e83e1c 0%, #ff5329 100%)",
    fg: "#ffffff",
    qrColor: "#ffffff",
    qrBg: "rgba(255,255,255,0.15)",
    accent: "rgba(255,255,255,0.2)",
    labelColor: "rgba(255,255,255,0.8)",
    desc: "Your brand colors",
  },
  {
    id: "vibrant",
    name: "Vibrant",
    bg: "linear-gradient(135deg, #7c3aed 0%, #ec4899 50%, #f59e0b 100%)",
    fg: "#ffffff",
    qrColor: "#ffffff",
    qrBg: "rgba(255,255,255,0.12)",
    accent: "rgba(255,255,255,0.18)",
    labelColor: "rgba(255,255,255,0.85)",
    desc: "Colorful gradient",
  },
  {
    id: "ocean",
    name: "Ocean",
    bg: "linear-gradient(135deg, #0ea5e9 0%, #06b6d4 100%)",
    fg: "#ffffff",
    qrColor: "#ffffff",
    qrBg: "rgba(255,255,255,0.12)",
    accent: "rgba(255,255,255,0.18)",
    labelColor: "rgba(255,255,255,0.85)",
    desc: "Blue wave gradient",
  },
  {
    id: "midnight",
    name: "Midnight",
    bg: "linear-gradient(135deg, #0f172a 0%, #1e293b 100%)",
    fg: "#e2e8f0",
    qrColor: "#38bdf8",
    qrBg: "#0f172a",
    accent: "#1e293b",
    labelColor: "#94a3b8",
    desc: "Deep navy glow",
  },
  {
    id: "nature",
    name: "Nature",
    bg: "linear-gradient(135deg, #166534 0%, #22c55e 100%)",
    fg: "#ffffff",
    qrColor: "#ffffff",
    qrBg: "rgba(255,255,255,0.12)",
    accent: "rgba(255,255,255,0.18)",
    labelColor: "rgba(255,255,255,0.85)",
    desc: "Fresh green tones",
  },
  {
    id: "sunset",
    name: "Sunset",
    bg: "linear-gradient(135deg, #dc2626 0%, #f59e0b 100%)",
    fg: "#ffffff",
    qrColor: "#ffffff",
    qrBg: "rgba(255,255,255,0.12)",
    accent: "rgba(255,255,255,0.18)",
    labelColor: "rgba(255,255,255,0.85)",
    desc: "Warm sunset glow",
  },
]

interface QRCardProps {
  url: string
  label: string
  template: QRCardTemplate
  size?: number
  className?: string
  onDownload?: () => void
}

export function QRCard({ url, label, template, size = 280, className, onDownload }: QRCardProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [qrDataUrl, setQrDataUrl] = useState<string>("")
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    async function generateQR() {
      try {
        const dataUrl = await QRCode.toDataURL(url, {
          width: size * 0.55,
          margin: 1,
          color: {
            dark: template.qrColor,
            light: template.qrBg,
          },
        })
        setQrDataUrl(dataUrl)
      } catch {
        console.error("Failed to generate QR code")
      }
    }
    generateQR()
  }, [url, size, template.qrColor, template.qrBg])

  const renderToCanvas = useCallback(() => {
    const canvas = canvasRef.current
    if (!canvas || !qrDataUrl) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    const cardW = size
    const cardH = size * 1.35
    canvas.width = cardW * 2
    canvas.height = cardH * 2
    ctx.scale(2, 2)

    const isGradient = template.bg.startsWith("linear-gradient")
    if (isGradient) {
      const match = template.bg.match(/linear-gradient\(([^)]+)\)/)
      if (match) {
        const parts = match[1].split(",")
        const angle = parts[0].trim()
        const colors = parts.slice(1).map((c) => c.trim())
        const radAngle = parseFloat(angle) * (Math.PI / 180)
        const x1 = 0.5 + 0.5 * Math.cos(radAngle + Math.PI)
        const y1 = 0.5 + 0.5 * Math.sin(radAngle + Math.PI)
        const x2 = 0.5 + 0.5 * Math.cos(radAngle)
        const y2 = 0.5 + 0.5 * Math.sin(radAngle)
        const grad = ctx.createLinearGradient(x1 * cardW, y1 * cardH, x2 * cardW, y2 * cardH)
        colors.forEach((c, i) => {
          grad.addColorStop(i / (colors.length - 1 || 1), c.trim())
        })
        ctx.fillStyle = grad
      } else {
        ctx.fillStyle = "#ffffff"
      }
    } else {
      ctx.fillStyle = template.bg
    }
    ctx.beginPath()
    ctx.roundRect(0, 0, cardW, cardH, 20)
    ctx.fill()

    ctx.fillStyle = template.accent
    ctx.beginPath()
    ctx.roundRect(12, 12, cardW - 24, cardH - 24, 14)
    ctx.fill()

    const img = new Image()
    img.onload = () => {
      const qrSize = cardW * 0.48
      const qrX = (cardW - qrSize) / 2
      const qrY = cardH * 0.12
      ctx.beginPath()
      ctx.roundRect(qrX - 8, qrY - 8, qrSize + 16, qrSize + 16, 12)
      ctx.fillStyle = isGradient ? "rgba(255,255,255,0.1)" : template.bg
      ctx.fill()
      ctx.drawImage(img, qrX, qrY, qrSize, qrSize)

      ctx.fillStyle = template.fg
      ctx.font = `bold ${Math.round(cardW * 0.045)}px system-ui, sans-serif`
      ctx.textAlign = "center"
      ctx.textBaseline = "middle"
      ctx.fillText(label, cardW / 2, cardH * 0.78)

      ctx.fillStyle = template.labelColor
      ctx.font = `${Math.round(cardW * 0.028)}px system-ui, sans-serif`
      ctx.fillText("Scan to visit", cardW / 2, cardH * 0.86)
    }
    img.src = qrDataUrl
  }, [qrDataUrl, size, template, label])

  useEffect(() => {
    if (qrDataUrl) {
      renderToCanvas()
    }
  }, [qrDataUrl, renderToCanvas])

  const downloadCard = useCallback(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const link = document.createElement("a")
    link.download = `flolio-qr-${label.toLowerCase().replace(/\s+/g, "-")}.png`
    link.href = canvas.toDataURL("image/png")
    link.click()
    onDownload?.()
  }, [label, onDownload])

  const copyUrl = useCallback(() => {
    navigator.clipboard.writeText(url)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }, [url])

  return (
    <div className={cn("flex flex-col items-center gap-4", className)}>
      <canvas
        ref={canvasRef}
        className="w-full max-w-[320px] rounded-2xl shadow-lg"
        style={{ aspectRatio: "1 / 1.35" }}
      />
      <div className="flex gap-2 w-full max-w-[320px]">
        <Button
          variant="default"
          size="sm"
          className="flex-1"
          onClick={downloadCard}
          leftIcon={<Download className="w-4 h-4" />}
        >
          Download Card
        </Button>
        <Button
          variant="outline"
          size="sm"
          className="gap-1.5"
          onClick={copyUrl}
        >
          {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
        </Button>
      </div>
    </div>
  )
}

interface QRCardGridProps {
  url: string
  label: string
  selectedTemplate: string
  onSelectTemplate: (id: string) => void
}

export function QRCardGrid({ url, label, selectedTemplate, onSelectTemplate }: QRCardGridProps) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
      {qrTemplates.map((tpl) => (
        <button
          key={tpl.id}
          onClick={() => onSelectTemplate(tpl.id)}
          className={cn(
            "relative rounded-xl border-2 p-3 text-left transition-all",
            selectedTemplate === tpl.id
              ? "border-brand-500 ring-2 ring-brand-500/20 shadow-md"
              : "border-neutral-200 hover:border-neutral-300 dark:border-neutral-700 dark:hover:border-neutral-600"
          )}
        >
          <div
            className="h-20 rounded-lg mb-2 flex items-center justify-center"
            style={{
              background: tpl.bg,
              border: tpl.id === "minimal" ? "1px solid #e5e5e5" : "none",
            }}
          >
            <div
              className="w-10 h-10 rounded-lg flex items-center justify-center text-[10px] font-bold"
              style={{
                background: tpl.qrBg,
                color: tpl.qrColor,
                border: tpl.id === "minimal" ? "1px solid #e5e5e5" : "none",
              }}
            >
              QR
            </div>
          </div>
          <p className="text-sm font-medium text-neutral-900 dark:text-neutral-100">{tpl.name}</p>
          <p className="text-xs text-neutral-500 dark:text-neutral-400">{tpl.desc}</p>
        </button>
      ))}
    </div>
  )
}
