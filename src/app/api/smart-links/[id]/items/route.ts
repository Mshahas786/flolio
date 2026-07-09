import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import prisma from "@/lib/prisma"
import { z } from "zod"

const itemSchema = z.object({
  linkId: z.string(),
  weight: z.number().min(1).max(100).default(100),
  country: z.string().optional(),
  device: z.enum(["mobile", "desktop", "tablet"]).optional(),
  variant: z.enum(["A", "B"]).optional(),
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

  const smartLink = await prisma.smartLink.findFirst({
    where: { id: params.id, userId: session.user.id },
  })
  if (!smartLink) {
    return NextResponse.json({ error: "Smart link not found" }, { status: 404 })
  }

  const body = await req.json()
  const parsed = itemSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 })
  }

  const link = await prisma.link.findFirst({
    where: { id: parsed.data.linkId, userId: session.user.id },
  })
  if (!link) {
    return NextResponse.json({ error: "Link not found" }, { status: 404 })
  }

  const maxOrder = await prisma.smartLinkItem.aggregate({
    where: { smartLinkId: params.id },
    _max: { order: true },
  })

  const item = await prisma.smartLinkItem.create({
    data: {
      smartLinkId: params.id,
      linkId: parsed.data.linkId,
      weight: parsed.data.weight,
      country: parsed.data.country,
      device: parsed.data.device,
      variant: parsed.data.variant,
      order: parsed.data.order ?? (maxOrder._max.order ?? -1) + 1,
    },
    include: { link: true },
  })

  return NextResponse.json(item)
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
  const itemId = searchParams.get("itemId")
  if (!itemId) {
    return NextResponse.json({ error: "itemId required" }, { status: 400 })
  }

  await prisma.smartLinkItem.delete({
    where: { id: itemId, smartLinkId: params.id },
  })

  return NextResponse.json({ success: true })
}