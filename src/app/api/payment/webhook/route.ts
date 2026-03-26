import { NextResponse } from "next/server"

export const runtime = 'nodejs'

export async function POST(req: Request) {
  try {
    const body = await req.text()
    const event = JSON.parse(body) as {
      event_type: string
      resource: {
        billing_agreement_id?: string
        id?: string
      }
    }

    // Webhook 事件记录（后续接入数据库时补充）
    console.log("PayPal Webhook event:", event.event_type, event.resource?.id)

    return NextResponse.json({ received: true })
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: "Webhook 处理失败" }, { status: 500 })
  }
}
