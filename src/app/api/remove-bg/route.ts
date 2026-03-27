import { NextResponse } from "next/server"
import { getUserCredits, incrementUserCredits } from "@/lib/kv"
import { jwtVerify } from "jose"

export const runtime = 'edge'

const secret = new TextEncoder().encode(process.env.AUTH_SECRET || 'secret')

export async function POST(req: Request) {
  try {
    // 从 cookie 中获取 token
    const cookieHeader = req.headers.get('cookie') || ''
    const tokenMatch = cookieHeader.match(/authjs\.session-token=([^;]+)/)
    const token = tokenMatch?.[1]

    if (!token) {
      return NextResponse.json({ error: "未登录" }, { status: 401 })
    }

    // 解析 JWT
    let userId: string
    try {
      const verified = await jwtVerify(token, secret)
      userId = verified.payload.sub as string
    } catch {
      return NextResponse.json({ error: "token 无效" }, { status: 401 })
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

    const removeFormData = new FormData()
    removeFormData.append('image_file', file)
    removeFormData.append('size', 'auto')

    const removeRes = await fetch('https://api.remove.bg/v1.0/removebg', {
      method: 'POST',
      headers: {
        'X-API-Key': 'D7qTp9zbZKRApPDdGhCnbZuf',
      },
      body: removeFormData,
    })

    if (!removeRes.ok) {
      return NextResponse.json({ error: "处理失败" }, { status: 500 })
    }

    await incrementUserCredits(userId, -1)

    const imageBuffer = await removeRes.arrayBuffer()
    return new NextResponse(imageBuffer, {
      headers: {
        'Content-Type': 'image/png',
        'Content-Disposition': 'attachment; filename="result.png"',
      },
    })
  } catch (error) {
    console.error('Remove BG error:', error)
    return NextResponse.json({ error: "服务器错误" }, { status: 500 })
  }
}
