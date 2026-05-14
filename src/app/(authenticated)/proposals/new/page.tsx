'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Container from '@/components/ui/Container'
import PageHeader from '@/components/ui/PageHeader'
import Button from '@/components/ui/Button'
import { Sparkles, Check } from 'lucide-react'
import { useLanguage } from '@/hooks/useLanguage'
import { getTranslation } from '@/lib/i18n'

interface CatalogItem {
  id: string
  name: string
  description: string | null
  price: number | null
  type: 'service' | 'product'
}

export default function NewProposalPage() {
  const router = useRouter()
  const { language } = useLanguage()
  const t = getTranslation(language)
  const [title, setTitle] = useState('')
  const [brief, setBrief] = useState('')
  const [generateWithAI, setGenerateWithAI] = useState(true)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [catalogItems, setCatalogItems] = useState<CatalogItem[]>([])
  const [selectedItems, setSelectedItems] = useState<string[]>([])
  const [loadingCatalog, setLoadingCatalog] = useState(true)

  useEffect(() => {
    async function loadCatalog() {
      try {
        const res = await fetch('/api/catalog')
        if (res.ok) {
          const data = await res.json()
          setCatalogItems(data)
        }
      } catch (err) {
        console.error('Failed to load catalog:', err)
      } finally {
        setLoadingCatalog(false)
      }
    }
    loadCatalog()
  }, [])

  function toggleItem(id: string) {
    setSelectedItems(prev =>
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    )
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const res = await fetch('/api/proposals', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title,
          brief,
          generateWithAI,
          selectedCatalogItemIds: selectedItems,
        }),
      })

      if (!res.ok) {
        const data = await res.json()
        setError(data.error || 'Failed to create proposal')
        setLoading(false)
        return
      }

      const proposal = await res.json()
      router.push(`/proposals/${proposal.id}/edit`)
    } catch (err) {
      setError('An error occurred. Please try again.')
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-background py-12">
      <Container className="max-w-2xl">
        <PageHeader
          title={t.createProposal.title}
          subtitle={t.createProposal.subtitle}
        />

        <form onSubmit={handleSubmit} className="mt-8 space-y-6">
          {error && (
            <div className="rounded-lg border border-red-500/20 bg-red-500/5 p-4">
              <p className="text-sm text-red-400">{error}</p>
            </div>
          )}

          <div className="space-y-2">
            <label className="text-sm font-semibold text-text-secondary">{t.createProposal.titleLabel}</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              placeholder={t.createProposal.titlePlaceholder}
              className="w-full rounded-xl border border-white/[0.08] bg-surface px-4 py-3 text-sm text-text-primary placeholder:text-text-muted focus:border-accent/50 focus:outline-none focus:ring-1 focus:ring-accent/30"
            />
            <p className="text-xs text-text-muted">{title.length}/200 {t.createProposal.characters}</p>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-semibold text-text-secondary">{t.createProposal.briefLabel}</label>
            <textarea
              value={brief}
              onChange={(e) => setBrief(e.target.value)}
              required
              rows={8}
              placeholder={t.createProposal.briefPlaceholder}
              className="w-full rounded-xl border border-white/[0.08] bg-surface px-4 py-3 text-sm text-text-primary placeholder:text-text-muted focus:border-accent/50 focus:outline-none focus:ring-1 focus:ring-accent/30 resize-none"
            />
            <p className="text-xs text-text-muted">{brief.length}/5000 {t.createProposal.characters}</p>
          </div>

          {!loadingCatalog && catalogItems.length > 0 && (
            <div className="space-y-3">
              <label className="text-sm font-semibold text-text-secondary">
                Incluir servicios/productos (opcional)
              </label>
              <div className="grid gap-2 sm:grid-cols-2">
                {catalogItems.map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => toggleItem(item.id)}
                    className={`text-left rounded-lg border-2 p-3 transition-all ${
                      selectedItems.includes(item.id)
                        ? 'border-accent bg-accent/10'
                        : 'border-white/[0.08] hover:border-white/[0.15]'
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <p className="text-sm font-medium text-text-primary">{item.name}</p>
                        <p className="text-xs text-text-muted mt-1">
                          {item.type === 'service' ? t.catalog.service : t.catalog.product}
                        </p>
                        {item.price && (
                          <p className="text-xs text-accent mt-1">${item.price.toFixed(2)}</p>
                        )}
                      </div>
                      {selectedItems.includes(item.id) && (
                        <Check className="h-4 w-4 text-accent flex-shrink-0 ml-2" />
                      )}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="rounded-lg border border-accent/20 bg-accent/5 p-4">
            <label className="flex items-start gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={generateWithAI}
                onChange={(e) => setGenerateWithAI(e.target.checked)}
                className="mt-1 h-4 w-4 rounded border-white/20 bg-surface accent-accent"
              />
              <div>
                <p className="flex items-center gap-2 text-sm font-medium text-text-primary">
                  <Sparkles className="h-4 w-4 text-accent" />
                  {t.createProposal.generateWithAI}
                </p>
                <p className="text-xs text-text-muted mt-1">
                  {t.createProposal.generateWithAIDesc}
                </p>
              </div>
            </label>
          </div>

          <div className="flex items-center gap-3 pt-4">
            <Button type="submit" disabled={loading || title.trim().length === 0 || brief.trim().length === 0}>
              {loading ? (
                <>
                  <Sparkles className="h-4 w-4 animate-spin" />
                  {generateWithAI ? t.createProposal.generating : t.createProposal.creating}
                </>
              ) : (
                <>
                  <Sparkles className="h-4 w-4" />
                  {t.createProposal.createButton}
                </>
              )}
            </Button>
            <Button
              type="button"
              variant="ghost"
              onClick={() => router.push('/dashboard')}
              disabled={loading}
            >
              {t.createProposal.cancel}
            </Button>
          </div>
        </form>
      </Container>
    </div>
  )
}
