import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { AppProviders } from '@/core/providers'

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' })

export const metadata: Metadata = {
  title: 'My App',
  description: 'Built with Next.js Feature Slices Architecture',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={`${inter.variable} font-sans antialiased`}>
        <AppProviders>
          {children}
        </AppProviders>
      </body>
    </html>
  )
}
