'use client'

import { useState, useCallback, useEffect } from 'react'
import { useDropzone } from 'react-dropzone'
import { useSession } from 'next-auth/react'

import UserMenu from '@/components/UserMenu'

const i18n = {
  en: {
    title: 'Background Remover',
    subtitle: 'Remove image backgrounds instantly — free, fast, private.',
    step1: 'Upload Image',
    step1desc: 'Drag & drop or click to select',
    step2: 'Auto Remove',
    step2desc: 'AI removes background instantly',
    step3: 'Download',
    step3desc: 'Save as PNG with transparency',
    dropzone: 'Drag & drop an image here',
    dropzoneHint: 'or click to select — JPG, PNG, WebP up to 10MB',
    removing: 'Removing background...',
    download: '⬇️ Download PNG',
    tryAnother: 'Try another image',
    original: 'Original',
    result: 'Result',
    errorTitle: 'Error',
    tryAgain: 'Try again',
    footer: 'Powered by Remove.bg · Images are never stored',
    langSwitch: '中文',
  },
  zh: {
    title: '图片背景去除',
    subtitle: '一键去除图片背景 — 免费、快速、隐私安全',
    step1: '上传图片',
    step1desc: '拖拽或点击选择图片',
    step2: '自动处理',
    step2desc: 'AI 秒级去除背景',
    step3: '下载结果',
    step3desc: '保存为透明 PNG',
    dropzone: '拖拽图片到这里',
    dropzoneHint: '或点击选择 — 支持 JPG、PNG、WebP，最大 10MB',
    removing: '正在去除背景...',
    download: '⬇️ 下载 PNG',
    tryAnother: '处理另一张',
    original: '原图',
    result: '处理结果',
    errorTitle: '出错了',
    tryAgain: '重试',
    footer: '由 Remove.bg 提供支持 · 图片不会被存储',
    langSwitch: 'English',
  },
}

type Lang = 'en' | 'zh'

export default function Home() {
  const { data: session, status } = useSession()
  const [lang, setLang] = useState<Lang>('zh')
  const [original, setOriginal] = useState<string | null>(null)
  const [result, setResult] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [fileName, setFileName] = useState<string>('removed-bg.png')
  const [showLoginModal, setShowLoginModal] = useState(false)
  const [showUpgradeModal, setShowUpgradeModal] = useState(false)
  const [userCredits, setUserCredits] = useState(0)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)

  // 获取用户额度
  useEffect(() => {
    if (status === 'authenticated') {
      fetchUserCredits()
    }
  }, [status])

  const fetchUserCredits = async () => {
    try {
      const res = await fetch('/api/user/profile')
      console.log('[fetchUserCredits] Response status:', res.status)
      
      if (!res.ok) {
        const data = await res.json()
        console.error('[fetchUserCredits] Error response:', res.status, data)
        console.error(`[fetchUserCredits] Failed to fetch credits: ${res.status} - ${data.error || data.message || 'Unknown error'}`)
        return
      }
      
      const data = await res.json()
      console.log('[fetchUserCredits] Success:', data)
      setUserCredits(data.credits.remaining)
    } catch (error) {
      console.error('[fetchUserCredits] Exception:', error)
    }
  }

  const t = i18n[lang]

  const processImage = useCallback(async (file: File) => {
    setOriginal(URL.createObjectURL(file))
    setResult(null)
    setError(null)
    setLoading(true)
    setFileName(`removed-bg-${file.name.replace(/\.[^.]+$/, '')}.png`)

    const formData = new FormData()
    formData.append('image', file)

    try {
      console.log('[processImage] Sending request to /api/remove-bg')
      const res = await fetch('/api/remove-bg', { method: 'POST', body: formData })
      console.log('[processImage] Response status:', res.status)
      
      if (!res.ok) {
        const contentType = res.headers.get('content-type')
        let errorData
        
        try {
          if (contentType?.includes('application/json')) {
            errorData = await res.json()
          } else {
            const text = await res.text()
            errorData = { error: text || `HTTP ${res.status}` }
          }
        } catch {
          errorData = { error: `HTTP ${res.status}` }
        }
        
        const errorMessage = `[${res.status}] ${errorData.error || errorData.message || 'Unknown error'}${errorData.details ? ` - ${errorData.details}` : ''}`
        console.error('[processImage] Error response:', errorMessage, errorData)
        throw new Error(errorMessage)
      }
      
      const blob = await res.blob()
      console.log('[processImage] Processing successful, blob size:', blob.size)
      setResult(URL.createObjectURL(blob))
      // 处理成功后刷新额度
      await fetchUserCredits()
    } catch (e: unknown) {
      const errorMsg = e instanceof Error ? e.message : String(e)
      console.error('[processImage] Exception:', errorMsg)
      setError(errorMsg)
    } finally {
      setLoading(false)
    }
  }, [fetchUserCredits])

  // 假的图片处理函数（用于测试额度扣减）
  const processMockImage = useCallback(async (file: File) => {
    setOriginal(URL.createObjectURL(file))
    setResult(null)
    setError(null)
    setLoading(true)
    setFileName(`test-removed-bg-${file.name.replace(/\.[^.]+$/, '')}.png`)

    const formData = new FormData()
    formData.append('image', file)

    try {
      console.log('[processMockImage] Sending request to /api/remove-bg-mock')
      const res = await fetch('/api/remove-bg-mock', { method: 'POST', body: formData })
      console.log('[processMockImage] Response status:', res.status)
      
      if (!res.ok) {
        const contentType = res.headers.get('content-type')
        let errorData
        
        try {
          if (contentType?.includes('application/json')) {
            errorData = await res.json()
          } else {
            const text = await res.text()
            errorData = { error: text || `HTTP ${res.status}` }
          }
        } catch {
          errorData = { error: `HTTP ${res.status}` }
        }
        
        const errorMessage = `[${res.status}] ${errorData.error || errorData.message || 'Unknown error'}${errorData.details ? ` - ${errorData.details}` : ''}`
        console.error('[processMockImage] Error response:', errorMessage, errorData)
        throw new Error(errorMessage)
      }
      
      const blob = await res.blob()
      console.log('[processMockImage] Processing successful, blob size:', blob.size)
      setResult(URL.createObjectURL(blob))
      // 处理成功后刷新额度
      await fetchUserCredits()
    } catch (e: unknown) {
      const errorMsg = e instanceof Error ? e.message : String(e)
      console.error('[processMockImage] Exception:', errorMsg)
      setError(errorMsg)
    } finally {
      setLoading(false)
    }
  }, [fetchUserCredits])

  const onDrop = useCallback((accepted: File[]) => {
    if (!accepted[0]) return

    // 未登录检查
    if (status !== 'authenticated') {
      setShowLoginModal(true)
      return
    }

    // 额度检查
    if (userCredits <= 0) {
      setShowUpgradeModal(true)
      return
    }

    // 保存文件以供处理选择
    setSelectedFile(accepted[0])
  }, [status, userCredits])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'image/*': ['.jpg', '.jpeg', '.png', '.webp'] },
    maxSize: 10 * 1024 * 1024,
    multiple: false,
  })

  const reset = () => {
    setOriginal(null)
    setResult(null)
    setError(null)
  }

  return (
    <main className="min-h-screen flex flex-col items-center bg-gradient-to-b from-slate-50 to-white px-4 py-10">

      {/* Header */}
      <header className="w-full max-w-3xl flex items-center justify-between mb-6">
        <div className="flex-1">
          <h1 className="text-3xl font-bold text-gray-900">{t.title}</h1>
          <p className="text-gray-500 mt-1">{t.subtitle}</p>
          {/* 免费 3 次徽章 */}
          <div className="mt-3 inline-block bg-green-50 border border-green-200 text-green-700 px-4 py-2 rounded-lg text-sm font-medium">
            🎉 免费试用 3 次 — 无需信用卡
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setLang(lang === 'en' ? 'zh' : 'en')}
            className="text-sm border border-gray-300 rounded-lg px-3 py-1.5 text-gray-600 hover:border-blue-400 hover:text-blue-600 transition-colors"
          >
            {t.langSwitch}
          </button>
          <a
            href="/faq"
            className="text-sm text-gray-600 hover:text-blue-600 transition-colors"
          >
            FAQ
          </a>
          <a
            href="/pricing"
            className="text-sm bg-purple-600 text-white rounded-lg px-4 py-1.5 hover:bg-purple-700 transition-colors"
          >
            升级
          </a>
          <UserMenu />
        </div>
      </header>

      {/* Steps guide */}
      {!original && (
        <div className="w-full max-w-3xl grid grid-cols-3 gap-4 mb-8">
          {[
            { num: '1', title: t.step1, desc: t.step1desc, icon: '📤' },
            { num: '2', title: t.step2, desc: t.step2desc, icon: '✨' },
            { num: '3', title: t.step3, desc: t.step3desc, icon: '📥' },
          ].map((step) => (
            <div key={step.num} className="bg-white rounded-xl border border-gray-100 shadow-sm p-4 text-center">
              <div className="text-2xl mb-2">{step.icon}</div>
              <p className="font-semibold text-gray-800 text-sm">{step.title}</p>
              <p className="text-gray-400 text-xs mt-1">{step.desc}</p>
            </div>
          ))}
        </div>
      )}

      {/* Before/After 效果展示 */}
      {!original && (
        <div className="w-full max-w-3xl mb-8 bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
          <p className="text-center text-gray-600 font-medium mb-4">✨ 看看我们能做什么</p>
          <div className="grid grid-cols-2 gap-4">
            <div className="rounded-lg overflow-hidden border border-gray-200 bg-gray-50 flex items-center justify-center" style={{ minHeight: '300px' }}>
              <img 
                src="https://sb.kaleidousercontent.com/67418/604x802/9455f54d5d/person-1.png" 
                alt="原图示例" 
                className="max-w-full max-h-full object-contain"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = 'data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 width=%22400%22 height=%22300%22%3E%3Crect fill=%22%23f3f4f6%22 width=%22400%22 height=%22300%22/%3E%3Ctext x=%2250%25%22 y=%2250%25%22 text-anchor=%22middle%22 dy=%22.3em%22 fill=%22%239ca3af%22 font-size=%2216%22%3E示例图片%3C/text%3E%3C/svg%3E'
                }}
              />
            </div>
            <div className="rounded-lg overflow-hidden border border-gray-200 bg-gradient-to-br from-blue-50 to-purple-50 flex items-center justify-center" style={{ minHeight: '300px' }}>
              <img 
                src="https://sb.kaleidousercontent.com/67418/604x802/cb1c7782ea/person-2.png" 
                alt="处理后示例" 
                className="max-w-full max-h-full object-contain"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = 'data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 width=%22400%22 height=%22300%22%3E%3Crect fill=%22%23ede9fe%22 width=%22400%22 height=%22300%22/%3E%3Ctext x=%2250%25%22 y=%2250%25%22 text-anchor=%22middle%22 dy=%22.3em%22 fill=%22%239ca3af%22 font-size=%2216%22%3E透明背景%3C/text%3E%3C/svg%3E'
                }}
              />
            </div>
          </div>
        </div>
      )}

      {/* Upload area */}
      {!original && (
        <>
          <div
            {...getRootProps()}
            className={`w-full max-w-3xl border-2 border-dashed rounded-2xl p-16 text-center cursor-pointer transition-colors
              ${isDragActive ? 'border-blue-500 bg-blue-50' : 'border-gray-200 bg-white hover:border-blue-400 hover:bg-blue-50/30'}`}
          >
            <input {...getInputProps()} />
            <div className="text-5xl mb-4">🖼️</div>
            <p className="text-gray-700 font-medium text-lg">{t.dropzone}</p>
            <p className="text-gray-400 text-sm mt-2">{t.dropzoneHint}</p>
          </div>

          {/* 处理方式选择 */}
          {selectedFile && (
            <div className="mt-6 w-full max-w-3xl bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
              <p className="text-gray-700 font-medium mb-4">选择处理方式:</p>
              <div className="grid grid-cols-2 gap-4">
                <button
                  onClick={() => {
                    processImage(selectedFile)
                    setSelectedFile(null)
                  }}
                  className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 rounded-lg transition-colors"
                >
                  🎨 真实处理 (Real Remove.bg)
                </button>
                <button
                  onClick={() => {
                    processMockImage(selectedFile)
                    setSelectedFile(null)
                  }}
                  className="bg-green-600 hover:bg-green-700 text-white font-medium py-3 rounded-lg transition-colors"
                >
                  🧪 测试处理 (Mock - 输出原图)
                </button>
              </div>
              <button
                onClick={() => setSelectedFile(null)}
                className="mt-3 w-full border border-gray-300 text-gray-600 font-medium py-2 rounded-lg hover:bg-gray-50"
              >
                取消
              </button>
            </div>
          )}
        </>
      )}

      {/* Loading */}
      {loading && (
        <div className="mt-16 flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-gray-500">{t.removing}</p>
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="mt-6 bg-red-50 border border-red-200 text-red-700 rounded-xl px-6 py-4 max-w-md text-center">
          <p className="font-medium">{t.errorTitle}</p>
          <p className="text-sm mt-1">{error}</p>
          <button onClick={reset} className="mt-3 text-sm underline text-red-500">{t.tryAgain}</button>
        </div>
      )}

      {/* Result */}
      {original && result && !loading && (
        <div className="mt-4 w-full max-w-3xl">
          <div className="grid grid-cols-2 gap-4">
            <div className="rounded-xl overflow-hidden border border-gray-200 bg-white shadow-sm">
              <p className="text-xs text-center text-gray-400 py-2 bg-gray-50 border-b border-gray-100">{t.original}</p>
              <img src={original} alt="Original" className="w-full object-contain max-h-80" />
            </div>
            <div className="rounded-xl overflow-hidden border border-gray-200 shadow-sm">
              <p className="text-xs text-center text-gray-400 py-2 bg-gray-50 border-b border-gray-100">{t.result}</p>
              <div className="checkerboard">
                <img src={result} alt="Result" className="w-full object-contain max-h-80" />
              </div>
            </div>
          </div>

          <div className="flex gap-3 mt-6 justify-center">
            <a
              href={result}
              download={fileName}
              className="bg-blue-600 hover:bg-blue-700 text-white font-medium px-8 py-3 rounded-xl transition-colors shadow-sm"
            >
              {t.download}
            </a>
            <button
              onClick={reset}
              className="border border-gray-300 hover:border-gray-400 text-gray-600 font-medium px-8 py-3 rounded-xl transition-colors"
            >
              {t.tryAnother}
            </button>
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="mt-auto pt-16 text-gray-400 text-sm">
        {t.footer}
      </footer>

      {/* 统计数据 */}
      <div className="w-full max-w-3xl mt-12 mb-8 grid grid-cols-3 gap-4">
        <div className="bg-white rounded-xl border border-gray-200 p-6 text-center shadow-sm">
          <p className="text-3xl font-bold text-blue-600">10K+</p>
          <p className="text-gray-600 text-sm mt-2">已处理图片</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-6 text-center shadow-sm">
          <p className="text-3xl font-bold text-blue-600">4.8★</p>
          <p className="text-gray-600 text-sm mt-2">用户评分</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-6 text-center shadow-sm">
          <p className="text-3xl font-bold text-blue-600">&lt;2s</p>
          <p className="text-gray-600 text-sm mt-2">平均处理时间</p>
        </div>
      </div>

      {/* 登录提示模态框 */}
      {showLoginModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-8 max-w-sm mx-4">
            <h2 className="text-xl font-bold text-gray-900 mb-4">请先登录</h2>
            <p className="text-gray-600 mb-6">登录后即可使用背景去除功能</p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowLoginModal(false)}
                className="flex-1 border border-gray-300 text-gray-600 font-medium py-2 rounded-lg hover:bg-gray-50"
              >
                取消
              </button>
              <button
                onClick={() => {
                  setShowLoginModal(false)
                  window.location.href = '/api/auth/signin'
                }}
                className="flex-1 bg-blue-600 text-white font-medium py-2 rounded-lg hover:bg-blue-700"
              >
                登录
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 升级提示模态框 */}
      {showUpgradeModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-8 max-w-sm mx-4">
            <h2 className="text-xl font-bold text-gray-900 mb-4">额度已用完</h2>
            <p className="text-gray-600 mb-6">升级到付费版本，获得更多处理次数</p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowUpgradeModal(false)}
                className="flex-1 border border-gray-300 text-gray-600 font-medium py-2 rounded-lg hover:bg-gray-50"
              >
                取消
              </button>
              <a
                href="/pricing"
                className="flex-1 bg-blue-600 text-white font-medium py-2 rounded-lg hover:bg-blue-700 text-center"
              >
                查看定价
              </a>
            </div>
          </div>
        </div>
      )}
    </main>
  )
}
