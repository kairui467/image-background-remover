'use client'

import Link from "next/link"
import { useState } from "react"

export default function FAQPage() {
  const [openIndex, setOpenIndex] = useState<number | null>(null)

  const faqs = [
    {
      q: "可以随时取消订阅吗？",
      a: "可以。你可以在个人中心随时取消订阅，不会收取任何费用。下个月不会再扣费。",
    },
    {
      q: "未使用的额度会过期吗？",
      a: "月度订阅的额度在月末过期。年度订阅的额度在年末过期。积分包永久有效。",
    },
    {
      q: "如何升级或降级方案？",
      a: "在个人中心可以随时修改订阅方案。升级立即生效，降级在下个计费周期生效。",
    },
    {
      q: "支持哪些支付方式？",
      a: "目前支持 PayPal，包含 PayPal 余额、信用卡、借记卡等多种付款方式。",
    },
    {
      q: "如何获取发票？",
      a: "在账单历史中可以下载电子发票。",
    },
    {
      q: "有学生优惠吗？",
      a: "有。学生可享受 30% 折扣。需提供学生证明。",
    },
  ]

  return (
    <main className="min-h-screen bg-gradient-to-b from-slate-50 to-white px-4 py-16">
      <div className="max-w-3xl mx-auto">
        {/* 页面标题 */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            常见问题
          </h1>
          <p className="text-xl text-gray-500">
            找到你想要的答案
          </p>
        </div>

        {/* FAQ 手风琴 */}
        <div className="space-y-4 mb-12">
          {faqs.map((faq, idx) => (
            <div
              key={idx}
              className="border border-gray-200 rounded-lg overflow-hidden hover:shadow-md transition-shadow"
            >
              <button
                onClick={() => setOpenIndex(openIndex === idx ? null : idx)}
                className="w-full px-6 py-4 text-left font-semibold text-gray-900 hover:bg-gray-50 flex justify-between items-center"
              >
                <span>{faq.q}</span>
                <span className={`text-2xl transition-transform ${openIndex === idx ? 'rotate-180' : ''}`}>
                  ▼
                </span>
              </button>
              {openIndex === idx && (
                <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 text-gray-600">
                  {faq.a}
                </div>
              )}
            </div>
          ))}
        </div>

        {/* 底部链接 */}
        <div className="text-center">
          <p className="text-gray-600 mb-4">
            还有其他问题？
          </p>
          <Link
            href="/pricing"
            className="inline-block bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
          >
            查看定价方案
          </Link>
        </div>
      </div>
    </main>
  )
}
