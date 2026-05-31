"use client"

import { useState, useEffect, useRef } from "react"
import { useSession } from "next-auth/react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Modal } from "@/components/ui/modal"
import { Plus, Trash2, GripVertical, ExternalLink, Pause, Play, Clock, Tag, Smile, Wand2, Pencil, Link as LinkIcon, Share2 } from "lucide-react"
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
        className="w-8 h-8 rounded-lg border border-input bg-background flex items-center justify-center text-sm hover:bg-accent shrink-0"
      >
        {value || <Smile className="w-3.5 h-3.5 text-muted-foreground" />}
      </button>
      {open && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />
          <div className="absolute top-full left-0 mt-1 z-20 w-52 p-2 bg-card border rounded-xl shadow-xl grid grid-cols-8 gap-1 max-h-40 overflow-y-auto">
            {emojis.map((e) => (
              <button
                key={e}
                type="button"
                onClick={() => { onChange(e === value ? null : e); setOpen(false) }}
                className={`w-6 h-6 flex items-center justify-center rounded hover:bg-accent text-sm ${value === e ? "bg-primary/10 ring-1 ring-primary" : ""}`}
              >
                {e}
              </button>
            ))}
            {value && (
              <button
                type="button"
                onClick={() => { onChange(null); setOpen(false) }}
                className="col-span-8 text-xs text-muted-foreground hover:text-foreground py-1"
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
        <div className="flex items-start gap-1 shrink-0">
          <span className="hidden sm:inline text-xs text-muted-foreground mt-1.5">{link.clicks} clicks</span>
          <Badge variant={status.variant} className="mt-1.5">{status.label}</Badge>
          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => onEdit(link)} title="Edit link">
            <Pencil className="w-3.5 h-3.5" />
          </Button>
          <a href={link.url} target="_blank" rel="noopener noreferrer">
            <Button variant="ghost" size="icon" className="h-8 w-8"><ExternalLink className="w-3.5 h-3.5" /></Button>
          </a>
          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => onToggleLink(link.id, link.isActive)}>
            {link.isActive ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
          </Button>
          <Button variant="ghost" size="icon" className="h-8 w-8 text-red-600 hover:text-red-700 hover:bg-destructive/10" onClick={() => onDeleteLink(link.id)}>
            <Trash2 className="w-3.5 h-3.5" />
          </Button>
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
        <div className="flex items-center gap-1 shrink-0">
          <a href={social.url} target="_blank" rel="noopener noreferrer">
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <ExternalLink className="w-3.5 h-3.5" />
            </Button>
          </a>
          <Button variant="ghost" size="icon" className="h-8 w-8 text-red-600 hover:text-red-700 hover:bg-destructive/10" onClick={() => onDelete(social.id)}>
            <Trash2 className="w-3.5 h-3.5" />
          </Button>
        </div>
      </div>
    </div>
  )
}

// ---------- Main merged page ----------

export default function LinksPage() {
  const { data: session } = useSession()
  const isPro = (session?.user as any)?.isPro
  const [tab, setTab] = useState<"links" | "social">("links")

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
