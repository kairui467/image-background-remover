'use client'

import { useState, useCallback } from 'react'
import { useDropzone } from 'react-dropzone'

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
  const [lang, setLang] = useState<Lang>('zh')
  const [original, setOriginal] = useState<string | null>(null)
  const [result, setResult] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [fileName, setFileName] = useState<string>('removed-bg.png')

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
      const res = await fetch('/api/remove-bg', { method: 'POST', body: formData })
      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || 'Processing failed')
      }
      const blob = await res.blob()
      setResult(URL.createObjectURL(blob))
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Unknown error')
    } finally {
      setLoading(false)
    }
  }, [])

  const onDrop = useCallback((accepted: File[]) => {
    if (accepted[0]) processImage(accepted[0])
  }, [processImage])

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

      <div className="bg-green-200 p-3 text-black mb-4 rounded shadow-sm font-bold">✅ Updated: 2026-03-23 19:42 GMT+8</div>

      {/* Header */}
      <header className="w-full max-w-3xl flex items-center justify-between mb-10">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">{t.title}</h1>
          <p className="text-gray-500 mt-1">{t.subtitle}</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setLang(lang === 'en' ? 'zh' : 'en')}
            className="text-sm border border-gray-300 rounded-lg px-3 py-1.5 text-gray-600 hover:border-blue-400 hover:text-blue-600 transition-colors"
          >
            {t.langSwitch}
          </button>
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

      {/* Upload area */}
      {!original && (
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
    </main>
  )
}
