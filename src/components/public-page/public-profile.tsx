"use client"

import { useState, useEffect, useCallback } from "react"
import { themes, buttonStyles, avatarShapes } from "@/lib/themes"
import { fontFamilies, fontSizeOptions, borderWidthOptions, shadowOptions, spacingOptions, layoutModes, hoverEffects, fontWeightOptions } from "@/lib/customization"
import { getSocialPlatform } from "@/lib/social"

interface LinkData {
  id: string
  title: string
  url: string
  icon?: string
  imageUrl?: string | null
  section?: string | null
  utmSource?: string | null
  utmMedium?: string | null
  utmCampaign?: string | null
  utmContent?: string | null
  gateType?: string
  gateValue?: string
}

interface SocialLinkData {
  platform: string
  handle: string
  url: string
}

interface ProductData {
  id: string
  title: string
  description?: string
  price: number
  imageUrl?: string
  sold: number
}

interface EmbedData {
  id: string
  type: string
  title?: string
  url: string
  embedUrl?: string
}

interface PageData {
  id: string
  title: string
  slug: string
  links: LinkData[]
}

interface IntegrationData {
  provider: string
  key: string
}

interface PublicProfileProps {
  name: string
  bio?: string
  avatarUrl?: string
  theme: string
  accentColor: string
  showBranding: boolean
  buttonStyle?: string
  bioAlignment?: string
  buttonTextColor?: string | null
  backgroundColor?: string | null
  avatarShape?: string
  fontFamily?: string
  fontSize?: string
  linkBorderWidth?: string
  linkShadow?: string
  linkSpacing?: string
  layoutMode?: string
  hoverEffect?: string
  showAvatar?: boolean
  showBio?: boolean
  headerImageUrl?: string
  customCss?: string
  isLocked?: boolean
  pagePassword?: string
  buttonBorderColor?: string | null
  buttonFontWeight?: string
  countdownTitle?: string
  countdownDate?: string | null
  enableEmailCapture?: boolean
  emailCaptureTitle?: string
  tipEnabled?: boolean
  tipVenmo?: string
  tipPayPal?: string
  tipCashApp?: string
  showInstagramGrid?: boolean
  gridColumns?: number
  links: LinkData[]
  socialLinks?: SocialLinkData[]
  products?: ProductData[]
  embeds?: EmbedData[]
  pages?: PageData[]
  activePageSlug?: string
  integrations?: IntegrationData[]
  isPro: boolean
  username: string
}

function buildUrl(link: LinkData): string {
  const params = new URLSearchParams()
  if (link.utmSource) params.set("utm_source", link.utmSource)
  if (link.utmMedium) params.set("utm_medium", link.utmMedium)
  if (link.utmCampaign) params.set("utm_campaign", link.utmCampaign)
  if (link.utmContent) params.set("utm_content", link.utmContent)
  const qs = params.toString()
  if (!qs) return link.url
  const separator = link.url.includes("?") ? "&" : "?"
  return `${link.url}${separator}${qs}`
}

function CountdownTimer({ targetDate }: { targetDate: string }) {
  const [timeLeft, setTimeLeft] = useState("")

  useEffect(() => {
    function tick() {
      const diff = new Date(targetDate).getTime() - Date.now()
      if (diff <= 0) { setTimeLeft("Launched!"); return }
      const d = Math.floor(diff / 86400000)
      const h = Math.floor((diff % 86400000) / 3600000)
      const m = Math.floor((diff % 3600000) / 60000)
      const s = Math.floor((diff % 60000) / 1000)
      setTimeLeft(`${d}d ${h}h ${m}m ${s}s`)
    }
    tick()
    const int = setInterval(tick, 1000)
    return () => clearInterval(int)
  }, [targetDate])

  return <div className="text-2xl font-bold font-mono tracking-wider my-4">{timeLeft}</div>
}

function GatedLink({ link, accentColor, buttonTextColor, borderColorValue, className, children }: {
  link: LinkData; accentColor: string; buttonTextColor: string; borderColorValue: string; className: string; children: React.ReactNode
}) {
  const [gated, setGated] = useState(true)
  const [code, setCode] = useState("")
  const [error, setError] = useState(false)

  if (!gated) {
    return <a href={buildUrl(link)} target="_blank" rel="noopener noreferrer" className={className} style={{ backgroundColor: accentColor, color: buttonTextColor, borderColor: borderColorValue }}>{children}</a>
  }

  return (
    <div className={className} style={{ backgroundColor: accentColor, color: buttonTextColor, borderColor: borderColorValue }}>
      {link.gateType === "subscribe" ? (
        <div className="flex items-center gap-2 px-2">
          <input type="email" placeholder="Enter email" value={code} onChange={(e) => setCode(e.target.value)}
            className="flex-1 h-8 px-2 rounded text-xs text-black" onClick={(e) => e.stopPropagation()}
          />
          <button onClick={(e) => { e.stopPropagation(); if (code) setGated(false) }}
            className="text-xs font-medium whitespace-nowrap" style={{ color: buttonTextColor }}
          >Unlock</button>
        </div>
      ) : (
        <div className="flex items-center gap-2 px-2">
          <input type="text" placeholder="Enter code" value={code} onChange={(e) => setCode(e.target.value)}
            className="flex-1 h-8 px-2 rounded text-xs text-black" onClick={(e) => e.stopPropagation()}
          />
          <button onClick={(e) => { e.stopPropagation(); if (code === link.gateValue) setGated(false); else setError(true) }}
            className="text-xs font-medium whitespace-nowrap" style={{ color: buttonTextColor }}
          >Unlock</button>
        </div>
      )}
      {error && <p className="text-xs text-red-300 px-2 pb-1">Incorrect code</p>}
    </div>
  )
}

function AnalyticsScripts({ integrations }: { integrations?: IntegrationData[] }) {
  if (!integrations?.length) return null

  return (
    <>
      {integrations.map((i) => {
        if (i.provider === "google_analytics" && i.key) {
          return (
            <script key="ga" dangerouslySetInnerHTML={{
              __html: `window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments)}gtag('js',new Date());gtag('config','${i.key}');`
            }} />
          )
        }
        if (i.provider === "meta_pixel" && i.key) {
          return (
            <script key="meta" dangerouslySetInnerHTML={{
              __html: `!function(f,b,e,v,n,t,s){if(f.fbq)return;n=f.fbq=function(){n.callMethod?n.callMethod.apply(n,arguments):n.queue.push(arguments)};if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';n.queue=[];t=b.createElement(e);t.async=!0;t.src=v;s=b.getElementsByTagName(e)[0];s.parentNode.insertBefore(t,s)}(window,document,'script','https://connect.facebook.net/en_US/fbevents.js');fbq('init','${i.key}');fbq('track','PageView');`
            }} />
          )
        }
        if (i.provider === "tiktok_pixel" && i.key) {
          return (
            <script key="tiktok" dangerouslySetInnerHTML={{
              __html: `!function(w,d,t){w.TiktokAnalyticsObject=t;var ttq=w[t]=w[t]||[];ttq.methods=["page","track","identify","instances","debug","on","off","once","ready","alias","group","enableCookie","disableCookie"],ttq.setAndDefer=function(t,e){t[e]=function(){t.push([e].concat(Array.prototype.slice.call(arguments,0)))}};for(var i=0;i<ttq.methods.length;i++)ttq.setAndDefer(ttq,ttq.methods[i]);ttq.load=function(){var e=document.createElement("script");e.type="text/javascript",e.async=!0,e.src="https://analytics.tiktok.com/i18n/pixel/sdk.js";var t=document.getElementsByTagName("script")[0];t.parentNode.insertBefore(e,t)};ttq.load();ttq.page();}(window,document,'ttq');ttq.init('${i.key}');ttq.track('PageView');`
            }} />
          )
        }
        return null
      })}
      {integrations.some((i) => i.provider === "google_analytics" && i.key) && (
        <script async src={`https://www.googletagmanager.com/gtag/js?id=${integrations.find((i) => i.provider === "google_analytics")?.key}`} />
      )}
    </>
  )
}

export function PublicProfile({
  name, bio, avatarUrl, theme: themeId, accentColor, showBranding,
  buttonStyle: buttonStyleId = "rounded", bioAlignment = "center",
  buttonTextColor, backgroundColor: customBg, avatarShape: avatarShapeId = "circle",
  fontFamily: fontFamilyId = "modern", fontSize: fontSizeId = "md",
  linkBorderWidth: borderId = "none", linkShadow: shadowId = "none",
  linkSpacing: spacingId = "normal", layoutMode: layoutId = "list",
  hoverEffect: hoverId = "lift", showAvatar = true, showBio = true,
  headerImageUrl, customCss, isLocked = false, pagePassword,
  buttonBorderColor, buttonFontWeight: fontWeightId = "medium",
  countdownTitle, countdownDate, enableEmailCapture = false, emailCaptureTitle,
  tipEnabled = false, tipVenmo, tipPayPal, tipCashApp,
  showInstagramGrid = false, gridColumns = 2,
  links, socialLinks, products = [], embeds = [], pages = [],
  activePageSlug, integrations, username,
}: PublicProfileProps) {
  const [password, setPassword] = useState("")
  const [unlocked, setUnlocked] = useState(false)
  const [passwordError, setPasswordError] = useState(false)
  const [email, setEmail] = useState("")
  const [subscribed, setSubscribed] = useState(false)
  const [subscribing, setSubscribing] = useState(false)
  const [buying, setBuying] = useState<string | null>(null)
  const [currentPage, setCurrentPage] = useState(activePageSlug || "main")

  const activeTheme = themes.find((t) => t.id === themeId) || themes[0]
  const activeButtonStyle = buttonStyles.find((b) => b.id === buttonStyleId) || buttonStyles[0]
  const activeAvatarShape = avatarShapes.find((a) => a.id === avatarShapeId) || avatarShapes[0]
  const activeFontFamily = fontFamilies.find((f) => f.id === fontFamilyId) || fontFamilies[0]
  const activeFontSize = fontSizeOptions.find((f) => f.id === fontSizeId) || fontSizeOptions[0]
  const activeBorderWidth = borderWidthOptions.find((b) => b.id === borderId) || borderWidthOptions[0]
  const activeShadow = shadowOptions.find((s) => s.id === shadowId) || shadowOptions[0]
  const activeSpacing = spacingOptions.find((s) => s.id === spacingId) || spacingOptions[0]
  const activeHover = hoverEffects.find((h) => h.id === hoverId) || hoverEffects[0]
  const activeFontWeight = fontWeightOptions.find((fw) => fw.id === fontWeightId) || fontWeightOptions[0]
  const isGrid = layoutId === "grid"
  const bgGradient = customBg ? "" : `bg-gradient-to-b ${activeTheme.background}`
  const bgStyle = customBg ? { backgroundColor: customBg } : {}
  const borderColorValue = buttonBorderColor || accentColor

  const groupedLinks = links.reduce<Record<string, LinkData[]>>((acc, link) => {
    const section = link.section || "__default"
    if (!acc[section]) acc[section] = []
    acc[section].push(link)
    return acc
  }, {})

  const showPageNav = pages.length > 0

  const currentLinks = currentPage === "main" ? links : (pages.find((p) => p.slug === currentPage)?.links || [])

  const currentGroupedLinks = currentLinks.reduce<Record<string, LinkData[]>>((acc, link) => {
    const section = link.section || "__default"
    if (!acc[section]) acc[section] = []
    acc[section].push(link)
    return acc
  }, {})

  useEffect(() => {
    document.documentElement.style.setProperty("--accent", accentColor)
  }, [accentColor])

  async function trackClick(linkId: string) {
    try { await fetch(`/api/analytics/${linkId}`, { method: "POST" }) } catch {}
  }

  async function handleSubscribe(e: React.FormEvent) {
    e.preventDefault()
    if (!email) return
    setSubscribing(true)
    try {
      const res = await fetch("/api/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, email }),
      })
      if (res.ok) setSubscribed(true)
    } catch {}
    setSubscribing(false)
  }

  async function buyProduct(productId: string) {
    setBuying(productId)
    try {
      const res = await fetch("/api/products/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productId }),
      })
      const data = await res.json()
      if (data.url) window.location.href = data.url
    } catch {}
    setBuying(null)
  }

  if (isLocked && !unlocked) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center px-4">
        <AnalyticsScripts integrations={integrations} />
        <div className="max-w-sm w-full text-center space-y-6">
          <h1 className="font-heading text-2xl font-bold">{name}</h1>
          <p className="text-muted-foreground">This page is password protected</p>
          <input type="password" value={password} onChange={(e) => { setPassword(e.target.value); setPasswordError(false) }}
            placeholder="Enter password"
            className="w-full h-10 rounded-md border border-input bg-background px-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            onKeyDown={(e) => { if (e.key === "Enter") { if (password === pagePassword) setUnlocked(true); else setPasswordError(true) } }}
          />
          {passwordError && <p className="text-sm text-destructive">Incorrect password</p>}
          <button onClick={() => { if (password === pagePassword) setUnlocked(true); else setPasswordError(true) }}
            className="w-full h-10 rounded-md bg-primary text-primary-foreground font-medium text-sm hover:bg-primary/90"
          >Unlock</button>
        </div>
      </div>
    )
  }

  return (
    <div className={`min-h-screen ${bgGradient} px-4 pb-16`} style={bgStyle}>
      <AnalyticsScripts integrations={integrations} />
      {customCss && <style>{customCss}</style>}
      <div className={`max-w-md mx-auto pt-12 ${bioAlignment === "left" ? "text-left" : "text-center"}`}>
        {headerImageUrl && (
          <img src={headerImageUrl} alt="" className="w-full h-40 object-cover rounded-2xl mb-6 shadow-md" />
        )}
        {showAvatar && avatarUrl && (
          <img src={avatarUrl} alt={name}
            className={`w-24 h-24 mx-auto mb-4 object-cover border-4 shadow-lg ${activeAvatarShape.className} ${bioAlignment === "left" ? "ml-0" : ""}`}
            style={{ borderColor: accentColor }}
          />
        )}
        <h1 className={`font-heading text-2xl font-bold mb-1 ${activeTheme.textClass}`}>{name}</h1>
        {showBio && bio && <p className="text-gray-600 mb-4">{bio}</p>}

        {countdownDate && countdownTitle && (
          <div className="mb-6">
            <p className="text-sm text-muted-foreground mb-1">{countdownTitle}</p>
            <CountdownTimer targetDate={countdownDate} />
          </div>
        )}

        {socialLinks && socialLinks.length > 0 && (
          <div className={`flex items-center gap-3 mb-6 flex-wrap ${bioAlignment === "left" ? "justify-start" : "justify-center"}`}>
            {socialLinks.map((sl) => {
              const platform = getSocialPlatform(sl.platform)
              if (!platform) return null
              return (
                <a key={sl.platform} href={sl.url} target="_blank" rel="noopener noreferrer"
                  className="w-10 h-10 rounded-full flex items-center justify-center transition-all hover:scale-110 hover:shadow-md"
                  style={{ backgroundColor: platform.color }}
                  title={`${platform.name}: ${sl.handle}`}
                >
                  <span className="w-5 h-5 text-white" dangerouslySetInnerHTML={{ __html: platform.icon.replace('fill="currentColor"', 'fill="white"') }} />
                </a>
              )
            })}
          </div>
        )}

        {showPageNav && (
          <div className="flex items-center gap-1 mb-6 overflow-x-auto pb-1 justify-center">
            <button onClick={() => setCurrentPage("main")}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all whitespace-nowrap ${
                currentPage === "main" ? "bg-primary/20 text-primary" : "text-gray-500 hover:text-gray-700"
              }`}
            >Main</button>
            {pages.map((p) => (
              <button key={p.id} onClick={() => setCurrentPage(p.slug)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all whitespace-nowrap ${
                  currentPage === p.slug ? "bg-primary/20 text-primary" : "text-gray-500 hover:text-gray-700"
                }`}
              >{p.title}</button>
            ))}
          </div>
        )}

        <div className={isGrid ? "grid grid-cols-2 gap-2" : `flex flex-col ${activeSpacing.className}`}>
          {Object.entries(currentGroupedLinks).map(([section, sectionLinks]) => (
            <div key={section} className={isGrid ? "col-span-2" : ""}>
              {section !== "__default" && (
                <p className={`text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2 ${isGrid ? "" : "mt-2 first:mt-0"} ${bioAlignment === "left" ? "text-left" : "text-center"}`}>
                  {section}
                </p>
              )}
              <div className={isGrid ? "grid grid-cols-2 gap-2" : `flex flex-col ${activeSpacing.className}`}>
                {sectionLinks.map((link) => {
                  const commonClasses = `block w-full transition-all duration-200 ${activeFontWeight.className} ${activeBorderWidth.className} ${activeShadow.className} ${activeHover.className}`
                  const hasImage = !!link.imageUrl
                  const cardClasses = hasImage
                    ? `${commonClasses} rounded-xl overflow-hidden bg-white/10 ${activeShadow.className}`
                    : `${commonClasses} py-3 px-4 text-center ${activeFontSize.className} ${activeButtonStyle.className}`

                  const inner = (
                    <>
                      {hasImage ? (
                        <div className="w-full">
                          <img src={link.imageUrl || undefined} alt={link.title} className="w-full aspect-[2/1] object-cover" />
                          <div className="py-2.5 px-4 text-center" style={{ backgroundColor: accentColor, color: buttonTextColor || "#fff", fontFamily: activeFontFamily.family }}>
                            {link.icon && (link.icon.startsWith("http") ? <img src={link.icon} alt="" className="w-5 h-5 inline-block mr-2 rounded object-cover" /> : <span className="mr-2">{link.icon}</span>)}
                            <span className={activeFontSize.className}>{link.title}</span>
                          </div>
                        </div>
                      ) : (
                        <>
                          {link.icon && (link.icon.startsWith("http") ? <img src={link.icon} alt="" className="w-5 h-5 inline-block mr-2 rounded object-cover" /> : <span className="mr-2">{link.icon}</span>)}
                          {link.title}
                        </>
                      )}
                    </>
                  )

                  return link.gateType ? (
                    <GatedLink key={link.id} link={link} accentColor={accentColor}
                      buttonTextColor={buttonTextColor || "#fff"}
                      borderColorValue={borderColorValue}
                      className={cardClasses}
                    >
                      {inner}
                    </GatedLink>
                  ) : (
                    <a key={link.id} href={buildUrl(link)} target="_blank" rel="noopener noreferrer"
                      onClick={() => trackClick(link.id)}
                      className={cardClasses}
                      style={!hasImage ? { backgroundColor: accentColor, color: buttonTextColor || "#fff", fontFamily: activeFontFamily.family, borderColor: borderColorValue } : {}}
                    >
                      {inner}
                    </a>
                  )
                })}
              </div>
            </div>
          ))}
        </div>

        {embeds.length > 0 && (
          <div className="mt-6 space-y-4">
            {embeds.map((e) => (
              <div key={e.id} className="rounded-xl overflow-hidden bg-black/5">
                {e.title && <p className="text-xs font-medium px-3 pt-2 text-muted-foreground">{e.title}</p>}
                {e.type === "youtube" && e.embedUrl && (
                  <div className="aspect-video">
                    <iframe src={e.embedUrl} className="w-full h-full" allowFullScreen />
                  </div>
                )}
                {e.type === "spotify" && e.embedUrl && (
                  <iframe src={e.embedUrl} className="w-full h-[80px]" allow="encrypted-media" />
                )}
                {e.type === "soundcloud" && e.embedUrl && (
                  <iframe src={e.embedUrl} className="w-full h-[120px]" />
                )}
                {(e.type === "tiktok" || e.type === "apple_music" || (!e.embedUrl)) && (
                  <a href={e.url} target="_blank" rel="noopener noreferrer"
                    className="block px-3 py-2 text-sm text-primary hover:underline"
                  >Listen on {e.type}</a>
                )}
              </div>
            ))}
          </div>
        )}

        {products.length > 0 && (
          <div className="mt-6 space-y-3">
            <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground text-center">Products</p>
            <div className="grid sm:grid-cols-2 gap-3">
              {products.map((p) => (
                <div key={p.id} className="rounded-xl border bg-white/50 p-3 text-center">
                  {p.imageUrl && <img src={p.imageUrl} alt="" className="w-full h-20 object-cover rounded-lg mb-2" />}
                  <h3 className="text-sm font-semibold">{p.title}</h3>
                  {p.description && <p className="text-xs text-muted-foreground mt-1">{p.description}</p>}
                  <p className="text-lg font-bold mt-2" style={{ color: accentColor }}>${(p.price / 100).toFixed(2)}</p>
                  <button onClick={() => buyProduct(p.id)} disabled={buying === p.id}
                    className="w-full mt-2 py-2 rounded-lg text-xs font-medium text-white transition-all hover:opacity-90"
                    style={{ backgroundColor: accentColor }}
                  >{buying === p.id ? "Redirecting..." : "Buy Now"}</button>
                </div>
              ))}
            </div>
          </div>
        )}

        {enableEmailCapture && !subscribed && (
          <form onSubmit={handleSubscribe} className="mt-6 space-y-2">
            <p className="text-sm text-muted-foreground">{emailCaptureTitle || "Subscribe for updates"}</p>
            <div className="flex gap-2">
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com" required
                className="flex-1 h-10 rounded-md border border-input bg-background px-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              />
              <button type="submit" disabled={subscribing}
                className="h-10 px-4 rounded-md bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 disabled:opacity-50"
              >{subscribing ? "..." : "Join"}</button>
            </div>
          </form>
        )}
        {subscribed && <p className="mt-4 text-sm text-green-600">Thanks for subscribing!</p>}

        {tipEnabled && (tipVenmo || tipPayPal || tipCashApp) && (
          <div className="mt-6 p-4 border border-dashed border-muted-foreground/30 rounded-xl">
            <p className="text-sm font-medium text-center mb-3">Support me</p>
            <div className="flex items-center justify-center gap-3">
              {tipVenmo && (
                <a href={`https://venmo.com/${tipVenmo.replace("@", "")}`} target="_blank" rel="noopener noreferrer"
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-500 text-white text-xs font-medium hover:bg-blue-600 transition-colors"
                >Venmo</a>
              )}
              {tipPayPal && (
                <a href={`https://paypal.me/${tipPayPal.replace("@", "")}`} target="_blank" rel="noopener noreferrer"
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-600 text-white text-xs font-medium hover:bg-blue-700 transition-colors"
                >PayPal</a>
              )}
              {tipCashApp && (
                <a href={`https://cash.app/${tipCashApp.replace("$", "")}`} target="_blank" rel="noopener noreferrer"
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-green-500 text-white text-xs font-medium hover:bg-green-600 transition-colors"
                >Cash App</a>
              )}
            </div>
          </div>
        )}

      </div>

      {showBranding && (
        <div className="fixed bottom-0 left-0 right-0 py-3 text-center bg-white/80 backdrop-blur-sm border-t border-gray-200/50">
          <p className="text-xs text-gray-400">
            Powered by <a href="/" className="font-medium hover:text-gray-600">Flolio</a>
          </p>
        </div>
      )}
    </div>
  )
}
