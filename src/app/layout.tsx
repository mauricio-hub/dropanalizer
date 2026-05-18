import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import ClerkProviders from '@/components/ClerkProviders'
import { LanguageProvider } from '@/components/LanguageContext'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Proply – Crea landing pages que venden, sin diseñador',
  description:
    'Genera landing pages profesionales para tus productos en minutos. Con IA, imágenes y CTA a WhatsApp o tu tienda. Ideal para dropshipping y ventas online.',
  keywords: [
    'landing page dropshipping',
    'crear landing page gratis',
    'generador de landing pages',
    'landing page para productos',
    'landing page con whatsapp',
    'proply',
  ],
  authors: [{ name: 'Proply' }],
  openGraph: {
    title: 'Proply – Crea landing pages que venden, sin diseñador',
    description:
      'Genera landing pages profesionales para tus productos en minutos. Con IA, imágenes y CTA a WhatsApp o tu tienda.',
    url: 'https://proply.app',
    siteName: 'Proply',
    locale: 'es_ES',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Proply – Landing pages que venden',
    description:
      'Crea tu landing page en minutos con IA. Ideal para dropshipping y ventas online.',
  },
  robots: {
    index: true,
    follow: true,
  },
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