import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import prisma from "@/lib/prisma"

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const username = searchParams.get("username")

  if (!username || !username.match(/^[a-zA-Z0-9_]{3,20}$/)) {
    return NextResponse.json({ available: false, reason: "invalid" })
  }

  const session = await getServerSession(authOptions)
  const existing = await prisma.user.findUnique({ where: { username } })
  const available = !existing || (session?.user?.id === existing.id)
  return NextResponse.json({ available })
}
