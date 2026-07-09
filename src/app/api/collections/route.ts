import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import prisma from "@/lib/prisma"
import { z } from "zod"

const collectionSchema = z.object({
  name: z.string().min(1).max(50),
  slug: z.string().min(1).max(50).regex(/^[a-z0-9-]+$/),
  description: z.string().max(500).optional(),
  color: z.string().regex(/^#[0-9A-Fa-f]{6}$/).default("#6366f1"),
  icon: z.string().optional(),
  isActive: z.boolean().default(true),
})

export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const collections = await prisma.linkCollection.findMany({
    where: { userId: session.user.id },
    include: {
      links: {
        orderBy: { order: "asc" },
      },
    },
    orderBy: { order: "asc" },
  })

  return NextResponse.json(collections)
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const body = await req.json()
  const parsed = collectionSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 })
  }

  const existing = await prisma.linkCollection.findFirst({
    where: { userId: session.user.id, slug: parsed.data.slug },
  })
  if (existing) {
    return NextResponse.json({ error: "Slug already in use" }, { status: 400 })
  }

  const maxOrder = await prisma.linkCollection.aggregate({
    where: { userId: session.user.id },
    _max: { order: true },
  })

  const collection = await prisma.linkCollection.create({
    data: {
      ...parsed.data,
      userId: session.user.id,
      order: (maxOrder._max.order ?? -1) + 1,
    },
  })

  return NextResponse.json(collection)
}