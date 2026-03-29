import { NextRequest, NextResponse } from "next/server"
import { jwtVerify } from "jose"

export const runtime = 'edge'

async function getUserIdFromRequest(req: NextRequest): Promise<string | null> {
  // 先尝试从请求头
  let userId = req.headers.get('x-user-id')
  if (userId) return userId
  
  // 尝试从 cookie 解析 JWT
  const cookieHeader = req.headers.get('cookie') || ''
  const tokenMatch = cookieHeader.match(/authjs\.session-token=([^;]+)/)
  const token = tokenMatch?.[1]
  
  if (token) {
    try {
      const secret = new TextEncoder().encode('vT2df4N49gnJ1vXLDYkl/wGWlGkcNg1VxyQK2HjqKbQ=')
      const verified = await jwtVerify(token, secret)
      return verified.payload.sub as string
    } catch (e) {
      console.error('[records] Failed to verify token:', e)
    }
  }
  
  return null
}

export async function GET(req: NextRequest) {
  try {
    const userId = await getUserIdFromRequest(req)

    if (!userId) {
      return NextResponse.json(
        { error: "未登录" },
        { status: 401 }
      )
    }

    // 暂时返回空列表（无数据库连接）
    return NextResponse.json({
      records: [],
      total: 0,
      page: 1,
      limit: 10,
    })
  } catch (error) {
    console.error('[records] Error:', error)
    return NextResponse.json(
      { error: "服务器错误", details: error instanceof Error ? error.message : 'Unknown' },
      { status: 500 }
    )
  }
}
