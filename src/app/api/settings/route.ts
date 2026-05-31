import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import prisma from "@/lib/prisma"

export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: {
      name: true,
      email: true,
      username: true,
      bio: true,
      avatarUrl: true,
      socialImage: true,
      theme: true,
      accentColor: true,
      showBranding: true,
      buttonStyle: true,
      bioAlignment: true,
      buttonTextColor: true,
      backgroundColor: true,
      avatarShape: true,
      fontFamily: true,
      fontSize: true,
      linkBorderWidth: true,
      linkShadow: true,
      linkSpacing: true,
      layoutMode: true,
      hoverEffect: true,
      showAvatar: true,
      showBio: true,
      headerImageUrl: true,
      customCss: true,
      isLocked: true,
      pagePassword: true,
      buttonBorderColor: true,
      buttonFontWeight: true,
      countdownTitle: true,
      countdownDate: true,
      enableEmailCapture: true,
      emailCaptureTitle: true,
      metaTitle: true,
      metaDescription: true,
      ogImageUrl: true,
      tipEnabled: true,
      tipVenmo: true,
      tipPayPal: true,
      tipCashApp: true,
      dashboardTourDone: true,
      showInstagramGrid: true,
      gridColumns: true,
      customDomain: true,
      domainVerified: true,
    },
  })

  return NextResponse.json(user)
}

export async function PATCH(req: Request) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const data = await req.json()
  const allowed = ["name", "bio", "avatarUrl", "socialImage", "theme", "accentColor", "showBranding", "buttonStyle", "bioAlignment", "buttonTextColor", "backgroundColor", "avatarShape", "fontFamily", "fontSize", "linkBorderWidth", "linkShadow", "linkSpacing", "layoutMode", "hoverEffect", "showAvatar", "showBio", "headerImageUrl", "customCss", "isLocked", "pagePassword", "buttonBorderColor", "buttonFontWeight", "countdownTitle", "enableEmailCapture", "emailCaptureTitle", "metaTitle", "metaDescription", "ogImageUrl", "tipEnabled", "tipVenmo", "tipPayPal", "tipCashApp", "dashboardTourDone", "showInstagramGrid", "gridColumns", "username"]

  const updateData: Record<string, any> = {}
  for (const key of allowed) {
    if (data[key] !== undefined) {
      updateData[key] = data[key]
    }
  }

  if (data.username !== undefined) {
    const username = data.username
    if (!username || !username.match(/^[a-zA-Z0-9_]{3,20}$/)) {
      return NextResponse.json({ error: "Invalid username format (3-20 chars, letters, numbers, underscores)" }, { status: 400 })
    }
    const existing = await prisma.user.findUnique({ where: { username } })
    if (existing && existing.id !== session.user.id) {
      return NextResponse.json({ error: "Username already taken" }, { status: 409 })
    }
  }
  if (data.countdownDate !== undefined) {
    updateData.countdownDate = data.countdownDate ? new Date(data.countdownDate) : null
  }

  const user = await prisma.user.update({
    where: { id: session.user.id },
    data: updateData,
  })

  return NextResponse.json(user)
}
