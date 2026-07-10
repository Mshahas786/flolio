"use client"

import { useState, useEffect, useRef } from "react"
import { useRouter } from "next/navigation"
import { useSession } from "next-auth/react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Check, X, Loader2, Sparkles, Crown } from "lucide-react"
import { templates } from "@/lib/templates"
import { cn } from "@/lib/utils"

export default function OnboardingPage() {
  const router = useRouter()
  const { data: session, status, update } = useSession()
  const isPro = (session?.user as any)?.isPro
  const [username, setUsername] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)
  const [step, setStep] = useState<"username" | "template">("username")
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null)
  const [availability, setAvailability] = useState<"idle" | "checking" | "available" | "taken" | "invalid">("idle")
  const debounceRef = useRef<ReturnType<typeof setTimeout>>()

  useEffect(() => {
    if (session?.user?.username) {
      router.push("/dashboard")
      router.refresh()
    }
  }, [session, router])

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current)

    const val = username
    if (!val) { setAvailability("idle"); return }
    if (!val.match(/^[a-zA-Z0-9_]{3,20}$/)) { setAvailability("invalid"); return }

    setAvailability("checking")
    debounceRef.current = setTimeout(async () => {
      try {
        const res = await fetch(`/api/username-check?username=${encodeURIComponent(val)}`)
        const data = await res.json()
        setAvailability(data.available ? "available" : "taken")
      } catch {
        setAvailability("idle")
      }
    }, 400)

    return () => { if (debounceRef.current) clearTimeout(debounceRef.current) }
  }, [username])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError("")

    if (!username.match(/^[a-zA-Z0-9_]{3,20}$/)) {
      setError("Username must be 3-20 characters (letters, numbers, underscores)")
      setLoading(false)
      return
    }

    if (availability !== "available") {
      setError(availability === "taken" ? "Username already taken — please choose another" : "Please choose a valid username")
      setLoading(false)
      return
    }

    setStep("template")
    setLoading(false)
  }

  async function finishSetup() {
    setLoading(true)
    setError("")
    try {
      const res = await fetch("/api/onboarding", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, templateId: selectedTemplate }),
      })

      const data = await res.json()

      if (!res.ok) {
        setError(data.error || "Something went wrong")
        setLoading(false)
        return
      }

      const pendingRef = localStorage.getItem("pending_ref")
      if (pendingRef) {
        await fetch("/api/referral/claim-oauth", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ referralCode: pendingRef }),
        })
        localStorage.removeItem("pending_ref")
      }

      await update()
      router.push("/dashboard")
      router.refresh()
    } catch {
      setError("Something went wrong")
      setLoading(false)
    }
  }

  if (status === "loading" || session?.user?.username) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/[0.08] via-background to-primary/[0.04] px-4">
        <p className="text-muted-foreground">Loading...</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/[0.08] via-background to-primary/[0.04] px-4">
      <Card className="w-full max-w-2xl">
        {step === "username" ? (
          <>
            <CardHeader className="text-center">
              <CardTitle>Welcome to Flolio!</CardTitle>
              <CardDescription>Choose your unique username to get started</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Your Flolio URL</label>
                  <div className="flex items-center rounded-md border border-input bg-background px-3">
                    <span className="text-muted-foreground text-sm shrink-0">yoursite.com/</span>
                    <input
                      className="flex-1 bg-transparent px-1 py-2 text-sm outline-none"
                      placeholder="username"
                      value={username}
                      onChange={(e) => setUsername(e.target.value.replace(/[^a-zA-Z0-9_]/g, "").toLowerCase())}
                      required
                      minLength={3}
                      maxLength={20}
                      spellCheck={false}
                    />
                    <div className="w-5 shrink-0">
                      {availability === "checking" && <Loader2 className="w-4 h-4 text-muted-foreground animate-spin" />}
                      {availability === "available" && <Check className="w-4 h-4 text-green-500" />}
                      {availability === "taken" && <X className="w-4 h-4 text-red-500" />}
                      {availability === "invalid" && <X className="w-4 h-4 text-amber-500" />}
                    </div>
                  </div>
                  {error && <p className="text-sm text-red-600">{error}</p>}
                  {availability === "available" && <p className="text-xs text-green-600">Username available!</p>}
                  {availability === "taken" && <p className="text-xs text-red-600">Username taken — try another</p>}
                  {availability === "invalid" && <p className="text-xs text-amber-600">Letters, numbers, underscores only, 3-20 chars</p>}
                  <p className="text-xs text-muted-foreground">
                    Letters, numbers, and underscores. 3-20 characters.
                  </p>
                </div>
                <Button type="submit" className="w-full" disabled={loading}>
                  {loading ? "Setting up..." : "Continue"}
                </Button>
              </form>
            </CardContent>
          </>
        ) : (
          <>
            <CardHeader className="text-center">
              <CardTitle className="flex items-center justify-center gap-2">
                <Sparkles className="w-5 h-5 text-primary" /> Pick a starting template
              </CardTitle>
              <CardDescription>Choose a look for your page — you can change everything later. We'll add a few starter links too.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 max-h-[55vh] overflow-y-auto pr-1">
                {templates.map((t) => {
                  const selected = selectedTemplate === t.id
                  const locked = t.isPro && !isPro
                  return (
                    <button
                      key={t.id}
                      type="button"
                      disabled={locked}
                      onClick={() => !locked && setSelectedTemplate(selected ? null : t.id)}
                      className={cn(
                        "relative flex flex-col rounded-xl border-2 overflow-hidden text-left transition-all group",
                        selected
                          ? "border-primary shadow-lg ring-2 ring-primary/30"
                          : "border-border hover:border-primary/50 hover:shadow-md",
                        locked && "opacity-50 cursor-not-allowed"
                      )}
                    >
                      <div className={cn("h-16 bg-gradient-to-br flex items-center p-2.5", t.previewGradient)}>
                        <span className="text-xl">{t.emoji}</span>
                        <div className="flex gap-1 ml-auto">
                          <div className={cn("w-2.5 h-2.5 rounded-full", t.previewAccent)} />
                          <div className={cn("w-2.5 h-2.5 rounded-full opacity-60", t.previewAccent)} />
                        </div>
                      </div>
                      <div className="p-2.5 bg-card">
                        <p className="text-xs font-semibold flex items-center gap-1">
                          {t.name}
                          {t.isPro && <Crown className="w-3 h-3 text-yellow-500" />}
                        </p>
                      </div>
                      {selected && (
                        <div className="absolute top-1.5 left-1.5 w-5 h-5 rounded-full bg-primary flex items-center justify-center">
                          <Check className="w-3 h-3 text-white" />
                        </div>
                      )}
                    </button>
                  )
                })}
              </div>
              {error && <p className="text-sm text-red-600 mt-3">{error}</p>}
              <div className="flex items-center gap-2 mt-4">
                <Button variant="ghost" type="button" onClick={() => setStep("username")} disabled={loading}>
                  Back
                </Button>
                <Button variant="outline" type="button" onClick={finishSetup} disabled={loading} className="flex-1">
                  Skip &amp; use default
                </Button>
                <Button type="button" onClick={finishSetup} disabled={loading} className="flex-1">
                  {loading ? "Setting up..." : selectedTemplate ? "Use this template" : "Finish"}
                </Button>
              </div>
            </CardContent>
          </>
        )}
      </Card>
    </div>
  )
}
