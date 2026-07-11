"use client"

import { useRef, useEffect, useState, useCallback } from "react"
import QRCode from "qrcode"
import { toPng } from "html-to-image"
import { cn } from "@/lib/utils"
import { Download, Check, Copy } from "lucide-react"
import { Button } from "@/components/ui/button"

export interface QRCardTemplate {
  id: string
  name: string
  desc: string
  containerClass: string
  qrClass: string
  labelClass: string
  tagClass: string
  badgeClass: string
  previewBg: string
  previewQr: string
}

export const qrTemplates: QRCardTemplate[] = [
  {
    id: "ivory",
    name: "Ivory",
    desc: "Warm minimal card",
    containerClass: "bg-gradient-to-br from-stone-50 to-stone-100 border border-stone-200",
    qrClass: "bg-white p-2.5 rounded-xl shadow-sm border border-stone-100",
    labelClass: "text-stone-900",
    tagClass: "text-stone-500",
    badgeClass: "bg-stone-200 text-stone-700",
    previewBg: "from-stone-50 to-stone-100",
    previewQr: "bg-white",
  },
  {
    id: "obsidian",
    name: "Obsidian",
    desc: "Bold dark card",
    containerClass: "bg-gradient-to-br from-neutral-900 to-neutral-950 border border-neutral-800",
    qrClass: "bg-neutral-800 p-2.5 rounded-xl border border-neutral-700",
    labelClass: "text-neutral-100",
    tagClass: "text-neutral-400",
    badgeClass: "bg-neutral-800 text-neutral-300",
    previewBg: "from-neutral-900 to-neutral-950",
    previewQr: "bg-neutral-800",
  },
  {
    id: "ember",
    name: "Ember",
    desc: "Warm brand glow",
    containerClass: "bg-gradient-to-br from-brand-600 to-brand-800 border border-brand-500",
    qrClass: "bg-white/15 p-2.5 rounded-xl backdrop-blur-sm border border-white/20",
    labelClass: "text-white",
    tagClass: "text-white/75",
    badgeClass: "bg-white/20 text-white",
    previewBg: "from-brand-600 to-brand-800",
    previewQr: "bg-white/15",
  },
  {
    id: "prism",
    name: "Prism",
    desc: "Vibrant gradient",
    containerClass: "bg-gradient-to-br from-violet-600 via-fuchsia-500 to-amber-500 border border-violet-400/30",
    qrClass: "bg-white/15 p-2.5 rounded-xl backdrop-blur-sm border border-white/20",
    labelClass: "text-white",
    tagClass: "text-white/75",
    badgeClass: "bg-white/20 text-white",
    previewBg: "from-violet-600 via-fuchsia-500 to-amber-500",
    previewQr: "bg-white/15",
  },
  {
    id: "lagoon",
    name: "Lagoon",
    desc: "Ocean blue tones",
    containerClass: "bg-gradient-to-br from-cyan-500 to-blue-700 border border-cyan-400/30",
    qrClass: "bg-white/15 p-2.5 rounded-xl backdrop-blur-sm border border-white/20",
    labelClass: "text-white",
    tagClass: "text-white/75",
    badgeClass: "bg-white/20 text-white",
    previewBg: "from-cyan-500 to-blue-700",
    previewQr: "bg-white/15",
  },
  {
    id: "midnight",
    name: "Midnight",
    desc: "Deep navy with glow",
    containerClass: "bg-gradient-to-br from-slate-900 to-slate-800 border border-slate-700",
    qrClass: "bg-slate-800/80 p-2.5 rounded-xl backdrop-blur-sm border border-sky-500/30",
    labelClass: "text-sky-100",
    tagClass: "text-slate-400",
    badgeClass: "bg-sky-500/20 text-sky-300",
    previewBg: "from-slate-900 to-slate-800",
    previewQr: "bg-slate-800/80",
  },
  {
    id: "meadow",
    name: "Meadow",
    desc: "Fresh green tones",
    containerClass: "bg-gradient-to-br from-emerald-600 to-green-800 border border-emerald-500/30",
    qrClass: "bg-white/15 p-2.5 rounded-xl backdrop-blur-sm border border-white/20",
    labelClass: "text-white",
    tagClass: "text-white/75",
    badgeClass: "bg-white/20 text-white",
    previewBg: "from-emerald-600 to-green-800",
    previewQr: "bg-white/15",
  },
  {
    id: "sorbet",
    name: "Sorbet",
    desc: "Warm sunset blend",
    containerClass: "bg-gradient-to-br from-rose-500 via-orange-400 to-yellow-400 border border-rose-300/30",
    qrClass: "bg-white/15 p-2.5 rounded-xl backdrop-blur-sm border border-white/20",
    labelClass: "text-white",
    tagClass: "text-white/75",
    badgeClass: "bg-white/20 text-white",
    previewBg: "from-rose-500 via-orange-400 to-yellow-400",
    previewQr: "bg-white/15",
  },
]

interface QRCardProps {
  url: string
  label: string
  template: QRCardTemplate
  className?: string
  onDownload?: () => void
}

export function QRCard({ url, label, template, className, onDownload }: QRCardProps) {
  const cardRef = useRef<HTMLDivElement>(null)
  const [qrDataUrl, setQrDataUrl] = useState<string>("")
  const [qrReady, setQrReady] = useState(false)
  const [copied, setCopied] = useState(false)
  const [downloading, setDownloading] = useState(false)

  useEffect(() => {
    setQrReady(false)
    async function generateQR() {
      try {
        const dataUrl = await QRCode.toDataURL(url, {
          width: 280,
          margin: 2,
          color: {
            dark: template.id === "obsidian" || template.id === "midnight" ? "#ffffff" : "#171717",
            light: "transparent",
          },
        })
        setQrDataUrl(dataUrl)
        setQrReady(true)
      } catch {
        console.error("Failed to generate QR code")
      }
    }
    generateQR()
  }, [url, template.id])

  const downloadCard = useCallback(async () => {
    if (!cardRef.current || !qrReady) return
    setDownloading(true)
    try {
      const dataUrl = await toPng(cardRef.current, {
        quality: 1,
        pixelRatio: 3,
        cacheBust: true,
      })
      const link = document.createElement("a")
      link.download = `flolio-qr-${label.toLowerCase().replace(/\s+/g, "-")}.png`
      link.href = dataUrl
      link.click()
      onDownload?.()
    } catch {
      console.error("Failed to download QR card")
    }
    setDownloading(false)
  }, [label, onDownload, qrReady])

  const copyUrl = useCallback(() => {
    navigator.clipboard.writeText(url)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }, [url])

  return (
    <div className={cn("flex flex-col items-center gap-4", className)}>
      <div
        ref={cardRef}
        className={cn(
          "w-[300px] h-[400px] rounded-2xl flex flex-col items-center justify-center p-6 relative overflow-hidden select-none",
          template.containerClass,
        )}
      >
        <div className="absolute inset-0 opacity-[0.04] bg-[radial-gradient(circle_at_50%_0%,white,transparent_70%)]" />
        <div className="absolute -top-10 -right-10 w-40 h-40 rounded-full bg-white/5 blur-xl" />
        <div className="absolute -bottom-8 -left-8 w-32 h-32 rounded-full bg-white/5 blur-xl" />

        <div className={cn("mb-5", template.qrClass)}>
          {qrReady ? (
            <img src={qrDataUrl} alt="QR" className="w-36 h-36" />
          ) : (
            <div className="w-36 h-36 flex items-center justify-center text-sm text-muted-foreground">
              Generating...
            </div>
          )}
        </div>

        <span className={cn("text-lg font-bold tracking-tight", template.labelClass)}>
          {label}
        </span>
        <span className={cn("text-xs mt-1", template.tagClass)}>
          Scan to visit profile
        </span>

        <div className={cn("mt-4 px-3 py-1 rounded-full text-[10px] font-medium uppercase tracking-wider", template.badgeClass)}>
          Flolio
        </div>
      </div>

      <div className="flex gap-2 w-[300px]">
        <Button
          variant="default"
          size="sm"
          className="flex-1"
          onClick={downloadCard}
          disabled={!qrReady || downloading}
          loading={downloading}
          loadingText="Downloading..."
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
  selectedTemplate: string
  onSelectTemplate: (id: string) => void
}

export function QRCardGrid({ selectedTemplate, onSelectTemplate }: QRCardGridProps) {
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
            className={cn(
              "h-20 rounded-lg mb-2 flex items-center justify-center bg-gradient-to-br",
              tpl.previewBg,
            )}
          >
            <div className={cn("w-10 h-10 rounded-lg flex items-center justify-center text-[10px] font-bold text-white/80", tpl.previewQr)}>
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
