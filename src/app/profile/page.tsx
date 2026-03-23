'use client'

import { useSession, signOut } from "next-auth/react"
import { useRouter } from "next/navigation"
import { useEffect } from "react"

export default function ProfilePage() {
  const { data: session, status } = useSession()
  const router = useRouter()

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/")
    }
  }, [status, router])

  if (status === "loading") {
    return <div className="flex items-center justify-center min-h-screen">加载中...</div>
  }

  if (!session) {
    return null
  }

  return (
    <main className="min-h-screen bg-gradient-to-b from-slate-50 to-white px-4 py-10">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">个人中心</h1>

        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-8">
          <div className="flex items-center gap-4 mb-8">
            {session.user?.image && (
              <img
                src={session.user.image}
                alt="avatar"
                className="w-16 h-16 rounded-full border-2 border-blue-500"
              />
            )}
            <div>
              <p className="text-sm text-gray-500">用户名</p>
              <p className="text-2xl font-bold text-gray-900">{session.user?.name}</p>
            </div>
          </div>

          <div className="space-y-4 mb-8">
            <div>
              <p className="text-sm text-gray-500">邮箱</p>
              <p className="text-lg text-gray-900">{session.user?.email}</p>
            </div>
          </div>

          <button
            onClick={() => signOut({ redirect: true, callbackUrl: "/" })}
            className="w-full bg-red-600 hover:bg-red-700 text-white font-medium py-3 rounded-xl transition-colors"
          >
            退出登录
          </button>
        </div>
      </div>
    </main>
  )
}
