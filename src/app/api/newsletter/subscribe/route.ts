import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import prisma from "@/lib/prisma"

export async function POST(req: Request) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { newsletterId, email, name, source, metadata } = await req.json()
  if (!newsletterId || !email) {
    return NextResponse.json({ error: "newsletterId and email required" }, { status: 400 })
  }

  const newsletter = await prisma.newsletter.findFirst({
    where: { id: newsletterId, userId: session.user.id },
  })
  if (!newsletter) {
    return NextResponse.json({ error: "Newsletter not found" }, { status: 404 })
  }

  // Check if already subscribed
  const existing = await prisma.newsletterSub.findUnique({
    where: { newsletterId_email: { newsletterId, email } },
  })

  if (existing) {
    if (existing.status === "subscribed") {
      return NextResponse.json({ error: "Already subscribed" }, { status: 400 })
    }
    // Reactivate
    const updated = await prisma.newsletterSub.update({
      where: { id: existing.id },
      data: { status: "subscribed", name: name || existing.name, source, metadata, subscribedAt: new Date(), unsubscribedAt: null },
    })
    return NextResponse.json(updated)
  }

  const subscriber = await prisma.newsletterSub.create({
    data: { newsletterId, email, name, source, metadata },
  })

  // Sync with provider
  await syncToProvider(newsletter, subscriber)

  return NextResponse.json(subscriber)
}

async function syncToProvider(newsletter: any, subscriber: any) {
  if (!newsletter.isConnected || !newsletter.apiKey) return

  try {
    switch (newsletter.provider) {
      case "mailchimp":
        await syncMailchimp(newsletter, subscriber)
        break
      case "convertkit":
        await syncConvertKit(newsletter, subscriber)
        break
      case "beehiiv":
        await syncBeehiiv(newsletter, subscriber)
        break
      case "kit":
        await syncKit(newsletter, subscriber)
        break
      case "buttdown":
        await syncButtondown(newsletter, subscriber)
        break
    }
  } catch (error) {
    console.error("Provider sync error:", error)
  }
}

async function syncMailchimp(newsletter: any, subscriber: any) {
  const [dc] = newsletter.apiKey.split("-")
  const url = `https://${dc}.api.mailchimp.com/3.0/lists/${newsletter.listId}/members`
  
  await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${newsletter.apiKey}`,
    },
    body: JSON.stringify({
      email_address: subscriber.email,
      status: newsletter.doubleOptIn ? "pending" : "subscribed",
      merge_fields: { FNAME: subscriber.name || "" },
    }),
  })
}

async function syncConvertKit(newsletter: any, subscriber: any) {
  const url = `https://api.convertkit.com/v3/forms/${newsletter.listId}/subscribe`
  
  await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      api_key: newsletter.apiKey,
      email: subscriber.email,
      first_name: subscriber.name || "",
      tags: ["flolio"],
    }),
  })
}

async function syncBeehiiv(newsletter: any, subscriber: any) {
  const url = `https://api.beehiiv.com/v2/publications/${newsletter.listId}/subscriptions`
  
  await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${newsletter.apiKey}`,
    },
    body: JSON.stringify({
      email: subscriber.email,
      name: subscriber.name || "",
      reactivate_existing: true,
      send_welcome_email: newsletter.doubleOptIn,
    }),
  })
}

async function syncKit(newsletter: any, subscriber: any) {
  const url = `https://api.kit.com/v3/forms/${newsletter.listId}/subscribe`
  
  await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      api_key: newsletter.apiKey,
      email: subscriber.email,
      first_name: subscriber.name || "",
    }),
  })
}

async function syncButtondown(newsletter: any, subscriber: any) {
  const url = "https://api.buttondown.email/v1/subscribers"
  
  await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${newsletter.apiKey}`,
    },
    body: JSON.stringify({
      email: subscriber.email,
      name: subscriber.name || "",
      tags: ["flolio"],
    }),
  })
}