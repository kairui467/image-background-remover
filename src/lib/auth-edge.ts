/**
 * 从 middleware 传来的请求头中提取用户 ID
 * NextAuth middleware 会在验证成功后将 user ID 添加到请求头中
 */
export function getUserIdFromRequest(request: Request): string | null {
  // NextAuth 在 middleware 中验证成功后，会将用户信息存在 session 中
  // 我们可以通过自定义头部传递用户 ID
  const userId = request.headers.get('x-user-id')
  return userId
}
