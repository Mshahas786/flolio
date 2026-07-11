import { NextResponse } from "next/server"
import { stripe } from "@/lib/stripe"
import prisma from "@/lib/prisma"

export async function POST(req: Request) {
  const { productId, buyerEmail } = await req.json()

  if (!productId) {
    return NextResponse.json({ error: "Product ID required" }, { status: 400 })
  }

  const product = await prisma.product.findUnique({
    where: { id: productId },
    include: { user: { select: { username: true } } },
  })

  if (!product || !product.isActive) {
    return NextResponse.json({ error: "Product not found" }, { status: 404 })
  }

  const username = product.user?.username

  const session = await stripe.checkout.sessions.create({
    mode: "payment",
    line_items: [
      {
        price_data: {
          currency: "usd",
          product_data: {
            name: product.title,
            description: product.description || undefined,
            images: product.imageUrl ? [product.imageUrl] : [],
          },
          unit_amount: product.price,
        },
        quantity: 1,
      },
    ],
    metadata: { productId: product.id, userId: product.userId },
    ...(buyerEmail ? { customer_email: buyerEmail } : {}),
    success_url: `${process.env.APP_URL || "http://localhost:3000"}/purchase/success?productId=${product.id}${username ? `&username=${username}` : ""}`,
    cancel_url: `${process.env.APP_URL || "http://localhost:3000"}/purchase/cancel${username ? `?username=${username}` : ""}`,
  })

  return NextResponse.json({ url: session.url })
}
