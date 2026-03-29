import { NextResponse } from "next/server"
import { getUserCredits, incrementUserCredits } from "@/lib/kv"
import { auth } from "@/auth"

// 使用 Node.js Runtime 而不是 Edge，这样可以访问 process.env
export const runtime = 'nodejs'

export async function POST(req: Request) {
  try {
    // 使用 NextAuth 的内置 auth() 函数获取 session
    const session = await auth()

    if (!session || !session.user) {
      return NextResponse.json({ error: "未登录" }, { status: 401 })
    }

    const userId = session.user.id
    if (!userId) {
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
        'X-API-Key': process.env.REMOVE_BG_API_KEY || 'D7qTp9zbZKRApPDdGhCnbZuf',
      },
      body: removeFormData,
    })

    if (!removeRes.ok) {
      const errorText = await removeRes.text()
      console.error('Remove.bg API error:', removeRes.status, errorText)
      
      if (removeRes.status === 403) {
        return NextResponse.json({ error: "API Key 无效或已过期", details: "Please check your remove.bg API key" }, { status: 403 })
      }
      
      return NextResponse.json({ error: "处理图片失败", details: errorText }, { status: removeRes.status })
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
    return NextResponse.json({ error: "服务器错误", details: error instanceof Error ? error.message : 'Unknown' }, { status: 500 })
  }
}
