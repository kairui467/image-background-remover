import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export const runtime = 'edge'

export async function POST(req: Request) {
  try {
    const body = await req.text()
    const event = JSON.parse(body) as {
      event_type: string
      resource: {
        billing_agreement_id?: string
        id?: string
        amount?: { total: string }
      }
    }

    switch (event.event_type) {
      case "PAYMENT.CAPTURE.COMPLETED": {
        const captureId = event.resource.id
        if (captureId) {
          await prisma.payment.updateMany({
            where: { paypalCaptureId: captureId },
            data: { status: "COMPLETED" },
          })
        }
        break
      }

      case "PAYMENT.CAPTURE.DENIED":
      case "PAYMENT.CAPTURE.REFUNDED": {
        const captureId = event.resource.id
        if (captureId) {
          await prisma.payment.updateMany({
            where: { paypalCaptureId: captureId },
            data: { status: event.event_type === "PAYMENT.CAPTURE.REFUNDED" ? "REFUNDED" : "FAILED" },
          })
        }
        break
      }

      case "BILLING.SUBSCRIPTION.CANCELLED":
      case "BILLING.SUBSCRIPTION.EXPIRED": {
        const subscriptionId = event.resource.billing_agreement_id
        if (subscriptionId) {
          await prisma.subscription.updateMany({
            where: { id: subscriptionId },
            data: {
              status: "CANCELLED",
              cancelledAt: new Date(),
            },
          })
          const sub = await prisma.subscription.findFirst({
            where: { id: subscriptionId },
          })
          if (sub) {
            await prisma.user.update({
              where: { id: sub.userId },
              data: { planType: "FREE", planExpiresAt: null },
            })
          }
        }
        break
      }
    }

    return NextResponse.json({ received: true })
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: "Webhook 处理失败" }, { status: 500 })
  }
}
