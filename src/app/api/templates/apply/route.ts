import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import prisma from "@/lib/prisma"
import { getTemplate } from "@/lib/templates"
import { socialPlatforms, buildSocialUrl } from "@/lib/social"

export async function POST(req: Request) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { templateId, includeContent } = await req.json()

  const template = getTemplate(templateId)
  if (!template) {
    return NextResponse.json({ error: "Template not found" }, { status: 404 })
  }

  const a = template.appearance

  await prisma.user.update({
    where: { id: session.user.id },
    data: {
      theme: a.theme,
      accentColor: a.accentColor,
      buttonStyle: a.buttonStyle,
      bioAlignment: a.bioAlignment,
      fontFamily: a.fontFamily,
      fontSize: a.fontSize,
      linkBorderWidth: a.linkBorderWidth,
      linkShadow: a.linkShadow,
      linkSpacing: a.linkSpacing,
      layoutMode: a.layoutMode,
      hoverEffect: a.hoverEffect,
      ...(a.buttonTextColor ? { buttonTextColor: a.buttonTextColor } : {}),
      ...(a.backgroundColor ? { backgroundColor: a.backgroundColor } : {}),
      ...(a.avatarShape ? { avatarShape: a.avatarShape } : {}),
      ...(a.showAvatar !== undefined ? { showAvatar: a.showAvatar } : {}),
      ...(a.showBio !== undefined ? { showBio: a.showBio } : {}),
      ...(a.buttonFontWeight ? { buttonFontWeight: a.buttonFontWeight } : {}),
    },
  })

  let seededLinks = 0
  let seededSocial = 0

  if (includeContent) {
    const [linkCount, socialCount] = await Promise.all([
      prisma.link.count({ where: { userId: session.user.id } }),
      prisma.socialLink.count({ where: { userId: session.user.id } }),
    ])

    const seedingLinks = linkCount === 0 && template.links.length > 0
    const seedingSocial = socialCount === 0 && template.social.length > 0

    if (seedingLinks) {
      await prisma.link.createMany({
        data: template.links.map((l, i) => ({
          userId: session.user.id,
          title: l.title,
          url: l.url,
          icon: l.icon || null,
          section: l.section || null,
          order: i,
          isActive: true,
        })),
      })
      seededLinks = template.links.length
    }

    if (seedingSocial) {
      const valid = template.social.filter((s) =>
        socialPlatforms.some((p) => p.id === s.platform)
      )
      if (valid.length > 0) {
        await prisma.socialLink.createMany({
          data: valid.map((s, i) => {
            const platform = socialPlatforms.find((p) => p.id === s.platform)!
            return {
              userId: session.user.id,
              platform: s.platform,
              handle: s.handle,
              url: buildSocialUrl(platform, s.handle),
              order: i,
            }
          }),
        })
        seededSocial = valid.length
      }
    }
  }

  return NextResponse.json({
    success: true,
    seededLinks,
    seededSocial,
    seeded: seededLinks > 0 || seededSocial > 0,
  })
}
