import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Microservices Dashboard',
  description: 'DevOps CI/CD Project',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
