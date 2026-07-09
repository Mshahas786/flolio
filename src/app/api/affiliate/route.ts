import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import prisma from "@/lib/prisma"
import { z } from "zod"
import crypto from "node:crypto"

const affiliateSchema = z.object({
  linkId: z.string(),
  commissionRate: z.number().min(1).max(50).default(10),
})

export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const affiliates = await prisma.affiliateLink.findMany({
    where: { userId: session.user.id },
    include: {
      link: true,
      affiliateClicks: {
        orderBy: { timestamp: "desc" },
        take: 50,
      },
    },
    orderBy: { createdAt: "desc" },
  })

  return NextResponse.json(affiliates)
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const body = await req.json()
  const parsed = affiliateSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 })
  }

  const link = await prisma.link.findFirst({
    where: { id: parsed.data.linkId, userId: session.user.id },
  })
  if (!link) {
    return NextResponse.json({ error: "Link not found" }, { status: 404 })
  }

  const existing = await prisma.affiliateLink.findFirst({
    where: { userId: session.user.id, linkId: parsed.data.linkId },
  })
  if (existing) {
    return NextResponse.json({ error: "Affiliate link already exists" }, { status: 400 })
  }

  const code = `AFF-${crypto.randomBytes(4).toString("hex").toUpperCase()}`

  const affiliate = await prisma.affiliateLink.create({
    data: {
      ...parsed.data,
      code,
      userId: session.user.id,
    },
    include: { link: true },
  })

  return NextResponse.json(affiliate)
}