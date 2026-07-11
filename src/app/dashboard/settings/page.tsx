"use client"

import { useState, useEffect, useRef } from "react"
import { useSession } from "next-auth/react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Crown, Image, Gift, Copy, Check, Globe, CreditCard, BarChart3, Mail, Trash2, Puzzle, Eye, EyeOff } from "lucide-react"
import { toast } from "@/components/ui/toast"
import { PRICE_TIERS } from "@/lib/pricing"
import { Badge } from "@/components/ui/badge"
import { ImageUpload } from "@/components/ui/image-upload"

export default function SettingsPage() {
  const { data: session } = useSession()
  const isPro = (session?.user as any)?.isPro
  const [name, setName] = useState("")
  const [bio, setBio] = useState("")
  const [avatarUrl, setAvatarUrl] = useState("")
  const [socialImage, setSocialImage] = useState("")
  const [username, setUsername] = useState("")
  const [usernameAvail, setUsernameAvail] = useState<"idle" | "checking" | "available" | "taken" | "invalid">("idle")
  const usernameDebounce = useRef<ReturnType<typeof setTimeout>>()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState("")
  const [referralCode, setReferralCode] = useState("")
  const [referralCount, setReferralCount] = useState(0)
  const [brandingUnlocked, setBrandingUnlocked] = useState(false)
  const [copied, setCopied] = useState(false)
  const [customDomain, setCustomDomain] = useState("")
  const [domainVerified, setDomainVerified] = useState(false)
  const [domainInput, setDomainInput] = useState("")
  const [domainSaving, setDomainSaving] = useState(false)
  const [domainMessage, setDomainMessage] = useState("")
  const [subscription, setSubscription] = useState<any>(null)
  const [subscriptionLoading, setSubscriptionLoading] = useState(true)
  const [upgrading, setUpgrading] = useState(false)

  const [integrations, setIntegrations] = useState<any[]>([])
  const [integrationsLoading, setIntegrationsLoading] = useState(true)
  const [configuring, setConfiguring] = useState<string | null>(null)
  const [keyValue, setKeyValue] = useState("")
  const [showKeys, setShowKeys] = useState<Record<string, boolean>>({})

  const integrationProviders = [
    { value: "google_analytics", label: "Google Analytics", icon: BarChart3, category: "analytics", desc: "Track page visits with GA4", placeholder: "G-XXXXXXXXXX" },
    { value: "meta_pixel", label: "Meta Pixel", icon: BarChart3, category: "analytics", desc: "Track conversions from Facebook/Instagram", placeholder: "1234567890" },
    { value: "tiktok_pixel", label: "TikTok Pixel", icon: BarChart3, category: "analytics", desc: "Track TikTok ad conversions", placeholder: "TT-XXXXX" },
    { value: "mailchimp", label: "Mailchimp", icon: Mail, category: "email", desc: "Sync subscribers to Mailchimp", placeholder: "Mailchimp API Key" },
    { value: "convertkit", label: "ConvertKit", icon: Mail, category: "email", desc: "Sync subscribers to ConvertKit", placeholder: "ConvertKit API Key" },
    { value: "kit", label: "Kit (ConvertKit)", icon: Mail, category: "email", desc: "Sync subscribers to Kit", placeholder: "Kit API Key" },
  ]

  useEffect(() => {
    if (usernameDebounce.current) clearTimeout(usernameDebounce.current)
    const val = username
    if (!val || val === (session?.user as any)?.username) { setUsernameAvail("idle"); return }
    if (!val.match(/^[a-zA-Z0-9_]{3,20}$/)) { setUsernameAvail("invalid"); return }
    setUsernameAvail("checking")
    usernameDebounce.current = setTimeout(async () => {
      const res = await fetch(`/api/username-check?username=${encodeURIComponent(val)}`)
      const data = await res.json()
      setUsernameAvail(data.available ? "available" : "taken")
    }, 400)
    return () => { if (usernameDebounce.current) clearTimeout(usernameDebounce.current) }
  }, [username, session])

  useEffect(() => {
    async function load() {
      const [settingsRes, referralRes] = await Promise.all([
        fetch("/api/settings"),
        fetch("/api/referral/stats"),
      ])
      if (settingsRes.ok) {
        const data = await settingsRes.json()
        setName(data.name || "")
        setBio(data.bio || "")
        setAvatarUrl(data.avatarUrl || "")
        setSocialImage(data.socialImage || "")
        setUsername(data.username || "")
        setCustomDomain(data.customDomain || "")
        setDomainVerified(data.domainVerified || false)
        setDomainInput(data.customDomain || "")
      }
      if (referralRes.ok) {
        const data = await referralRes.json()
        setReferralCode(data.referralCode || "")
        setReferralCount(data.referralCount)
        setBrandingUnlocked(data.brandingUnlocked)
      }
      const subRes = await fetch("/api/subscription")
      if (subRes.ok) {
        const subData = await subRes.json()
        setSubscription(subData)
      }
      setSubscriptionLoading(false)

      const intRes = await fetch("/api/integrations")
      if (intRes.ok) {
        setIntegrations(await intRes.json())
      }
      setIntegrationsLoading(false)

      if (referralRes.status === 401) {
        const genRes = await fetch("/api/referral/generate")
        if (genRes.ok) {
          const data = await genRes.json()
          setReferralCode(data.referralCode)
        }
      }
      setLoading(false)
    }
    load()
  }, [])

  async function save() {
    setSaving(true)
    setMessage("")
    const res = await fetch("/api/settings", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, bio, avatarUrl, socialImage, username }),
    })
    if (res.ok) {
      setMessage("Settings saved!")
      setUsernameAvail("idle")
    } else {
      const err = await res.json()
      setMessage(err.error || "Failed to save settings")
    }
    setSaving(false)
  }

  async function generateReferralCode() {
    const res = await fetch("/api/referral/generate")
    if (res.ok) {
      const data = await res.json()
      setReferralCode(data.referralCode)
    }
  }

  async function upgrade() {
    setUpgrading(true)
    const res = await fetch("/api/subscription", { method: "POST" })
    const data = await res.json()
    if (data.url) {
      window.location.href = data.url
    }
    setUpgrading(false)
  }

  async function manageBilling() {
    const res = await fetch("/api/billing", { method: "POST" })
    const data = await res.json()
    if (data.url) {
      window.location.href = data.url
    }
  }

  function getIntConfig(provider: string) {
    return integrations.find((i: any) => i.provider === provider)
  }

  async function connectIntegration(provider: string) {
    if (!keyValue) return
    const res = await fetch("/api/integrations", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ provider, key: keyValue }),
    })
    if (res.ok) {
      toast.success(`${getIntConfig(provider)?.label || provider} connected`)
      setConfiguring(null)
      setKeyValue("")
      const r = await fetch("/api/integrations")
      if (r.ok) setIntegrations(await r.json())
    } else {
      toast.error("Failed to connect")
    }
  }

  async function toggleIntegration(provider: string, enabled: boolean) {
    const res = await fetch("/api/integrations", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ provider, enabled: !enabled }),
    })
    if (res.ok) {
      const r = await fetch("/api/integrations")
      if (r.ok) setIntegrations(await r.json())
    }
  }

  async function disconnectIntegration(provider: string) {
    const config = getIntConfig(provider)
    if (!config) return
    await fetch(`/api/integrations/${config.id}`, { method: "DELETE" })
    toast.error("Integration removed")
    const r = await fetch("/api/integrations")
    if (r.ok) setIntegrations(await r.json())
  }

  function copyReferralLink() {
    const link = `${window.location.origin}/register?ref=${referralCode}`
    navigator.clipboard.writeText(link)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  if (loading) return <p className="text-muted-foreground">Loading...</p>

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Settings</h1>
        <p className="text-muted-foreground mt-1">Manage your profile settings</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Profile</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Display Name</label>
            <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Your name" />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Username</label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">flolio.com/</span>
              <Input
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="username"
                className="pl-[5.5rem]"
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2">
                {usernameAvail === "checking" && <span className="w-4 h-4 rounded-full border-2 border-muted-foreground border-t-transparent animate-spin inline-block" />}
                {usernameAvail === "available" && <span className="text-green-500 text-sm">Available</span>}
                {usernameAvail === "taken" && <span className="text-red-500 text-sm">Taken</span>}
                {usernameAvail === "invalid" && <span className="text-red-500 text-sm">3-20 chars, letters, numbers, underscores</span>}
              </span>
            </div>
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Bio</label>
            <textarea
              className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              placeholder="A short bio about yourself"
              rows={3}
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Avatar</label>
            <ImageUpload value={avatarUrl} onChange={setAvatarUrl} />
            {avatarUrl && (
              <img src={avatarUrl} alt="Preview" className="w-16 h-16 rounded-full object-cover mt-2 border"
                onError={(e) => { (e.target as HTMLImageElement).style.display = "none" }} />
            )}
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium flex items-center gap-2">
              <Image className="w-4 h-4" />
              Social Preview Image
              {!isPro && (
                <span className="inline-flex items-center gap-1 text-xs text-yellow-600 bg-yellow-50 px-2 py-0.5 rounded-full">
                  <Crown className="w-3 h-3" /> Pro
                </span>
              )}
            </label>
            <CardDescription>
              {isPro
                ? "URL for the image shown when your page is shared on social media"
                : "Upgrade to Pro to set a custom social preview image on your profile"}
            </CardDescription>
            <Input value={socialImage} onChange={(e) => setSocialImage(e.target.value)}
              placeholder="https://example.com/social-preview.png" disabled={!isPro} />
            {socialImage && (
              <img src={socialImage} alt="Social preview" className="w-full max-w-sm h-32 object-cover mt-2 rounded-lg border"
                onError={(e) => { (e.target as HTMLImageElement).style.display = "none" }} />
            )}
          </div>

          {message && (
            <p className={`text-sm ${message.includes("saved") ? "text-green-600" : "text-red-600"}`}>{message}</p>
          )}
          <Button onClick={save} disabled={saving}>{saving ? "Saving..." : "Save Settings"}</Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <CreditCard className="w-5 h-5 text-primary" />
            Billing &amp; Plan
          </CardTitle>
          <CardDescription>Manage your subscription plan</CardDescription>
        </CardHeader>
        <CardContent>
          {subscriptionLoading ? (
            <p className="text-sm text-muted-foreground">Loading...</p>
          ) : (
            <div className="grid md:grid-cols-2 gap-4">
              <div className={`rounded-xl border p-4 space-y-3 ${isPro ? "" : "ring-2 ring-primary/30 border-primary/50"}`}>
                <div className="flex items-center justify-between">
                  <p className="font-semibold">Free</p>
                  {!isPro && <Badge>Current Plan</Badge>}
                </div>
                <p className="text-2xl font-bold">$0<span className="text-sm font-normal text-muted-foreground">/mo</span></p>
                <ul className="space-y-1.5">
                  {PRICE_TIERS.free.features.map((f) => (
                    <li key={f} className="flex items-center gap-2 text-sm">
                      <Check className="w-4 h-4 text-green-500 shrink-0" />
                      <span>{f}</span>
                    </li>
                  ))}
                </ul>
                {!isPro && <Button variant="outline" className="w-full" disabled>Current Plan</Button>}
              </div>
              <div className={`rounded-xl border p-4 space-y-3 ${isPro ? "ring-2 ring-primary/30 border-primary/50" : ""}`}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <p className="font-semibold">Pro</p>
                    <Crown className="w-4 h-4 text-yellow-500" />
                  </div>
                  {isPro && <Badge variant="success">Active</Badge>}
                </div>
                <p className="text-2xl font-bold">$5<span className="text-sm font-normal text-muted-foreground">/mo</span></p>
                <ul className="space-y-1.5">
                  {PRICE_TIERS.pro.features.map((f) => (
                    <li key={f} className="flex items-center gap-2 text-sm">
                      <Check className="w-4 h-4 text-green-500 shrink-0" />
                      <span>{f}</span>
                    </li>
                  ))}
                </ul>
                {isPro ? (
                  <Button variant="outline" className="w-full" onClick={manageBilling}>Manage Subscription</Button>
                ) : (
                  <Button className="w-full" onClick={upgrade} disabled={upgrading}>
                    {upgrading ? "Redirecting..." : "Upgrade to Pro"}
                  </Button>
                )}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Puzzle className="w-5 h-5 text-primary" />
            Integrations
          </CardTitle>
          <CardDescription>Connect analytics, email marketing, and other tools</CardDescription>
        </CardHeader>
        <CardContent>
          {integrationsLoading ? (
            <p className="text-sm text-muted-foreground">Loading...</p>
          ) : (
            <div className="space-y-6">
              <div>
                <h3 className="text-sm font-medium mb-3">Analytics</h3>
                <div className="space-y-1">
                  {integrationProviders.filter((p) => p.category === "analytics").map((p) => {
                    const config = getIntConfig(p.value)
                    return (
                      <div key={p.value} className="flex items-center justify-between py-3 border-b last:border-0 gap-3">
                        <div className="min-w-0">
                          <p className="font-medium text-sm">{p.label}</p>
                          <p className="text-xs text-muted-foreground">{p.desc}</p>
                        </div>
                        {configuring === p.value ? (
                          <div className="flex items-center gap-2 shrink-0">
                            <Input value={keyValue} onChange={(e) => setKeyValue(e.target.value)} placeholder={p.placeholder} className="w-36 sm:w-40 h-9 text-xs" />
                            <Button size="sm" onClick={() => connectIntegration(p.value)} className="h-9">Connect</Button>
                            <Button size="sm" variant="ghost" onClick={() => setConfiguring(null)} className="h-9">Cancel</Button>
                          </div>
                        ) : config ? (
                          <div className="flex items-center gap-2 shrink-0">
                            <Badge variant={config.enabled ? "success" : "secondary"} className="text-xs">
                              {config.enabled ? "Active" : "Paused"}
                            </Badge>
                            {config.key && (
                              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                                <code className="bg-muted px-1.5 py-0.5 rounded text-[10px]">
                                  {showKeys[p.value] ? config.key : `${config.key.slice(0, 8)}••••`}
                                </code>
                                <button type="button" onClick={() => setShowKeys(s => ({ ...s, [p.value]: !s[p.value] }))}
                                  className="hover:text-foreground transition-colors" aria-label="Toggle key visibility"
                                >
                                  {showKeys[p.value] ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                                </button>
                              </div>
                            )}
                            <Button size="sm" variant="outline" onClick={() => toggleIntegration(p.value, config.enabled)} className="h-9">
                              {config.enabled ? "Pause" : "Activate"}
                            </Button>
                            <button onClick={() => disconnectIntegration(p.value)} title="Remove" className="flex items-center justify-center h-9 w-9 rounded-lg hover:bg-destructive/10 text-muted-foreground hover:text-red-600 transition-colors">
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        ) : (
                          <Button size="sm" variant="outline" onClick={() => setConfiguring(p.value)} className="h-9 shrink-0">+ Connect</Button>
                        )}
                      </div>
                    )
                  })}
                </div>
              </div>
              <div>
                <h3 className="text-sm font-medium mb-3">Email Marketing</h3>
                <div className="space-y-1">
                  {integrationProviders.filter((p) => p.category === "email").map((p) => {
                    const config = getIntConfig(p.value)
                    return (
                      <div key={p.value} className="flex items-center justify-between py-3 border-b last:border-0 gap-3">
                        <div className="min-w-0">
                          <p className="font-medium text-sm">{p.label}</p>
                          <p className="text-xs text-muted-foreground">{p.desc}</p>
                        </div>
                        {configuring === p.value ? (
                          <div className="flex items-center gap-2 shrink-0">
                            <Input value={keyValue} onChange={(e) => setKeyValue(e.target.value)} placeholder={p.placeholder} className="w-36 sm:w-40 h-9 text-xs" />
                            <Button size="sm" onClick={() => connectIntegration(p.value)} className="h-9">Connect</Button>
                            <Button size="sm" variant="ghost" onClick={() => setConfiguring(null)} className="h-9">Cancel</Button>
                          </div>
                        ) : config ? (
                          <div className="flex items-center gap-2 shrink-0">
                            <Badge variant="success" className="text-xs">Connected</Badge>
                            <button onClick={() => disconnectIntegration(p.value)} title="Remove" className="flex items-center justify-center h-9 w-9 rounded-lg hover:bg-destructive/10 text-muted-foreground hover:text-red-600 transition-colors">
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        ) : (
                          <Button size="sm" variant="outline" onClick={() => setConfiguring(p.value)} className="h-9 shrink-0">+ Connect</Button>
                        )}
                      </div>
                    )
                  })}
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Globe className="w-5 h-5 text-primary" />
            Custom Domain
            {!isPro && (
              <span className="inline-flex items-center gap-1 text-xs text-yellow-600 bg-yellow-50 px-2 py-0.5 rounded-full">
                <Crown className="w-3 h-3" /> Pro
              </span>
            )}
          </CardTitle>
          <CardDescription>
            Connect your own domain to your Flolio page
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Your Domain</label>
            <div className="flex flex-col sm:flex-row gap-2">
              <Input
                placeholder="links.yourdomain.com"
                value={domainInput}
                onChange={(e) => setDomainInput(e.target.value)}
                disabled={!isPro || !!customDomain}
              />
              {customDomain ? (
                <Button
                  variant="destructive"
                  size="sm"
                  className="shrink-0"
                  onClick={async () => {
                    setDomainSaving(true)
                    setDomainMessage("")
                    const res = await fetch("/api/domain", { method: "DELETE" })
                    if (res.ok) {
                      setCustomDomain("")
                      setDomainInput("")
                      setDomainVerified(false)
                      setDomainMessage("Domain disconnected")
                    } else {
                      setDomainMessage("Failed to disconnect domain")
                    }
                    setDomainSaving(false)
                  }}
                  disabled={domainSaving}
                >
                  Disconnect
                </Button>
              ) : isPro ? (
                <Button
                  size="sm"
                  className="shrink-0"
                  onClick={async () => {
                    setDomainSaving(true)
                    setDomainMessage("")
                    const res = await fetch("/api/domain", {
                      method: "POST",
                      headers: { "Content-Type": "application/json" },
                      body: JSON.stringify({ domain: domainInput }),
                    })
                    if (res.ok) {
                      const data = await res.json()
                      setCustomDomain(data.customDomain)
                      setDomainVerified(false)
                      setDomainMessage("Domain connected! Set up DNS to complete verification.")
                    } else {
                      const data = await res.json()
                      setDomainMessage(data.error || "Failed to connect domain")
                    }
                    setDomainSaving(false)
                  }}
                  disabled={domainSaving || !domainInput}
                >
                  Connect
                </Button>
              ) : (
                <Button size="sm" className="shrink-0" disabled>
                  <Crown className="w-3 h-3 mr-1" /> Upgrade to Pro
                </Button>
              )}
            </div>
          </div>
          {customDomain && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg px-4 py-3 space-y-2 text-sm">
                  <p className="font-medium text-blue-800">DNS Setup Instructions</p>
                  <ol className="text-blue-700 space-y-1 list-decimal list-inside">
                    <li>Add a CNAME record pointing <strong>{customDomain}</strong> to <strong>{typeof window !== "undefined" ? window.location.host : "your-app.vercel.app"}</strong></li>
                    <li>If using a root domain (e.g., yourdomain.com), add an A record to <strong>76.76.21.21</strong> (Vercel)</li>
                    <li>Wait for DNS propagation (5 mins to 24 hours)</li>
                    <li>Add the domain in your Vercel project dashboard under <strong>Settings &rarr; Domains</strong></li>
                  </ol>
                  {domainVerified ? (
                    <p className="text-green-700 flex items-center gap-1 mt-2">
                      <Check className="w-4 h-4" /> Domain verified
                    </p>
                  ) : (
                    <p className="text-yellow-700 mt-2">
                      Domain pending verification. After setting up DNS, add it in Vercel project settings.
                    </p>
                  )}
                </div>
              )}
              {domainMessage && (
                <p className={`text-sm ${domainMessage.includes("connected") ? "text-green-600" : domainMessage.includes("Failed") ? "text-red-600" : "text-blue-600"}`}>
                  {domainMessage}
                </p>
              )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Gift className="w-5 h-5 text-pink-500" />
            Referral Program
          </CardTitle>
          <CardDescription>
            {brandingUnlocked
              ? "You've unlocked the ability to remove Flolio branding! Check the Appearance page."
              : `Refer 3 friends to unlock branding removal. You've referred ${referralCount}/3.`}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {referralCode ? (
            <>
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                <div className="flex-1 bg-muted rounded-lg px-3 py-2 text-sm font-mono truncate text-center sm:text-left">
                  {window.location.origin}/register?ref={referralCode}
                </div>
                <Button variant="outline" size="sm" onClick={copyReferralLink} className="shrink-0">
                  {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                  {copied ? "Copied!" : "Copy"}
                </Button>
              </div>
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-muted-foreground">Referrals</span>
                  <span className="font-medium">{referralCount} / 3</span>
                </div>
                <div className="w-full bg-gray-100 rounded-full h-2">
                  <div className="bg-pink-500 h-2 rounded-full transition-all" style={{ width: `${Math.min((referralCount / 3) * 100, 100)}%` }} />
                </div>
              </div>
              {brandingUnlocked && (
                <div className="bg-green-50 border border-green-200 rounded-lg px-3 py-2 text-sm text-green-700 flex items-center gap-2">
                  <Check className="w-4 h-4" />
                  Branding removal unlocked! Go to Appearance to toggle it off.
                </div>
              )}
              {!brandingUnlocked && (
                <p className="text-xs text-muted-foreground">
                  Share your referral link with friends. When they sign up, you get credit.
                  Referring via email signup works automatically.
                </p>
              )}
            </>
          ) : (
            <Button variant="outline" onClick={generateReferralCode}>
              <Gift className="w-4 h-4 mr-2" />
              Generate Referral Link
            </Button>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
