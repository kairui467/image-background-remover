import { auth } from "@/auth"
import { NextResponse } from "next/server"
import { getUserCredits } from "@/lib/kv"

export const runtime = 'edge'

export async function GET() {
  try {
    const session = await auth()

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "未登录" },
        { status: 401 }
      )
    }

    const credits = await getUserCredits(session.user.id)

    return NextResponse.json({
      user: {
        id: session.user.id,
        name: session.user.name ?? null,
        email: session.user.email,
        image: session.user.image ?? null,
        createdAt: new Date().toISOString(),
      },
      credits: {
        remaining: credits.credits,
        total: 3,
        used: credits.totalCreditsUsed,
      },
      plan: {
        type: credits.planType,
        expiresAt: credits.planExpiresAt,
      },
    })
  } catch (error) {
    console.error(error)
    return NextResponse.json(
      { error: "服务器错误" },
      { status: 500 }
    )
  }
}
