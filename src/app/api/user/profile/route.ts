import { NextResponse } from "next/server"
import { getUserCredits } from "@/lib/kv"
import { jwtVerify } from "jose"

export const runtime = 'edge'

export async function GET(req: Request) {
  try {
    // 先尝试从 middleware 设置的请求头中获取用户 ID
    let userId = req.headers.get('x-user-id')
    console.log('[profile] User ID from header:', userId)
    
    // 如果没有，尝试从 cookie 中读取 NextAuth session token
    if (!userId) {
      console.log('[profile] No x-user-id header, trying to parse JWT from cookie')
      const cookieHeader = req.headers.get('cookie') || ''
      const tokenMatch = cookieHeader.match(/authjs\.session-token=([^;]+)/)
      const token = tokenMatch?.[1]
      
      if (token) {
        try {
          // 注意：这里我们需要 AUTH_SECRET，但在 Edge Runtime 中无法可靠读取 process.env
          // 作为临时方案，直接使用硬编码的密钥
          const secret = new TextEncoder().encode('vT2df4N49gnJ1vXLDYkl/wGWlGkcNg1VxyQK2HjqKbQ=')
          const verified = await jwtVerify(token, secret)
          userId = verified.payload.sub as string
          console.log('[profile] Extracted user ID from token:', userId)
        } catch (e) {
          console.error('[profile] Failed to verify token:', e)
        }
      }
    }
    
    if (!userId) {
      console.log('[profile] No user ID found (no header, no token)')
      return NextResponse.json(
        { error: "未登录", details: "No user ID found" },
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
    console.log('[profile] Response credits:', credits)
    
    return NextResponse.json(response)
  } catch (error) {
    console.error('[profile] Error:', error)
    return NextResponse.json(
      { error: "服务器错误", details: error instanceof Error ? error.message : 'Unknown' },
      { status: 500 }
    )
  }
}
