import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import prisma from "@/lib/prisma"
import { z } from "zod"

const qrSchema = z.object({
  type: z.enum(["profile", "link", "custom"]).default("link"),
  label: z.string().min(1).max(50),
  linkId: z.string().optional(),
  data: z.string().url().optional(),
  style: z.record(z.any()).optional(),
})

export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const qrCodes = await prisma.qRCode.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: "desc" },
  })

  return NextResponse.json(qrCodes)
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const body = await req.json()
  const parsed = qrSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 })
  }

  let data = parsed.data.data
  if (!data && parsed.data.linkId) {
    const link = await prisma.link.findFirst({
      where: { id: parsed.data.linkId, userId: session.user.id },
    })
    if (!link) {
      return NextResponse.json({ error: "Link not found" }, { status: 404 })
    }
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://flolio.vercel.app"
    data = `${siteUrl}/${link.url}`
  }

  if (!data) {
    return NextResponse.json({ error: "data or linkId required" }, { status: 400 })
  }

  const qrCode = await prisma.qRCode.create({
    data: {
      type: parsed.data.type,
      label: parsed.data.label,
      linkId: parsed.data.linkId || null,
      data,
      style: parsed.data.style || {},
      userId: session.user.id,
    },
  })

  return NextResponse.json(qrCode)
}