import type { Metadata } from 'next'
import { GeistSans } from 'geist/font/sans'
import { GeistMono } from 'geist/font/mono'
import { Analytics } from '@vercel/analytics/next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Holly Jolly Christmas Event',
  description: 'Join us for a magical Christmas celebration! Register now for Holly Jolly - an unforgettable holiday experience.',
  generator: 'v0.app',
  icons: {
    icon: '/images/design-mode/tree.png',
    shortcut: '/images/design-mode/tree.png',
    apple: '/images/design-mode/tree.png',
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <head>
        <link rel="preload" href="/fonts/TIDO-B.otf" as="font" type="font/otf" crossOrigin="anonymous" />
        <link rel="preload" href="/fonts/Balbaleo.otf" as="font" type="font/otf" crossOrigin="anonymous" />
      </head>
      <body className={`${GeistSans.variable} ${GeistMono.variable}`}>
        {children}
        <Analytics />
      </body>
    </html>
  )
}
