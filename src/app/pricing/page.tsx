'use client'

import { useSession } from "next-auth/react"
import Link from "next/link"
import { useState } from "react"

const PLAN_TYPE_MAP: Record<string, string> = {
  "专业版_monthly": "PRO_MONTHLY",
  "专业版_yearly": "PRO_YEARLY",
  "企业版_monthly": "PRO_MONTHLY",
  "企业版_yearly": "PRO_YEARLY",
}

const CREDIT_PACK_MAP: Record<string, string> = {
  "小包": "CREDITS_SMALL",
  "中包": "CREDITS_MEDIUM",
  "大包": "CREDITS_LARGE",
  "超大包": "CREDITS_XLARGE",
}

export default function PricingPage() {
  const { data: session } = useSession()
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('monthly')
  const [loading, setLoading] = useState<string | null>(null)

  const plans = {
    monthly: [
      {
        name: "免费版",
        price: "$0",
        usdPrice: "0.00",
        period: "永久",
        credits: 3,
        features: ["3次/月", "基础功能", "标准处理速度"],
        cta: "当前方案",
        disabled: true,
        highlighted: false,
      },
      {
        name: "专业版",
        price: "$3.99",
        usdPrice: "3.99",
        period: "/月",
        credits: 200,
        features: ["200次/月", "优先处理", "无水印"],
        cta: "升级",
        disabled: false,
        highlighted: true,
      },
      {
        name: "企业版",
        price: "$13.99",
        usdPrice: "13.99",
        period: "/月",
        credits: 1000,
        features: ["1000次/月", "优先处理", "无水印", "API 访问"],
        cta: "升级",
        disabled: false,
        highlighted: false,
      },
    ],
    yearly: [
      {
        name: "免费版",
        price: "$0",
        usdPrice: "0.00",
        period: "永久",
        credits: 3,
        features: ["3次/月", "基础功能", "标准处理速度"],
        cta: "当前方案",
        disabled: true,
        highlighted: false,
      },
      {
        name: "专业版",
        price: "$39.99",
        usdPrice: "39.99",
        period: "/年",
        credits: 2400,
        features: ["2400次/年", "优先处理", "无水印", "节省 17%"],
        cta: "升级",
        disabled: false,
        highlighted: true,
      },
      {
        name: "企业版",
        price: "$139.99",
        usdPrice: "139.99",
        period: "/年",
        credits: 12000,
        features: ["12000次/年", "优先处理", "无水印", "API 访问", "节省 17%"],
        cta: "升级",
        disabled: false,
        highlighted: false,
      },
    ],
  }

  const creditPacks = [
    { name: "小包", price: "$1.39", credits: 10, unitPrice: "$0.14/次", planType: "CREDITS_SMALL" },
    { name: "中包", price: "$2.79", credits: 25, unitPrice: "$0.11/次", planType: "CREDITS_MEDIUM" },
    { name: "大包", price: "$6.99", credits: 100, unitPrice: "$0.07/次", planType: "CREDITS_LARGE" },
    { name: "超大包", price: "$13.99", credits: 300, unitPrice: "$0.05/次", planType: "CREDITS_XLARGE" },
  ]

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

  const currentPlans = plans[billingCycle]

  const handlePayment = async (planType: string) => {
    if (!session) {
      alert("请先登录")
      return
    }

    setLoading(planType)
    try {
      const res = await fetch("/api/payment/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ planType }),
      })

      const data = await res.json() as { approveUrl?: string; error?: string }
      if (data.approveUrl) {
        window.location.href = data.approveUrl
      } else {
        alert("创建支付订单失败：" + (data.error || "未知错误"))
      }
    } catch (error) {
      alert("错误：" + (error instanceof Error ? error.message : "未知错误"))
    } finally {
      setLoading(null)
    }
  }

  const handleUpgrade = (planName: string) => {
    const key = `${planName}_${billingCycle}`
    const planType = PLAN_TYPE_MAP[key]
    if (planType) {
      handlePayment(planType)
    }
  }

  return (
    <main className="min-h-screen bg-gradient-to-b from-slate-50 to-white px-4 py-16">
      <div className="max-w-7xl mx-auto">
        {/* 页面标题 */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            简单透明的定价
          </h1>
          <p className="text-xl text-gray-500">
            选择适合你的方案，开始使用
          </p>
        </div>

        {/* 计费周期切换 */}
        <div className="flex justify-center mb-12">
          <div className="inline-flex bg-gray-100 rounded-lg p-1">
            <button
              onClick={() => setBillingCycle('monthly')}
              className={`px-6 py-2 rounded-md font-medium transition-colors ${
                billingCycle === 'monthly'
                  ? 'bg-white text-blue-600 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              按月计费
            </button>
            <button
              onClick={() => setBillingCycle('yearly')}
              className={`px-6 py-2 rounded-md font-medium transition-colors ${
                billingCycle === 'yearly'
                  ? 'bg-white text-blue-600 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              按年计费
            </button>
          </div>
        </div>

        {/* 订阅方案卡片 */}
        <div className="grid md:grid-cols-3 gap-8 mb-16">
          {currentPlans.map((plan) => (
            <div
              key={plan.name}
              className={`rounded-xl border-2 p-8 transition-all ${
                plan.highlighted
                  ? 'border-blue-500 bg-blue-50 shadow-lg scale-105'
                  : 'border-gray-200 bg-white'
              }`}
            >
              {plan.highlighted && (
                <div className="mb-4 inline-block bg-blue-600 text-white px-3 py-1 rounded-full text-sm font-medium">
                  ⭐ 最受欢迎
                </div>
              )}

              <h3 className="text-2xl font-bold text-gray-900 mb-2">
                {plan.name}
              </h3>
              <div className="mb-6">
                <span className="text-4xl font-bold text-gray-900">
                  {plan.price}
                </span>
                <span className="text-gray-500 ml-2">{plan.period}</span>
              </div>

              <div className="mb-8 p-4 bg-gray-100 rounded-lg">
                <p className="text-lg font-semibold text-gray-900">
                  {plan.credits} 次额度
                </p>
              </div>

              <ul className="space-y-3 mb-8">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-center gap-2">
                    <span className="text-green-500">✓</span>
                    <span className="text-gray-700">{feature}</span>
                  </li>
                ))}
              </ul>

              <button
                onClick={() => handleUpgrade(plan.name)}
                disabled={plan.disabled || loading !== null}
                className={`w-full py-3 rounded-lg font-medium transition-colors ${
                  plan.disabled
                    ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
                    : 'bg-blue-600 text-white hover:bg-blue-700'
                }`}
              >
                {loading === PLAN_TYPE_MAP[`${plan.name}_${billingCycle}`]
                  ? "跳转中..."
                  : plan.cta}
              </button>
            </div>
          ))}
        </div>

        {/* 积分包选项 */}
        <div className="mb-16">
          <h2 className="text-2xl font-bold text-gray-900 mb-8 text-center">
            或者一次性购买额度
          </h2>
          <div className="grid md:grid-cols-4 gap-6">
            {creditPacks.map((pack) => (
              <div
                key={pack.name}
                className="rounded-xl border border-gray-200 bg-white p-6 text-center hover:shadow-lg transition-shadow"
              >
                <h3 className="text-lg font-bold text-gray-900 mb-2">
                  {pack.name}
                </h3>
                <p className="text-3xl font-bold text-blue-600 mb-2">
                  {pack.price}
                </p>
                <p className="text-gray-600 mb-4">{pack.credits} 次</p>
                <p className="text-sm text-gray-500 mb-4">{pack.unitPrice}</p>
                <button
                  onClick={() => handlePayment(pack.planType)}
                  disabled={loading !== null}
                  className="w-full bg-blue-600 text-white font-medium py-2 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
                >
                  {loading === pack.planType ? "跳转中..." : "购买"}
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* 常见问题 */}
        <div className="bg-white rounded-xl border border-gray-200 p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-8">常见问题</h2>
          <div className="space-y-6">
            {faqs.map((faq, idx) => (
              <div key={idx}>
                <h3 className="font-semibold text-gray-900 mb-2">
                  {faq.q}
                </h3>
                <p className="text-gray-600">
                  {faq.a}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* 底部信任背书 */}
        <div className="mt-16 text-center">
          <p className="text-gray-600 mb-4">
            🔒 PayPal 安全支付 • 💳 支持信用卡/借记卡 • ↩️ 7 天无理由退款
          </p>
          <p className="text-sm text-gray-500">
            有任何问题？<Link href="/" className="text-blue-600 hover:underline">联系我们</Link>
          </p>
        </div>
      </div>
    </main>
  )
}
