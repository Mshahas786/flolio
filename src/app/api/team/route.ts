import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import prisma from "@/lib/prisma"
import { z } from "zod"

const inviteSchema = z.object({
  email: z.string().email(),
  role: z.enum(["admin", "editor", "viewer", "analyst"]).default("editor"),
})

export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const members = await prisma.teamMember.findMany({
    where: { userId: session.user.id },
    include: {
      member: {
        select: { id: true, name: true, email: true, image: true, username: true },
      },
    },
    orderBy: { invitedAt: "desc" },
  })

  return NextResponse.json(members)
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const body = await req.json()
  const parsed = inviteSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 })
  }

  // Find user by email
  const member = await prisma.user.findUnique({
    where: { email: parsed.data.email },
    select: { id: true, name: true, email: true, image: true, username: true },
  })

  if (!member) {
    return NextResponse.json({ error: "User not found" }, { status: 404 })
  }

  if (member.id === session.user.id) {
    return NextResponse.json({ error: "Cannot invite yourself" }, { status: 400 })
  }

  const existing = await prisma.teamMember.findUnique({
    where: { userId_memberId: { userId: session.user.id, memberId: member.id } },
  })
  if (existing) {
    return NextResponse.json({ error: "Already a team member" }, { status: 400 })
  }

  const teamMember = await prisma.teamMember.create({
    data: {
      userId: session.user.id,
      memberId: member.id,
      role: parsed.data.role,
      status: "pending",
    },
    include: { member: true },
  })

  // TODO: Send invitation email

  return NextResponse.json(teamMember)
}