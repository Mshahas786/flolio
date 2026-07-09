import { NextResponse } from "next/server"
import prisma from "@/lib/prisma"
import { headers } from "next/headers"

async function getClientInfo() {
  const headersList = headers()
  const forwarded = headersList.get("x-forwarded-for")
  const ip = forwarded ? forwarded.split(",")[0] : headersList.get("x-real-ip") || "unknown"
  
  const userAgent = headersList.get("user-agent") || ""
  const isMobile = /mobile|android|iphone|ipad|phone/i.test(userAgent)
  const isTablet = /tablet|ipad/i.test(userAgent)
  const device = isMobile ? "mobile" : isTablet ? "tablet" : "desktop"
  
  // Get country from Cloudflare/CloudFront headers or use a geo IP service
  const country = headersList.get("cf-ipcountry") || headersList.get("x-vercel-ip-country") || "US"
  
  return { ip, userAgent, device, country }
}

interface SmartLinkItemWithLink {
  id: string
  smartLinkId: string
  linkId: string
  weight: number
  country: string | null
  device: string | null
  variant: string | null
  order: number
  createdAt: Date
  link: {
    id: string
    userId: string
    title: string
    url: string
    icon: string | null
    imageUrl: string | null
    section: string | null
    isActive: boolean
    order: number
    clicks: number
    startsAt: Date | null
    expiresAt: Date | null
    utmSource: string | null
    utmMedium: string | null
    utmCampaign: string | null
    utmContent: string | null
    gateType: string | null
    gateValue: string | null
    createdAt: Date
    updatedAt: Date
    pageId: string | null
    collectionId: string | null
  }
}

interface SmartLinkWithItems {
  id: string
  userId: string
  name: string
  slug: string
  description: string | null
  type: string
  config: any
  isActive: boolean
  clicks: number
  conversions: number
  createdAt: Date
  updatedAt: Date
  items: SmartLinkItemWithLink[]
}

export async function GET(
  req: Request,
  { params }: { params: { slug: string } }
) {
  try {
    const smartLink = await prisma.smartLink.findFirst({
      where: { slug: params.slug, isActive: true },
      include: {
        items: {
          include: { link: true },
          orderBy: { order: "asc" },
        },
      },
    }) as SmartLinkWithItems | null

    if (!smartLink) {
      return NextResponse.redirect(new URL("/404", req.url))
    }

    const { device, country } = await getClientInfo()
    let destinationLink: SmartLinkItemWithLink["link"] | null = null

    switch (smartLink.type) {
      case "rotation": {
        // Weighted random selection
        const totalWeight = smartLink.items.reduce((sum: number, item: SmartLinkItemWithLink) => sum + item.weight, 0)
        let random = Math.random() * totalWeight
        for (const item of smartLink.items) {
          random -= item.weight
          if (random <= 0) {
            destinationLink = item.link
            break
          }
        }
        break
      }

      case "geo": {
        // Geo-based routing
        const geoItem = smartLink.items.find(item => 
          item.country && item.country.toLowerCase() === country.toLowerCase()
        )
        if (geoItem) {
          destinationLink = geoItem.link
        } else {
          // Fallback to first item
          destinationLink = smartLink.items[0]?.link || null
        }
        break
      }

      case "device": {
        // Device-based routing
        const deviceItem = smartLink.items.find(item => item.device === device)
        if (deviceItem) {
          destinationLink = deviceItem.link
        } else {
          destinationLink = smartLink.items[0]?.link || null
        }
        break
      }

      case "ab_test": {
        // A/B testing - consistent assignment based on IP
        const hash = await crypto.subtle.digest(
          "SHA-256",
          new TextEncoder().encode(req.headers.get("x-forwarded-for") || "anonymous")
        )
        const hashArray = Array.from(new Uint8Array(hash))
        const hashValue = hashArray.reduce((acc: number, byte: number) => (acc * 256 + byte) % 100, 0)
        
        const variant = hashValue < 50 ? "A" : "B"
        const variantItem = smartLink.items.find(item => item.variant === variant)
        destinationLink = variantItem?.link || smartLink.items[0]?.link || null
        break
      }

      case "schedule": {
        // Time-based routing
        const now = new Date()
        const config = smartLink.config as any
        const scheduledItem = smartLink.items.find(item => {
          const schedule = config?.schedules?.[item.linkId]
          if (!schedule) return false
          const start = schedule.start ? new Date(schedule.start) : null
          const end = schedule.end ? new Date(schedule.end) : null
          return (!start || now >= start) && (!end || now <= end)
        })
        destinationLink = scheduledItem?.link || smartLink.items[0]?.link || null
        break
      }

      case "conditional": {
        // Conditional routing based on config rules
        const config = smartLink.config as any
        for (const item of smartLink.items) {
          const conditions = config?.conditions?.[item.linkId]
          if (!conditions) continue
          
          let matches = true
          if (conditions.countries && !conditions.countries.includes(country)) matches = false
          if (conditions.devices && !conditions.devices.includes(device)) matches = false
          if (conditions.timeRanges) {
            const now = new Date()
            const currentHour = now.getHours()
            const inRange = conditions.timeRanges.some((range: any) => 
              currentHour >= range.start && currentHour < range.end
            )
            if (!inRange) matches = false
          }
          if (matches) {
            destinationLink = item.link
            break
          }
        }
        if (!destinationLink) {
          destinationLink = smartLink.items[0]?.link || null
        }
        break
      }
    }

    if (!destinationLink || !destinationLink.isActive) {
      return NextResponse.redirect(new URL("/404", req.url))
    }

    // Track the click
    await Promise.all([
      prisma.smartLink.update({
        where: { id: smartLink.id },
        data: { clicks: { increment: 1 } },
      }),
      prisma.link.update({
        where: { id: destinationLink.id },
        data: { clicks: { increment: 1 } },
      }),
      prisma.analyticsEvent.create({
        data: {
          userId: smartLink.userId,
          linkId: destinationLink.id,
          event: "smart_link_click",
          metadata: { smartLinkId: smartLink.id, type: smartLink.type },
          device,
          country,
        },
      }),
    ])

    // Build URL with UTM parameters
    const url = new URL(destinationLink.url)
    if (destinationLink.utmSource) url.searchParams.set("utm_source", destinationLink.utmSource)
    if (destinationLink.utmMedium) url.searchParams.set("utm_medium", destinationLink.utmMedium)
    if (destinationLink.utmCampaign) url.searchParams.set("utm_campaign", destinationLink.utmCampaign)
    if (destinationLink.utmContent) url.searchParams.set("utm_content", destinationLink.utmContent)
    url.searchParams.set("utm_smartlink", smartLink.slug)

    return NextResponse.redirect(url.toString())
  } catch (error) {
    console.error("Smart link error:", error)
    return NextResponse.redirect(new URL("/404", req.url))
  }
}