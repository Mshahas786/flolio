import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import prisma from "@/lib/prisma"
import { z } from "zod"

const addLinkSchema = z.object({
  linkId: z.string(),
  order: z.number().optional(),
})

export async function POST(
  req: Request,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const body = await req.json()
  const parsed = addLinkSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 })
  }

  const collection = await prisma.linkCollection.findFirst({
    where: { id: params.id, userId: session.user.id },
  })
  if (!collection) {
    return NextResponse.json({ error: "Collection not found" }, { status: 404 })
  }

  const link = await prisma.link.findFirst({
    where: { id: parsed.data.linkId, userId: session.user.id },
  })
  if (!link) {
    return NextResponse.json({ error: "Link not found" }, { status: 404 })
  }

  // Check if link is already in this collection
  if (link.collectionId === params.id) {
    return NextResponse.json({ error: "Link already in collection" }, { status: 400 })
  }

  const maxOrder = await prisma.link.aggregate({
    where: { collectionId: params.id },
    _max: { order: true },
  })

  const updatedLink = await prisma.link.update({
    where: { id: parsed.data.linkId },
    data: {
      collectionId: params.id,
      order: parsed.data.order ?? (maxOrder._max.order ?? -1) + 1,
    },
  })

  return NextResponse.json(updatedLink)
}

export async function DELETE(
  req: Request,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { searchParams } = new URL(req.url)
  const linkId = searchParams.get("linkId")
  if (!linkId) {
    return NextResponse.json({ error: "linkId required" }, { status: 400 })
  }

  await prisma.link.update({
    where: { id: linkId, userId: session.user.id },
    data: { collectionId: null },
  })

  return NextResponse.json({ success: true })
}