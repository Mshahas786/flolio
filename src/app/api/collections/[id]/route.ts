import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import prisma from "@/lib/prisma"
import { z } from "zod"

const collectionSchema = z.object({
  name: z.string().min(1).max(50).optional(),
  slug: z.string().min(1).max(50).regex(/^[a-z0-9-]+$/).optional(),
  description: z.string().max(500).optional(),
  color: z.string().regex(/^#[0-9A-Fa-f]{6}$/).optional(),
  icon: z.string().optional(),
  isActive: z.boolean().optional(),
})

export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const collection = await prisma.linkCollection.findFirst({
    where: { id: params.id, userId: session.user.id },
    include: {
      links: {
        orderBy: { order: "asc" },
      },
    },
  })

  if (!collection) {
    return NextResponse.json({ error: "Not found" }, { status: 404 })
  }

  return NextResponse.json(collection)
}

export async function PATCH(
  req: Request,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const body = await req.json()
  const parsed = collectionSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 })
  }

  if (parsed.data.slug) {
    const existing = await prisma.linkCollection.findFirst({
      where: { userId: session.user.id, slug: parsed.data.slug, NOT: { id: params.id } },
    })
    if (existing) {
      return NextResponse.json({ error: "Slug already in use" }, { status: 400 })
    }
  }

  const collection = await prisma.linkCollection.update({
    where: { id: params.id, userId: session.user.id },
    data: parsed.data,
  })

  return NextResponse.json(collection)
}

export async function DELETE(
  req: Request,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  await prisma.linkCollection.delete({
    where: { id: params.id, userId: session.user.id },
  })

  return NextResponse.json({ success: true })
}