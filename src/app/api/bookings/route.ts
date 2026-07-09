import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import prisma from "@/lib/prisma"
import { z } from "zod"

const bookingSchema = z.object({
  provider: z.enum(["calendly", "calcom", "savvycal", "custom"]),
  url: z.string().url(),
  embedCode: z.string().optional(),
  title: z.string().min(1).max(100),
  description: z.string().optional(),
  duration: z.number().min(15).max(480).default(30),
})

export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const bookings = await prisma.booking.findMany({
    where: { userId: session.user.id },
    include: {
      bookings: {
        orderBy: { startTime: "desc" },
        take: 50,
      },
    },
    orderBy: { createdAt: "desc" },
  })

  return NextResponse.json(bookings)
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const body = await req.json()
  const parsed = bookingSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 })
  }

  const existing = await prisma.booking.findFirst({
    where: { userId: session.user.id, provider: parsed.data.provider },
  })
  if (existing) {
    return NextResponse.json({ error: "Provider already connected" }, { status: 400 })
  }

  const booking = await prisma.booking.create({
    data: {
      ...parsed.data,
      userId: session.user.id,
    },
  })

  return NextResponse.json(booking)
}