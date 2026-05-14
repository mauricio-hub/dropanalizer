'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import { useLanguage } from '@/hooks/useLanguage'
import { getTranslation } from '@/lib/i18n'
import Container from '@/components/ui/Container'
import PageHeader from '@/components/ui/PageHeader'
import Card from '@/components/ui/Card'
import Button from '@/components/ui/Button'
import { FileText, Plus, ExternalLink } from 'lucide-react'

interface ProposalWithVersions {
  id: string
  title: string
  description?: string
  status: string
  createdAt: string
  versions: Array<{ id: string }>
}

export default function DashboardPage() {
  const { language } = useLanguage()
  const t = getTranslation(language)
  const [proposals, setProposals] = useState<ProposalWithVersions[]>([])
  const [loading, setLoading] = useState(true)
  const [, setRerender] = useState(0)

  useEffect(() => {
    async function loadProposals() {
      try {
        const res = await fetch('/api/proposals')
        if (res.ok) {
          const data = await res.json()
          setProposals(data)
        }
      } catch (err) {
        console.error('Failed to load proposals:', err)
      } finally {
        setLoading(false)
      }
    }

    loadProposals()
  }, [])

  // Re-render when language changes
  useEffect(() => {
    const handleLanguageChange = () => {
      setRerender(prev => prev + 1)
    }

    window.addEventListener('PROPLY_LANGUAGE_CHANGE', handleLanguageChange)
    return () => window.removeEventListener('PROPLY_LANGUAGE_CHANGE', handleLanguageChange)
  }, [])

  if (loading) {
    return (
      <div className="min-h-screen bg-background py-12 flex items-center justify-center">
        <p className="text-text-muted">Loading...</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background py-12">
      <Container>
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

        {proposals.length === 0 ? (
          <div className="mt-12 flex flex-col items-center justify-center rounded-2xl border border-dashed border-white/[0.10] py-20 text-center">
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-accent/10 text-accent">
              <FileText className="h-6 w-6" />
            </div>
            <p className="text-sm font-medium text-text-primary">{t.dashboard.noProposals}</p>
            <p className="mt-1 text-sm text-text-muted">{t.dashboard.noProposalsDesc}</p>
            <Link href="/proposals/new" className="mt-6">
              <Button>
                <Plus className="h-4 w-4" />
                {t.dashboard.newProposal}
              </Button>
            </Link>
          </div>
        ) : (
          <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {proposals.map((p) => {
              const publishedVersion = p.versions[0]
              return (
                <Card key={p.id} hover>
                  <div className="p-5">
                    <div className="mb-3 flex h-8 w-8 items-center justify-center rounded-lg bg-accent/10 text-accent">
                      <FileText className="h-4 w-4" />
                    </div>
                    <h3 className="text-sm font-semibold text-text-primary line-clamp-1">{p.title}</h3>
                    {p.description && (
                      <p className="mt-1 text-xs text-text-muted line-clamp-2">{p.description}</p>
                    )}
                    <div className="mt-4 flex items-center justify-between">
                      <p className="text-xs text-text-muted">
                        {new Date(p.createdAt).toLocaleDateString(language === 'es' ? 'es-ES' : 'en-US', {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric',
                        })}
                      </p>
                      <div className="flex items-center gap-2">
                        <span className={`inline-flex items-center gap-1 rounded-full px-2 py-1 text-xs font-medium ${
                          p.status === 'published'
                            ? 'bg-accent/10 text-accent'
                            : 'bg-white/5 text-text-muted'
                        }`}>
                          <span className={`h-1.5 w-1.5 rounded-full ${
                            p.status === 'published' ? 'bg-accent' : 'bg-white/30'
                          }`}></span>
                          {p.status === 'published' ? t.dashboard.published : t.dashboard.draft}
                        </span>
                      </div>
                    </div>
                    <div className="mt-4 flex items-center gap-2 border-t border-white/[0.06] pt-4">
                      <Link
                        href={`/proposals/${p.id}/edit`}
                        className="flex-1 text-xs text-text-secondary hover:text-text-primary transition-colors text-center"
                      >
                        {t.dashboard.edit}
                      </Link>
                      {publishedVersion && (
                        <>
                          <Link
                            href={`/proposals/${p.id}/analytics`}
                            className="flex-1 text-xs text-text-secondary hover:text-text-primary transition-colors text-center"
                          >
                            Analytics
                          </Link>
                          <Link
                            href={`/p/${p.id}`}
                            target="_blank"
                            className="flex items-center gap-1 flex-1 text-xs text-accent hover:text-accent-hover transition-colors text-center justify-center"
                          >
                            <ExternalLink className="h-3 w-3" />
                            {t.dashboard.view}
                          </Link>
                        </>
                      )}
                    </div>
                  </div>
                </Card>
              )
            })}
          </div>
        )}
      </Container>
    </div>
  )
}
