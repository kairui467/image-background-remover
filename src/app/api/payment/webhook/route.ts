import { NextResponse } from "next/server"

export const runtime = 'edge'

export async function POST(req: Request) {
  try {
    const body = await req.text()
    const event = JSON.parse(body) as {
      event_type: string
      resource: { id?: string }
    }

    console.log("PayPal Webhook event:", event.event_type, event.resource?.id)

    return NextResponse.json({ received: true })
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: "Webhook 处理失败" }, { status: 500 })
  }
}
