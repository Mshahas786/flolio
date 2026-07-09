import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import prisma from "@/lib/prisma"
import { z } from "zod"

const newsletterSchema = z.object({
  provider: z.enum(["mailchimp", "convertkit", "beehiiv", "kit", "buttdown", "custom"]),
  apiKey: z.string().optional(),
  listId: z.string().optional(),
  listName: z.string().optional(),
  doubleOptIn: z.boolean().default(true),
  customFields: z.record(z.any()).optional(),
})

export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const newsletters = await prisma.newsletter.findMany({
    where: { userId: session.user.id },
    include: {
      subscribers: {
        where: { status: "subscribed" },
        select: { id: true, email: true, name: true, subscribedAt: true, source: true },
        orderBy: { subscribedAt: "desc" },
        take: 100,
      },
    },
    orderBy: { createdAt: "desc" },
  })

  return NextResponse.json(newsletters)
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const body = await req.json()
  const parsed = newsletterSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 })
  }

  const existing = await prisma.newsletter.findFirst({
    where: { userId: session.user.id, provider: parsed.data.provider },
  })
  if (existing) {
    return NextResponse.json({ error: "Provider already connected" }, { status: 400 })
  }

  const newsletter = await prisma.newsletter.create({
    data: {
      ...parsed.data,
      userId: session.user.id,
      isConnected: !!parsed.data.apiKey,
    },
  })

  return NextResponse.json(newsletter)
}