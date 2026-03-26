import { auth } from "@/auth"
import { NextResponse } from "next/server"
import { capturePayPalOrder } from "@/lib/paypal"
import { incrementUserCredits } from "@/lib/kv"

export const runtime = 'edge'

const PRICING: Record<string, { amount: number; credits: number }> = {
  PRO_MONTHLY: { amount: 3.99, credits: 200 },
  PRO_YEARLY: { amount: 39.99, credits: 2400 },
  CREDITS_SMALL: { amount: 1.39, credits: 10 },
  CREDITS_MEDIUM: { amount: 2.79, credits: 25 },
  CREDITS_LARGE: { amount: 6.99, credits: 100 },
  CREDITS_XLARGE: { amount: 13.99, credits: 300 },
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

    // 更新用户额度
    await incrementUserCredits(session.user.id, pricing.credits)

    return NextResponse.redirect(new URL("/profile?payment=success", req.url))
  } catch (error) {
    console.error("Payment capture error:", error)
    return NextResponse.redirect(new URL("/pricing?error=server_error", req.url))
  }
}
