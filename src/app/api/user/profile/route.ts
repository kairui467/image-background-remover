import { auth } from "@/auth"
import { NextResponse } from "next/server"

export const runtime = 'edge'

export async function GET() {
  try {
    const session = await auth()

    if (!session?.user?.email) {
      return NextResponse.json(
        { error: "未登录" },
        { status: 401 }
      )
    }

    return NextResponse.json({
      user: {
        id: session.user.id ?? "",
        name: session.user.name ?? null,
        email: session.user.email,
        image: session.user.image ?? null,
        createdAt: new Date().toISOString(),
      },
      credits: {
        remaining: 0,
        total: 3,
        used: 3,
      },
      plan: {
        type: "FREE",
        expiresAt: null,
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
