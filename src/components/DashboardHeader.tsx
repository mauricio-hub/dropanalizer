'use client'

import Link from 'next/link'
import Button from '@/components/ui/Button'
import PageHeader from '@/components/ui/PageHeader'
import { Plus } from 'lucide-react'
import { useLanguage } from '@/hooks/useLanguage'
import { getTranslation } from '@/lib/i18n'

export default function DashboardHeader() {
  const { language } = useLanguage()
  const t = getTranslation(language)

  return (
    <PageHeader
      title={t.dashboard.title}
      subtitle={t.dashboard.subtitle}
      actions={
        <Link href="/proposals/new">
          <Button>
            <Plus className="h-4 w-4" />
            {t.dashboard.newProposal}
          </Button>
        </Link>
      }
    />
  )
}
