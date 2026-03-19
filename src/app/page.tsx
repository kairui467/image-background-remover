'use client'

import { useState, useCallback } from 'react'
import { useDropzone } from 'react-dropzone'

export default function Home() {
  const [original, setOriginal] = useState<string | null>(null)
  const [result, setResult] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [fileName, setFileName] = useState<string>('removed-bg.png')

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
    <main className="min-h-screen flex flex-col items-center px-4 py-12">
      {/* Header */}
      <header className="mb-10 text-center">
        <h1 className="text-4xl font-bold text-gray-900 mb-2">Background Remover</h1>
        <p className="text-gray-500 text-lg">Remove image backgrounds instantly — free, fast, private.</p>
      </header>

      {/* Upload area */}
      {!original && (
        <div
          {...getRootProps()}
          className={`w-full max-w-xl border-2 border-dashed rounded-2xl p-12 text-center cursor-pointer transition-colors
            ${isDragActive ? 'border-blue-500 bg-blue-50' : 'border-gray-300 bg-white hover:border-blue-400'}`}
        >
          <input {...getInputProps()} />
          <div className="text-5xl mb-4">🖼️</div>
          <p className="text-gray-600 font-medium">Drag & drop an image here</p>
          <p className="text-gray-400 text-sm mt-1">or click to select — JPG, PNG, WebP up to 10MB</p>
        </div>
      )}

      {/* Loading */}
      {loading && (
        <div className="mt-10 flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-gray-500">Removing background...</p>
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="mt-6 bg-red-50 border border-red-200 text-red-700 rounded-xl px-6 py-4 max-w-md text-center">
          <p className="font-medium">Error</p>
          <p className="text-sm mt-1">{error}</p>
          <button onClick={reset} className="mt-3 text-sm underline text-red-500">Try again</button>
        </div>
      )}

      {/* Result */}
      {original && result && !loading && (
        <div className="mt-8 w-full max-w-3xl">
          <div className="grid grid-cols-2 gap-4">
            <div className="rounded-xl overflow-hidden border border-gray-200">
              <p className="text-xs text-center text-gray-400 py-2 bg-gray-50">Original</p>
              <img src={original} alt="Original" className="w-full object-contain max-h-72" />
            </div>
            <div className="rounded-xl overflow-hidden border border-gray-200">
              <p className="text-xs text-center text-gray-400 py-2 bg-gray-50">Result</p>
              <div className="checkerboard">
                <img src={result} alt="Result" className="w-full object-contain max-h-72" />
              </div>
            </div>
          </div>

          <div className="flex gap-3 mt-6 justify-center">
            <a
              href={result}
              download={fileName}
              className="bg-blue-600 hover:bg-blue-700 text-white font-medium px-6 py-2.5 rounded-xl transition-colors"
            >
              ⬇️ Download PNG
            </a>
            <button
              onClick={reset}
              className="border border-gray-300 hover:border-gray-400 text-gray-600 font-medium px-6 py-2.5 rounded-xl transition-colors"
            >
              Try another image
            </button>
          </div>
        </div>
      )}

      <footer className="mt-auto pt-16 text-gray-400 text-sm">
        Powered by Remove.bg · Images are never stored
      </footer>
    </main>
  )
}
