import { auth } from "@/auth"
import { NextResponse } from "next/server"
import { getUserCredits, incrementUserCredits } from "@/lib/kv"

export const runtime = 'nodejs'

export async function POST(req: Request) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: "未登录" }, { status: 401 })
    }

    const credits = await getUserCredits(session.user.id)
    if (credits.credits <= 0) {
      return NextResponse.json({ error: "额度不足" }, { status: 402 })
    }

    const formData = await req.formData()
    const file = formData.get('image') as File
    if (!file) {
      return NextResponse.json({ error: "未上传图片" }, { status: 400 })
    }

    // 调用背景移除 API（使用 remove.bg 或其他服务）
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
      console.error('Remove.bg API error:', removeRes.status, await removeRes.text())
      return NextResponse.json({ error: "处理失败" }, { status: 500 })
    }

    // 扣除额度
    await incrementUserCredits(session.user.id, -1)

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
