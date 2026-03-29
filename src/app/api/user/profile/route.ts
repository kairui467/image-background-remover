import { NextResponse } from "next/server"
import { getUserCredits } from "@/lib/kv"

export const runtime = 'edge'

export async function GET(req: Request) {
  try {
    // 从 middleware 设置的请求头中获取用户 ID
    const userId = req.headers.get('x-user-id')
    
    if (!userId) {
      console.log('[profile] No user ID found')
      return NextResponse.json(
        { error: "未登录" },
        { status: 401 }
      )
    }

    console.log('[profile] Getting credits for user:', userId)
    const credits = await getUserCredits(userId)

    const response = {
      user: {
        id: userId,
        name: null,
        email: null,
        image: null,
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
    }
    console.log('[profile] Response:', response)
    
    return NextResponse.json(response)
  } catch (error) {
    console.error('[profile] Error:', error)
    return NextResponse.json(
      { error: "服务器错误", details: error instanceof Error ? error.message : 'Unknown' },
      { status: 500 }
    )
  }
}
