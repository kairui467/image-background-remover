import { NextResponse } from "next/server"
import { getUserCredits, incrementUserCredits } from "@/lib/kv"

export const runtime = 'edge'

export async function POST(req: Request) {
  try {
    console.log('[remove-bg-mock] POST request received')
    
    // 从 middleware 设置的请求头中获取用户 ID
    const userId = req.headers.get('x-user-id')
    console.log('[remove-bg-mock] User ID from header:', userId)

    if (!userId) {
      console.log('[remove-bg-mock] No user ID found')
      return NextResponse.json({ 
        error: "未登录", 
        code: "AUTH_001",
        details: "No x-user-id header" 
      }, { status: 401 })
    }

    console.log('[remove-bg-mock] Getting credits for user:', userId)
    const credits = await getUserCredits(userId)
    console.log('[remove-bg-mock] Current credits:', credits.credits)
    
    if (credits.credits <= 0) {
      console.log('[remove-bg-mock] Insufficient credits')
      return NextResponse.json({ 
        error: "额度不足", 
        code: "CREDITS_002",
        details: `Current credits: ${credits.credits}` 
      }, { status: 402 })
    }

    const formData = await req.formData()
    const file = formData.get('image') as File
    if (!file) {
      console.log('[remove-bg-mock] No image file provided')
      return NextResponse.json({ 
        error: "未上传图片", 
        code: "INPUT_003",
        details: "No image file in request" 
      }, { status: 400 })
    }

    console.log('[remove-bg-mock] Processing file:', file.name, 'size:', file.size)

    // 模拟处理延迟（500ms）
    await new Promise(resolve => setTimeout(resolve, 500))

    // 读取原始图片数据
    const imageBuffer = await file.arrayBuffer()

    // 扣减额度
    console.log('[remove-bg-mock] Deducting 1 credit from user:', userId)
    const updatedCredits = await incrementUserCredits(userId, -1)
    console.log('[remove-bg-mock] Credits after deduction:', updatedCredits.credits)

    // 返回原图（模拟处理）
    return new NextResponse(imageBuffer, {
      headers: {
        'Content-Type': file.type || 'image/png',
        'Content-Disposition': 'attachment; filename="mock-result.png"',
      },
    })
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : String(error)
    console.error('[remove-bg-mock] Error:', errorMsg)
    console.error('[remove-bg-mock] Error stack:', error instanceof Error ? error.stack : 'No stack')
    
    return NextResponse.json({ 
      error: "服务器错误", 
      code: "MOCK_500",
      details: errorMsg 
    }, { status: 500 })
  }
}
