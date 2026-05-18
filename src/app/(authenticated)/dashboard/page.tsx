'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import { useLanguage } from '@/hooks/useLanguage'
import { getTranslation } from '@/lib/i18n'
import Container from '@/components/ui/Container'
import PageHeader from '@/components/ui/PageHeader'
import Card from '@/components/ui/Card'
import Button from '@/components/ui/Button'
import CtaDestinations from '@/components/CtaDestinations'
import { Plus, ExternalLink, MessageCircle, Link as LinkIcon, AlertCircle } from 'lucide-react'

interface ProposalWithVersions {
  id: string
  title: string
  description?: string
  status: string
  createdAt: string
  buyUrl?: string
  versions: Array<{ id: string }>
}

function CtaBadge({ buyUrl }: { buyUrl?: string }) {
  if (!buyUrl) {
    return (
      <span className="inline-flex items-center gap-1 text-xs text-orange-400">
        <AlertCircle className="h-3 w-3" />
        Sin destino
      </span>
    )
  }

  const isWA = buyUrl.includes('wa.me')
  let label = ''

  if (isWA) {
    const match = buyUrl.match(/wa\.me\/\+?(\d+)/)
    label = match ? `+${match[1]}` : 'WhatsApp'
  } else {
    try { label = new URL(buyUrl).hostname } catch { label = buyUrl }
  }

  return (
    <span className="inline-flex items-center gap-1 text-xs text-text-muted">
      {isWA
        ? <MessageCircle className="h-3 w-3 text-green-400 flex-shrink-0" />
        : <LinkIcon className="h-3 w-3 text-blue-400 flex-shrink-0" />
      }
      <span className="truncate max-w-[120px]">{label}</span>
    </span>
  )
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

  useEffect(() => {
    const handleLanguageChange = () => setRerender(prev => prev + 1)
    window.addEventListener('PROPLY_LANGUAGE_CHANGE', handleLanguageChange)
    return () => window.removeEventListener('PROPLY_LANGUAGE_CHANGE', handleLanguageChange)
  }, [])

  if (loading) {
    return (
      <div className="min-h-screen bg-background py-12 flex items-center justify-center">
        <p className="text-text-muted">Cargando...</p>
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

        {/* CTA Destinations */}
        <div className="mt-8">
          <CtaDestinations />
        </div>

        {/* Proposals Table */}
        <Card className="mt-6">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-white/[0.06]">
                  <th className="text-left px-6 py-3 text-xs font-semibold text-text-secondary">Producto</th>
                  <th className="text-left px-6 py-3 text-xs font-semibold text-text-secondary">Estado</th>
                  <th className="text-left px-6 py-3 text-xs font-semibold text-text-secondary">Destino CTA</th>
                  <th className="text-left px-6 py-3 text-xs font-semibold text-text-secondary">Creado</th>
                  <th className="text-right px-6 py-3 text-xs font-semibold text-text-secondary">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {proposals.length > 0 ? (
                  proposals.map((p) => {
                    const publishedVersion = p.versions[0]
                    return (
                      <tr key={p.id} className="border-b border-white/[0.06] hover:bg-white/[0.03] transition-colors">
                        <td className="px-6 py-4 text-sm font-medium text-text-primary max-w-xs truncate">{p.title}</td>
                        <td className="px-6 py-4">
                          <span className={`inline-flex items-center gap-1 rounded-full px-2 py-1 text-xs font-medium ${
                            p.status === 'published'
                              ? 'bg-accent/10 text-accent'
                              : 'bg-white/5 text-text-muted'
                          }`}>
                            <span className={`h-1.5 w-1.5 rounded-full ${
                              p.status === 'published' ? 'bg-accent' : 'bg-white/30'
                            }`} />
                            {p.status === 'published' ? t.dashboard.published : t.dashboard.draft}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <CtaBadge buyUrl={p.buyUrl} />
                        </td>
                        <td className="px-6 py-4 text-sm text-text-muted">
                          {new Date(p.createdAt).toLocaleDateString(language === 'es' ? 'es-ES' : 'en-US', {
                            month: 'short', day: 'numeric', year: 'numeric',
                          })}
                        </td>
                        <td className="px-6 py-4 text-right">
                          <div className="flex gap-2 justify-end">
                            <Link
                              href={`/proposals/${p.id}/edit`}
                              className="text-xs text-accent hover:text-accent-hover transition-colors py-1 px-2 hover:bg-white/5 rounded"
                            >
                              {t.dashboard.edit}
                            </Link>
                            {publishedVersion && (
                              <>
                                <Link
                                  href={`/proposals/${p.id}/analytics`}
                                  className="text-xs text-text-secondary hover:text-text-primary transition-colors py-1 px-2 hover:bg-white/5 rounded"
                                >
                                  Analytics
                                </Link>
                                <Link
                                  href={`/p/${p.id}`}
                                  target="_blank"
                                  className="flex items-center gap-1 text-xs text-accent hover:text-accent-hover transition-colors py-1 px-2 hover:bg-white/5 rounded"
                                >
                                  <ExternalLink className="h-3 w-3" />
                                  {t.dashboard.view}
                                </Link>
                              </>
                            )}
                          </div>
                        </td>
                      </tr>
                    )
                  })
                ) : (
                  <tr>
                    <td colSpan={5} className="px-6 py-12 text-center text-sm text-text-muted">
                      {t.dashboard.noProposals}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </Card>
      </Container>
    </div>
  )
}
