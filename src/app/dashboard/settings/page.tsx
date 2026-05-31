"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Crown, Image, Gift, Copy, Check, Globe, CreditCard } from "lucide-react"
import { PRICE_TIERS } from "@/lib/pricing"
import { Badge } from "@/components/ui/badge"

export default function SettingsPage() {
  const { data: session } = useSession()
  const isPro = (session?.user as any)?.isPro
  const [name, setName] = useState("")
  const [bio, setBio] = useState("")
  const [avatarUrl, setAvatarUrl] = useState("")
  const [socialImage, setSocialImage] = useState("")
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
      body: JSON.stringify({ name, bio, avatarUrl, socialImage }),
    })
    if (res.ok) {
      setMessage("Settings saved!")
    } else {
      setMessage("Failed to save settings")
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
            <label className="text-sm font-medium">Avatar URL</label>
            <Input value={avatarUrl} onChange={(e) => setAvatarUrl(e.target.value)} placeholder="https://example.com/avatar.jpg" />
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
            <Globe className="w-5 h-5 text-primary" />
            Custom Domain
            {!isPro && (
              <span className="inline-flex items-center gap-1 text-xs text-yellow-600 bg-yellow-50 px-2 py-0.5 rounded-full">
                <Crown className="w-3 h-3" /> Pro
              </span>
            )}
          </CardTitle>
          <CardDescription>
            {isPro
              ? "Connect your own domain to your Flolio page"
              : "Upgrade to Pro to use a custom domain"}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {isPro ? (
            <>
              <div className="space-y-2">
                <label className="text-sm font-medium">Your Domain</label>
                <div className="flex flex-col sm:flex-row gap-2">
                  <Input
                    placeholder="links.yourdomain.com"
                    value={domainInput}
                    onChange={(e) => setDomainInput(e.target.value)}
                    disabled={!!customDomain}
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
                  ) : (
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
            </>
          ) : (
            <p className="text-sm text-muted-foreground">
              Custom domains are available on the Pro plan. Upgrade to connect your own domain.
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
