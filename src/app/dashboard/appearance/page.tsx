"use client"

import { useState, useEffect, useRef } from "react"
import { useSession } from "next-auth/react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Crown, Lock, Check, Sparkles, Type, AlignLeft, Square, LayoutGrid, Image, Eye, EyeOff, Box, Mail, Code, Clock, Search, Heart } from "lucide-react"
import { themes, proThemes, buttonStyles, avatarShapes, alignmentOptions } from "@/lib/themes"
import { fontFamilies, fontSizeOptions, borderWidthOptions, shadowOptions, spacingOptions, layoutModes, hoverEffects, fontWeightOptions } from "@/lib/customization"
import { PublicProfile } from "@/components/public-page/public-profile"
import { ProfilePreview } from "@/components/dashboard/profile-preview"
import type { LinkData, SocialLinkData, ProductData, EmbedData, PageData, IntegrationData } from "@/components/public-page/public-profile"

const presetColors = [
  "#c04a2b", "#d46845", "#e8926e", "#ef4444",
  "#f97316", "#eab308", "#22c55e", "#14b8a6",
  "#06b6d4", "#3b82f6", "#6b7280", "#000000",
]

export default function AppearancePage() {
  const { data: session, update } = useSession()
  const isPro = (session?.user as any)?.isPro
  const userName = session?.user?.name || ""
  const [accentColor, setAccentColor] = useState("#c04a2b")
  const [theme, setTheme] = useState("default")
  const [showBranding, setShowBranding] = useState(true)
  const [buttonStyle, setButtonStyle] = useState("rounded")
  const [bioAlignment, setBioAlignment] = useState("center")
  const [buttonTextColor, setButtonTextColor] = useState("#ffffff")
  const [backgroundColor, setBackgroundColor] = useState("")
  const [avatarShape, setAvatarShape] = useState("circle")
  const [fontFamily, setFontFamily] = useState("modern")
  const [fontSize, setFontSize] = useState("md")
  const [linkBorderWidth, setLinkBorderWidth] = useState("none")
  const [linkShadow, setLinkShadow] = useState("none")
  const [linkSpacing, setLinkSpacing] = useState("normal")
  const [layoutMode, setLayoutMode] = useState("list")
  const [hoverEffect, setHoverEffect] = useState("lift")
  const [showAvatar, setShowAvatar] = useState(true)
  const [showBio, setShowBio] = useState(true)
  const [headerImageUrl, setHeaderImageUrl] = useState("")
  const [customCss, setCustomCss] = useState("")
  const [isLocked, setIsLocked] = useState(false)
  const [pagePassword, setPagePassword] = useState("")
  const [buttonBorderColor, setButtonBorderColor] = useState("")
  const [buttonFontWeight, setButtonFontWeight] = useState("medium")
  const [countdownTitle, setCountdownTitle] = useState("")
  const [countdownDate, setCountdownDate] = useState("")
  const [enableEmailCapture, setEnableEmailCapture] = useState(false)
  const [emailCaptureTitle, setEmailCaptureTitle] = useState("")
  const [metaTitle, setMetaTitle] = useState("")
  const [metaDescription, setMetaDescription] = useState("")
  const [ogImageUrl, setOgImageUrl] = useState("")
  const [tipEnabled, setTipEnabled] = useState(false)
  const [tipVenmo, setTipVenmo] = useState("")
  const [tipPayPal, setTipPayPal] = useState("")
  const [tipCashApp, setTipCashApp] = useState("")
  const [saving, setSaving] = useState(false)
  const [loading, setLoading] = useState(true)
  const [message, setMessage] = useState("")
  const [brandingUnlocked, setBrandingUnlocked] = useState(false)
  const [userUsername, setUserUsername] = useState("")
  const [userBio, setUserBio] = useState("")
  const [userAvatarUrl, setUserAvatarUrl] = useState("")
  const [links, setLinks] = useState<LinkData[]>([])
  const [socialLinks, setSocialLinks] = useState<SocialLinkData[]>([])
  const [products, setProducts] = useState<ProductData[]>([])
  const [embeds, setEmbeds] = useState<EmbedData[]>([])
  const [pages, setPages] = useState<PageData[]>([])
  const [integrations, setIntegrations] = useState<IntegrationData[]>([])
  const loaded = useRef(false)
  const [showMobilePreview, setShowMobilePreview] = useState(false)
  const autoSaveTimer = useRef<ReturnType<typeof setTimeout>>()
  const savingRef = useRef(false)

  useEffect(() => {
    async function load() {
      const [settingsRes, referralRes] = await Promise.all([
        fetch("/api/settings"),
        fetch("/api/referral/stats").catch(() => null),
      ])
      if (settingsRes.ok) {
        const data = await settingsRes.json()
        setAccentColor(data.accentColor || "#c04a2b")
        setTheme(data.theme || "default")
        setShowBranding(data.showBranding ?? true)
        setButtonStyle(data.buttonStyle || "rounded")
        setBioAlignment(data.bioAlignment || "center")
        setButtonTextColor(data.buttonTextColor || "#ffffff")
        setBackgroundColor(data.backgroundColor || "")
        setAvatarShape(data.avatarShape || "circle")
        setFontFamily(data.fontFamily || "modern")
        setFontSize(data.fontSize || "md")
        setLinkBorderWidth(data.linkBorderWidth || "none")
        setLinkShadow(data.linkShadow || "none")
        setLinkSpacing(data.linkSpacing || "normal")
        setLayoutMode(data.layoutMode || "list")
        setHoverEffect(data.hoverEffect || "lift")
        setShowAvatar(data.showAvatar ?? true)
        setShowBio(data.showBio ?? true)
        setHeaderImageUrl(data.headerImageUrl || "")
        setCustomCss(data.customCss || "")
        setIsLocked(data.isLocked ?? false)
        setPagePassword(data.pagePassword || "")
        setButtonBorderColor(data.buttonBorderColor || "")
        setButtonFontWeight(data.buttonFontWeight || "medium")
        setCountdownTitle(data.countdownTitle || "")
        setCountdownDate(data.countdownDate ? new Date(data.countdownDate).toISOString().slice(0, 16) : "")
        setEnableEmailCapture(data.enableEmailCapture ?? false)
        setEmailCaptureTitle(data.emailCaptureTitle || "")
        setMetaTitle(data.metaTitle || "")
        setMetaDescription(data.metaDescription || "")
        setOgImageUrl(data.ogImageUrl || "")
        setTipEnabled(data.tipEnabled ?? false)
        setTipVenmo(data.tipVenmo || "")
        setTipPayPal(data.tipPayPal || "")
        setTipCashApp(data.tipCashApp || "")
        setUserUsername(data.username || "")
        setUserBio(data.bio || "")
        setUserAvatarUrl(data.avatarUrl || "")
      }
      if (referralRes?.ok) {
        const data = await referralRes.json()
        setBrandingUnlocked(data.brandingUnlocked)
      }
      const [linksRes, socialRes, productsRes, embedsRes, pagesRes, integrationsRes] = await Promise.all([
        fetch("/api/links").catch(() => null),
        fetch("/api/social").catch(() => null),
        fetch("/api/products").catch(() => null),
        fetch("/api/embeds").catch(() => null),
        fetch("/api/pages").catch(() => null),
        fetch("/api/integrations").catch(() => null),
      ])
      if (linksRes?.ok) setLinks(await linksRes.json())
      if (socialRes?.ok) setSocialLinks(await socialRes.json())
      if (productsRes?.ok) setProducts(await productsRes.json())
      if (embedsRes?.ok) setEmbeds(await embedsRes.json())
      if (pagesRes?.ok) setPages(await pagesRes.json())
      if (integrationsRes?.ok) setIntegrations(await integrationsRes.json())
      loaded.current = true
      setLoading(false)
    }
    load()
  }, [])

  useEffect(() => {
    if (!loaded.current) return
    if (autoSaveTimer.current) clearTimeout(autoSaveTimer.current)
    setMessage("")
    autoSaveTimer.current = setTimeout(async () => {
      if (savingRef.current) return
      savingRef.current = true
      setSaving(true)
      const body: Record<string, any> = {
        accentColor, theme, showBranding,
        buttonStyle, bioAlignment,
        fontFamily, fontSize, linkBorderWidth, linkShadow, linkSpacing,
        layoutMode, hoverEffect, showAvatar, showBio,
        isLocked, pagePassword, buttonFontWeight, enableEmailCapture, emailCaptureTitle, countdownTitle,
        metaTitle, metaDescription, ogImageUrl, tipEnabled, tipVenmo, tipPayPal, tipCashApp,
      }
      if (isPro) {
        body.buttonTextColor = buttonTextColor
        body.avatarShape = avatarShape
        body.backgroundColor = backgroundColor || null
        body.headerImageUrl = headerImageUrl || null
        body.customCss = customCss || null
        body.buttonBorderColor = buttonBorderColor || null
        body.countdownDate = countdownDate || null
      }
      const res = await fetch("/api/settings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      })
      setSaving(false)
      savingRef.current = false
      setMessage(res.ok ? "Saved" : "Save failed")
    }, 800)
  }, [
    accentColor, theme, showBranding, buttonStyle, bioAlignment,
    fontFamily, fontSize, linkBorderWidth, linkShadow, linkSpacing,
    layoutMode, hoverEffect, showAvatar, showBio,
    isLocked, pagePassword, buttonFontWeight, enableEmailCapture, emailCaptureTitle, countdownTitle,
    metaTitle, metaDescription, ogImageUrl, tipEnabled, tipVenmo, tipPayPal, tipCashApp,
    buttonTextColor, avatarShape, backgroundColor, headerImageUrl, customCss, buttonBorderColor, countdownDate,
  ])

  function handleThemeSelect(themeId: string) {
    if (proThemes.includes(themeId) && !isPro) return
    setTheme(themeId)
  }

  const themePresets = [
    { id: "clean", name: "Clean", theme: "default", buttonStyle: "rounded", hoverEffect: "lift", layoutMode: "list", swatch: "bg-gradient-to-br from-gray-50 to-white" },
    { id: "bold", name: "Bold", theme: "dark", buttonStyle: "pill", hoverEffect: "glow", layoutMode: "list", swatch: "bg-gradient-to-br from-gray-900 to-gray-800" },
    { id: "playful", name: "Playful", theme: "sunset", buttonStyle: "pill", hoverEffect: "scale", layoutMode: "grid", swatch: "bg-gradient-to-br from-orange-50 to-rose-50" },
    { id: "modern", name: "Modern", theme: "mint", buttonStyle: "square", hoverEffect: "slide", layoutMode: "list", swatch: "bg-gradient-to-br from-emerald-50 to-teal-50" },
    { id: "elegant", name: "Elegant", theme: "lavender", buttonStyle: "rounded", hoverEffect: "lift", layoutMode: "list", swatch: "bg-gradient-to-br from-violet-50 to-purple-50", isPro: true },
    { id: "edgy", name: "Edgy", theme: "midnight", buttonStyle: "square", hoverEffect: "none", layoutMode: "grid", swatch: "bg-gradient-to-br from-indigo-950 to-slate-900", isPro: true },
  ]

  function applyPreset(preset: typeof themePresets[number]) {
    if (preset.isPro && !isPro) return
    setTheme(preset.theme)
    setButtonStyle(preset.buttonStyle)
    setHoverEffect(preset.hoverEffect)
    setLayoutMode(preset.layoutMode)
  }

  async function save() {
    if (autoSaveTimer.current) clearTimeout(autoSaveTimer.current)
    savingRef.current = true
    setSaving(true)
    setMessage("")
    const body: Record<string, any> = {
      accentColor, theme, showBranding,
      buttonStyle, bioAlignment,
      fontFamily, fontSize, linkBorderWidth, linkShadow, linkSpacing,
      layoutMode, hoverEffect, showAvatar, showBio,
      isLocked, pagePassword, buttonFontWeight, enableEmailCapture, emailCaptureTitle, countdownTitle,
      metaTitle, metaDescription, ogImageUrl, tipEnabled, tipVenmo, tipPayPal, tipCashApp,
    }
    if (isPro) {
      body.buttonTextColor = buttonTextColor
      body.avatarShape = avatarShape
      body.backgroundColor = backgroundColor || null
      body.headerImageUrl = headerImageUrl || null
      body.customCss = customCss || null
      body.buttonBorderColor = buttonBorderColor || null
      body.countdownDate = countdownDate || null
    }
    const res = await fetch("/api/settings", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    })
    setSaving(false)
    savingRef.current = false
    setMessage(res.ok ? "Saved" : "Save failed")
    if (res.ok) update()
  }

  const canToggleBranding = isPro || brandingUnlocked

  if (loading) return <p className="text-muted-foreground">Loading...</p>

  function ProBadge() {
    return <span className="inline-flex items-center gap-1 text-xs font-medium text-yellow-700 bg-yellow-50 border border-yellow-200 px-2 py-0.5 rounded-full ml-2"><Crown className="w-3 h-3" />Pro</span>
  }

  function ProLock() {
    return (
      <div className="absolute inset-0 flex items-center justify-center bg-white/40 rounded-xl">
        <div className="text-center">
          <Crown className="w-8 h-8 text-yellow-500 mx-auto mb-1" />
          <p className="text-sm font-semibold text-yellow-700">Upgrade to Pro</p>
          <p className="text-xs text-yellow-600/70">Unlock this feature</p>
        </div>
      </div>
    )
  }

  function renderPreview() {
    if (!userUsername) return null
    return (
      <ProfilePreview
        name={userName}
        bio={userBio}
        avatarUrl={userAvatarUrl}
        username={userUsername}
        isPro={isPro}
        accentColor={accentColor}
        theme={theme}
        showBranding={showBranding}
        buttonStyle={buttonStyle}
        bioAlignment={bioAlignment}
        buttonTextColor={buttonTextColor}
        backgroundColor={backgroundColor}
        avatarShape={avatarShape}
        fontFamily={fontFamily}
        fontSize={fontSize}
        linkBorderWidth={linkBorderWidth}
        linkShadow={linkShadow}
        linkSpacing={linkSpacing}
        layoutMode={layoutMode}
        hoverEffect={hoverEffect}
        showAvatar={showAvatar}
        showBio={showBio}
        headerImageUrl={headerImageUrl}
        customCss={customCss}
        isLocked={isLocked}
        pagePassword={pagePassword}
        buttonBorderColor={buttonBorderColor}
        buttonFontWeight={buttonFontWeight}
        countdownTitle={countdownTitle}
        countdownDate={countdownDate}
        enableEmailCapture={enableEmailCapture}
        emailCaptureTitle={emailCaptureTitle}
        metaTitle={metaTitle}
        metaDescription={metaDescription}
        ogImageUrl={ogImageUrl}
        tipEnabled={tipEnabled}
        tipVenmo={tipVenmo}
        tipPayPal={tipPayPal}
        tipCashApp={tipCashApp}
        links={links}
        socialLinks={socialLinks}
        products={products}
        embeds={embeds}
        pages={pages}
        integrations={integrations}
      />
    )
  }

  return (
    <div className="lg:flex lg:gap-6 lg:items-start">
      <div className="flex-1 space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Appearance</h1>
        <p className="text-muted-foreground mt-1">Customize how your page looks</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Theme</CardTitle>
          <CardDescription>Choose a design system for your page — includes background, text colors, and overall style</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
            {themes.map((t) => {
              const isProTheme = proThemes.includes(t.id)
              const isLocked = isProTheme && !isPro
              const isSelected = theme === t.id && !isLocked
              return (
                <button
                  key={t.id}
                  onClick={() => handleThemeSelect(t.id)}
                  disabled={isLocked}
                  className={`relative h-20 rounded-lg bg-gradient-to-b ${t.gradient} border-2 transition-all ${
                    isSelected
                      ? "border-primary scale-105"
                      : isLocked
                      ? "border-gray-200 opacity-50 cursor-not-allowed"
                      : "border-gray-200 hover:border-gray-300"
                  }`}
                >
                  {isLocked && (
                    <div className="absolute inset-0 flex items-center justify-center bg-white/40 rounded-lg">
                      <Lock className="w-5 h-5 text-gray-400" />
                    </div>
                  )}
                  <span className={`text-xs font-medium ${t.id === "dark" || t.id === "midnight" ? "text-white" : "text-gray-900"}`}>
                    {t.name}
                  </span>
                  {isProTheme && (
                    <div className="absolute top-1 right-1">
                      <Crown className="w-3 h-3 text-yellow-500" />
                    </div>
                  )}
                </button>
              )
            })}
          </div>
          {!isPro && (
            <p className="text-xs text-muted-foreground mt-3">
              <Crown className="w-3 h-3 inline mr-1 text-yellow-500" />
              5 additional themes available on the Pro plan.
            </p>
          )}
        </CardContent>
      </Card>

      <Card className={!isPro ? "relative opacity-60 pointer-events-none select-none" : ""}>
        <CardHeader>
          <CardTitle className="text-lg flex items-center">
            Custom Background Color
            <ProBadge />
          </CardTitle>
          <CardDescription>Override your theme with a solid background color of your choice</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg border-2 border-gray-200" style={{ backgroundColor: backgroundColor || "#ffffff" }} />
            <Input
              value={backgroundColor}
              onChange={(e) => setBackgroundColor(e.target.value)}
              placeholder="#ffffff"
              className="w-32"
            />
            {backgroundColor && (
              <button onClick={() => setBackgroundColor("")} className="text-xs text-muted-foreground underline">
                Clear
              </button>
            )}
          </div>
          <div className="flex flex-wrap gap-2">
            {["#ffffff", "#f3f4f6", "#fef3c7", "#ede9fe", "#dbeafe", "#fce7f3", "#ecfdf5", "#1e1b4b", "#0f172a", "#1c1917"].map((color) => (
              <button
                key={color}
                onClick={() => setBackgroundColor(color)}
                className={`w-8 h-8 rounded-full border-2 transition-all ${
                  backgroundColor === color ? "border-gray-900 scale-110" : "border-gray-200"
                }`}
                style={{ backgroundColor: color }}
              />
            ))}
          </div>
        </CardContent>
        {!isPro && <ProLock />}
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Accent Color</CardTitle>
          <CardDescription>Choose your button and highlight color</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg border-2 border-gray-200" style={{ backgroundColor: accentColor }} />
            <Input value={accentColor} onChange={(e) => setAccentColor(e.target.value)} className="w-32" />
          </div>
          <div className="flex flex-wrap gap-2">
            {presetColors.map((color) => (
              <button
                key={color}
                onClick={() => setAccentColor(color)}
                className={`w-8 h-8 rounded-full border-2 transition-all ${
                  accentColor === color ? "border-gray-900 scale-110" : "border-gray-200"
                }`}
                style={{ backgroundColor: color }}
              />
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Button Style</CardTitle>
          <CardDescription>Choose the shape of your link buttons</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-3">
            {buttonStyles.map((bs) => (
              <button
                key={bs.id}
                onClick={() => setButtonStyle(bs.id)}
                className={`flex-1 py-4 px-4 text-sm font-medium border-2 rounded-xl transition-all ${
                  buttonStyle === bs.id
                    ? "border-primary bg-primary/10 text-primary"
                    : "border-gray-200 hover:border-gray-300 text-gray-700"
                }`}
              >
                <div className={`w-full h-8 bg-gray-300 mx-auto mb-2 ${bs.className}`} />
                {bs.name}
              </button>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Bio Alignment</CardTitle>
          <CardDescription>How your bio text is aligned</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-3">
            {alignmentOptions.map((opt) => (
              <button
                key={opt.id}
                onClick={() => setBioAlignment(opt.id)}
                className={`flex-1 py-3 px-4 text-sm font-medium border-2 rounded-xl transition-all ${
                  bioAlignment === opt.id
                    ? "border-primary bg-primary/10 text-primary"
                    : "border-gray-200 hover:border-gray-300 text-gray-700"
                }`}
              >
                {opt.name}
              </button>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Type className="w-5 h-5 text-primary" />
            Font Family
          </CardTitle>
          <CardDescription>Choose the font for your link buttons</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
            {fontFamilies.map((f) => (
              <button
                key={f.id}
                onClick={() => setFontFamily(f.id)}
                className={`flex items-center justify-center py-3 px-2 text-sm font-medium border-2 rounded-xl transition-all ${
                  fontFamily === f.id
                    ? "border-primary bg-primary/10 text-primary"
                    : "border-gray-200 hover:border-gray-300 text-gray-700"
                }`}
                style={{ fontFamily: f.family }}
              >
                {f.name}
              </button>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <AlignLeft className="w-5 h-5 text-primary" />
            Font Size
          </CardTitle>
          <CardDescription>Adjust the text size on your link buttons</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {fontSizeOptions.map((f) => (
              <button
                key={f.id}
                onClick={() => setFontSize(f.id)}
                className={`flex items-center justify-center py-4 px-3 font-medium border-2 rounded-xl transition-all ${
                  fontSize === f.id
                    ? "border-primary bg-primary/10 text-primary"
                    : "border-gray-200 hover:border-gray-300 text-gray-700"
                } ${f.className}`}
              >
                {f.name}
              </button>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Square className="w-5 h-5 text-primary" />
            Link Border
          </CardTitle>
          <CardDescription>Add a border around your link buttons</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {borderWidthOptions.map((b) => (
              <button
                key={b.id}
                onClick={() => setLinkBorderWidth(b.id)}
                className={`flex items-center justify-center py-4 px-3 text-sm font-medium border-2 rounded-xl transition-all ${
                  linkBorderWidth === b.id
                    ? "border-primary bg-primary/10 text-primary"
                    : "border-gray-200 hover:border-gray-300 text-gray-700"
                }`}
              >
                {b.name}
              </button>
            ))}
          </div>
          {linkBorderWidth !== "none" && (
            <p className="text-xs text-muted-foreground mt-3">
              Border color matches your accent color.
            </p>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Box className="w-5 h-5 text-primary" />
            Link Shadow
          </CardTitle>
          <CardDescription>Add a shadow effect to your link buttons</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {shadowOptions.map((s) => (
              <button
                key={s.id}
                onClick={() => setLinkShadow(s.id)}
                className={`flex items-center justify-center py-4 px-3 text-sm font-medium border-2 rounded-xl transition-all ${
                  linkShadow === s.id
                    ? "border-primary bg-primary/10 text-primary"
                    : "border-gray-200 hover:border-gray-300 text-gray-700"
                }`}
              >
                {s.name}
              </button>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <LayoutGrid className="w-5 h-5 text-primary" />
            Link Spacing
          </CardTitle>
          <CardDescription>Control the spacing between your links</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {spacingOptions.map((s) => (
              <button
                key={s.id}
                onClick={() => setLinkSpacing(s.id)}
                className={`flex items-center justify-center py-4 px-3 text-sm font-medium border-2 rounded-xl transition-all ${
                  linkSpacing === s.id
                    ? "border-primary bg-primary/10 text-primary"
                    : "border-gray-200 hover:border-gray-300 text-gray-700"
                }`}
              >
                {s.name}
              </button>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <LayoutGrid className="w-5 h-5 text-primary" />
            Layout Mode
          </CardTitle>
          <CardDescription>Choose how your links are arranged on the page</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-3">
            {layoutModes.map((m) => (
              <button
                key={m.id}
                onClick={() => setLayoutMode(m.id)}
                className={`flex flex-col items-center justify-center gap-2 py-6 px-4 text-sm font-medium border-2 rounded-xl transition-all ${
                  layoutMode === m.id
                    ? "border-primary bg-primary/10 text-primary"
                    : "border-gray-200 hover:border-gray-300 text-gray-700"
                }`}
              >
                {m.id === "list" ? (
                  <div className="flex flex-col gap-1.5 w-12">
                    <div className="h-2 bg-current rounded opacity-40" />
                    <div className="h-2 bg-current rounded opacity-40" />
                    <div className="h-2 bg-current rounded opacity-40" />
                  </div>
                ) : (
                  <div className="grid grid-cols-2 gap-1.5 w-12">
                    <div className="h-2 bg-current rounded opacity-40" />
                    <div className="h-2 bg-current rounded opacity-40" />
                    <div className="h-2 bg-current rounded opacity-40" />
                    <div className="h-2 bg-current rounded opacity-40" />
                  </div>
                )}
                {m.name}
              </button>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-primary" />
            Hover Effect
          </CardTitle>
          <CardDescription>Animation when someone hovers over your link buttons</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
            {hoverEffects.map((h) => (
              <button
                key={h.id}
                onClick={() => setHoverEffect(h.id)}
                className={`flex items-center justify-center py-4 px-3 text-sm font-medium border-2 rounded-xl transition-all ${
                  hoverEffect === h.id
                    ? "border-primary bg-primary/10 text-primary"
                    : "border-gray-200 hover:border-gray-300 text-gray-700"
                }`}
              >
                {h.name}
              </button>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Eye className="w-5 h-5 text-primary" />
            Visibility
          </CardTitle>
          <CardDescription>Toggle which elements appear on your public page</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={showAvatar}
              onChange={(e) => setShowAvatar(e.target.checked)}
              className="w-4 h-4 rounded border-gray-300 text-primary"
            />
            <span className="text-sm">Show profile picture</span>
          </label>
          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={showBio}
              onChange={(e) => setShowBio(e.target.checked)}
              className="w-4 h-4 rounded border-gray-300 text-primary"
            />
            <span className="text-sm">Show bio text</span>
          </label>
        </CardContent>
      </Card>

      <Card className={!isPro ? "relative opacity-60 pointer-events-none select-none" : ""}>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Image className="w-5 h-5 text-primary" />
            Header Image
            <ProBadge />
          </CardTitle>
          <CardDescription>Add a banner image at the top of your page</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Input
              value={headerImageUrl}
              onChange={(e) => setHeaderImageUrl(e.target.value)}
              placeholder="https://example.com/banner.jpg"
            />
            {headerImageUrl && (
              <img
                src={headerImageUrl}
                alt="Header preview"
                className="w-full h-32 object-cover rounded-xl border"
                onError={(e) => { (e.target as HTMLImageElement).style.display = "none" }}
              />
            )}
            <p className="text-xs text-muted-foreground">
              Recommended size: 1200x600px. Will be cropped to 2:1 ratio.
            </p>
          </div>
        </CardContent>
        {!isPro && <ProLock />}
      </Card>

      <Card className={!isPro ? "relative opacity-60 pointer-events-none select-none" : ""}>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Box className="w-5 h-5 text-primary" />
            Button Border Color
            <ProBadge />
          </CardTitle>
          <CardDescription>Override the border color on your link buttons</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg border-2 border-gray-200" style={{ backgroundColor: buttonBorderColor || accentColor }} />
            <Input value={buttonBorderColor} onChange={(e) => setButtonBorderColor(e.target.value)} placeholder={accentColor} className="w-32" />
            {buttonBorderColor && (
              <button onClick={() => setButtonBorderColor("")} className="text-xs text-muted-foreground underline">Clear</button>
            )}
          </div>
          <div className="flex flex-wrap gap-2">
            {["#ffffff", "#e5e7eb", "#9ca3af", "#374151", "#000000", accentColor].map((color) => (
              <button
                key={color}
                onClick={() => setButtonBorderColor(color === accentColor ? "" : color)}
                className={`w-8 h-8 rounded-full border-2 transition-all ${buttonBorderColor === color || (!buttonBorderColor && color === accentColor) ? "border-gray-900 scale-110" : "border-gray-200"}`}
                style={{ backgroundColor: color }}
              />
            ))}
          </div>
        </CardContent>
        {!isPro && <ProLock />}
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Type className="w-5 h-5 text-primary" />
            Button Font Weight
          </CardTitle>
          <CardDescription>Control how bold your link button text appears</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 sm:grid-cols-5 gap-3">
            {fontWeightOptions.map((fw) => (
              <button
                key={fw.id}
                onClick={() => setButtonFontWeight(fw.id)}
                className={`flex items-center justify-center py-4 px-3 text-sm border-2 rounded-xl transition-all ${fw.className} ${
                  buttonFontWeight === fw.id
                    ? "border-primary bg-primary/10 text-primary"
                    : "border-gray-200 hover:border-gray-300 text-gray-700"
                }`}
              >
                {fw.name}
              </button>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Lock className="w-5 h-5 text-primary" />
            Password Protection
          </CardTitle>
          <CardDescription>Lock your page behind a password</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={isLocked}
              onChange={(e) => setIsLocked(e.target.checked)}
              className="w-4 h-4 rounded border-gray-300 text-primary"
            />
            <span className="text-sm">Lock my page with a password</span>
          </label>
          {isLocked && (
            <Input
              value={pagePassword}
              onChange={(e) => setPagePassword(e.target.value)}
              placeholder="Enter a password"
              type="password"
            />
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Mail className="w-5 h-5 text-primary" />
            Email Capture
          </CardTitle>
          <CardDescription>Collect email addresses from your visitors</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={enableEmailCapture}
              onChange={(e) => setEnableEmailCapture(e.target.checked)}
              className="w-4 h-4 rounded border-gray-300 text-primary"
            />
            <span className="text-sm">Show email signup form on my page</span>
          </label>
          {enableEmailCapture && (
            <Input
              value={emailCaptureTitle}
              onChange={(e) => setEmailCaptureTitle(e.target.value)}
              placeholder="e.g. Join my newsletter"
            />
          )}
        </CardContent>
      </Card>

      <Card className={!isPro ? "relative opacity-60 pointer-events-none select-none" : ""}>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Clock className="w-5 h-5 text-primary" />
            Countdown Timer
            <ProBadge />
          </CardTitle>
          <CardDescription>Show a countdown on your page for launches or events</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Input
            value={countdownTitle}
            onChange={(e) => setCountdownTitle(e.target.value)}
            placeholder="e.g. Launching in"
          />
          <Input
            type="datetime-local"
            value={countdownDate}
            onChange={(e) => setCountdownDate(e.target.value)}
          />
        </CardContent>
        {!isPro && <ProLock />}
      </Card>

      <Card className={!isPro ? "relative opacity-60 pointer-events-none select-none" : ""}>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Code className="w-5 h-5 text-primary" />
            Custom CSS
            <ProBadge />
          </CardTitle>
          <CardDescription>Inject custom CSS to style your page (advanced)</CardDescription>
        </CardHeader>
        <CardContent>
          <textarea
            value={customCss}
            onChange={(e) => setCustomCss(e.target.value)}
            placeholder="/* Add your custom CSS here */
.my-link { background: red !important; }"
            className="flex min-h-[120px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm font-mono ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
          />
        </CardContent>
        {!isPro && <ProLock />}
      </Card>

      <Card className={!isPro ? "relative opacity-60 pointer-events-none select-none" : ""}>
        <CardHeader>
          <CardTitle className="text-lg flex items-center">
            Button Text Color
            <ProBadge />
          </CardTitle>
          <CardDescription>Customize the text color on your buttons</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg border-2 border-gray-200 flex items-center justify-center text-xs font-bold" style={{ backgroundColor: accentColor, color: buttonTextColor }}>
              Aa
            </div>
            <Input value={buttonTextColor} onChange={(e) => setButtonTextColor(e.target.value)} className="w-32" />
          </div>
          <div className="flex flex-wrap gap-2">
            {["#ffffff", "#000000", "#1e293b", "#f8fafc", "#fef2f2", "#ecfdf5"].map((color) => (
              <button
                key={color}
                onClick={() => setButtonTextColor(color)}
                className={`w-8 h-8 rounded-full border-2 transition-all ${
                  buttonTextColor === color ? "border-gray-900 scale-110" : "border-gray-200"
                }`}
                style={{ backgroundColor: color }}
              />
            ))}
          </div>
        </CardContent>
        {!isPro && <ProLock />}
      </Card>

      <Card className={!isPro ? "relative opacity-60 pointer-events-none select-none" : ""}>
        <CardHeader>
          <CardTitle className="text-lg flex items-center">
            Avatar Shape
            <ProBadge />
          </CardTitle>
          <CardDescription>Change how your profile picture is displayed</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-3">
            {avatarShapes.map((shape) => (
              <button
                key={shape.id}
                onClick={() => setAvatarShape(shape.id)}
                className={`flex-1 py-4 px-4 text-sm font-medium border-2 rounded-xl transition-all ${
                  avatarShape === shape.id
                  ? "border-primary bg-primary/10 text-primary"
                  : "border-gray-200 hover:border-gray-300 text-gray-700"
                }`}
              >
                <div className={`w-12 h-12 bg-gray-300 mx-auto mb-2 ${shape.className}`} />
                {shape.name}
              </button>
            ))}
          </div>
        </CardContent>
        {!isPro && <ProLock />}
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Search className="w-5 h-5 text-primary" />
            SEO & Meta Tags
          </CardTitle>
          <CardDescription>Customize how your page appears in search results and social shares</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <label className="text-xs font-medium text-muted-foreground">Page Title</label>
            <Input value={metaTitle} onChange={(e) => setMetaTitle(e.target.value)} placeholder={`${userName || "Your Name"} | Flolio`} />
          </div>
          <div className="space-y-2">
            <label className="text-xs font-medium text-muted-foreground">Meta Description</label>
            <textarea
              value={metaDescription}
              onChange={(e) => setMetaDescription(e.target.value)}
              placeholder="A short description for search engines"
              className="flex min-h-[60px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            />
          </div>
          <div className="space-y-2">
            <label className="text-xs font-medium text-muted-foreground">OG Image URL</label>
            <Input value={ogImageUrl} onChange={(e) => setOgImageUrl(e.target.value)} placeholder="https://example.com/social-card.jpg" />
            {ogImageUrl && <img src={ogImageUrl} alt="" className="w-full h-24 object-cover rounded-lg border" onError={(e) => { (e.target as HTMLImageElement).style.display = "none" }} />}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Heart className="w-5 h-5 text-primary" />
            Tip Jar
          </CardTitle>
          <CardDescription>Let visitors support you with donations</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <label className="flex items-center gap-3 cursor-pointer">
            <input type="checkbox" checked={tipEnabled} onChange={(e) => setTipEnabled(e.target.checked)} className="w-4 h-4 rounded border-gray-300 text-primary" />
            <span className="text-sm">Enable tip jar on my page</span>
          </label>
          {tipEnabled && (
            <div className="space-y-3 pl-7">
              <div>
                <label className="text-xs font-medium text-muted-foreground">Venmo Handle</label>
                <Input value={tipVenmo} onChange={(e) => setTipVenmo(e.target.value)} placeholder="@username" />
              </div>
              <div>
                <label className="text-xs font-medium text-muted-foreground">PayPal Handle</label>
                <Input value={tipPayPal} onChange={(e) => setTipPayPal(e.target.value)} placeholder="@username" />
              </div>
              <div>
                <label className="text-xs font-medium text-muted-foreground">Cash App Handle</label>
                <Input value={tipCashApp} onChange={(e) => setTipCashApp(e.target.value)} placeholder="$cashtag" />
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-primary" />
            Theme Presets
          </CardTitle>
          <CardDescription>Apply a complete style bundle in one click</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {themePresets.map((preset) => (
              <button
                key={preset.id}
                onClick={() => applyPreset(preset)}
                className={`relative flex flex-col items-center gap-2 py-4 px-3 text-sm font-medium border-2 rounded-xl transition-all ${
                  theme === preset.theme && buttonStyle === preset.buttonStyle && hoverEffect === preset.hoverEffect && layoutMode === preset.layoutMode
                    ? "border-primary bg-primary/10 text-primary"
                    : "border-gray-200 hover:border-gray-300 text-gray-700"
                } ${preset.isPro && !isPro ? "opacity-50 cursor-not-allowed" : ""}`}
              >
                <div className={`w-full h-10 rounded-lg ${preset.swatch}`} />
                <span>{preset.name}</span>
                {preset.isPro && !isPro && (
                  <div className="absolute top-1 right-1">
                    <Crown className="w-3 h-3 text-yellow-500" />
                  </div>
                )}
              </button>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Branding</CardTitle>
          <CardDescription>
            {canToggleBranding
              ? "Toggle the 'Powered by Flolio' badge on your page"
              : brandingUnlocked
              ? "You've unlocked branding removal via referrals!"
              : "Upgrade to Pro or refer 3 friends to remove branding"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={showBranding}
              onChange={(e) => setShowBranding(e.target.checked)}
              disabled={!canToggleBranding}
              className="w-4 h-4 rounded border-gray-300 text-primary disabled:opacity-50"
            />
            <span className="text-sm">Show &quot;Powered by Flolio&quot; on my page</span>
          </label>
          {!canToggleBranding && (
            <p className="text-xs text-muted-foreground mt-2">
              <Crown className="w-3 h-3 inline mr-1 text-yellow-500" />
              Upgrade to Pro or refer 3 friends to remove branding.
            </p>
          )}
          {brandingUnlocked && !isPro && (
            <p className="text-xs text-green-600 mt-2 flex items-center gap-1">
              <Check className="w-3 h-3" />
              Branding removal unlocked via referrals!
            </p>
          )}
        </CardContent>
      </Card>

      <div className="flex items-center justify-between">
        {message ? (
          <p className={`text-sm ${message === "Saved" ? "text-green-600" : "text-red-600"}`}>{message}</p>
        ) : (
          <p className="text-sm text-muted-foreground">{saving ? "Saving..." : "All changes saved"}</p>
        )}
        <Button onClick={save} variant="outline" size="sm" disabled={saving}>
          {saving ? "Saving..." : "Save"}
        </Button>
      </div>
    </div>

    {renderPreview()}

    {userUsername && (
      <>
        <button
          onClick={() => setShowMobilePreview(true)}
          className="lg:hidden fixed bottom-20 right-4 z-30 w-12 h-12 rounded-full bg-primary text-primary-foreground shadow-lg flex items-center justify-center"
        >
          <Eye className="w-5 h-5" />
        </button>
        {showMobilePreview && (
          <div className="lg:hidden fixed inset-0 z-50 bg-black/50" onClick={() => setShowMobilePreview(false)}>
            <div
              className="absolute bottom-0 left-0 right-0 bg-white rounded-t-2xl max-h-[85vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="sticky top-0 bg-white z-10 pt-3 pb-2 flex items-center justify-center">
                <div className="w-10 h-1 bg-gray-300 rounded-full" />
                <button
                  onClick={() => setShowMobilePreview(false)}
                  className="absolute right-2 w-8 h-8 rounded-full flex items-center justify-center text-gray-500 hover:text-gray-800 hover:bg-gray-100 transition-colors"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                </button>
              </div>
              <div className="px-2 pb-6">
                <PublicProfile
                  name={userName}
                  bio={userBio}
                  avatarUrl={userAvatarUrl}
                  theme={theme}
                  accentColor={accentColor}
                  showBranding={showBranding}
                  buttonStyle={buttonStyle}
                  bioAlignment={bioAlignment}
                  buttonTextColor={buttonTextColor || null}
                  backgroundColor={backgroundColor || null}
                  avatarShape={avatarShape}
                  fontFamily={fontFamily}
                  fontSize={fontSize}
                  linkBorderWidth={linkBorderWidth}
                  linkShadow={linkShadow}
                  linkSpacing={linkSpacing}
                  layoutMode={layoutMode}
                  hoverEffect={hoverEffect}
                  showAvatar={showAvatar}
                  showBio={showBio}
                  headerImageUrl={headerImageUrl}
                  customCss={customCss}
                  isLocked={isLocked}
                  pagePassword={pagePassword}
                  buttonBorderColor={buttonBorderColor || null}
                  buttonFontWeight={buttonFontWeight}
                  countdownTitle={countdownTitle}
                  countdownDate={countdownDate || null}
                  enableEmailCapture={enableEmailCapture}
                  emailCaptureTitle={emailCaptureTitle}
                  tipEnabled={tipEnabled}
                  tipVenmo={tipVenmo}
                  tipPayPal={tipPayPal}
                  tipCashApp={tipCashApp}
                  links={links}
                  socialLinks={socialLinks}
                  products={products}
                  embeds={embeds}
                  pages={pages}
                  integrations={integrations}
                  username={userUsername}
                  isPro={isPro}
                  preview
                />
              </div>
            </div>
          </div>
        )}
      </>
    )}
  </div>
  )
}
