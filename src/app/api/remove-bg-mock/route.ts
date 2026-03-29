import { NextResponse } from "next/server"
import { getUserCredits, incrementUserCredits } from "@/lib/kv"

export const runtime = 'edge'

export async function POST(req: Request) {
  try {
    console.log('[remove-bg-mock] Request received')
    
    // 从 middleware 设置的请求头中获取用户 ID
    const userId = req.headers.get('x-user-id')
    console.log('[remove-bg-mock] User ID from header:', userId)

    if (!userId) {
      console.log('[remove-bg-mock] No user ID found, checking cookies')
      // 如果没有用户 ID，尝试从 cookie 中获取（备用方案）
      const cookieHeader = req.headers.get('cookie') || ''
      console.log('[remove-bg-mock] Cookies:', cookieHeader.substring(0, 50))
      
      return NextResponse.json({ error: "未登录", details: "No x-user-id header" }, { status: 401 })
    }

    console.log('[remove-bg-mock] Getting credits for user:', userId)
    const credits = await getUserCredits(userId)
    console.log('[remove-bg-mock] Current credits:', credits)
    
    if (credits.credits <= 0) {
      return NextResponse.json({ error: "额度不足" }, { status: 402 })
    }

    const formData = await req.formData()
    const file = formData.get('image') as File
    if (!file) {
      return NextResponse.json({ error: "未上传图片" }, { status: 400 })
    }

    console.log('[remove-bg-mock] Processing file:', file.name, 'size:', file.size)

    // 模拟处理延迟（500ms）
    await new Promise(resolve => setTimeout(resolve, 500))

    // 读取原始图片数据
    const imageBuffer = await file.arrayBuffer()

    // 扣减额度
    console.log('[remove-bg-mock] Deducting 1 credit')
    await incrementUserCredits(userId, -1)

    const updatedCredits = await getUserCredits(userId)
    console.log('[remove-bg-mock] Updated credits:', updatedCredits)

    // 返回原图（模拟处理）
    return new NextResponse(imageBuffer, {
      headers: {
        'Content-Type': file.type || 'image/png',
        'Content-Disposition': 'attachment; filename="mock-result.png"',
      },
    })
  } catch (error) {
    console.error('[remove-bg-mock] Error:', error)
    return NextResponse.json({ error: "服务器错误", details: error instanceof Error ? error.message : 'Unknown' }, { status: 500 })
  }
}
