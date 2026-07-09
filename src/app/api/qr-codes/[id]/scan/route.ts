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

export async function POST(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const qrCode = await prisma.qRCode.findUnique({
      where: { id: params.id, isActive: true },
    })

    if (!qrCode) {
      return NextResponse.json({ error: "QR code not found" }, { status: 404 })
    }

    const { device, country } = await getClientInfo()
    const referrer = headers().get("referer") || ""

    await Promise.all([
      prisma.qRCode.update({
        where: { id: qrCode.id },
        data: { scans: { increment: 1 } },
      }),
      prisma.qRScan.create({
        data: {
          qrCodeId: qrCode.id,
          country,
          device,
          referrer,
        },
      }),
      prisma.analyticsEvent.create({
        data: {
          userId: qrCode.userId,
          linkId: qrCode.linkId,
          event: "qr_scan",
          metadata: { qrCodeId: qrCode.id, qrCodeLabel: qrCode.label },
          device,
          country,
          referrer,
        },
      }),
    ])

    return NextResponse.json({ success: true, redirectUrl: qrCode.data })
  } catch (error) {
    console.error("QR scan error:", error)
    return NextResponse.json({ error: "Scan tracking failed" }, { status: 500 })
  }
}