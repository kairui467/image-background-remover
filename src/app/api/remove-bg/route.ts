import { NextResponse } from "next/server"
import { getUserCredits, incrementUserCredits } from "@/lib/kv"

export const runtime = 'edge'

export async function POST(req: Request) {
  try {
    // 从 middleware 设置的请求头中获取用户 ID
    const userId = req.headers.get('x-user-id')

    if (!userId) {
      return NextResponse.json({ error: "未登录" }, { status: 401 })
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

    // 硬编码 API Key（Edge Runtime 无法读取 process.env）
    const removeRes = await fetch('https://api.remove.bg/v1.0/removebg', {
      method: 'POST',
      headers: {
        'X-API-Key': 'D7qTp9zbZKRApPDdGhCnbZuf',
      },
      body: removeFormData,
    })

    if (!removeRes.ok) {
      const errorText = await removeRes.text()
      console.error('Remove.bg API error:', removeRes.status, errorText)
      
      if (removeRes.status === 403) {
        return NextResponse.json({ error: "API Key 无效或已过期" }, { status: 403 })
      }
      
      return NextResponse.json({ error: "处理图片失败" }, { status: removeRes.status })
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
