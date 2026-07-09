import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import prisma from "@/lib/prisma"
import { z } from "zod"

const proofSchema = z.object({
  type: z.enum(["testimonial", "review", "tweet", "video", "logo", "metric"]),
  authorName: z.string().min(1).max(100),
  authorRole: z.string().optional(),
  authorImage: z.string().url().optional().or(z.literal("")),
  content: z.string().min(1).max(2000),
  rating: z.number().min(1).max(5).optional(),
  sourceUrl: z.string().url().optional().or(z.literal("")),
  isFeatured: z.boolean().default(false),
})

export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const proofs = await prisma.socialProof.findMany({
    where: { userId: session.user.id },
    orderBy: [{ isFeatured: "desc" }, { order: "asc" }, { createdAt: "desc" }],
  })

  return NextResponse.json(proofs)
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const body = await req.json()
  const parsed = proofSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 })
  }

  const proof = await prisma.socialProof.create({
    data: {
      ...parsed.data,
      userId: session.user.id,
      authorImage: parsed.data.authorImage || null,
      sourceUrl: parsed.data.sourceUrl || null,
    },
  })

  return NextResponse.json(proof)
}