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
    return NextResponse.json({ error: "服务器错误", details: error instanceof Error ? error.message : 'Unknown' }, { status: 500 })
  }
}
