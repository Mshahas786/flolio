import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import prisma from "@/lib/prisma"
import { z } from "zod"
import crypto from "crypto"

const webhookSchema = z.object({
  url: z.string().url(),
  events: z.array(z.enum([
    "link_click",
    "page_view",
    "email_capture",
    "product_view",
    "product_buy",
    "booking_created",
    "smart_link_click",
    "qr_scan",
  ])).min(1),
  secret: z.string().optional(),
})

export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const webhooks = await prisma.webhook.findMany({
    where: { userId: session.user.id },
    include: {
      logs: {
        orderBy: { createdAt: "desc" },
        take: 20,
      },
    },
    orderBy: { createdAt: "desc" },
  })

  return NextResponse.json(webhooks)
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const body = await req.json()
  const parsed = webhookSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 })
  }

  const secret = parsed.data.secret || crypto.randomBytes(32).toString("hex")

  const webhook = await prisma.webhook.create({
    data: {
      ...parsed.data,
      secret,
      userId: session.user.id,
    },
  })

  return NextResponse.json(webhook)
}