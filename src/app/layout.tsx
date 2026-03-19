import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Image Background Remover - Free Online Tool',
  description: 'Remove image backgrounds instantly for free. No signup required.',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
