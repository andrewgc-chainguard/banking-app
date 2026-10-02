import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'FinanceHub - Online Banking',
  description: 'A modern online banking demo application',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className="bg-slate-100">{children}</body>
    </html>
  )
}
