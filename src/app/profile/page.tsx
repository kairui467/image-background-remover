import { auth } from "@/auth"
import { redirect } from "next/navigation"
import Link from "next/link"

export const dynamic = 'force-dynamic'

export default async function ProfilePage() {
  const session = await auth()
  if (!session?.user?.email) redirect("/")

  const user = {
    name: session.user.name || "Test User",
    email: session.user.email,
    image: session.user.image,
    credits: 3,
    planType: "FREE"
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto space-y-8">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold text-gray-900">个人中心</h1>
          <Link href="/" className="text-blue-600 hover:underline">← 返回工作区</Link>
        </div>
        
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-6">
          <img src={user.image || ""} alt="Profile" className="w-20 h-20 rounded-full shadow-sm" />
          <div>
            <h2 className="text-2xl font-semibold text-gray-800">{user.name}</h2>
            <p className="text-gray-500">{user.email}</p>
            <div className="mt-2 inline-flex items-center gap-2 bg-blue-50 text-blue-700 px-3 py-1 rounded-full text-sm font-medium">
              当前状态: {user.planType === "PRO" ? "Pro 高级会员" : "免费体验"}
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">使用额度 (Credits)</h3>
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl border border-gray-100">
            <div>
              <p className="text-sm text-gray-500 font-medium">剩余扣图次数</p>
              <p className="text-3xl font-bold text-gray-900 mt-1">{user.credits}</p>
            </div>
            <div className="text-right">
              <span className="inline-block bg-orange-100 text-orange-700 text-xs px-2 py-1 rounded font-medium mb-1">额度即将用尽</span>
            </div>
          </div>
        </div>

        <div>
          <h3 className="text-xl font-bold text-gray-900 mb-4">升级与购买 (Pricing)</h3>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h4 className="text-lg font-bold text-gray-900">流量包 (Credit Pack)</h4>
                  <p className="text-sm text-gray-500">适合偶尔使用的用户</p>
                </div>
                <span className="text-2xl font-bold text-gray-900">$2.90</span>
              </div>
              <ul className="space-y-3 mb-6">
                <li className="flex items-center text-sm text-gray-600">✅ 50 次高清去背景额度</li>
                <li className="flex items-center text-sm text-gray-600">✅ 永久有效，不过期</li>
              </ul>
              <button className="w-full py-2.5 rounded-xl font-medium bg-blue-50 text-blue-700 hover:bg-blue-100 transition-colors">购买 50 次额度</button>
            </div>
            
            <div className="bg-gradient-to-b from-gray-900 to-gray-800 p-6 rounded-2xl shadow-lg border border-gray-700">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h4 className="text-lg font-bold text-white">包月订阅 (Pro Plan)</h4>
                  <p className="text-sm text-gray-400">适合高频创作者</p>
                </div>
                <span className="text-2xl font-bold text-white">$8.90<span className="text-sm text-gray-400 font-normal"> /月</span></span>
              </div>
              <ul className="space-y-3 mb-6">
                <li className="flex items-center text-sm text-gray-300">✅ 每月 500 次高清额度</li>
                <li className="flex items-center text-sm text-gray-300">✅ API 优先响应速度</li>
              </ul>
              <button className="w-full py-2.5 rounded-xl font-medium bg-blue-600 text-white hover:bg-blue-500 transition-colors">升级至 Pro</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
