import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import { ThemeProvider } from 'ui'
import { SessionProvider } from '@/components/SessionProvider'
import 'ui/styles'
import './globals.css'

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'FlatFlow',
  description: 'A modern full-stack application built with Next.js, Prisma, and TypeScript',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.variable} font-sans antialiased bg-background text-foreground`}>
        <SessionProvider>
          <ThemeProvider defaultAccent="sage">
            {children}
          </ThemeProvider>
        </SessionProvider>
      </body>
    </html>
  )
}
