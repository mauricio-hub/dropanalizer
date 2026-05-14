import { auth } from '@clerk/nextjs'
import { redirect } from 'next/navigation'
import { LanguageProvider } from '@/context/LanguageContext'
import LanguageAndNavigation from '@/components/LanguageAndNavigation'

export default function AuthenticatedLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { userId } = auth()
  if (!userId) redirect('/sign-in')

  return (
    <LanguageProvider>
      <LanguageAndNavigation>{children}</LanguageAndNavigation>
    </LanguageProvider>
  )
}
