'use client'

import { useSession, signOut } from "next-auth/react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { useEffect, useState } from "react"

export default function ProfilePage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [activeTab, setActiveTab] = useState("overview")

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/")
    }
  }, [status, router])

  if (status === "loading") {
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

  return (
    <main className="min-h-screen bg-gradient-to-b from-slate-50 to-white px-4 py-10">
      <div className="max-w-5xl mx-auto">
        {/* 页面标题 */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">个人中心</h1>
          <p className="text-gray-500 mt-2">管理你的账户和订阅</p>
        </div>

        {/* 用户信息卡片 */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              {session.user?.image && (
                <img
                  src={session.user.image}
                  alt={session.user.name || "User"}
                  className="w-16 h-16 rounded-full border-2 border-gray-200"
                />
              )}
              <div>
                <h2 className="text-xl font-bold text-gray-900">
                  {session.user?.name || "用户"}
                </h2>
                <p className="text-gray-500">{session.user?.email}</p>
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
                    <span className="text-sm text-gray-500">7 / 50 次</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                    <div
                      className="bg-blue-600 h-full transition-all duration-300"
                      style={{ width: "14%" }}
                    ></div>
                  </div>
                </div>

                {/* 额度统计 */}
                <div className="grid grid-cols-3 gap-4">
                  <div className="bg-blue-50 rounded-lg p-4 text-center">
                    <p className="text-2xl font-bold text-blue-600">43</p>
                    <p className="text-sm text-gray-600">剩余次数</p>
                  </div>
                  <div className="bg-green-50 rounded-lg p-4 text-center">
                    <p className="text-2xl font-bold text-green-600">50</p>
                    <p className="text-sm text-gray-600">总额度</p>
                  </div>
                  <div className="bg-orange-50 rounded-lg p-4 text-center">
                    <p className="text-2xl font-bold text-orange-600">7</p>
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
                  <span className="font-medium text-gray-900">专业版 (月度)</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">价格</span>
                  <span className="font-medium text-gray-900">¥29.9/月</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">下次扣费</span>
                  <span className="font-medium text-gray-900">2026-04-24</span>
                </div>
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
                  {[
                    { date: "2026-03-24", file: "photo.jpg", cost: 1, status: "success" },
                    { date: "2026-03-23", file: "image.png", cost: 2, status: "success" },
                    { date: "2026-03-22", file: "picture.webp", cost: 1, status: "success" },
                    { date: "2026-03-21", file: "avatar.jpg", cost: 1, status: "success" },
                    { date: "2026-03-20", file: "background.png", cost: 2, status: "success" },
                  ].map((record, idx) => (
                    <tr key={idx} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="py-3 px-4 text-gray-600">{record.date}</td>
                      <td className="py-3 px-4 text-gray-900 truncate max-w-xs">
                        {record.file}
                      </td>
                      <td className="py-3 px-4 text-gray-600">{record.cost} 次</td>
                      <td className="py-3 px-4">
                        {record.status === "success" ? (
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
          </div>
        )}

        {/* 账单标签页 */}
        {activeTab === "billing" && (
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-4">💰 账单历史</h3>
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
                  {[
                    { date: "2026-03-24", item: "月度订阅", amount: "¥29.9", status: "success" },
                    { date: "2026-02-24", item: "月度订阅", amount: "¥29.9", status: "success" },
                    { date: "2026-01-24", item: "月度订阅", amount: "¥29.9", status: "success" },
                  ].map((bill, idx) => (
                    <tr key={idx} className="border-b border-gray-100 hover:bg-gray-50">
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
          </div>
        )}
      </div>
    </main>
  )
}

