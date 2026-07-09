import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import prisma from "@/lib/prisma"
import { z } from "zod"

const smartLinkSchema = z.object({
  name: z.string().min(1).max(50),
  slug: z.string().min(1).max(50).regex(/^[a-z0-9-]+$/),
  description: z.string().max(500).optional(),
  type: z.enum(["rotation", "geo", "device", "ab_test", "schedule", "conditional"]).default("rotation"),
  config: z.record(z.any()).optional(),
})

export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const smartLinks = await prisma.smartLink.findMany({
    where: { userId: session.user.id },
    include: {
      items: {
        include: { link: true },
        orderBy: { order: "asc" },
      },
    },
    orderBy: { createdAt: "desc" },
  })

  return NextResponse.json(smartLinks)
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const body = await req.json()
  const parsed = smartLinkSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 })
  }

  const existing = await prisma.smartLink.findFirst({
    where: { userId: session.user.id, slug: parsed.data.slug },
  })
  if (existing) {
    return NextResponse.json({ error: "Slug already in use" }, { status: 400 })
  }

  const smartLink = await prisma.smartLink.create({
    data: {
      ...parsed.data,
      userId: session.user.id,
      config: parsed.data.config || {},
    },
  })

  return NextResponse.json(smartLink)
}