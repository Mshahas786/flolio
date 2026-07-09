"use client"

import { useState, useEffect, useRef } from "react"
import { useSession } from "next-auth/react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Modal } from "@/components/ui/modal"
import { ImageUpload } from "@/components/ui/image-upload"
import { Plus, Trash2, GripVertical, ExternalLink, Pause, Play, Clock, Tag, Smile, Wand2, Pencil, Link as LinkIcon, Share2, Music, Video, Headphones, Radio, DollarSign, Image as ImageIcon, FolderPlus, Zap, Users, MessageSquare, Calendar, QrCode, BarChart3, Globe, Link2, FolderOpen, Cpu, Mail, UserPlus, Star, TrendingUp, Download, Settings, Bell, Shield, Lock, Key, Eye, EyeOff, Copy, X, Mail as MailIcon, Calendar as CalendarIcon, User, MousePointerClick } from "lucide-react"
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
  const [mode, setMode] = useState<"emoji" | "image">("emoji")
  const isImage = value?.startsWith("http")

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="w-10 h-10 rounded-lg border border-input bg-background flex items-center justify-center text-base hover:bg-accent shrink-0 overflow-hidden"
      >
        {isImage ? (
          <img src={value!} alt="" className="w-full h-full object-cover" />
        ) : value ? (
          <span>{value}</span>
        ) : (
          <Smile className="w-4 h-4 text-muted-foreground" />
        )}
      </button>
      {open && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />
          <div className="absolute top-full left-0 mt-1 z-20 w-64 bg-card border rounded-xl shadow-xl p-2">
            <div className="flex gap-1 mb-2 border-b pb-2">
              <button
                type="button"
                onClick={() => setMode("emoji")}
                className={`flex-1 text-xs py-1 rounded-md font-medium transition-colors ${mode === "emoji" ? "bg-primary/10 text-primary" : "text-muted-foreground hover:text-foreground"}`}
              >
                <Smile className="w-3 h-3 inline mr-1" />Emoji
              </button>
              <button
                type="button"
                onClick={() => setMode("image")}
                className={`flex-1 text-xs py-1 rounded-md font-medium transition-colors ${mode === "image" ? "bg-primary/10 text-primary" : "text-muted-foreground hover:text-foreground"}`}
              >
                <ImageIcon className="w-3 h-3 inline mr-1" />Image
              </button>
            </div>
            {mode === "emoji" ? (
              <div className="grid grid-cols-7 gap-1.5 max-h-48 overflow-y-auto">
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
              </div>
            ) : (
              <div className="space-y-2 pt-1">
                <ImageUpload value={isImage ? value! : ""} onChange={(url) => { onChange(url); setOpen(false) }} />
                <p className="text-[10px] text-muted-foreground text-center">Max 1200px, auto-compressed</p>
              </div>
            )}
            {value && (
              <button
                type="button"
                onClick={() => { onChange(null); setOpen(false); setMode("emoji") }}
                className="w-full text-xs text-muted-foreground hover:text-foreground py-2 mt-1 border-t"
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
          <label className="text-xs font-medium text-muted-foreground mb-1 block">Image</label>
          <ImageUpload value={form.imageUrl} onChange={(url) => set("imageUrl", url)} />
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

// ---------- Collections Tab ----------
interface CollectionsTabProps {
  isPro: boolean
  links: any[]
}

function CollectionsTab({ isPro, links }: CollectionsTabProps) {
  const [collections, setCollections] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [formOpen, setFormOpen] = useState(false)
  const [editing, setEditing] = useState<any | null>(null)
  const [name, setName] = useState("")
  const [slug, setSlug] = useState("")
  const [description, setDescription] = useState("")
  const [color, setColor] = useState("#6366f1")
  const [saving, setSaving] = useState(false)
  const [selectedCollection, setSelectedCollection] = useState<any | null>(null)

  useEffect(() => {
    fetchCollections()
  }, [])

  async function fetchCollections() {
    const res = await fetch("/api/collections")
    if (res.ok) setCollections(await res.json())
    setLoading(false)
  }

  function openCreate() {
    setEditing(null)
    setName("")
    setSlug("")
    setDescription("")
    setColor("#6366f1")
    setFormOpen(true)
  }

  function openEdit(c: any) {
    setEditing(c)
    setName(c.name)
    setSlug(c.slug)
    setDescription(c.description || "")
    setColor(c.color)
    setFormOpen(true)
  }

  async function handleSave() {
    if (!name || !slug) return
    setSaving(true)
    const method = editing ? "PATCH" : "POST"
    const url = editing ? `/api/collections/${editing.id}` : "/api/collections"
    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, slug, description, color }),
    })
    if (res.ok) {
      setFormOpen(false)
      setEditing(null)
      fetchCollections()
    }
    setSaving(false)
  }

  async function handleDelete(id: string) {
    await fetch(`/api/collections/${id}`, { method: "DELETE" })
    fetchCollections()
  }

  async function selectCollection(c: any) {
    setSelectedCollection(c)
    const res = await fetch(`/api/collections/${c.id}/links`)
    if (res.ok) {
      const data = await res.json()
      setSelectedCollection({ ...c, links: data })
    }
  }

  if (loading) return <p className="text-muted-foreground text-sm">Loading...</p>

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Link Collections</h2>
          <p className="text-sm text-muted-foreground">Organize links into themed collections with custom colors and slugs</p>
        </div>
        <Button onClick={openCreate}>
          <Plus className="w-4 h-4 mr-1" /> Create Collection
        </Button>
      </div>

      {collections.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <FolderOpen className="w-12 h-12 text-muted-foreground/40 mx-auto mb-4" />
            <p className="text-muted-foreground mb-4">No collections yet. Create your first collection to organize links.</p>
            <Button onClick={openCreate}>
              <Plus className="w-4 h-4 mr-1" /> Create Collection
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {collections.map((c) => (
            <Card key={c.id} className="hover:shadow-lg transition-shadow cursor-pointer"
              onClick={() => selectCollection(c)}
              style={{ borderLeft: `4px solid ${c.color}` }}
            >
              <CardContent className="pt-6">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg flex items-center justify-center text-white text-lg"
                      style={{ backgroundColor: c.color }}>
                      <FolderPlus className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="font-semibold">{c.name}</h3>
                      <p className="text-xs text-muted-foreground">/{c.slug} • {c.links?.length || 0} links</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    <Button variant="ghost" size="icon" className="h-7 w-7" onClick={(e) => { e.stopPropagation(); openEdit(c) }}>
                      <Pencil className="w-4 h-4" />
                    </Button>
                    <Button variant="ghost" size="icon" className="h-7 w-7 text-red-500" onClick={(e) => { e.stopPropagation(); handleDelete(c.id) }}>
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
                {c.description && <p className="text-sm text-muted-foreground mt-3">{c.description}</p>}
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {selectedCollection && (
        <Card className="fixed inset-0 z-50 bg-background m-4 md:m-20 rounded-xl shadow-2xl max-h-[80vh] flex flex-col">
          <CardHeader className="flex flex-row items-center justify-between border-b p-4">
            <CardTitle className="text-lg">{selectedCollection.name}</CardTitle>
            <Button variant="ghost" size="icon" onClick={() => setSelectedCollection(null)}>
              <X className="w-5 h-5" />
            </Button>
          </CardHeader>
          <CardContent className="flex-1 overflow-y-auto p-4">
            <div className="space-y-2">
              {selectedCollection.links?.map((cl: any) => (
                <div key={cl.id} className="flex items-center gap-3 p-3 rounded-lg border hover:bg-accent/50">
                  <div className="w-8 h-8 rounded-lg border border-input bg-background flex items-center justify-center text-sm shrink-0">
                    {cl.link.icon || <Link2 className="w-3.5 h-3.5 text-muted-foreground" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm truncate">{cl.link.title}</p>
                    <p className="text-xs text-muted-foreground truncate">{cl.link.url}</p>
                  </div>
                  <Button variant="ghost" size="icon" className="h-7 w-7"
                    onClick={async (e) => {
                      e.stopPropagation()
                      await fetch(`/api/collections/${selectedCollection.id}/links`, {
                        method: "DELETE",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({ linkId: cl.linkId }),
                      })
                      selectCollection(selectedCollection)
                    }}>
                    <Trash2 className="w-4 h-4 text-red-500" />
                  </Button>
                </div>
              ))}
              {(!selectedCollection.links || selectedCollection.links.length === 0) && (
                <div className="text-center py-8 text-muted-foreground">
                  <Link2 className="w-10 h-10 mx-auto mb-2 opacity-40" />
                  <p>No links in this collection yet</p>
                  <Button variant="outline" size="sm" className="mt-2"
                    onClick={() => setSelectedCollection(null)}>
                    Back to Collections
                  </Button>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      <Modal open={formOpen} onClose={() => { setFormOpen(false); setEditing(null) }} title={editing ? "Edit Collection" : "Create Collection"}>
        <div className="space-y-4">
          <div className="space-y-2">
            <label className="text-xs font-medium text-muted-foreground">Name</label>
            <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="My Links" />
          </div>
          <div className="space-y-2">
            <label className="text-xs font-medium text-muted-foreground">Slug</label>
            <Input value={slug} onChange={(e) => setSlug(e.target.value)} placeholder="my-links" />
          </div>
          <div className="space-y-2">
            <label className="text-xs font-medium text-muted-foreground">Description</label>
            <textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Optional description" className="flex min-h-[60px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring" />
          </div>
          <div className="space-y-2">
            <label className="text-xs font-medium text-muted-foreground">Color</label>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg border-2 border-gray-200" style={{ backgroundColor: color }} />
              <Input value={color} onChange={(e) => setColor(e.target.value)} className="w-32" />
            </div>
          </div>
          <div className="flex gap-3 pt-2">
            <Button variant="outline" onClick={() => { setFormOpen(false); setEditing(null) }} className="flex-1">Cancel</Button>
            <Button onClick={handleSave} disabled={saving || !name || !slug} className="flex-1">
              {saving ? "Saving..." : editing ? "Save Changes" : "Create Collection"}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  )
}

// ---------- Smart Links Tab ----------
interface SmartLinksTabProps {
  isPro: boolean
  links: any[]
}

function SmartLinksTab({ isPro, links }: SmartLinksTabProps) {
  const [smartLinks, setSmartLinks] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [formOpen, setFormOpen] = useState(false)
  const [editing, setEditing] = useState<any | null>(null)
  const [name, setName] = useState("")
  const [slug, setSlug] = useState("")
  const [description, setDescription] = useState("")
  const [type, setType] = useState("rotation")
  const [saving, setSaving] = useState(false)
  const [selectedSmartLink, setSelectedSmartLink] = useState<any | null>(null)
  const [showAddItem, setShowAddItem] = useState(false)
  const [itemLinkId, setItemLinkId] = useState("")
  const [itemWeight, setItemWeight] = useState(100)
  const [itemCountry, setItemCountry] = useState("")
  const [itemDevice, setItemDevice] = useState("")
  const [itemVariant, setItemVariant] = useState("")

  const types = [
    { value: "rotation", label: "Weighted Rotation", desc: "Distribute clicks by weight" },
    { value: "geo", label: "Geo Routing", desc: "Route by visitor country" },
    { value: "device", label: "Device Routing", desc: "Route by device type" },
    { value: "ab_test", label: "A/B Testing", desc: "Split traffic between variants" },
    { value: "schedule", label: "Scheduled", desc: "Time-based routing" },
  ]

  useEffect(() => {
    fetchSmartLinks()
  }, [])

  async function fetchSmartLinks() {
    const res = await fetch("/api/smart-links")
    if (res.ok) setSmartLinks(await res.json())
    setLoading(false)
  }

  function openCreate() {
    setEditing(null)
    setName("")
    setSlug("")
    setDescription("")
    setType("rotation")
    setFormOpen(true)
  }

  function openEdit(s: any) {
    setEditing(s)
    setName(s.name)
    setSlug(s.slug)
    setDescription(s.description || "")
    setType(s.type)
    setFormOpen(true)
  }

  async function handleSave() {
    if (!name || !slug) return
    setSaving(true)
    const method = editing ? "PATCH" : "POST"
    const url = editing ? `/api/smart-links/${editing.id}` : "/api/smart-links"
    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, slug, description, type }),
    })
    if (res.ok) {
      setFormOpen(false)
      setEditing(null)
      fetchSmartLinks()
    }
    setSaving(false)
  }

  async function handleDelete(id: string) {
    await fetch(`/api/smart-links/${id}`, { method: "DELETE" })
    fetchSmartLinks()
  }

  async function selectSmartLink(s: any) {
    setSelectedSmartLink(s)
    const res = await fetch(`/api/smart-links/${s.id}`)
    if (res.ok) {
      const data = await res.json()
      setSelectedSmartLink({ ...s, items: data.items })
    }
  }

  async function addItem() {
    if (!itemLinkId) return
    await fetch(`/api/smart-links/${selectedSmartLink?.id}/items`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        linkId: itemLinkId,
        weight: itemWeight,
        country: itemCountry || undefined,
        device: itemDevice || undefined,
        variant: itemVariant || undefined,
      }),
    })
    setItemLinkId("")
    setItemWeight(100)
    setItemCountry("")
    setItemDevice("")
    setItemVariant("")
    setShowAddItem(false)
    selectSmartLink(selectedSmartLink!)
  }

  async function removeItem(itemId: string) {
    await fetch(`/api/smart-links/${selectedSmartLink?.id}/items?itemId=${itemId}`, { method: "DELETE" })
    selectSmartLink(selectedSmartLink!)
  }

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://flolio.vercel.app"

  if (loading) return <p className="text-muted-foreground text-sm">Loading...</p>

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Smart Links</h2>
          <p className="text-sm text-muted-foreground">Create intelligent links that route visitors based on rules</p>
        </div>
        <Button onClick={openCreate}>
          <Plus className="w-4 h-4 mr-1" /> Create Smart Link
        </Button>
      </div>

      {smartLinks.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <Zap className="w-12 h-12 text-muted-foreground/40 mx-auto mb-4" />
            <p className="text-muted-foreground mb-4">No smart links yet. Create one to route traffic intelligently.</p>
            <Button onClick={openCreate}>
              <Plus className="w-4 h-4 mr-1" /> Create Smart Link
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {smartLinks.map((s) => (
            <Card key={s.id} className="hover:shadow-lg transition-shadow cursor-pointer"
              onClick={() => selectSmartLink(s)}
            >
              <CardContent className="pt-6">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                      <Zap className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="font-semibold">{s.name}</h3>
                      <p className="text-xs text-muted-foreground">/s/{s.slug} • {s.type}</p>
                    </div>
                  </div>
                  <Badge variant={s.isActive ? "success" : "secondary"} className="mt-1">
                    {s.isActive ? "Active" : "Paused"}
                  </Badge>
                </div>
                {s.description && <p className="text-sm text-muted-foreground mt-3">{s.description}</p>}
                <div className="flex items-center gap-4 mt-4 text-xs text-muted-foreground">
                  <span>{s.clicks} clicks</span>
                  <span>{s.conversions} conversions</span>
                  <span>{s.items?.length || 0} destinations</span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {selectedSmartLink && (
        <Card className="fixed inset-0 z-50 bg-background m-4 md:m-20 rounded-xl shadow-2xl max-h-[80vh] flex flex-col">
          <CardHeader className="flex flex-row items-center justify-between border-b p-4">
            <CardTitle className="text-lg">{selectedSmartLink.name}</CardTitle>
            <Button variant="ghost" size="icon" onClick={() => setSelectedSmartLink(null)}>
              <X className="w-5 h-5" />
            </Button>
          </CardHeader>
          <CardContent className="flex-1 overflow-y-auto p-4">
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <span className="text-xs text-muted-foreground">Share URL:</span>
                <input
                  readOnly
                  value={`${siteUrl}/s/${selectedSmartLink.slug}`}
                  className="flex-1 bg-muted px-3 py-2 rounded text-sm font-mono"
                  onClick={(e) => (e.target as HTMLInputElement).select()}
                />
                <Button variant="outline" size="sm" onClick={() => navigator.clipboard.writeText(`${siteUrl}/s/${selectedSmartLink.slug}`)}>
                  <Copy className="w-4 h-4 mr-1" /> Copy
                </Button>
              </div>

              <div className="border-t pt-4">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="font-medium">Destinations</h4>
                  <Button size="sm" variant="outline" onClick={() => setShowAddItem(true)}>
                    <Plus className="w-3.5 h-3.5 mr-1" /> Add
                  </Button>
                </div>

                {showAddItem && (
                  <div className="space-y-3 p-3 bg-muted/50 rounded-lg mb-4">
                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1">
                        <label className="text-xs font-medium text-muted-foreground">Link</label>
                        <select value={itemLinkId} onChange={(e) => setItemLinkId(e.target.value)} className="w-full text-xs border rounded px-2 py-1.5 bg-background">
                          <option value="">Select a link</option>
                          {links.map((l) => (
                            <option key={l.id} value={l.id}>{l.title}</option>
                          ))}
                        </select>
                      </div>
                      <div className="space-y-1">
                        <label className="text-xs font-medium text-muted-foreground">Weight</label>
                        <input type="number" min="1" max="100" value={itemWeight} onChange={(e) => setItemWeight(parseInt(e.target.value))} className="w-full text-xs border rounded px-2 py-1.5 bg-background" />
                      </div>
                    </div>
                    {["geo", "device", "ab_test"].includes(selectedSmartLink.type) && (
                      <div className="grid grid-cols-2 gap-3">
                        {selectedSmartLink.type === "geo" && (
                          <div className="space-y-1">
                            <label className="text-xs font-medium text-muted-foreground">Country Code</label>
                            <input type="text" value={itemCountry} onChange={(e) => setItemCountry(e.target.value.toUpperCase())} placeholder="US, GB, CA..." className="w-full text-xs border rounded px-2 py-1.5 bg-background" maxLength={2} />
                          </div>
                        )}
                        {selectedSmartLink.type === "device" && (
                          <div className="space-y-1">
                            <label className="text-xs font-medium text-muted-foreground">Device</label>
                            <select value={itemDevice} onChange={(e) => setItemDevice(e.target.value)} className="w-full text-xs border rounded px-2 py-1.5 bg-background">
                              <option value="">All devices</option>
                              <option value="mobile">Mobile</option>
                              <option value="desktop">Desktop</option>
                              <option value="tablet">Tablet</option>
                            </select>
                          </div>
                        )}
                        {selectedSmartLink.type === "ab_test" && (
                          <div className="space-y-1">
                            <label className="text-xs font-medium text-muted-foreground">Variant</label>
                            <select value={itemVariant} onChange={(e) => setItemVariant(e.target.value)} className="w-full text-xs border rounded px-2 py-1.5 bg-background">
                              <option value="A">Variant A</option>
                              <option value="B">Variant B</option>
                            </select>
                          </div>
                        )}
                      </div>
                    )}
                    <div className="flex gap-2">
                      <Button size="sm" onClick={addItem}>Add Destination</Button>
                      <Button size="sm" variant="outline" onClick={() => setShowAddItem(false)}>Cancel</Button>
                    </div>
                  </div>
                )}

                {selectedSmartLink.items?.map((item: any) => (
                  <div key={item.id} className="flex items-center gap-3 p-3 rounded-lg border hover:bg-accent/50">
                    <div className="w-8 h-8 rounded-lg border border-input bg-background flex items-center justify-center text-sm shrink-0">
                      {item.link?.icon || <Link2 className="w-3.5 h-3.5 text-muted-foreground" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm truncate">{item.link?.title}</p>
                      <p className="text-xs text-muted-foreground truncate">{item.link?.url}</p>
                      <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground">
                        <span>Weight: {item.weight}%</span>
                        {item.country && <span className="bg-primary/10 text-primary px-1.5 py-0.5 rounded">🌍 {item.country}</span>}
                        {item.device && <span className="bg-blue/10 text-blue px-1.5 py-0.5 rounded">📱 {item.device}</span>}
                        {item.variant && <span className="bg-purple/10 text-purple px-1.5 py-0.5 rounded">A/B: {item.variant}</span>}
                      </div>
                    </div>
                    <Button variant="ghost" size="icon" className="h-7 w-7 text-red-500" onClick={(e) => { e.stopPropagation(); removeItem(item.id) }}>
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                ))}
              </div>

              <div className="border-t pt-4">
                <h4 className="font-medium mb-3">Analytics</h4>
                <div className="grid grid-cols-3 gap-4 text-center">
                  <div className="p-3 bg-muted/50 rounded-lg">
                    <p className="text-2xl font-bold">{selectedSmartLink.clicks}</p>
                    <p className="text-xs text-muted-foreground">Total Clicks</p>
                  </div>
                  <div className="p-3 bg-muted/50 rounded-lg">
                    <p className="text-2xl font-bold">{selectedSmartLink.conversions}</p>
                    <p className="text-xs text-muted-foreground">Conversions</p>
                  </div>
                  <div className="p-3 bg-muted/50 rounded-lg">
                    <p className="text-2xl font-bold">{selectedSmartLink.clicks > 0 ? ((selectedSmartLink.conversions / selectedSmartLink.clicks) * 100).toFixed(1) : 0}%</p>
                    <p className="text-xs text-muted-foreground">Conversion Rate</p>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <Modal open={formOpen} onClose={() => { setFormOpen(false); setEditing(null) }} title={editing ? "Edit Smart Link" : "Create Smart Link"}>
        <div className="space-y-4">
          <div className="space-y-2">
            <label className="text-xs font-medium text-muted-foreground">Name</label>
            <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Summer Campaign" />
          </div>
          <div className="space-y-2">
            <label className="text-xs font-medium text-muted-foreground">Slug</label>
            <Input value={slug} onChange={(e) => setSlug(e.target.value)} placeholder="summer-campaign" />
          </div>
          <div className="space-y-2">
            <label className="text-xs font-medium text-muted-foreground">Description</label>
            <textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Optional description" className="flex min-h-[60px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring" />
          </div>
          <div className="space-y-2">
            <label className="text-xs font-medium text-muted-foreground">Type</label>
            <div className="flex flex-wrap gap-2">
              {types.map((t) => (
                <button key={t.value} onClick={() => setType(t.value)}
                  className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium border transition-all ${
                    type === t.value ? "border-primary bg-primary/10 text-primary" : "border-gray-200 text-gray-600 hover:border-gray-300"
                  }`}
                >
                  <span className="font-medium">{t.label}</span>
                  <span className="text-[10px] text-muted-foreground">{t.desc}</span>
                </button>
              ))}
            </div>
          </div>
          <div className="flex gap-3 pt-2">
            <Button variant="outline" onClick={() => { setFormOpen(false); setEditing(null) }} className="flex-1">Cancel</Button>
            <Button onClick={handleSave} disabled={saving || !name || !slug} className="flex-1">
              {saving ? "Saving..." : editing ? "Save Changes" : "Create Smart Link"}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  )
}

// ---------- Newsletter Tab ----------
function NewsletterTab({ isPro }: { isPro: boolean }) {
  const [newsletters, setNewsletters] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [formOpen, setFormOpen] = useState(false)
  const [editing, setEditing] = useState<any | null>(null)
  const [provider, setProvider] = useState("mailchimp")
  const [apiKey, setApiKey] = useState("")
  const [listId, setListId] = useState("")
  const [listName, setListName] = useState("")
  const [doubleOptIn, setDoubleOptIn] = useState(true)
  const [saving, setSaving] = useState(false)

  const providers = [
    { value: "mailchimp", label: "Mailchimp", icon: "📧" },
    { value: "convertkit", label: "ConvertKit", icon: "⚡" },
    { value: "beehiiv", label: "Beehiiv", icon: "🐝" },
    { value: "kit", label: "Kit (formerly ConvertKit)", icon: "📮" },
    { value: "buttdown", label: "Buttondown", icon: "📮" },
    { value: "custom", label: "Custom Webhook", icon: "🔗" },
  ]

  useEffect(() => {
    fetchNewsletters()
  }, [])

  async function fetchNewsletters() {
    const res = await fetch("/api/newsletter")
    if (res.ok) setNewsletters(await res.json())
    setLoading(false)
  }

  function openCreate() {
    setEditing(null)
    setProvider("mailchimp")
    setApiKey("")
    setListId("")
    setListName("")
    setDoubleOptIn(true)
    setFormOpen(true)
  }

  function openEdit(n: any) {
    setEditing(n)
    setProvider(n.provider)
    setApiKey(n.apiKey || "")
    setListId(n.listId || "")
    setListName(n.listName || "")
    setDoubleOptIn(n.doubleOptIn)
    setFormOpen(true)
  }

  async function handleSave() {
    if (!apiKey || !listId) return
    setSaving(true)
    const method = editing ? "PATCH" : "POST"
    const url = editing ? `/api/newsletter/${editing.id}` : "/api/newsletter"
    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ provider, apiKey, listId, listName, doubleOptIn }),
    })
    if (res.ok) {
      setFormOpen(false)
      setEditing(null)
      fetchNewsletters()
    }
    setSaving(false)
  }

  async function handleDelete(id: string) {
    await fetch(`/api/newsletter/${id}`, { method: "DELETE" })
    fetchNewsletters()
  }

  if (loading) return <p className="text-muted-foreground text-sm">Loading...</p>

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Newsletter Integrations</h2>
          <p className="text-sm text-muted-foreground">Connect your email marketing platform to capture subscribers</p>
        </div>
        <Button onClick={openCreate}>
          <Plus className="w-4 h-4 mr-1" /> Connect Newsletter
        </Button>
      </div>

      {newsletters.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <Mail className="w-12 h-12 text-muted-foreground/40 mx-auto mb-4" />
            <p className="text-muted-foreground mb-4">No newsletter connected yet. Connect your email platform to start capturing subscribers.</p>
            <Button onClick={openCreate}>
              <Plus className="w-4 h-4 mr-1" /> Connect Newsletter
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {newsletters.map((n) => (
            <Card key={n.id}>
              <CardContent className="pt-6">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary text-lg">
                      {providers.find(p => p.value === n.provider)?.icon || "📧"}
                    </div>
                    <div>
                      <h3 className="font-semibold">{providers.find(p => p.value === n.provider)?.label || n.provider}</h3>
                      <p className="text-xs text-muted-foreground">{n.listName || n.listId} • {n.subscribers?.length || 0} subscribers</p>
                    </div>
                  </div>
                  <Badge variant={n.isConnected ? "success" : "secondary"}>
                    {n.isConnected ? "Connected" : "Disconnected"}
                  </Badge>
                </div>
                <div className="mt-4 flex items-center gap-2">
                  <Button variant="outline" size="sm" className="flex-1" onClick={() => openEdit(n)}>
                    <Settings className="w-3.5 h-3.5 mr-1" /> Configure
                  </Button>
                  <Button variant="ghost" size="sm" className="text-red-500" onClick={() => handleDelete(n.id)}>
                    <Trash2 className="w-3.5 h-3.5" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Modal open={formOpen} onClose={() => { setFormOpen(false); setEditing(null) }} title={editing ? "Edit Newsletter" : "Connect Newsletter"}>
        <div className="space-y-4">
          <div className="space-y-2">
            <label className="text-xs font-medium text-muted-foreground">Provider</label>
            <div className="flex flex-wrap gap-2">
              {providers.map((p) => (
                <button key={p.value} onClick={() => setProvider(p.value)}
                  className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium border transition-all ${
                    provider === p.value ? "border-primary bg-primary/10 text-primary" : "border-gray-200 text-gray-600 hover:border-gray-300"
                  }`}
                >
                  <span>{p.icon}</span> {p.label}
                </button>
              ))}
            </div>
          </div>
          <div className="space-y-2">
            <label className="text-xs font-medium text-muted-foreground">API Key</label>
            <Input type="password" value={apiKey} onChange={(e) => setApiKey(e.target.value)} placeholder="Enter your API key" />
          </div>
          <div className="space-y-2">
            <label className="text-xs font-medium text-muted-foreground">List / Audience ID</label>
            <Input value={listId} onChange={(e) => setListId(e.target.value)} placeholder="Enter list/audience ID" />
          </div>
          <div className="space-y-2">
            <label className="text-xs font-medium text-muted-foreground">List Name (optional)</label>
            <Input value={listName} onChange={(e) => setListName(e.target.value)} placeholder="My Newsletter" />
          </div>
          <label className="flex items-center gap-3 cursor-pointer">
            <input type="checkbox" checked={doubleOptIn} onChange={(e) => setDoubleOptIn(e.target.checked)} className="w-4 h-4 rounded border-gray-300 text-primary" />
            <span className="text-sm">Double opt-in (send confirmation email)</span>
          </label>
          <div className="flex gap-3 pt-2">
            <Button variant="outline" onClick={() => { setFormOpen(false); setEditing(null) }} className="flex-1">Cancel</Button>
            <Button onClick={handleSave} disabled={saving || !apiKey || !listId} className="flex-1">
              {saving ? "Saving..." : editing ? "Save Changes" : "Connect Newsletter"}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  )
}

// ---------- Bookings Tab ----------
function BookingsTab({ isPro }: { isPro: boolean }) {
  const [bookings, setBookings] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [formOpen, setFormOpen] = useState(false)
  const [editing, setEditing] = useState<any | null>(null)
  const [provider, setProvider] = useState("calendly")
  const [url, setUrl] = useState("")
  const [embedCode, setEmbedCode] = useState("")
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [duration, setDuration] = useState(30)
  const [saving, setSaving] = useState(false)

  const providers = [
    { value: "calendly", label: "Calendly", icon: "📅" },
    { value: "calcom", label: "Cal.com", icon: "📅" },
    { value: "savvycal", label: "SavvyCal", icon: "📅" },
    { value: "custom", label: "Custom URL", icon: "🔗" },
  ]

  useEffect(() => {
    fetchBookings()
  }, [])

  async function fetchBookings() {
    const res = await fetch("/api/bookings")
    if (res.ok) setBookings(await res.json())
    setLoading(false)
  }

  function openCreate() {
    setEditing(null)
    setProvider("calendly")
    setUrl("")
    setEmbedCode("")
    setTitle("")
    setDescription("")
    setDuration(30)
    setFormOpen(true)
  }

  function openEdit(b: any) {
    setEditing(b)
    setProvider(b.provider)
    setUrl(b.url)
    setEmbedCode(b.embedCode || "")
    setTitle(b.title)
    setDescription(b.description || "")
    setDuration(b.duration)
    setFormOpen(true)
  }

  async function handleSave() {
    if (!url || !title) return
    setSaving(true)
    const method = editing ? "PATCH" : "POST"
    const url_ = editing ? `/api/bookings/${editing.id}` : "/api/bookings"
    const res = await fetch(url_, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ provider, url, embedCode, title, description, duration }),
    })
    if (res.ok) {
      setFormOpen(false)
      setEditing(null)
      fetchBookings()
    }
    setSaving(false)
  }

  async function handleDelete(id: string) {
    await fetch(`/api/bookings/${id}`, { method: "DELETE" })
    fetchBookings()
  }

  if (loading) return <p className="text-muted-foreground text-sm">Loading...</p>

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Booking Links</h2>
          <p className="text-sm text-muted-foreground">Connect your scheduling tool to let visitors book meetings</p>
        </div>
        <Button onClick={openCreate}>
          <Plus className="w-4 h-4 mr-1" /> Add Booking Link
        </Button>
      </div>

      {bookings.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <Calendar className="w-12 h-12 text-muted-foreground/40 mx-auto mb-4" />
            <p className="text-muted-foreground mb-4">No booking links yet. Connect Calendly, Cal.com, or a custom URL.</p>
            <Button onClick={openCreate}>
              <Plus className="w-4 h-4 mr-1" /> Add Booking Link
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {bookings.map((b) => (
            <Card key={b.id}>
              <CardContent className="pt-6">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary text-lg">
                      {providers.find(p => p.value === b.provider)?.icon || "📅"}
                    </div>
                    <div>
                      <h3 className="font-semibold">{b.title}</h3>
                      <p className="text-xs text-muted-foreground">{providers.find(p => p.value === b.provider)?.label || b.provider} • {b.duration} min</p>
                    </div>
                  </div>
                  <Badge variant={b.isActive ? "success" : "secondary"}>
                    {b.isActive ? "Active" : "Paused"}
                  </Badge>
                </div>
                {b.description && <p className="text-sm text-muted-foreground mt-3">{b.description}</p>}
                <div className="mt-4 flex items-center gap-2">
                  <Button variant="outline" size="sm" className="flex-1" onClick={() => openEdit(b)}>
                    <Settings className="w-3.5 h-3.5 mr-1" /> Edit
                  </Button>
                  <Button variant="ghost" size="sm" className="text-red-500" onClick={() => handleDelete(b.id)}>
                    <Trash2 className="w-3.5 h-3.5" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Modal open={formOpen} onClose={() => { setFormOpen(false); setEditing(null) }} title={editing ? "Edit Booking Link" : "Add Booking Link"}>
        <div className="space-y-4">
          <div className="space-y-2">
            <label className="text-xs font-medium text-muted-foreground">Provider</label>
            <div className="flex flex-wrap gap-2">
              {providers.map((p) => (
                <button key={p.value} onClick={() => setProvider(p.value)}
                  className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium border transition-all ${
                    provider === p.value ? "border-primary bg-primary/10 text-primary" : "border-gray-200 text-gray-600 hover:border-gray-300"
                  }`}
                >
                  <span>{p.icon}</span> {p.label}
                </button>
              ))}
            </div>
          </div>
          <div className="space-y-2">
            <label className="text-xs font-medium text-muted-foreground">Booking URL</label>
            <Input value={url} onChange={(e) => setUrl(e.target.value)} placeholder="https://calendly.com/yourname/30min" />
          </div>
          <div className="space-y-2">
            <label className="text-xs font-medium text-muted-foreground">Embed Code (optional)</label>
            <textarea value={embedCode} onChange={(e) => setEmbedCode(e.target.value)} placeholder="Paste embed iframe code here" className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring" />
          </div>
          <div className="space-y-2">
            <label className="text-xs font-medium text-muted-foreground">Title</label>
            <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Book a Call" />
          </div>
          <div className="space-y-2">
            <label className="text-xs font-medium text-muted-foreground">Description</label>
            <textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Optional description" className="flex min-h-[60px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring" />
          </div>
          <div className="space-y-2">
            <label className="text-xs font-medium text-muted-foreground">Duration (minutes)</label>
            <Input type="number" value={duration} onChange={(e) => setDuration(parseInt(e.target.value))} min={15} max={480} className="w-32" />
          </div>
          <div className="flex gap-3 pt-2">
            <Button variant="outline" onClick={() => { setFormOpen(false); setEditing(null) }} className="flex-1">Cancel</Button>
            <Button onClick={handleSave} disabled={saving || !url || !title} className="flex-1">
              {saving ? "Saving..." : editing ? "Save Changes" : "Add Booking Link"}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  )
}

// ---------- Team Tab ----------
function TeamTab({ isPro }: { isPro: boolean }) {
  const [members, setMembers] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [inviteOpen, setInviteOpen] = useState(false)
  const [inviteEmail, setInviteEmail] = useState("")
  const [inviteRole, setInviteRole] = useState("editor")
  const [inviting, setInviting] = useState(false)

  useEffect(() => {
    fetchMembers()
  }, [])

  async function fetchMembers() {
    const res = await fetch("/api/team")
    if (res.ok) setMembers(await res.json())
    setLoading(false)
  }

  async function handleInvite() {
    if (!inviteEmail) return
    setInviting(true)
    const res = await fetch("/api/team", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: inviteEmail, role: inviteRole }),
    })
    if (res.ok) {
      setInviteOpen(false)
      setInviteEmail("")
      fetchMembers()
    }
    setInviting(false)
  }

  async function removeMember(id: string) {
    await fetch(`/api/team/${id}`, { method: "DELETE" })
    fetchMembers()
  }

  if (loading) return <p className="text-muted-foreground text-sm">Loading...</p>

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Team Members</h2>
          <p className="text-sm text-muted-foreground">Invite collaborators to manage your Flolio page</p>
        </div>
        <Button onClick={() => setInviteOpen(true)}>
          <UserPlus className="w-4 h-4 mr-1" /> Invite Member
        </Button>
      </div>

      {members.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <Users className="w-12 h-12 text-muted-foreground/40 mx-auto mb-4" />
            <p className="text-muted-foreground mb-4">No team members yet. Invite collaborators to help manage your page.</p>
            <Button onClick={() => setInviteOpen(true)}>
              <UserPlus className="w-4 h-4 mr-1" /> Invite Member
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {members.map((m) => (
            <Card key={m.id}>
              <CardContent className="pt-4 pb-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                      {m.member?.image ? (
                        <img src={m.member.image} alt="" className="w-10 h-10 rounded-full" />
                      ) : (
                        <User className="w-5 h-5" />
                      )}
                    </div>
                    <div>
                      <h3 className="font-medium">{m.member?.name || m.member?.email}</h3>
                      <p className="text-xs text-muted-foreground">{m.member?.username ? `@${m.member.username}` : m.member?.email}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Badge variant={m.status === "active" ? "success" : "secondary"}>
                      {m.status}
                    </Badge>
                    <select
                      value={m.role}
                      onChange={(e) => fetch(`/api/team/${m.id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ role: e.target.value }) })}
                      className="text-xs border rounded px-2 py-1"
                    >
                      <option value="admin">Admin</option>
                      <option value="editor">Editor</option>
                      <option value="viewer">Viewer</option>
                      <option value="analyst">Analyst</option>
                    </select>
                    <Button variant="ghost" size="icon" className="h-7 w-7 text-red-500" onClick={() => removeMember(m.id)}>
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Modal open={inviteOpen} onClose={() => setInviteOpen(false)} title="Invite Team Member">
        <div className="space-y-4">
          <div className="space-y-2">
            <label className="text-xs font-medium text-muted-foreground">Email Address</label>
            <Input type="email" value={inviteEmail} onChange={(e) => setInviteEmail(e.target.value)} placeholder="colleague@example.com" />
          </div>
          <div className="space-y-2">
            <label className="text-xs font-medium text-muted-foreground">Role</label>
            <select value={inviteRole} onChange={(e) => setInviteRole(e.target.value)} className="w-full text-xs border rounded px-3 py-2 bg-background">
              <option value="admin">Admin - Full access</option>
              <option value="editor">Editor - Manage links & content</option>
              <option value="viewer">Viewer - Read only</option>
              <option value="analyst">Analyst - View analytics only</option>
            </select>
          </div>
          <div className="flex gap-3 pt-2">
            <Button variant="outline" onClick={() => setInviteOpen(false)} className="flex-1">Cancel</Button>
            <Button onClick={handleInvite} disabled={inviting || !inviteEmail} className="flex-1">
              {inviting ? "Inviting..." : "Send Invitation"}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  )
}

// ---------- Social Proof Tab ----------
function SocialProofTab({ isPro }: { isPro: boolean }) {
  const [proofs, setProofs] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [formOpen, setFormOpen] = useState(false)
  const [editing, setEditing] = useState<any | null>(null)
  const [type, setType] = useState("testimonial")
  const [authorName, setAuthorName] = useState("")
  const [authorRole, setAuthorRole] = useState("")
  const [authorImage, setAuthorImage] = useState("")
  const [content, setContent] = useState("")
  const [rating, setRating] = useState(0)
  const [sourceUrl, setSourceUrl] = useState("")
  const [isFeatured, setIsFeatured] = useState(false)
  const [saving, setSaving] = useState(false)

  const types = [
    { value: "testimonial", label: "Testimonial", icon: "💬" },
    { value: "review", label: "Review", icon: "⭐" },
    { value: "tweet", label: "Tweet / Post", icon: "🐦" },
    { value: "video", label: "Video", icon: "🎥" },
    { value: "logo", label: "Logo / Badge", icon: "🏷️" },
    { value: "metric", label: "Metric / Stat", icon: "📊" },
  ]

  useEffect(() => {
    fetchProofs()
  }, [])

  async function fetchProofs() {
    const res = await fetch("/api/social-proof")
    if (res.ok) setProofs(await res.json())
    setLoading(false)
  }

  function openCreate() {
    setEditing(null)
    setType("testimonial")
    setAuthorName("")
    setAuthorRole("")
    setAuthorImage("")
    setContent("")
    setRating(0)
    setSourceUrl("")
    setIsFeatured(false)
    setFormOpen(true)
  }

  function openEdit(p: any) {
    setEditing(p)
    setType(p.type)
    setAuthorName(p.authorName)
    setAuthorRole(p.authorRole || "")
    setAuthorImage(p.authorImage || "")
    setContent(p.content)
    setRating(p.rating || 0)
    setSourceUrl(p.sourceUrl || "")
    setIsFeatured(p.isFeatured)
    setFormOpen(true)
  }

  async function handleSave() {
    if (!authorName || !content) return
    setSaving(true)
    const method = editing ? "PATCH" : "POST"
    const url = editing ? `/api/social-proof/${editing.id}` : "/api/social-proof"
    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ type, authorName, authorRole, authorImage, content, rating, sourceUrl, isFeatured }),
    })
    if (res.ok) {
      setFormOpen(false)
      setEditing(null)
      fetchProofs()
    }
    setSaving(false)
  }

  async function handleDelete(id: string) {
    await fetch(`/api/social-proof/${id}`, { method: "DELETE" })
    fetchProofs()
  }

  if (loading) return <p className="text-muted-foreground text-sm">Loading...</p>

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Social Proof</h2>
          <p className="text-sm text-muted-foreground">Showcase testimonials, reviews, and social proof on your page</p>
        </div>
        <Button onClick={openCreate}>
          <Plus className="w-4 h-4 mr-1" /> Add Social Proof
        </Button>
      </div>

      {proofs.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <Star className="w-12 h-12 text-muted-foreground/40 mx-auto mb-4" />
            <p className="text-muted-foreground mb-4">No social proof yet. Add testimonials, reviews, or metrics to build trust.</p>
            <Button onClick={openCreate}>
              <Plus className="w-4 h-4 mr-1" /> Add Social Proof
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {proofs.map((p) => (
            <Card key={p.id}>
              <CardContent className="pt-4 pb-4">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary text-lg">
                      {types.find(t => t.value === p.type)?.icon || "💬"}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <h3 className="font-medium">{types.find(t => t.value === p.type)?.label || p.type}</h3>
                        {p.isFeatured && <Badge variant="default" className="text-xs">Featured</Badge>}
                        <Badge variant={p.isActive ? "success" : "secondary"} className="ml-auto">
                          {p.isActive ? "Active" : "Hidden"}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground truncate max-w-md mt-1">{p.content}</p>
                      {p.authorName && <p className="text-xs text-muted-foreground">— {p.authorName}{p.authorRole && `, ${p.authorRole}`}</p>}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm" onClick={() => openEdit(p)}>
                      <Pencil className="w-3.5 h-3.5 mr-1" /> Edit
                    </Button>
                    <Button variant="ghost" size="sm" className="text-red-500" onClick={() => handleDelete(p.id)}>
                      <Trash2 className="w-3.5 h-3.5" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Modal open={formOpen} onClose={() => { setFormOpen(false); setEditing(null) }} title={editing ? "Edit Social Proof" : "Add Social Proof"}>
        <div className="space-y-4">
          <div className="space-y-2">
            <label className="text-xs font-medium text-muted-foreground">Type</label>
            <div className="flex flex-wrap gap-2">
              {types.map((t) => (
                <button key={t.value} onClick={() => setType(t.value)}
                  className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium border transition-all ${
                    type === t.value ? "border-primary bg-primary/10 text-primary" : "border-gray-200 text-gray-600 hover:border-gray-300"
                  }`}
                >
                  <span>{t.icon}</span> {t.label}
                </button>
              ))}
            </div>
          </div>
          <div className="space-y-2">
            <label className="text-xs font-medium text-muted-foreground">Author Name</label>
            <Input value={authorName} onChange={(e) => setAuthorName(e.target.value)} placeholder="John Doe" />
          </div>
          <div className="space-y-2">
            <label className="text-xs font-medium text-muted-foreground">Author Role / Company</label>
            <Input value={authorRole} onChange={(e) => setAuthorRole(e.target.value)} placeholder="CEO at Acme Inc." />
          </div>
          <div className="space-y-2">
            <label className="text-xs font-medium text-muted-foreground">Author Image URL</label>
            <Input value={authorImage} onChange={(e) => setAuthorImage(e.target.value)} placeholder="https://example.com/avatar.jpg" />
          </div>
          <div className="space-y-2">
            <label className="text-xs font-medium text-muted-foreground">Content</label>
            <textarea value={content} onChange={(e) => setContent(e.target.value)} placeholder="Amazing product! Highly recommended..." className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring" />
          </div>
          {["testimonial", "review"].includes(type) && (
            <div className="space-y-2">
              <label className="text-xs font-medium text-muted-foreground">Rating</label>
              <div className="flex items-center gap-2">
                {[1,2,3,4,5].map((n) => (
                  <button key={n} onClick={() => setRating(n)} className={`w-8 h-8 rounded border transition-colors ${rating >= n ? "bg-yellow-400 border-yellow-400" : "border-gray-300 hover:border-yellow-400"}`}>
                    <Star className="w-5 h-5 mx-auto text-white" />
                  </button>
                ))}
              </div>
            </div>
          )}
          <div className="space-y-2">
            <label className="text-xs font-medium text-muted-foreground">Source URL</label>
            <Input value={sourceUrl} onChange={(e) => setSourceUrl(e.target.value)} placeholder="https://twitter.com/.../status/..." />
          </div>
          <label className="flex items-center gap-3 cursor-pointer">
            <input type="checkbox" checked={isFeatured} onChange={(e) => setIsFeatured(e.target.checked)} className="w-4 h-4 rounded border-gray-300 text-primary" />
            <span className="text-sm">Feature this on my page</span>
          </label>
          <div className="flex gap-3 pt-2">
            <Button variant="outline" onClick={() => { setFormOpen(false); setEditing(null) }} className="flex-1">Cancel</Button>
            <Button onClick={handleSave} disabled={saving || !authorName || !content} className="flex-1">
              {saving ? "Saving..." : editing ? "Save Changes" : "Add Social Proof"}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  )
}

// ---------- Analytics Tab ----------
function AnalyticsTab({ isPro }: { isPro: boolean }) {
  const [analytics, setAnalytics] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [days, setDays] = useState(30)

  useEffect(() => {
    fetchAnalytics()
  }, [days])

  async function fetchAnalytics() {
    const res = await fetch(`/api/analytics/events?days=${days}`)
    if (res.ok) setAnalytics(await res.json())
    setLoading(false)
  }

  if (loading) return <p className="text-muted-foreground text-sm">Loading analytics...</p>

  if (!analytics || analytics.events.length === 0) {
    return (
      <Card>
        <CardContent className="py-12 text-center">
          <BarChart3 className="w-12 h-12 text-muted-foreground/40 mx-auto mb-4" />
          <p className="text-muted-foreground mb-4">No analytics data yet. Visit your page and click links to generate data.</p>
        </CardContent>
      </Card>
    )
  }

  const { summary } = analytics
  const eventLabels: Record<string, string> = {
    page_view: "Page Views",
    link_click: "Link Clicks",
    email_capture: "Email Captures",
    product_view: "Product Views",
    product_buy: "Purchases",
    embed_play: "Embed Plays",
    social_click: "Social Clicks",
    qr_scan: "QR Scans",
    smart_link_click: "Smart Link Clicks",
    booking_click: "Booking Clicks",
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Analytics</h2>
          <p className="text-sm text-muted-foreground">Track your page performance and visitor behavior</p>
        </div>
        <select value={days} onChange={(e) => setDays(parseInt(e.target.value))} className="text-sm border rounded px-3 py-2">
          <option value={7}>Last 7 days</option>
          <option value={30}>Last 30 days</option>
          <option value={90}>Last 90 days</option>
        </select>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Events</p>
                <p className="text-3xl font-bold">{summary.total}</p>
              </div>
              <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                <TrendingUp className="w-6 h-6" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Page Views</p>
                <p className="text-3xl font-bold">{summary.byEvent.page_view || 0}</p>
              </div>
              <div className="w-12 h-12 rounded-lg bg-blue/10 flex items-center justify-center text-blue">
                <Eye className="w-6 h-6" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Link Clicks</p>
                <p className="text-3xl font-bold">{summary.byEvent.link_click || 0}</p>
              </div>
              <div className="w-12 h-12 rounded-lg bg-green/10 flex items-center justify-center text-green">
                <MousePointerClick className="w-6 h-6" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Email Captures</p>
                <p className="text-3xl font-bold">{summary.byEvent.email_capture || 0}</p>
              </div>
              <div className="w-12 h-12 rounded-lg bg-purple/10 flex items-center justify-center text-purple">
                <Mail className="w-6 h-6" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Events Breakdown</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {Object.entries(summary.byEvent as Record<string, number>).map(([event, count]) => (
                <div key={event} className="flex items-center justify-between">
                  <span className="text-sm capitalize">{eventLabels[event] || event.replace("_", " ")}</span>
                  <div className="flex items-center gap-3">
                    <div className="w-32 h-2 bg-muted rounded-full overflow-hidden">
                      <div className="h-full bg-primary rounded-full" style={{ width: `${(count / summary.total) * 100}%` }} />
                    </div>
                    <span className="text-sm font-medium w-16 text-right">{count}</span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Top Countries</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {Object.entries(summary.byCountry as Record<string, number>)
                .sort(([,a], [,b]) => (b) - (a))
                .slice(0, 10)
                .map(([country, count]) => (
                  <div key={country} className="flex items-center justify-between">
                    <span className="text-sm">{country}</span>
                    <span className="text-sm font-medium">{count}</span>
                  </div>
                ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Devices</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {Object.entries(summary.byDevice as Record<string, number>).map(([device, count]) => (
                <div key={device} className="flex items-center justify-between">
                  <span className="text-sm capitalize">{device}</span>
                  <div className="flex items-center gap-3">
                    <div className="w-32 h-2 bg-muted rounded-full overflow-hidden">
                      <div className="h-full bg-primary rounded-full" style={{ width: `${(count / summary.total) * 100}%` }} />
                    </div>
                    <span className="text-sm font-medium w-16 text-right">{count}</span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Daily Activity (Last {days} Days)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {Object.entries(summary.byDay as Record<string, number>)
                .sort(([a], [b]) => b.localeCompare(a))
                .map(([day, count]) => (
                  <div key={day} className="flex items-center justify-between">
                    <span className="text-sm">{day}</span>
                    <div className="flex items-center gap-3">
                      <div className="w-40 h-2 bg-muted rounded-full overflow-hidden">
                        <div className="h-full bg-primary rounded-full" style={{ width: `${(count / Math.max(...(Object.values(summary.byDay as Record<string, number>) as number[]))) * 100}%` }} />
                      </div>
                      <span className="text-sm font-medium w-12 text-right">{count}</span>
                    </div>
                  </div>
                ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

// ---------- Main merged page ----------

export default function LinksPage() {
  const { data: session } = useSession()
  const isPro = (session?.user as any)?.isPro
  const [tab, setTab] = useState<"links" | "social" | "embeds" | "products" | "collections" | "smart-links" | "newsletter" | "bookings" | "team" | "social-proof" | "analytics">("links")

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
      <div className="flex gap-1 border-b overflow-x-auto pb-1">
        <button
          onClick={() => setTab("links")}
          className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
            tab === "links"
              ? "border-primary text-primary"
              : "border-transparent text-muted-foreground hover:text-foreground"
          }`}
        >
          <LinkIcon className="w-4 h-4" />
          Links
        </button>
        <button
          onClick={() => setTab("collections")}
          className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
            tab === "collections"
              ? "border-primary text-primary"
              : "border-transparent text-muted-foreground hover:text-foreground"
          }`}
        >
          <FolderPlus className="w-4 h-4" />
          Collections
        </button>
        <button
          onClick={() => setTab("smart-links")}
          className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
            tab === "smart-links"
              ? "border-primary text-primary"
              : "border-transparent text-muted-foreground hover:text-foreground"
          }`}
        >
          <Zap className="w-4 h-4" />
          Smart Links
        </button>
        <button
          onClick={() => setTab("social")}
          className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
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
          className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
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
          className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
            tab === "products"
              ? "border-primary text-primary"
              : "border-transparent text-muted-foreground hover:text-foreground"
          }`}
        >
          <DollarSign className="w-4 h-4" />
          Products
        </button>
        <button
          onClick={() => setTab("newsletter")}
          className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
            tab === "newsletter"
              ? "border-primary text-primary"
              : "border-transparent text-muted-foreground hover:text-foreground"
          }`}
        >
          <MessageSquare className="w-4 h-4" />
          Newsletter
        </button>
        <button
          onClick={() => setTab("bookings")}
          className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
            tab === "bookings"
              ? "border-primary text-primary"
              : "border-transparent text-muted-foreground hover:text-foreground"
          }`}
        >
          <Calendar className="w-4 h-4" />
          Bookings
        </button>
        <button
          onClick={() => setTab("team")}
          className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
            tab === "team"
              ? "border-primary text-primary"
              : "border-transparent text-muted-foreground hover:text-foreground"
          }`}
        >
          <Users className="w-4 h-4" />
          Team
        </button>
        <button
          onClick={() => setTab("social-proof")}
          className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
            tab === "social-proof"
              ? "border-primary text-primary"
              : "border-transparent text-muted-foreground hover:text-foreground"
          }`}
        >
          <Globe className="w-4 h-4" />
          Social Proof
        </button>
        <button
          onClick={() => setTab("analytics")}
          className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
            tab === "analytics"
              ? "border-primary text-primary"
              : "border-transparent text-muted-foreground hover:text-foreground"
          }`}
        >
          <BarChart3 className="w-4 h-4" />
          Analytics
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

      {/* Collections tab */}
      {tab === "collections" && (
        <CollectionsTab 
          isPro={isPro} 
          links={links}
        />
      )}

      {/* Smart Links tab */}
      {tab === "smart-links" && (
        <SmartLinksTab 
          isPro={isPro} 
          links={links}
        />
      )}

      {/* Newsletter tab */}
      {tab === "newsletter" && (
        <NewsletterTab isPro={isPro} />
      )}

      {/* Bookings tab */}
      {tab === "bookings" && (
        <BookingsTab isPro={isPro} />
      )}

      {/* Team tab */}
      {tab === "team" && (
        <TeamTab isPro={isPro} />
      )}

      {/* Social Proof tab */}
      {tab === "social-proof" && (
        <SocialProofTab isPro={isPro} />
      )}

      {/* Analytics tab */}
      {tab === "analytics" && (
        <AnalyticsTab isPro={isPro} />
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
