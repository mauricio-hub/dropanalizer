import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import ClerkProviders from '@/components/ClerkProviders'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Proply - Propuestas Inteligentes',
  description: 'Crea y optimiza propuestas comerciales como landing pages dinámicas',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="es" className="dark">
      <body className={inter.className}>
        <ClerkProviders>
          {children}
        </ClerkProviders>
      </body>
    </html>
  )
}