import NextAuth from "next-auth"
import Google from "next-auth/providers/google"
import { PrismaAdapter } from "@auth/prisma-adapter"
import { PrismaClient } from "@prisma/client"

// Cloudflare Pages (Edge) 上的 Auth.js 最佳实践
// 我们暂时不使用 Prisma Adapter，直到解决了 Cloudflare 上的 D1 或数据库适配器连接问题
// 为了演示和快速验证，我们先使用 JWT 策略，不落地存储到数据库

export const { handlers, auth, signIn, signOut } = NextAuth({
  secret: process.env.AUTH_SECRET || "736936d5c65f8426d5c65f8426d5c65f",
  providers: [
    Google({
      clientId: process.env.AUTH_GOOGLE_ID,
      clientSecret: process.env.AUTH_GOOGLE_SECRET,
    }),
  ],
  session: {
    strategy: "jwt",
  },
  callbacks: {
    async session({ session, token }) {
      if (token.sub && session.user) {
        session.user.id = token.sub;
      }
      return session;
    },
  },
})
