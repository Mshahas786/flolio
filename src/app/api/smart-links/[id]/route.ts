import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import prisma from "@/lib/prisma"
import { z } from "zod"

const smartLinkSchema = z.object({
  name: z.string().min(1).max(50).optional(),
  slug: z.string().min(1).max(50).regex(/^[a-z0-9-]+$/).optional(),
  description: z.string().max(500).optional(),
  type: z.enum(["rotation", "geo", "device", "ab_test", "schedule", "conditional"]).optional(),
  config: z.record(z.any()).optional(),
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

  const smartLink = await prisma.smartLink.findFirst({
    where: { id: params.id, userId: session.user.id },
    include: {
      items: {
        include: { link: true },
        orderBy: { order: "asc" },
      },
    },
  })

  if (!smartLink) {
    return NextResponse.json({ error: "Not found" }, { status: 404 })
  }

  return NextResponse.json(smartLink)
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
  const parsed = smartLinkSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 })
  }

  if (parsed.data.slug) {
    const existing = await prisma.smartLink.findFirst({
      where: { userId: session.user.id, slug: parsed.data.slug, NOT: { id: params.id } },
    })
    if (existing) {
      return NextResponse.json({ error: "Slug already in use" }, { status: 400 })
    }
  }

  const smartLink = await prisma.smartLink.update({
    where: { id: params.id, userId: session.user.id },
    data: parsed.data,
  })

  return NextResponse.json(smartLink)
}

export async function DELETE(
  req: Request,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  await prisma.smartLink.delete({
    where: { id: params.id, userId: session.user.id },
  })

  return NextResponse.json({ success: true })
}