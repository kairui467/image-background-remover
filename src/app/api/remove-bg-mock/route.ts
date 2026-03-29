import { NextResponse } from "next/server"
import { getUserCredits, incrementUserCredits } from "@/lib/kv"
import { jwtVerify } from "jose"

export const runtime = 'edge'

const secret = new TextEncoder().encode(process.env.AUTH_SECRET || 'default-secret-key-for-edge-runtime')

export async function POST(req: Request) {
  try {
    // 从 cookie 中获取 token
    const cookieHeader = req.headers.get('cookie') || ''
    const tokenMatch = cookieHeader.match(/authjs\.session-token=([^;]+)/)
    const token = tokenMatch?.[1]

    if (!token) {
      return NextResponse.json({ error: "未登录", details: "No session token found" }, { status: 401 })
    }

    // 解析 JWT
    let userId: string
    try {
      const verified = await jwtVerify(token, secret)
      userId = verified.payload.sub as string
      if (!userId) {
        return NextResponse.json({ error: "token 无效", details: "No user ID in token" }, { status: 401 })
      }
    } catch (e) {
      const errorMsg = e instanceof Error ? e.message : 'Unknown error'
      return NextResponse.json({ error: "token 无效", details: errorMsg }, { status: 401 })
    }

    const credits = await getUserCredits(userId)
    if (credits.credits <= 0) {
      return NextResponse.json({ error: "额度不足" }, { status: 402 })
    }

    const formData = await req.formData()
    const file = formData.get('image') as File
    if (!file) {
      return NextResponse.json({ error: "未上传图片" }, { status: 400 })
    }

    // 模拟处理延迟（500ms）
    await new Promise(resolve => setTimeout(resolve, 500))

    // 读取原始图片数据
    const imageBuffer = await file.arrayBuffer()

    // 扣减额度
    await incrementUserCredits(userId, -1)

    // 返回原图（模拟处理）
    return new NextResponse(imageBuffer, {
      headers: {
        'Content-Type': file.type || 'image/png',
        'Content-Disposition': 'attachment; filename="mock-result.png"',
      },
    })
  } catch (error) {
    console.error('Mock Remove BG error:', error)
    return NextResponse.json({ error: "服务器错误" }, { status: 500 })
  }
}
