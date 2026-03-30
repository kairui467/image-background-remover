import { auth } from "@/auth"
import { NextResponse } from "next/server"
import { capturePayPalOrder } from "@/lib/paypal"
import { incrementUserCredits, addBill, addBillToIndex } from "@/lib/kv"

export const runtime = 'edge'

const PRICING: Record<string, { amount: number; credits: number; name: string }> = {
  PRO_MONTHLY: { amount: 3.99, credits: 200, name: "专业版月付" },
  PRO_YEARLY: { amount: 39.99, credits: 2400, name: "专业版年付" },
  CREDITS_SMALL: { amount: 1.39, credits: 10, name: "积分小包" },
  CREDITS_MEDIUM: { amount: 2.79, credits: 25, name: "积分中包" },
  CREDITS_LARGE: { amount: 6.99, credits: 100, name: "积分大包" },
  CREDITS_XLARGE: { amount: 13.99, credits: 300, name: "积分超大包" },
}

export async function GET(req: Request) {
  try {
    const url = new URL(req.url)
    const orderId = url.searchParams.get("token")
    const planType = url.searchParams.get("planType") || "CREDITS_SMALL"

    if (!orderId) {
      return NextResponse.redirect(new URL("/pricing?error=missing_order", req.url))
    }

    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.redirect(new URL("/pricing?error=unauthorized", req.url))
    }

    const capture = await capturePayPalOrder(orderId)
    if (capture.status !== "COMPLETED") {
      return NextResponse.redirect(new URL("/pricing?error=payment_failed", req.url))
    }

    const pricing = PRICING[planType]
    if (!pricing) {
      return NextResponse.redirect(new URL("/pricing?error=invalid_plan", req.url))
    }

    await incrementUserCredits(session.user.id, pricing.credits)

    // 添加账单记录
    const billId = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
    const bill = {
      id: billId,
      date: new Date().toLocaleString('zh-CN'),
      item: pricing.name,
      amount: `$${pricing.amount}`,
      status: "success",
    }
    
    try {
      await addBill(session.user.id, bill)
      await addBillToIndex(session.user.id, billId)
    } catch (billError) {
      console.error('Failed to add bill:', billError)
    }

    return NextResponse.redirect(new URL("/profile?payment=success", req.url))
  } catch (error) {
    console.error("Payment capture error:", error)
    return NextResponse.redirect(new URL("/pricing?error=server_error", req.url))
  }
}
