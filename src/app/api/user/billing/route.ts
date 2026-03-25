import { auth } from "@/auth"
import { NextRequest, NextResponse } from "next/server"

export const runtime = 'edge'

export async function GET(req: NextRequest) {
  try {
    const session = await auth()

    if (!session?.user?.email) {
      return NextResponse.json(
        { error: "未登录" },
        { status: 401 }
      )
    }

    // 暂时返回空列表（无数据库连接）
    return NextResponse.json({
      bills: [],
      total: 0,
      page: 1,
      limit: 10,
    })
  } catch (error) {
    console.error(error)
    return NextResponse.json(
      { error: "服务器错误" },
      { status: 500 }
    )
  }
}
