import { auth } from "@/auth"
import { NextResponse } from "next/server"
import { capturePayPalOrder } from "@/lib/paypal"

export const runtime = 'edge'

export async function GET(req: Request) {
  try {
    const url = new URL(req.url)
    const orderId = url.searchParams.get("token")

    if (!orderId) {
      return NextResponse.redirect(new URL("/pricing?error=missing_order", req.url))
    }

    const session = await auth()
    if (!session?.user?.email) {
      return NextResponse.redirect(new URL("/pricing?error=unauthorized", req.url))
    }

    const capture = await capturePayPalOrder(orderId)
    if (capture.status !== "COMPLETED") {
      return NextResponse.redirect(new URL("/pricing?error=payment_failed", req.url))
    }

    return NextResponse.redirect(new URL("/profile?payment=success", req.url))
  } catch (error) {
    console.error(error)
    return NextResponse.redirect(new URL("/pricing?error=server_error", req.url))
  }
}
