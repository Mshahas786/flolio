import { NextResponse } from "next/server"
import prisma from "@/lib/prisma"
import { headers } from "next/headers"

async function getClientInfo() {
  const headersList = headers()
  const forwarded = headersList.get("x-forwarded-for")
  const ip = forwarded ? forwarded.split(",")[0] : headersList.get("x-real-ip") || "unknown"
  
  const userAgent = headersList.get("user-agent") || ""
  const isMobile = /mobile|android|iphone|ipad|phone/i.test(userAgent)
  const isTablet = /tablet|ipad/i.test(userAgent)
  const device = isMobile ? "mobile" : isTablet ? "tablet" : "desktop"
  
  const country = headersList.get("cf-ipcountry") || headersList.get("x-vercel-ip-country") || "US"
  
  return { ip, userAgent, device, country }
}

export async function GET(
  req: Request,
  { params }: { params: { code: string } }
) {
  try {
    const affiliate = await prisma.affiliateLink.findUnique({
      where: { code: params.code, isActive: true },
      include: { link: true },
    })

    if (!affiliate || !affiliate.link.isActive) {
      return NextResponse.redirect(new URL("/404", req.url))
    }

    const { device, country } = await getClientInfo()
    const referrer = headers().get("referer") || ""

    await Promise.all([
      prisma.affiliateLink.update({
        where: { id: affiliate.id },
        data: { clicks: { increment: 1 } },
      }),
      prisma.affiliateClick.create({
        data: {
          affiliateId: affiliate.id,
          device,
          country,
          referrer,
        },
      }),
      prisma.link.update({
        where: { id: affiliate.linkId },
        data: { clicks: { increment: 1 } },
      }),
    ])

    // Build URL with UTM parameters
    const url = new URL(affiliate.link.url)
    if (affiliate.link.utmSource) url.searchParams.set("utm_source", affiliate.link.utmSource)
    if (affiliate.link.utmMedium) url.searchParams.set("utm_medium", affiliate.link.utmMedium)
    if (affiliate.link.utmCampaign) url.searchParams.set("utm_campaign", affiliate.link.utmCampaign)
    if (affiliate.link.utmContent) url.searchParams.set("utm_content", affiliate.link.utmContent)
    url.searchParams.set("utm_affiliate", affiliate.code)
    url.searchParams.set("aff", affiliate.code)

    return NextResponse.redirect(url.toString())
  } catch (error) {
    console.error("Affiliate click error:", error)
    return NextResponse.redirect(new URL("/404", req.url))
  }
}