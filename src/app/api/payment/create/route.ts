import { auth } from "@/auth"
import { NextResponse } from "next/server"
import { createPayPalOrder } from "@/lib/paypal"

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

    // 从请求 URL 动态获取 origin，不依赖环境变量
    const origin = new URL(req.url).origin

    const order = await createPayPalOrder(
      pricing.amount,
      planType,
      `购买: ${planType}`,
      origin,
    )

    if (!order?.links) {
      console.error("PayPal order response:", JSON.stringify(order))
      return NextResponse.json({ error: "PayPal 返回异常" }, { status: 500 })
    }

    // PayPal approve 链接的 rel 可能是 "payer-action" 或 "approve"
    const approveLink = order.links.find(
      (l: { rel: string }) => l.rel === "payer-action" || l.rel === "approve"
    )

    return NextResponse.json({
      orderId: order.id,
      approveUrl: approveLink?.href,
    })
  } catch (error) {
    console.error("Payment create error:", error)
    return NextResponse.json({ error: "创建订单失败" }, { status: 500 })
  }
}
