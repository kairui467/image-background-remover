import { auth } from "@/auth"
import { NextResponse } from "next/server"
import { createPayPalOrder } from "@/lib/paypal"
import { prisma } from "@/lib/prisma"

export const runtime = 'edge'

const PRICING = {
  PRO_MONTHLY: { amount: "3.99", credits: 200 },
  PRO_YEARLY: { amount: "39.99", credits: 2400 },
  CREDITS_SMALL: { amount: "1.39", credits: 10 },
  CREDITS_MEDIUM: { amount: "2.79", credits: 25 },
  CREDITS_LARGE: { amount: "6.99", credits: 100 },
  CREDITS_XLARGE: { amount: "13.99", credits: 300 },
}

export async function POST(req: Request) {
  try {
    const session = await auth()
    if (!session?.user?.email) {
      return NextResponse.json({ error: "未登录" }, { status: 401 })
    }

    const { planType } = await req.json() as { planType: string }
    const pricing = PRICING[planType as keyof typeof PRICING]

    if (!pricing) {
      return NextResponse.json({ error: "无效的方案" }, { status: 400 })
    }

    const order = await createPayPalOrder(
      pricing.amount,
      planType,
      `购买: ${planType}`
    )

    const approveLink = order.links.find((l: { rel: string }) => l.rel === "approve_link")

    return NextResponse.json({
      orderId: order.id,
      approveUrl: approveLink?.href,
    })
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: "创建订单失败" }, { status: 500 })
  }
}
