import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import ClerkProviders from '@/components/ClerkProviders'
import { LanguageProvider } from '@/components/LanguageContext'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Proply - smart landing pages generator',
  description: 'Create and optimize commercial proposals as dynamic landing pages',
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
          <LanguageProvider>
            {children}
          </LanguageProvider>
        </ClerkProviders>
      </body>
    </html>
  )
}