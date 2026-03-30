import { NextRequest, NextResponse } from "next/server"
import { jwtVerify } from "jose"
import { getUserRecords } from "@/lib/kv"

export const runtime = 'edge'

async function getUserIdFromRequest(req: NextRequest): Promise<string | null> {
  let userId = req.headers.get('x-user-id')
  if (userId) return userId
  
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

    const url = new URL(req.url)
    const limit = parseInt(url.searchParams.get('limit') || '10')
    
    const records = await getUserRecords(userId, limit)
    
    return NextResponse.json({
      records,
      total: records.length,
      page: 1,
      limit,
    })
  } catch (error) {
    console.error('[records] Error:', error)
    return NextResponse.json(
      { error: "服务器错误", details: error instanceof Error ? error.message : 'Unknown' },
      { status: 500 }
    )
  }
}
