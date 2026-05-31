"use client"

import { useState, useEffect, useRef } from "react"
import { useSession } from "next-auth/react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Modal } from "@/components/ui/modal"
import { Plus, Trash2, GripVertical, ExternalLink, Pause, Play, Clock, Tag, Smile, Wand2, Pencil, Link as LinkIcon, Share2, Music, Video, Headphones, Radio, DollarSign } from "lucide-react"
import { toast } from "@/components/ui/toast"
import { PRICE_TIERS } from "@/lib/pricing"
import { emojis } from "@/lib/customization"
import { socialPlatforms, getSocialPlatform } from "@/lib/social"
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core"
import {
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
  arrayMove,
} from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"

// ---------- Link types & components ----------

interface Link {
  id: string
  title: string
  url: string
  icon: string | null
  imageUrl: string | null
  isActive: boolean
  order: number
  clicks: number
  startsAt: string | null
  expiresAt: string | null
  utmSource: string | null
  utmMedium: string | null
  utmCampaign: string | null
  utmContent: string | null
  section: string | null
}

interface LinkFormData {
  title: string
  url: string
  icon: string | null
  imageUrl: string
  section: string
  startsAt: string
  expiresAt: string
  utmSource: string
  utmMedium: string
  utmCampaign: string
  utmContent: string
}

const emptyForm: LinkFormData = {
  title: "",
  url: "",
  icon: null,
  imageUrl: "",
  section: "",
  startsAt: "",
  expiresAt: "",
  utmSource: "",
  utmMedium: "",
  utmCampaign: "",
  utmContent: "",
}

function EmojiPicker({ value, onChange }: { value: string | null; onChange: (emoji: string | null) => void }) {
  const [open, setOpen] = useState(false)

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="w-10 h-10 rounded-lg border border-input bg-background flex items-center justify-center text-base hover:bg-accent shrink-0"
      >
        {value || <Smile className="w-4 h-4 text-muted-foreground" />}
      </button>
      {open && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />
          <div className="absolute top-full left-0 mt-1 z-20 w-64 p-2 bg-card border rounded-xl shadow-xl grid grid-cols-7 gap-1.5 max-h-48 overflow-y-auto">
            {emojis.map((e) => (
              <button
                key={e}
                type="button"
                onClick={() => { onChange(e === value ? null : e); setOpen(false) }}
                className={`w-8 h-8 flex items-center justify-center rounded-lg hover:bg-accent text-base ${value === e ? "bg-primary/10 ring-1 ring-primary" : ""}`}
              >
                {e}
              </button>
            ))}
            {value && (
              <button
                type="button"
                onClick={() => { onChange(null); setOpen(false) }}
                className="col-span-7 text-xs text-muted-foreground hover:text-foreground py-2"
              >
                Remove icon
              </button>
            )}
          </div>
        </>
      )}
    </div>
  )
}

function SortableLinkCard({
  link,
  onEdit,
  onToggleLink,
  onDeleteLink,
}: {
  link: Link
  onEdit: (link: Link) => void
  onToggleLink: (id: string, isActive: boolean) => void
  onDeleteLink: (id: string) => void
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    setActivatorNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: link.id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  }

  function getLinkStatus(l: Link) {
    if (!l.isActive) return { label: "Paused", variant: "secondary" as const }
    const now = new Date()
    if (l.startsAt && new Date(l.startsAt) > now) return { label: "Scheduled", variant: "outline" as const }
    if (l.expiresAt && new Date(l.expiresAt) < now) return { label: "Expired", variant: "destructive" as const }
    return { label: "Active", variant: "success" as const }
  }

  const status = getLinkStatus(link)

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`rounded-lg border bg-card hover:bg-accent/50 transition-colors ${isDragging ? "shadow-lg z-10" : ""}`}
    >
      <div className="flex items-start gap-3 p-3">
        <button
          ref={setActivatorNodeRef}
          {...attributes}
          {...listeners}
          className="cursor-grab active:cursor-grabbing shrink-0 p-0.5 rounded hover:bg-gray-100 mt-0.5"
        >
          <GripVertical className="w-4 h-4 text-muted-foreground" />
        </button>
        <div className="flex items-center justify-center w-8 h-8 rounded-lg border border-input bg-background text-sm shrink-0 mt-0.5">
          {link.icon || <LinkIcon className="w-3.5 h-3.5 text-muted-foreground" />}
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-medium text-sm truncate">{link.title}</p>
          <p className="text-xs text-muted-foreground truncate">{link.url}</p>
          {link.section && (
            <span className="text-[10px] text-muted-foreground bg-muted px-1.5 py-0.5 rounded mt-0.5 inline-block">{link.section}</span>
          )}
        </div>
        <div className="flex items-start gap-0.5 shrink-0">
          <span className="hidden sm:inline text-xs text-muted-foreground mt-3 mr-1">{link.clicks} clicks</span>
          <Badge variant={status.variant} className="mt-2.5">{status.label}</Badge>
          <div className="flex items-center gap-0.5">
            <button onClick={() => onEdit(link)} title="Edit link" className="flex items-center justify-center h-10 w-10 rounded-lg hover:bg-accent text-muted-foreground hover:text-foreground transition-colors">
              <Pencil className="w-4 h-4" />
            </button>
            <a href={link.url} target="_blank" rel="noopener noreferrer" className="flex items-center justify-center h-10 w-10 rounded-lg hover:bg-accent text-muted-foreground hover:text-foreground transition-colors">
              <ExternalLink className="w-4 h-4" />
            </a>
            <button onClick={() => onToggleLink(link.id, link.isActive)} title={link.isActive ? "Pause" : "Activate"} className="flex items-center justify-center h-10 w-10 rounded-lg hover:bg-accent text-muted-foreground hover:text-foreground transition-colors">
              {link.isActive ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
            </button>
            <button onClick={() => onDeleteLink(link.id)} title="Delete" className="flex items-center justify-center h-10 w-10 rounded-lg hover:bg-destructive/10 text-red-600 transition-colors">
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

// ---------- Link form modal ----------

function LinkFormModal({
  open,
  onClose,
  initial,
  onSave,
  saving,
}: {
  open: boolean
  onClose: () => void
  initial: LinkFormData
  onSave: (data: LinkFormData) => void
  saving: boolean
}) {
  const [form, setForm] = useState<LinkFormData>(initial)
  const [fetching, setFetching] = useState(false)

  useEffect(() => {
    if (open) setForm(initial)
  }, [open, initial])

  function set<K extends keyof LinkFormData>(key: K, value: LinkFormData[K]) {
    setForm((prev) => ({ ...prev, [key]: value }))
  }

  async function fetchOG() {
    if (!form.url) return
    setFetching(true)
    try {
      const res = await fetch(`/api/og?url=${encodeURIComponent(form.url)}`)
      const data = await res.json()
      if (data.title) set("title", data.title)
      if (data.image) set("imageUrl", data.image)
    } catch {}
    setFetching(false)
  }

  return (
    <Modal open={open} onClose={onClose} title={initial.title ? "Edit Link" : "Add Link"}>
      <div className="space-y-4">
        <div className="flex items-center gap-3">
          <EmojiPicker value={form.icon} onChange={(icon) => set("icon", icon)} />
          <div className="flex-1">
            <label className="text-xs font-medium text-muted-foreground mb-1 block">Title</label>
            <Input
              placeholder="Link title"
              value={form.title}
              onChange={(e) => set("title", e.target.value)}
            />
          </div>
        </div>

        <div>
          <label className="text-xs font-medium text-muted-foreground mb-1 block">URL</label>
          <div className="flex gap-2">
            <Input
              placeholder="https://example.com"
              value={form.url}
              onChange={(e) => set("url", e.target.value)}
              className="flex-1"
            />
            <Button type="button" variant="outline" size="icon" disabled={!form.url || fetching} onClick={fetchOG} title="Auto-fetch metadata">
              <Wand2 className={`w-4 h-4 ${fetching ? "animate-spin" : ""}`} />
            </Button>
          </div>
        </div>

        <div>
          <label className="text-xs font-medium text-muted-foreground mb-1 block">Image URL</label>
          <Input
            placeholder="https://example.com/image.jpg"
            value={form.imageUrl}
            onChange={(e) => set("imageUrl", e.target.value)}
          />
        </div>

        <div>
          <label className="text-xs font-medium text-muted-foreground mb-1 flex items-center gap-1"><Tag className="w-3 h-3" /> Section / Group</label>
          <Input
            placeholder="e.g. My Shop, Latest Video"
            value={form.section}
            onChange={(e) => set("section", e.target.value)}
          />
        </div>

        <div>
          <label className="text-xs font-medium text-muted-foreground mb-1 flex items-center gap-1"><Clock className="w-3 h-3" /> Schedule</label>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="text-[10px] text-muted-foreground">Start at</label>
              <input
                type="datetime-local"
                value={form.startsAt}
                onChange={(e) => set("startsAt", e.target.value)}
                className="w-full text-xs border rounded px-2 py-1.5 bg-background mt-0.5"
              />
            </div>
            <div>
              <label className="text-[10px] text-muted-foreground">Expire at</label>
              <input
                type="datetime-local"
                value={form.expiresAt}
                onChange={(e) => set("expiresAt", e.target.value)}
                className="w-full text-xs border rounded px-2 py-1.5 bg-background mt-0.5"
              />
            </div>
          </div>
        </div>

        <div>
          <label className="text-xs font-medium text-muted-foreground mb-1 flex items-center gap-1"><Tag className="w-3 h-3" /> UTM Parameters</label>
          <div className="grid grid-cols-2 gap-2">
            <Input placeholder="utm_source" value={form.utmSource} onChange={(e) => set("utmSource", e.target.value)} className="h-8 text-xs" />
            <Input placeholder="utm_medium" value={form.utmMedium} onChange={(e) => set("utmMedium", e.target.value)} className="h-8 text-xs" />
            <Input placeholder="utm_campaign" value={form.utmCampaign} onChange={(e) => set("utmCampaign", e.target.value)} className="h-8 text-xs" />
            <Input placeholder="utm_content" value={form.utmContent} onChange={(e) => set("utmContent", e.target.value)} className="h-8 text-xs" />
          </div>
        </div>

        <div className="flex gap-3 pt-2">
          <Button variant="outline" onClick={onClose} className="flex-1">Cancel</Button>
          <Button onClick={() => onSave(form)} disabled={saving || !form.title || !form.url} className="flex-1">
            {saving ? "Saving..." : initial.title ? "Save Changes" : "Create Link"}
          </Button>
        </div>
      </div>
    </Modal>
  )
}

// ---------- Social types & components ----------

interface SocialLink {
  id: string
  platform: string
  handle: string
  url: string
  order: number
}

function SortableSocialCard({
  social,
  onDelete,
  onUpdateHandle,
}: {
  social: SocialLink
  onDelete: (id: string) => void
  onUpdateHandle: (id: string, handle: string) => void
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    setActivatorNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: social.id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  }

  const platform = getSocialPlatform(social.platform)

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`rounded-lg border bg-card hover:bg-accent/50 transition-colors ${isDragging ? "shadow-lg z-10" : ""}`}
    >
      <div className="flex items-start gap-3 p-3">
        <button
          ref={setActivatorNodeRef}
          {...attributes}
          {...listeners}
          className="cursor-grab active:cursor-grabbing shrink-0 p-0.5 rounded hover:bg-gray-100 mt-0.5"
        >
          <GripVertical className="w-4 h-4 text-muted-foreground" />
        </button>
        {platform && (
          <span
            className="w-8 h-8 rounded-full flex items-center justify-center text-white shrink-0 mt-0.5"
            style={{ backgroundColor: platform.color }}
            dangerouslySetInnerHTML={{ __html: platform.icon.replace('fill="currentColor"', 'fill="white"') }}
          />
        )}
        <div className="flex-1 min-w-0">
          <p className="font-medium text-sm">{platform?.name || social.platform}</p>
          <Input
            value={social.handle}
            onChange={(e) => onUpdateHandle(social.id, e.target.value)}
            className="h-7 text-xs mt-0.5"
            placeholder="your handle"
          />
        </div>
        <div className="flex items-center gap-0.5 shrink-0">
          <a href={social.url} target="_blank" rel="noopener noreferrer" className="flex items-center justify-center h-10 w-10 rounded-lg hover:bg-accent text-muted-foreground hover:text-foreground transition-colors">
            <ExternalLink className="w-4 h-4" />
          </a>
          <button onClick={() => onDelete(social.id)} title="Delete" className="flex items-center justify-center h-10 w-10 rounded-lg hover:bg-destructive/10 text-red-600 transition-colors">
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  )
}

// ---------- Main merged page ----------

export default function LinksPage() {
  const { data: session } = useSession()
  const isPro = (session?.user as any)?.isPro
  const [tab, setTab] = useState<"links" | "social" | "embeds" | "products">("links")

  // Link state
  const [links, setLinks] = useState<Link[]>([])
  const [linksLoading, setLinksLoading] = useState(true)

  // Modal state
  const [modalOpen, setModalOpen] = useState(false)
  const [editingLink, setEditingLink] = useState<Link | null>(null)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState("")

  // Social state
  const [socialLinks, setSocialLinks] = useState<SocialLink[]>([])
  const [socialLoading, setSocialLoading] = useState(true)
  const [selectedPlatform, setSelectedPlatform] = useState("")
  const [handle, setHandle] = useState("")
  const [socialError, setSocialError] = useState("")
  const [addingSocial, setAddingSocial] = useState(false)

  const [embeds, setEmbeds] = useState<any[]>([])
  const [embedsLoading, setEmbedsLoading] = useState(true)
  const [embedForm, setEmbedForm] = useState(false)
  const [editingEmbed, setEditingEmbed] = useState<any | null>(null)
  const [embedType, setEmbedType] = useState("youtube")
  const [embedTitle, setEmbedTitle] = useState("")
  const [embedUrl, setEmbedUrl] = useState("")
  const [embedSaving, setEmbedSaving] = useState(false)

  const embedTypes = [
    { value: "youtube", label: "YouTube", icon: Video },
    { value: "spotify", label: "Spotify", icon: Music },
    { value: "soundcloud", label: "SoundCloud", icon: Music },
    { value: "podcast", label: "Podcast", icon: Headphones },
    { value: "tiktok", label: "TikTok", icon: Radio },
    { value: "apple_music", label: "Apple Music", icon: Music },
  ]

  const [products, setProducts] = useState<any[]>([])
  const [productsLoading, setProductsLoading] = useState(true)
  const [productForm, setProductForm] = useState(false)
  const [editingProduct, setEditingProduct] = useState<any | null>(null)
  const [prodTitle, setProdTitle] = useState("")
  const [prodDesc, setProdDesc] = useState("")
  const [prodPrice, setProdPrice] = useState("")
  const [prodFileUrl, setProdFileUrl] = useState("")
  const [prodFileType, setProdFileType] = useState("")
  const [prodImageUrl, setProdImageUrl] = useState("")
  const [prodSaving, setProdSaving] = useState(false)

  const pointerSensor = useSensor(PointerSensor, {
    activationConstraint: { distance: 8 },
  })
  const keyboardSensor = useSensor(KeyboardSensor, {
    coordinateGetter: sortableKeyboardCoordinates,
  })
  const sensors = useSensors(pointerSensor, keyboardSensor)

  // Fetch links
  async function fetchLinks() {
    const res = await fetch("/api/links")
    if (res.ok) {
      setLinks(await res.json())
    }
    setLinksLoading(false)
  }

  useEffect(() => { fetchLinks() }, [])

  async function handleSave(data: LinkFormData) {
    setSaving(true)
    setError("")

    const body: Record<string, any> = {
      title: data.title,
      url: data.url,
      icon: data.icon || undefined,
      imageUrl: data.imageUrl || undefined,
      section: data.section || undefined,
      startsAt: data.startsAt ? new Date(data.startsAt).toISOString() : undefined,
      expiresAt: data.expiresAt ? new Date(data.expiresAt).toISOString() : undefined,
      utmSource: data.utmSource || undefined,
      utmMedium: data.utmMedium || undefined,
      utmCampaign: data.utmCampaign || undefined,
      utmContent: data.utmContent || undefined,
    }

    const method = editingLink ? "PATCH" : "POST"
    const url = editingLink ? `/api/links/${editingLink.id}` : "/api/links"

    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    })

    if (!res.ok) {
      const d = await res.json()
      setError(d.error || "Something went wrong")
      setSaving(false)
      return
    }

    setSaving(false)
    setModalOpen(false)
    setEditingLink(null)
    fetchLinks()
  }

  function openAddModal() {
    setEditingLink(null)
    setError("")
    setModalOpen(true)
  }

  function openEditModal(link: Link) {
    setEditingLink(link)
    setError("")
    setModalOpen(true)
  }

  const formInitial: LinkFormData = editingLink
    ? {
        title: editingLink.title,
        url: editingLink.url,
        icon: editingLink.icon,
        imageUrl: editingLink.imageUrl || "",
        section: editingLink.section || "",
        startsAt: editingLink.startsAt ? new Date(editingLink.startsAt).toISOString().slice(0, 16) : "",
        expiresAt: editingLink.expiresAt ? new Date(editingLink.expiresAt).toISOString().slice(0, 16) : "",
        utmSource: editingLink.utmSource || "",
        utmMedium: editingLink.utmMedium || "",
        utmCampaign: editingLink.utmCampaign || "",
        utmContent: editingLink.utmContent || "",
      }
    : emptyForm

  async function toggleLink(id: string, isActive: boolean) {
    await fetch(`/api/links/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isActive: !isActive }),
    })
    fetchLinks()
  }

  async function deleteLink(id: string) {
    await fetch(`/api/links/${id}`, { method: "DELETE" })
    fetchLinks()
  }

  async function handleLinkDragEnd(event: DragEndEvent) {
    const { active, over } = event
    if (!over || active.id === over.id) return

    setLinks((items) => {
      const oldIndex = items.findIndex((l) => l.id === active.id)
      const newIndex = items.findIndex((l) => l.id === over.id)
      const reordered = arrayMove(items, oldIndex, newIndex)

      fetch("/api/links/reorder", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          links: reordered.map((l, i) => ({ id: l.id, order: i })),
        }),
      })

      return reordered
    })
  }

  const maxLinks = isPro ? PRICE_TIERS.pro.maxLinks : PRICE_TIERS.free.maxLinks

  // Social functions
  async function fetchSocial() {
    const res = await fetch("/api/social")
    if (res.ok) {
      setSocialLinks(await res.json())
    }
    setSocialLoading(false)
  }

  useEffect(() => { fetchSocial() }, [])

  async function fetchEmbeds() {
    const res = await fetch("/api/embeds")
    if (res.ok) setEmbeds(await res.json())
    setEmbedsLoading(false)
  }

  useEffect(() => { fetchEmbeds() }, [])

  function resetEmbedForm() {
    setEmbedForm(false)
    setEditingEmbed(null)
    setEmbedType("youtube")
    setEmbedTitle("")
    setEmbedUrl("")
  }

  async function saveEmbed() {
    if (!embedUrl) return
    setEmbedSaving(true)
    const body = { type: embedType, title: embedTitle, url: embedUrl }
    const res = editingEmbed
      ? await fetch(`/api/embeds/${editingEmbed.id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) })
      : await fetch("/api/embeds", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) })
    if (res.ok) {
      toast.success(editingEmbed ? "Embed updated" : "Embed added")
      resetEmbedForm()
      fetchEmbeds()
    } else {
      const err = await res.json()
      toast.error(err.error || "Error saving embed")
    }
    setEmbedSaving(false)
  }

  async function removeEmbed(id: string) {
    const res = await fetch(`/api/embeds/${id}`, { method: "DELETE" })
    if (res.ok) { toast.success("Embed removed"); fetchEmbeds() }
  }

  async function toggleEmbed(id: string, isActive: boolean) {
    await fetch(`/api/embeds/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isActive: !isActive }),
    })
    fetchEmbeds()
  }

  function startEditEmbed(e: any) {
    setEditingEmbed(e)
    setEmbedType(e.type)
    setEmbedTitle(e.title || "")
    setEmbedUrl(e.url)
    setEmbedForm(true)
  }

  async function fetchProducts() {
    const res = await fetch("/api/products")
    if (res.ok) setProducts(await res.json())
    setProductsLoading(false)
  }

  useEffect(() => { fetchProducts() }, [])

  function resetProductForm() {
    setProductForm(false)
    setEditingProduct(null)
    setProdTitle("")
    setProdDesc("")
    setProdPrice("")
    setProdFileUrl("")
    setProdFileType("")
    setProdImageUrl("")
  }

  function startEditProduct(p: any) {
    setEditingProduct(p)
    setProdTitle(p.title)
    setProdDesc(p.description || "")
    setProdPrice((p.price / 100).toFixed(2))
    setProdFileUrl(p.fileUrl || "")
    setProdFileType(p.fileType || "")
    setProdImageUrl(p.imageUrl || "")
    setProductForm(true)
  }

  async function saveProduct() {
    if (!prodTitle || !prodPrice) return
    setProdSaving(true)
    const body = { title: prodTitle, description: prodDesc, price: parseFloat(prodPrice), fileUrl: prodFileUrl, fileType: prodFileType, imageUrl: prodImageUrl }
    const res = editingProduct
      ? await fetch(`/api/products/${editingProduct.id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) })
      : await fetch("/api/products", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) })
    if (res.ok) {
      toast.success(editingProduct ? "Product updated" : "Product created")
      resetProductForm()
      fetchProducts()
    } else {
      toast.error(editingProduct ? "Error updating product" : "Error creating product")
    }
    setProdSaving(false)
  }

  async function removeProduct(id: string) {
    const res = await fetch(`/api/products/${id}`, { method: "DELETE" })
    if (res.ok) { toast.success("Product deleted"); fetchProducts() }
  }

  async function toggleProduct(id: string, isActive: boolean) {
    await fetch(`/api/products/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isActive: !isActive }),
    })
    fetchProducts()
  }

  const addedPlatforms = new Set(socialLinks.map((l) => l.platform))
  const availablePlatforms = socialPlatforms.filter((p) => !addedPlatforms.has(p.id))

  async function addSocial() {
    if (!selectedPlatform || !handle) return
    setAddingSocial(true)
    setSocialError("")
    const res = await fetch("/api/social", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ platform: selectedPlatform, handle }),
    })
    if (!res.ok) {
      const data = await res.json()
      setSocialError(data.error || "Failed to add social link")
      setAddingSocial(false)
      return
    }
    setSelectedPlatform("")
    setHandle("")
    setAddingSocial(false)
    fetchSocial()
  }

  async function deleteSocial(id: string) {
    await fetch(`/api/social/${id}`, { method: "DELETE" })
    fetchSocial()
  }

  async function updateHandle(id: string, newHandle: string) {
    await fetch(`/api/social/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ handle: newHandle }),
    })
    fetchSocial()
  }

  async function handleSocialDragEnd(event: DragEndEvent) {
    const { active, over } = event
    if (!over || active.id === over.id) return

    setSocialLinks((items) => {
      const oldIndex = items.findIndex((l) => l.id === active.id)
      const newIndex = items.findIndex((l) => l.id === over.id)
      const reordered = arrayMove(items, oldIndex, newIndex)

      Promise.all(
        reordered.map((l, i) =>
          fetch(`/api/social/${l.id}`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ order: i }),
          })
        )
      )

      return reordered
    })
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Links &amp; Social</h1>
          <p className="text-muted-foreground mt-1">Manage your links and social media handles</p>
        </div>
        {tab === "links" && (
          <Button onClick={openAddModal}>
            <Plus className="w-4 h-4 mr-1" /> Add Link
          </Button>
        )}
      </div>

      {/* Tab switcher */}
      <div className="flex gap-1 border-b">
        <button
          onClick={() => setTab("links")}
          className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium border-b-2 transition-colors ${
            tab === "links"
              ? "border-primary text-primary"
              : "border-transparent text-muted-foreground hover:text-foreground"
          }`}
        >
          <LinkIcon className="w-4 h-4" />
          Links
        </button>
        <button
          onClick={() => setTab("social")}
          className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium border-b-2 transition-colors ${
            tab === "social"
              ? "border-primary text-primary"
              : "border-transparent text-muted-foreground hover:text-foreground"
          }`}
        >
          <Share2 className="w-4 h-4" />
          Social
        </button>
        <button
          onClick={() => setTab("embeds")}
          className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium border-b-2 transition-colors ${
            tab === "embeds"
              ? "border-primary text-primary"
              : "border-transparent text-muted-foreground hover:text-foreground"
          }`}
        >
          <Music className="w-4 h-4" />
          Embeds
        </button>
        <button
          onClick={() => setTab("products")}
          className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium border-b-2 transition-colors ${
            tab === "products"
              ? "border-primary text-primary"
              : "border-transparent text-muted-foreground hover:text-foreground"
          }`}
        >
          <DollarSign className="w-4 h-4" />
          Products
        </button>
      </div>

      {/* Links tab */}
      {tab === "links" && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Your Links</CardTitle>
            <p className="text-xs text-muted-foreground">
              {maxLinks === -1
                ? "Unlimited links (Pro plan)"
                : `${links.length} / ${maxLinks} links used`}
              {links.length > 0 && " — Drag the grip handle to reorder"}
            </p>
          </CardHeader>
          <CardContent>
            {linksLoading ? (
              <p className="text-muted-foreground text-sm">Loading...</p>
            ) : links.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-muted-foreground mb-4">No links yet.</p>
                <Button onClick={openAddModal}>
                  <Plus className="w-4 h-4 mr-1" /> Add Your First Link
                </Button>
              </div>
            ) : (
              <DndContext
                sensors={sensors}
                collisionDetection={closestCenter}
                onDragEnd={handleLinkDragEnd}
              >
                <SortableContext
                  items={links.map(l => l.id)}
                  strategy={verticalListSortingStrategy}
                >
                  <div className="space-y-2">
                    {links.map((link) => (
                      <SortableLinkCard
                        key={link.id}
                        link={link}
                        onEdit={openEditModal}
                        onToggleLink={toggleLink}
                        onDeleteLink={deleteLink}
                      />
                    ))}
                  </div>
                </SortableContext>
              </DndContext>
            )}
          </CardContent>
        </Card>
      )}

      {/* Social tab */}
      {tab === "social" && (
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Add Social Link</CardTitle>
              <CardDescription>Select a platform and enter your username or handle</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-start">
                <div className="flex-1 space-y-2">
                  <div className="flex flex-wrap gap-2">
                    {availablePlatforms.length === 0 ? (
                      <p className="text-xs text-muted-foreground">All platforms added</p>
                    ) : (
                      availablePlatforms.map((p) => (
                        <button
                          key={p.id}
                          onClick={() => setSelectedPlatform(p.id)}
                          className={`flex items-center gap-2 px-3 py-2 rounded-lg border text-sm transition-all ${
                            selectedPlatform === p.id
                              ? "border-primary bg-primary/10 text-primary"
                              : "border-gray-200 hover:border-gray-300 text-gray-700"
                          }`}
                        >
                          <span
                            className="w-5 h-5 shrink-0"
                            style={{ color: p.color }}
                            dangerouslySetInnerHTML={{ __html: p.icon }}
                          />
                          {p.name}
                        </button>
                      ))
                    )}
                  </div>
                  {selectedPlatform && (
                    <Input
                      placeholder={`Enter your ${getSocialPlatform(selectedPlatform)?.name || selectedPlatform} handle`}
                      value={handle}
                      onChange={(e) => setHandle(e.target.value)}
                    />
                  )}
                </div>
                {selectedPlatform && (
                  <Button onClick={addSocial} disabled={addingSocial || !handle} className="shrink-0">
                    <Plus className="w-4 h-4 mr-1" /> Add
                  </Button>
                )}
              </div>
              {socialError && <p className="text-sm text-red-600 mt-2">{socialError}</p>}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Your Social Links</CardTitle>
              <p className="text-xs text-muted-foreground">Drag the grip handle to reorder</p>
            </CardHeader>
            <CardContent>
              {socialLoading ? (
                <p className="text-muted-foreground text-sm">Loading...</p>
              ) : socialLinks.length === 0 ? (
                <p className="text-muted-foreground text-sm">No social links yet. Add your first one above.</p>
              ) : (
                <DndContext
                  sensors={sensors}
                  collisionDetection={closestCenter}
                  onDragEnd={handleSocialDragEnd}
                >
                  <SortableContext
                    items={socialLinks.map(l => l.id)}
                    strategy={verticalListSortingStrategy}
                  >
                    <div className="space-y-2">
                      {socialLinks.map((social) => (
                        <SortableSocialCard
                          key={social.id}
                          social={social}
                          onDelete={deleteSocial}
                          onUpdateHandle={updateHandle}
                        />
                      ))}
                    </div>
                  </SortableContext>
                </DndContext>
              )}
            </CardContent>
          </Card>
        </div>
      )}

      {/* Embeds tab */}
      {tab === "embeds" && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold">Media Embeds</h2>
              <p className="text-sm text-muted-foreground mt-1">Add YouTube videos, Spotify tracks, podcasts, and more</p>
            </div>
            <Button onClick={() => { if (!embedForm) resetEmbedForm(); setEmbedForm(!embedForm) }} className="rounded-xl">
              <Plus className="w-4 h-4 mr-2" /> Add Embed
            </Button>
          </div>

          {embedForm && (
            <Card>
              <CardContent className="pt-6 space-y-4">
                <div className="space-y-2">
                  <label className="text-xs font-medium text-muted-foreground">Type</label>
                  <div className="flex flex-wrap gap-2">
                    {embedTypes.map((et) => (
                      <button key={et.value} onClick={() => setEmbedType(et.value)}
                        className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium border transition-all ${
                          embedType === et.value ? "border-primary bg-primary/10 text-primary" : "border-gray-200 text-gray-600 hover:border-gray-300"
                        }`}
                      >
                        <et.icon className="w-3.5 h-3.5" /> {et.label}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-medium text-muted-foreground">Title</label>
                  <Input value={embedTitle} onChange={(e) => setEmbedTitle(e.target.value)} placeholder="My favorite song" />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-medium text-muted-foreground">URL *</label>
                  <Input value={embedUrl} onChange={(e) => setEmbedUrl(e.target.value)} placeholder="https://youtube.com/watch?v=..." />
                </div>
                <div className="flex gap-2">
                  <Button onClick={saveEmbed} disabled={embedSaving || !embedUrl} className="rounded-xl">
                    {embedSaving ? "Saving..." : editingEmbed ? "Update Embed" : "Add Embed"}
                  </Button>
                  <Button variant="outline" onClick={resetEmbedForm} className="rounded-xl">Cancel</Button>
                </div>
              </CardContent>
            </Card>
          )}

          {embedsLoading ? (
            <p className="text-sm text-muted-foreground">Loading...</p>
          ) : embeds.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <Music className="w-12 h-12 text-muted-foreground/40 mx-auto mb-4" />
                <p className="text-muted-foreground">No embeds yet. Add music, videos, or podcasts.</p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid sm:grid-cols-2 gap-4">
              {embeds.map((e: any) => (
                <Card key={e.id}>
                  <CardContent className="pt-6">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-2">
                        {(() => {
                          const et = embedTypes.find((t: any) => t.value === e.type)
                          return et ? <et.icon className="w-5 h-5 text-primary" /> : null
                        })()}
                        <div>
                          <h3 className="font-semibold text-sm">{e.title || e.type}</h3>
                          <p className="text-xs text-muted-foreground truncate max-w-[200px]">{e.url}</p>
                        </div>
                      </div>
                      <Badge variant={e.isActive ? "success" : "secondary"} className="text-xs">{e.type}</Badge>
                    </div>
                    {e.embedUrl && e.type === "youtube" && (
                      <div className="aspect-video rounded-lg overflow-hidden bg-black/5 mb-2">
                        <iframe src={e.embedUrl} className="w-full h-full" allowFullScreen />
                      </div>
                    )}
                    {e.embedUrl && e.type === "spotify" && (
                      <iframe src={e.embedUrl} className="w-full h-[80px] rounded-lg" allow="encrypted-media" />
                    )}
                    {e.embedUrl && e.type === "soundcloud" && (
                      <iframe src={e.embedUrl} className="w-full h-[120px] rounded-lg" />
                    )}
                    <div className="flex items-center gap-2 mt-3">
                      <Button size="sm" variant="outline" onClick={() => startEditEmbed(e)} className="rounded-lg text-xs">
                        Edit
                      </Button>
                      <Button size="sm" variant="outline" onClick={() => toggleEmbed(e.id, e.isActive)} className="rounded-lg text-xs">
                        {e.isActive ? "Pause" : "Activate"}
                      </Button>
                      <Button size="sm" variant="outline" onClick={() => removeEmbed(e.id)} className="rounded-lg text-xs text-red-500">
                        <Trash2 className="w-3 h-3 mr-1" /> Remove
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Products tab */}
      {tab === "products" && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold">Digital Products</h2>
              <p className="text-sm text-muted-foreground mt-1">Sell digital goods directly from your Flolio page</p>
            </div>
            <Button onClick={() => { if (!productForm) resetProductForm(); setProductForm(!productForm) }} className="rounded-xl">
              <Plus className="w-4 h-4 mr-2" /> Add Product
            </Button>
          </div>

          {productForm && (
            <Card>
              <CardContent className="pt-6 space-y-4">
                <div className="grid sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-xs font-medium text-muted-foreground">Title *</label>
                    <Input value={prodTitle} onChange={(e) => setProdTitle(e.target.value)} placeholder="e.g. My eBook" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-medium text-muted-foreground">Price (USD) *</label>
                    <Input type="number" step="0.01" min="0.50" value={prodPrice} onChange={(e) => setProdPrice(e.target.value)} placeholder="9.99" />
                  </div>
                  <div className="sm:col-span-2 space-y-2">
                    <label className="text-xs font-medium text-muted-foreground">Description</label>
                    <textarea value={prodDesc} onChange={(e) => setProdDesc(e.target.value)} placeholder="Describe your product..." className="flex min-h-[60px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-medium text-muted-foreground">File URL</label>
                    <Input value={prodFileUrl} onChange={(e) => setProdFileUrl(e.target.value)} placeholder="https://example.com/file.pdf" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-medium text-muted-foreground">File Type</label>
                    <Input value={prodFileType} onChange={(e) => setProdFileType(e.target.value)} placeholder="pdf, zip, mp3..." />
                  </div>
                  <div className="sm:col-span-2 space-y-2">
                    <label className="text-xs font-medium text-muted-foreground">Image URL</label>
                    <Input value={prodImageUrl} onChange={(e) => setProdImageUrl(e.target.value)} placeholder="https://example.com/cover.jpg" />
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button onClick={saveProduct} disabled={prodSaving || !prodTitle || !prodPrice} className="rounded-xl">
                    {prodSaving ? "Saving..." : editingProduct ? "Update Product" : "Create Product"}
                  </Button>
                  <Button variant="outline" onClick={resetProductForm} className="rounded-xl">Cancel</Button>
                </div>
              </CardContent>
            </Card>
          )}

          {productsLoading ? (
            <p className="text-sm text-muted-foreground">Loading...</p>
          ) : products.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <DollarSign className="w-12 h-12 text-muted-foreground/40 mx-auto mb-4" />
                <p className="text-muted-foreground">No products yet. Create your first digital product.</p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {products.map((p: any) => (
                <Card key={p.id} className={`${!p.isActive ? "opacity-50" : ""}`}>
                  <CardContent className="pt-6">
                    {p.imageUrl && <img src={p.imageUrl} alt="" className="w-full h-32 object-cover rounded-lg mb-3" />}
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <h3 className="font-semibold">{p.title}</h3>
                        {p.description && <p className="text-xs text-muted-foreground mt-1">{p.description}</p>}
                      </div>
                      <Badge>${(p.price / 100).toFixed(2)}</Badge>
                    </div>
                    <div className="flex items-center gap-3 mt-3 text-xs text-muted-foreground">
                      <span>{p.sold} sold</span>
                      {p.fileType && <span>{p.fileType}</span>}
                    </div>
                    <div className="flex items-center gap-2 mt-4">
                      <Button size="sm" variant="outline" onClick={() => startEditProduct(p)} className="rounded-lg text-xs">
                        Edit
                      </Button>
                      <Button size="sm" variant="outline" onClick={() => toggleProduct(p.id, p.isActive)} className="rounded-lg text-xs">
                        {p.isActive ? "Pause" : "Activate"}
                      </Button>
                      <Button size="sm" variant="outline" onClick={() => removeProduct(p.id)} className="rounded-lg text-xs text-red-500">
                        <Trash2 className="w-3 h-3" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Link form modal */}
      <LinkFormModal
        open={modalOpen}
        onClose={() => { setModalOpen(false); setEditingLink(null); setError("") }}
        initial={formInitial}
        onSave={handleSave}
        saving={saving}
      />
      {error && (
        <p className="text-sm text-red-600 text-center">{error}</p>
      )}
    </div>
  )
}
