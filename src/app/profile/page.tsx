'use client'

import { useSession, signOut } from "next-auth/react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { useEffect, useState } from "react"

interface UserProfile {
  user: {
    id: string
    name: string | null
    email: string
    image: string | null
    createdAt: string
  }
  credits: {
    remaining: number
    total: number
    used: number
  }
  plan: {
    type: string
    expiresAt: string | null
  }
}

interface ImageRecord {
  id: string
  fileName: string | null
  status: string
  cost: number
  date: string
}

interface Bill {
  id: string
  date: string
  item: string
  amount: string
  status: string
}

export default function ProfilePage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [activeTab, setActiveTab] = useState("overview")
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [records, setRecords] = useState<ImageRecord[]>([])
  const [bills, setBills] = useState<Bill[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/")
    }
  }, [status, router])

  useEffect(() => {
    if (status === "authenticated") {
      fetchData()
    }
  }, [status])

  const fetchData = async () => {
    try {
      setLoading(true)
      setError(null)

      // 获取用户信息
      const profileRes = await fetch("/api/user/profile")
      if (!profileRes.ok) throw new Error("获取用户信息失败")
      const profileData = await profileRes.json()
      setProfile(profileData)

      // 获取使用记录
      const recordsRes = await fetch("/api/user/records?page=1&limit=10")
      if (!recordsRes.ok) throw new Error("获取使用记录失败")
      const recordsData = await recordsRes.json()
      setRecords(recordsData.records)

      // 获取账单
      const billsRes = await fetch("/api/user/billing?page=1&limit=10")
      if (!billsRes.ok) throw new Error("获取账单失败")
      const billsData = await billsRes.json()
      setBills(billsData.bills)
    } catch (err) {
      setError(err instanceof Error ? err.message : "加载失败")
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  if (status === "loading" || loading) {
    return (
      <main className="min-h-screen bg-gradient-to-b from-slate-50 to-white px-4 py-10">
        <div className="max-w-5xl mx-auto">
          <div className="animate-pulse space-y-4">
            <div className="h-32 bg-gray-200 rounded-xl"></div>
            <div className="h-64 bg-gray-200 rounded-xl"></div>
          </div>
        </div>
      </main>
    )
  }

  if (!session) {
    return null
  }

  if (error) {
    return (
      <main className="min-h-screen bg-gradient-to-b from-slate-50 to-white px-4 py-10">
        <div className="max-w-5xl mx-auto">
          <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl px-6 py-4">
            <p className="font-medium">加载失败</p>
            <p className="text-sm mt-1">{error}</p>
            <button
              onClick={fetchData}
              className="mt-3 text-sm underline text-red-600 hover:text-red-700"
            >
              重试
            </button>
          </div>
        </div>
      </main>
    )
  }

  if (!profile) {
    return null
  }

  const usagePercent = profile.credits.total > 0 ? (profile.credits.used / profile.credits.total) * 100 : 0

  return (
    <main className="min-h-screen bg-gradient-to-b from-slate-50 to-white px-4 py-10">
      <div className="max-w-5xl mx-auto">
        {/* 页面标题 */}
        <div className="mb-8 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">个人中心</h1>
            <p className="text-gray-500 mt-2">管理你的账户和订阅</p>
          </div>
          <button
            onClick={fetchData}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
          >
            🔄 刷新
          </button>
        </div>

        {/* 用户信息卡片 */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              {profile.user.image && (
                <img
                  src={profile.user.image}
                  alt={profile.user.name || "User"}
                  className="w-16 h-16 rounded-full border-2 border-gray-200"
                />
              )}
              <div>
                <h2 className="text-xl font-bold text-gray-900">
                  {profile.user.name || "用户"}
                </h2>
                <p className="text-gray-500">{profile.user.email}</p>
              </div>
            </div>
            <button
              onClick={() => signOut({ redirect: true, callbackUrl: "/" })}
              className="px-4 py-2 border border-gray-300 text-gray-600 rounded-lg hover:bg-red-50 hover:text-red-600 transition-colors"
            >
              退出登录
            </button>
          </div>
        </div>

        {/* 标签页导航 */}
        <div className="flex gap-4 mb-6 border-b border-gray-200">
          <button
            onClick={() => setActiveTab("overview")}
            className={`px-4 py-3 font-medium border-b-2 transition-colors ${
              activeTab === "overview"
                ? "border-blue-600 text-blue-600"
                : "border-transparent text-gray-600 hover:text-gray-900"
            }`}
          >
            概览
          </button>
          <button
            onClick={() => setActiveTab("usage")}
            className={`px-4 py-3 font-medium border-b-2 transition-colors ${
              activeTab === "usage"
                ? "border-blue-600 text-blue-600"
                : "border-transparent text-gray-600 hover:text-gray-900"
            }`}
          >
            使用记录
          </button>
          <button
            onClick={() => setActiveTab("billing")}
            className={`px-4 py-3 font-medium border-b-2 transition-colors ${
              activeTab === "billing"
                ? "border-blue-600 text-blue-600"
                : "border-transparent text-gray-600 hover:text-gray-900"
            }`}
          >
            账单
          </button>
        </div>

        {/* 概览标签页 */}
        {activeTab === "overview" && (
          <div className="space-y-6">
            {/* 额度信息卡片 */}
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4">💳 当前额度</h3>
              <div className="space-y-4">
                {/* 进度条 */}
                <div>
                  <div className="flex justify-between mb-2">
                    <span className="text-sm font-medium text-gray-700">使用进度</span>
                    <span className="text-sm text-gray-500">
                      {profile.credits.used} / {profile.credits.total} 次
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                    <div
                      className="bg-blue-600 h-full transition-all duration-300"
                      style={{ width: `${Math.min(usagePercent, 100)}%` }}
                    ></div>
                  </div>
                </div>

                {/* 额度统计 */}
                <div className="grid grid-cols-3 gap-4">
                  <div className="bg-blue-50 rounded-lg p-4 text-center">
                    <p className="text-2xl font-bold text-blue-600">
                      {profile.credits.remaining}
                    </p>
                    <p className="text-sm text-gray-600">剩余次数</p>
                  </div>
                  <div className="bg-green-50 rounded-lg p-4 text-center">
                    <p className="text-2xl font-bold text-green-600">
                      {profile.credits.total}
                    </p>
                    <p className="text-sm text-gray-600">总额度</p>
                  </div>
                  <div className="bg-orange-50 rounded-lg p-4 text-center">
                    <p className="text-2xl font-bold text-orange-600">
                      {profile.credits.used}
                    </p>
                    <p className="text-sm text-gray-600">已使用</p>
                  </div>
                </div>

                {/* 操作按钮 */}
                <div className="flex gap-3 pt-4">
                  <Link
                    href="/pricing"
                    className="flex-1 bg-blue-600 text-white font-medium py-2 rounded-lg hover:bg-blue-700 transition-colors text-center"
                  >
                    升级方案
                  </Link>
                  <button className="flex-1 border border-gray-300 text-gray-600 font-medium py-2 rounded-lg hover:bg-gray-50 transition-colors">
                    购买额度
                  </button>
                </div>
              </div>
            </div>

            {/* 订阅信息卡片 */}
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4">📋 当前订阅</h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">方案</span>
                  <span className="font-medium text-gray-900">
                    {profile.plan.type === "FREE" ? "免费版" : "付费版"}
                  </span>
                </div>
                {profile.plan.expiresAt && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">到期时间</span>
                    <span className="font-medium text-gray-900">
                      {new Date(profile.plan.expiresAt).toLocaleDateString("zh-CN")}
                    </span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-gray-600">状态</span>
                  <span className="inline-flex items-center gap-1 px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-medium">
                    ✅ 活跃
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 使用记录标签页 */}
        {activeTab === "usage" && (
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-4">📊 使用记录</h3>
            {records.length === 0 ? (
              <p className="text-center text-gray-500 py-8">暂无使用记录</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="text-left py-3 px-4 font-medium text-gray-700">
                        日期
                      </th>
                      <th className="text-left py-3 px-4 font-medium text-gray-700">
                        文件名
                      </th>
                      <th className="text-left py-3 px-4 font-medium text-gray-700">
                        消耗
                      </th>
                      <th className="text-left py-3 px-4 font-medium text-gray-700">
                        状态
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {records.map((record) => (
                      <tr key={record.id} className="border-b border-gray-100 hover:bg-gray-50">
                        <td className="py-3 px-4 text-gray-600">{record.date}</td>
                        <td className="py-3 px-4 text-gray-900 truncate max-w-xs">
                          {record.fileName || "未命名"}
                        </td>
                        <td className="py-3 px-4 text-gray-600">{record.cost} 次</td>
                        <td className="py-3 px-4">
                          {record.status === "SUCCESS" ? (
                            <span className="inline-flex items-center gap-1 px-2 py-1 bg-green-100 text-green-700 rounded text-xs font-medium">
                              ✅ 成功
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2 py-1 bg-red-100 text-red-700 rounded text-xs font-medium">
                              ❌ 失败
                            </span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* 账单标签页 */}
        {activeTab === "billing" && (
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-4">💰 账单历史</h3>
            {bills.length === 0 ? (
              <p className="text-center text-gray-500 py-8">暂无账单记录</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="text-left py-3 px-4 font-medium text-gray-700">
                        日期
                      </th>
                      <th className="text-left py-3 px-4 font-medium text-gray-700">
                        项目
                      </th>
                      <th className="text-left py-3 px-4 font-medium text-gray-700">
                        金额
                      </th>
                      <th className="text-left py-3 px-4 font-medium text-gray-700">
                        状态
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {bills.map((bill) => (
                      <tr key={bill.id} className="border-b border-gray-100 hover:bg-gray-50">
                        <td className="py-3 px-4 text-gray-600">{bill.date}</td>
                        <td className="py-3 px-4 text-gray-900">{bill.item}</td>
                        <td className="py-3 px-4 font-medium text-gray-900">{bill.amount}</td>
                        <td className="py-3 px-4">
                          {bill.status === "success" ? (
                            <span className="inline-flex items-center gap-1 px-2 py-1 bg-green-100 text-green-700 rounded text-xs font-medium">
                              ✅ 成功
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2 py-1 bg-red-100 text-red-700 rounded text-xs font-medium">
                              ❌ 失败
                            </span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </div>
    </main>
  )
}
