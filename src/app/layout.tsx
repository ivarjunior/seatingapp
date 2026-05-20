import type {Metadata, Viewport} from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Ivarium Seating',
  description: 'Vind je tafel en zitplaats',
  appleWebApp: {
    capable: true,
    title: 'Seating',
  },
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: '#0f766e',
}

export default function RootLayout({children}: {children: React.ReactNode}) {
  return (
    <html lang="nl">
      <body className="min-h-dvh antialiased">{children}</body>
    </html>
  )
}
