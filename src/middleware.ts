export { auth as middleware } from "@/auth"

export const config = {
  matcher: ["/api/remove-bg"], // 保护 API 路由
}
