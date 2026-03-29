import { auth } from "@/auth"
import { NextResponse } from "next/server"

export const config = {
  matcher: ["/api/remove-bg", "/api/remove-bg-mock"],
}

export async function middleware(request: Request) {
  console.log('[middleware] Processing request:', request.url)
  
  // 执行 NextAuth 认证
  const session = await auth()
  console.log('[middleware] Session:', session?.user?.id)
  
  // 如果未认证，返回 401
  if (!session?.user?.id) {
    console.log('[middleware] No session, returning 401')
    return NextResponse.json({ error: "未登录", details: "No session found" }, { status: 401 })
  }

  console.log('[middleware] Session verified, user ID:', session.user.id)

  // 在请求头中添加用户 ID，供 API 路由使用
  const requestHeaders = new Headers(request.headers)
  requestHeaders.set('x-user-id', session.user.id)
  console.log('[middleware] Added x-user-id header:', session.user.id)

  // 继续执行请求
  return NextResponse.next({
    request: {
      headers: requestHeaders,
    },
  })
}
