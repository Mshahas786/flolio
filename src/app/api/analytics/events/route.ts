import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import prisma from "@/lib/prisma"
import { z } from "zod"

const eventSchema = z.object({
  linkId: z.string().optional(),
  event: z.enum([
    "page_view",
    "link_click",
    "email_capture",
    "product_view",
    "product_buy",
    "embed_play",
    "social_click",
    "qr_scan",
    "smart_link_click",
    "booking_click",
  ]),
  metadata: z.record(z.any()).optional(),
  sessionId: z.string().optional(),
  country: z.string().optional(),
  device: z.string().optional(),
  referrer: z.string().optional(),
})

export async function POST(req: Request) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const body = await req.json()
  const parsed = eventSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 })
  }

  await prisma.analyticsEvent.create({
    data: {
      ...parsed.data,
      userId: session.user.id,
    },
  })

  return NextResponse.json({ success: true })
}

export async function GET(req: Request) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { searchParams } = new URL(req.url)
  const days = parseInt(searchParams.get("days") || "30")
  const eventType = searchParams.get("event")
  const linkId = searchParams.get("linkId")

  const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000)

  const where: any = {
    userId: session.user.id,
    timestamp: { gte: since },
  }
  if (eventType) where.event = eventType
  if (linkId) where.linkId = linkId

  const events = await prisma.analyticsEvent.findMany({
    where,
    orderBy: { timestamp: "desc" },
    take: 10000,
  })

  // Aggregate by day
  const byDay = events.reduce((acc, e) => {
    const day = e.timestamp.toISOString().split("T")[0]
    acc[day] = (acc[day] || 0) + 1
    return acc
  }, {} as Record<string, number>)

  // Aggregate by event type
  const byEvent = events.reduce((acc, e) => {
    acc[e.event] = (acc[e.event] || 0) + 1
    return acc
  }, {} as Record<string, number>)

  // Aggregate by country
  const byCountry = events.reduce((acc, e) => {
    if (e.country) {
      acc[e.country] = (acc[e.country] || 0) + 1
    }
    return acc
  }, {} as Record<string, number>)

  // Aggregate by device
  const byDevice = events.reduce((acc, e) => {
    if (e.device) {
      acc[e.device] = (acc[e.device] || 0) + 1
    }
    return acc
  }, {} as Record<string, number>)

  return NextResponse.json({
    events,
    summary: {
      total: events.length,
      byDay,
      byEvent,
      byCountry,
      byDevice,
    },
  })
}