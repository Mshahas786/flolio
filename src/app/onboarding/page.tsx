"use client"

import { useState, useEffect, useRef } from "react"
import { useRouter } from "next/navigation"
import { useSession } from "next-auth/react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Check, X, Loader2 } from "lucide-react"

export default function OnboardingPage() {
  const router = useRouter()
  const { data: session, status, update } = useSession()
  const [username, setUsername] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)
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

    if (availability === "taken") {
      setError("Username already taken — please choose another")
      setLoading(false)
      return
    }

    try {
      const res = await fetch("/api/onboarding", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username }),
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
      <Card className="w-full max-w-lg">
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
              {loading ? "Setting up..." : "Create My Page"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
