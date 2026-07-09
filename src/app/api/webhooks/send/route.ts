import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import prisma from "@/lib/prisma"
import crypto from "crypto"

async function sendWebhook(webhook: any, event: string, payload: any) {
  const timestamp = Date.now().toString()
  const payloadStr = JSON.stringify(payload)
  const signature = crypto
    .createHmac("sha256", webhook.secret)
    .update(`${timestamp}.${payloadStr}`)
    .digest("hex")

  try {
    const res = await fetch(webhook.url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Webhook-Signature": signature,
        "X-Webhook-Timestamp": timestamp,
        "X-Webhook-Event": event,
        "User-Agent": "Flolio-Webhook/1.0",
      },
      body: payloadStr,
    })

    await prisma.webhookLog.create({
      data: {
        webhookId: webhook.id,
        event,
        payload,
        status: res.ok ? "success" : "failed",
        response: res.statusText,
        attempts: 1,
      },
    })

    return res.ok
  } catch (error: any) {
    await prisma.webhookLog.create({
      data: {
        webhookId: webhook.id,
        event,
        payload,
        status: "failed",
        response: error.message,
        attempts: 1,
      },
    })
    return false
  }
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { webhookId, event, payload } = await req.json()

  const webhook = await prisma.webhook.findFirst({
    where: { id: webhookId, userId: session.user.id, isActive: true },
  })

  if (!webhook) {
    return NextResponse.json({ error: "Webhook not found" }, { status: 404 })
  }

  if (!webhook.events.includes(event)) {
    return NextResponse.json({ error: "Event not subscribed" }, { status: 400 })
  }

  const success = await sendWebhook(webhook, event, payload)

  return NextResponse.json({ success })
}