import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: '图片背景去除 - 免费在线工具 | Background Remover',
  description: '一键去除图片背景，免费、快速、隐私安全。支持 JPG、PNG、WebP 格式。',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="zh">
      <body className={inter.className}>{children}</body>
    </html>
  )
}
