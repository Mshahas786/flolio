"use client"

import { useState, useRef } from "react"
import { Loader2, Upload, X } from "lucide-react"

function compressImage(file: File, maxWidth = 1200, quality = 0.7): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.onload = () => {
      const canvas = document.createElement("canvas")
      let { width, height } = img
      if (width > maxWidth) {
        height = (height / width) * maxWidth
        width = maxWidth
      }
      if (height > maxWidth) {
        width = (width / height) * maxWidth
        height = maxWidth
      }
      canvas.width = width
      canvas.height = height
      const ctx = canvas.getContext("2d")!
      ctx.drawImage(img, 0, 0, width, height)
      canvas.toBlob((blob) => {
        if (blob) resolve(blob)
        else reject(new Error("Compression failed"))
      }, "image/jpeg", quality)
    }
    img.onerror = () => reject(new Error("Failed to load image"))
    img.src = URL.createObjectURL(file)
  })
}

export function ImageUpload({
  value,
  onChange,
}: {
  value: string
  onChange: (url: string) => void
}) {
  const [uploading, setUploading] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  async function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setUploading(true)
    try {
      const compressed = await compressImage(file)
      const fd = new FormData()
      fd.append("file", compressed, file.name.replace(/\.[^.]+$/, ".jpg"))
      const res = await fetch("/api/upload", { method: "POST", body: fd })
      const data = await res.json()
      if (data.url) onChange(data.url)
    } catch {}
    setUploading(false)
    if (inputRef.current) inputRef.current.value = ""
  }

  return (
    <div className="space-y-2">
      <input ref={inputRef} type="file" accept="image/*" onChange={handleFile} className="hidden" />
      {value ? (
        <div className="relative rounded-xl overflow-hidden border">
          <img src={value} alt="" className="w-full aspect-[2/1] object-cover" />
          <button
            type="button"
            onClick={() => onChange("")}
            className="absolute top-1 right-1 bg-black/60 text-white rounded-full p-1 hover:bg-black/80"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={uploading}
          className="w-full h-24 rounded-xl border-2 border-dashed border-muted-foreground/30 flex items-center justify-center text-sm text-muted-foreground hover:border-primary/50 hover:text-primary transition-colors disabled:opacity-50"
        >
          {uploading ? (
            <Loader2 className="w-5 h-5 animate-spin" />
          ) : (
            <span className="flex items-center gap-2">
              <Upload className="w-4 h-4" />
              Upload Image
            </span>
          )}
        </button>
      )}
    </div>
  )
}
