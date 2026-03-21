'use client'
import { signIn, signOut, useSession } from "next-auth/react"
import Link from "next/link"

export default function UserMenu() {
  const { data: session, status } = useSession()

  if (status === "loading") {
    return <div className="animate-pulse bg-gray-200 h-8 w-20 rounded-lg"></div>
  }

  if (!session) {
    return (
      <button 
        onClick={() => signIn("google")}
        className="text-sm bg-blue-600 text-white rounded-lg px-4 py-2 hover:bg-blue-700 transition-colors shadow-sm"
      >
        使用 Google 登录
      </button>
    )
  }

  return (
    <div className="flex items-center gap-3">
      <Link href="/profile" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
        <img src={session.user?.image ?? ""} alt="avatar" className="w-8 h-8 rounded-full border border-gray-200" />
        <span className="text-sm text-gray-700 font-medium hidden sm:inline">{session.user?.name}</span>
      </Link>
      
      <Link href="/profile" className="text-sm bg-purple-100 text-purple-700 font-semibold px-3 py-1.5 rounded-lg hover:bg-purple-200 transition-colors">
        个人中心
      </Link>
      
      <button 
        onClick={() => signOut()}
        className="text-sm border border-gray-300 text-gray-600 rounded-lg px-3 py-1.5 hover:bg-red-50 hover:text-red-500 transition-colors"
      >
        退出
      </button>
    </div>
  )
}
