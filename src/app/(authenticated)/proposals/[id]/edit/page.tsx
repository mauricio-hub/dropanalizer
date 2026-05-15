'use client'

import { useEffect, useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import Container from '@/components/ui/Container'
import PageHeader from '@/components/ui/PageHeader'
import Button from '@/components/ui/Button'
import { Trash2, Plus, Eye } from 'lucide-react'
import type { ProposalContent, DropshippingContent } from '@/types'

interface TimelinePhase {
  phase: string
  duration: string
  description: string
}

interface Version {
  id: string
  content: ProposalContent | DropshippingContent
  isPublished: boolean
  createdAt: string
}

interface Proposal {
  id: string
  title: string
  template?: 'producto_nuevo' | 'oferta_limitada'
  images?: { id: string; url: string; publicId: string; order: number }[]
  versions: Version[]
}

export default function EditProposalPage() {
  const router = useRouter()
  const params = useParams()
  const proposalId = params.id as string

  const [proposal, setProposal] = useState<Proposal | null>(null)
  const [content, setContent] = useState<ProposalContent | DropshippingContent | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  // Detect content type
  const isDropshipping = content && (content as any).contentType === 'dropshipping'

  useEffect(() => {
    async function loadProposal() {
      try {
        const res = await fetch(`/api/proposals/${proposalId}`)
        if (!res.ok) {
          setError('Proposal not found')
          return
        }

        const data = await res.json()
        setProposal(data)

        if (data.versions?.[0]?.content) {
          setContent(data.versions[0].content)
        }
      } catch (err) {
        setError('Failed to load proposal')
      } finally {
        setLoading(false)
      }
    }

    loadProposal()
  }, [proposalId])

  async function handleSave() {
    if (!proposal?.versions[0]) return

    setSaving(true)
    setError('')

    try {
      const res = await fetch(`/api/proposals/${proposalId}/versions/${proposal.versions[0].id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content }),
      })

      if (!res.ok) {
        const data = await res.json()
        setError(data.error || 'Failed to save')
        return
      }

      const updated = await res.json()
      setContent(updated.content)
    } catch (err) {
      setError('An error occurred while saving')
    } finally {
      setSaving(false)
    }
  }

  async function handlePublish() {
    if (!proposal?.versions[0]) return

    setSaving(true)
    setError('')

    try {
      const res = await fetch(
        `/api/proposals/${proposalId}/versions/${proposal.versions[0].id}`,
        { method: 'POST' }
      )

      if (!res.ok) {
        const data = await res.json()
        setError(data.error || 'Failed to publish')
        return
      }

      const data = await res.json()
      router.push(`/p/${data.publicUrl}`)
    } catch (err) {
      setError('An error occurred while publishing')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background py-12 flex items-center justify-center">
        <p className="text-text-muted">Loading...</p>
      </div>
    )
  }

  if (!proposal || !content) {
    return (
      <div className="min-h-screen bg-background py-12">
        <Container>
          <p className="text-red-400">{error || 'Proposal not found'}</p>
          <Button onClick={() => router.push('/dashboard')} className="mt-4">
            Back to Dashboard
          </Button>
        </Container>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background py-12">
      <Container className="max-w-4xl">
        <PageHeader
          title={proposal.title}
          subtitle={isDropshipping ? 'Edita tu landing page' : 'Edit your proposal before publishing'}
          actions={
            <div className="flex gap-2">
              <Button
                variant="secondary"
                onClick={() => router.push(`/p/${proposal.id}`)}
              >
                <Eye className="h-4 w-4" />
                Preview
              </Button>
            </div>
          }
        />

        {error && (
          <div className="mt-6 rounded-lg border border-red-500/20 bg-red-500/5 p-4">
            <p className="text-sm text-red-400">{error}</p>
          </div>
        )}

        {/* Render based on content type */}
        {isDropshipping ? (
          <DropshippingEditorForm
            content={content as DropshippingContent}
            setContent={(newContent) => setContent(newContent)}
            proposal={proposal}
            onSave={handleSave}
            onPublish={handlePublish}
            saving={saving}
          />
        ) : (
          <ProposalEditorForm
            content={content as ProposalContent}
            setContent={(newContent) => setContent(newContent)}
            onSave={handleSave}
            onPublish={handlePublish}
            saving={saving}
          />
        )}
      </Container>
    </div>
  )
}

// Legacy B2B Proposal Editor
function ProposalEditorForm({
  content,
  setContent,
  onSave,
  onPublish,
  saving,
}: {
  content: ProposalContent
  setContent: (content: ProposalContent) => void
  onSave: () => void
  onPublish: () => void
  saving: boolean
}) {
  return (
    <div className="mt-8 space-y-8">
      {/* Scope */}
          <section className="space-y-3">
            <label className="block text-sm font-semibold text-text-secondary">Project Scope</label>
            <textarea
              value={content.scope}
              onChange={(e) => setContent({ ...content, scope: e.target.value })}
              rows={6}
              className="w-full rounded-xl border border-white/[0.08] bg-surface px-4 py-3 text-sm text-text-primary placeholder:text-text-muted focus:border-accent/50 focus:outline-none focus:ring-1 focus:ring-accent/30 resize-none"
              placeholder="Describe the project scope..."
            />
          </section>

          {/* Deliverables */}
          <section className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-sm font-semibold text-text-secondary">Deliverables</label>
              <button
                type="button"
                onClick={() =>
                  setContent({
                    ...content,
                    deliverables: [...content.deliverables, ''],
                  })
                }
                className="flex items-center gap-1 text-xs text-accent hover:text-accent-hover"
              >
                <Plus className="h-3 w-3" />
                Add
              </button>
            </div>
            <div className="space-y-2">
              {content.deliverables.map((deliverable, idx) => (
                <div key={idx} className="flex gap-2">
                  <input
                    type="text"
                    value={deliverable}
                    onChange={(e) => {
                      const updated = [...content.deliverables]
                      updated[idx] = e.target.value
                      setContent({ ...content, deliverables: updated })
                    }}
                    className="flex-1 rounded-lg border border-white/[0.08] bg-surface px-3 py-2 text-sm text-text-primary placeholder:text-text-muted focus:border-accent/50 focus:outline-none focus:ring-1 focus:ring-accent/30"
                    placeholder={`Deliverable ${idx + 1}`}
                  />
                  <button
                    type="button"
                    onClick={() => {
                      const updated = content.deliverables.filter((_, i) => i !== idx)
                      setContent({ ...content, deliverables: updated })
                    }}
                    className="p-2 text-text-muted hover:text-red-400 transition-colors"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </div>
          </section>

          {/* Timeline */}
          <section className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-sm font-semibold text-text-secondary">Timeline</label>
              <button
                type="button"
                onClick={() =>
                  setContent({
                    ...content,
                    timeline: [
                      ...content.timeline,
                      { phase: '', duration: '', description: '' },
                    ],
                  })
                }
                className="flex items-center gap-1 text-xs text-accent hover:text-accent-hover"
              >
                <Plus className="h-3 w-3" />
                Add Phase
              </button>
            </div>
            <div className="space-y-4">
              {content.timeline.map((phase, idx) => (
                <div key={idx} className="rounded-lg border border-white/[0.08] bg-surface p-4 space-y-3">
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={phase.phase}
                      onChange={(e) => {
                        const updated = [...content.timeline]
                        updated[idx].phase = e.target.value
                        setContent({ ...content, timeline: updated })
                      }}
                      className="flex-1 rounded-lg border border-white/[0.08] bg-background px-3 py-2 text-sm text-text-primary placeholder:text-text-muted focus:border-accent/50 focus:outline-none focus:ring-1 focus:ring-accent/30"
                      placeholder="Phase name"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        const updated = content.timeline.filter((_, i) => i !== idx)
                        setContent({ ...content, timeline: updated })
                      }}
                      className="p-2 text-text-muted hover:text-red-400 transition-colors"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                  <input
                    type="text"
                    value={phase.duration}
                    onChange={(e) => {
                      const updated = [...content.timeline]
                      updated[idx].duration = e.target.value
                      setContent({ ...content, timeline: updated })
                    }}
                    className="w-full rounded-lg border border-white/[0.08] bg-background px-3 py-2 text-sm text-text-primary placeholder:text-text-muted focus:border-accent/50 focus:outline-none focus:ring-1 focus:ring-accent/30"
                    placeholder="Duration (e.g., 2 weeks)"
                  />
                  <textarea
                    value={phase.description}
                    onChange={(e) => {
                      const updated = [...content.timeline]
                      updated[idx].description = e.target.value
                      setContent({ ...content, timeline: updated })
                    }}
                    rows={3}
                    className="w-full rounded-lg border border-white/[0.08] bg-background px-3 py-2 text-sm text-text-primary placeholder:text-text-muted focus:border-accent/50 focus:outline-none focus:ring-1 focus:ring-accent/30 resize-none"
                    placeholder="What will be done in this phase?"
                  />
                </div>
              ))}
            </div>
          </section>

          {/* Pricing */}
          <section className="space-y-3">
            <label className="text-sm font-semibold text-text-secondary">Investment</label>
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs text-text-muted block mb-2">Total Amount</label>
                <input
                  type="number"
                  value={content.pricing.total}
                  onChange={(e) =>
                    setContent({
                      ...content,
                      pricing: { ...content.pricing, total: parseFloat(e.target.value) },
                    })
                  }
                  className="w-full rounded-lg border border-white/[0.08] bg-surface px-3 py-2 text-sm text-text-primary placeholder:text-text-muted focus:border-accent/50 focus:outline-none focus:ring-1 focus:ring-accent/30"
                  placeholder="5000"
                />
              </div>
              <div>
                <label className="text-xs text-text-muted block mb-2">Currency</label>
                <select
                  value={content.pricing.currency}
                  onChange={(e) =>
                    setContent({
                      ...content,
                      pricing: { ...content.pricing, currency: e.target.value },
                    })
                  }
                  className="w-full rounded-lg border border-white/[0.08] bg-surface px-3 py-2 text-sm text-text-primary focus:border-accent/50 focus:outline-none focus:ring-1 focus:ring-accent/30"
                >
                  <option>USD</option>
                  <option>EUR</option>
                  <option>ARS</option>
                  <option>MXN</option>
                  <option>COP</option>
                </select>
              </div>
            </div>
            <div>
              <label className="text-xs text-text-muted block mb-2">Cost Breakdown (optional)</label>
              <textarea
                value={content.pricing.breakdown || ''}
                onChange={(e) =>
                  setContent({
                    ...content,
                    pricing: { ...content.pricing, breakdown: e.target.value },
                  })
                }
                rows={4}
                className="w-full rounded-lg border border-white/[0.08] bg-surface px-3 py-2 text-sm text-text-primary placeholder:text-text-muted focus:border-accent/50 focus:outline-none focus:ring-1 focus:ring-accent/30 resize-none"
                placeholder="How is the price distributed? (optional)"
              />
            </div>
          </section>

      {/* Actions */}
      <div className="mt-12 flex gap-3 pt-8 border-t border-white/[0.06]">
        <Button onClick={onSave} disabled={saving}>
          {saving ? 'Saving...' : 'Save Draft'}
        </Button>
        <Button onClick={onPublish} disabled={saving} variant="primary">
          {saving ? 'Publishing...' : 'Publish Proposal'}
        </Button>
        <Button
          variant="ghost"
          disabled={saving}
          onClick={() => {}} // handled by parent
        >
          Cancel
        </Button>
      </div>
    </div>
  )
  }

// Dropshipping Landing Editor
function DropshippingEditorForm({
  content,
  setContent,
  proposal,
  onSave,
  onPublish,
  saving,
}: {
  content: DropshippingContent
  setContent: (content: DropshippingContent) => void
  proposal: Proposal
  onSave: () => void
  onPublish: () => void
  saving: boolean
}) {
  return (
    <div className="mt-8 space-y-8">
      {/* Headline */}
      <section className="space-y-3">
        <label className="block text-sm font-semibold text-text-secondary">Headline</label>
        <input
          type="text"
          value={content.headline}
          onChange={(e) => setContent({ ...content, headline: e.target.value })}
          placeholder="Ej: La solución que esperabas"
          className="w-full rounded-xl border border-white/[0.08] bg-surface px-4 py-3 text-sm text-text-primary placeholder:text-text-muted focus:border-accent/50 focus:outline-none focus:ring-1 focus:ring-accent/30"
        />
      </section>

      {/* Benefits */}
      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <label className="text-sm font-semibold text-text-secondary">Beneficios</label>
          <button
            type="button"
            onClick={() =>
              setContent({
                ...content,
                benefits: [...content.benefits, ''],
              })
            }
            className="flex items-center gap-1 text-xs text-accent hover:text-accent-hover"
          >
            <Plus className="h-3 w-3" />
            Add
          </button>
        </div>
        <div className="space-y-2">
          {content.benefits.map((benefit, idx) => (
            <div key={idx} className="flex gap-2">
              <input
                type="text"
                value={benefit}
                onChange={(e) => {
                  const updated = [...content.benefits]
                  updated[idx] = e.target.value
                  setContent({ ...content, benefits: updated })
                }}
                className="flex-1 rounded-lg border border-white/[0.08] bg-surface px-3 py-2 text-sm text-text-primary placeholder:text-text-muted focus:border-accent/50 focus:outline-none focus:ring-1 focus:ring-accent/30"
                placeholder={`Beneficio ${idx + 1}`}
              />
              <button
                type="button"
                onClick={() => {
                  const updated = content.benefits.filter((_, i) => i !== idx)
                  setContent({ ...content, benefits: updated })
                }}
                className="p-2 text-text-muted hover:text-red-400 transition-colors"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          ))}
        </div>
      </section>

      {/* Social Proof */}
      <section className="space-y-3">
        <label className="block text-sm font-semibold text-text-secondary">Prueba Social</label>
        <textarea
          value={content.socialProof}
          onChange={(e) => setContent({ ...content, socialProof: e.target.value })}
          rows={3}
          placeholder="Testimonio o estadística que genere confianza"
          className="w-full rounded-xl border border-white/[0.08] bg-surface px-4 py-3 text-sm text-text-primary placeholder:text-text-muted focus:border-accent/50 focus:outline-none focus:ring-1 focus:ring-accent/30 resize-none"
        />
      </section>

      {/* FAQ */}
      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <label className="text-sm font-semibold text-text-secondary">Preguntas Frecuentes</label>
          <button
            type="button"
            onClick={() =>
              setContent({
                ...content,
                faq: [...content.faq, { question: '', answer: '' }],
              })
            }
            className="flex items-center gap-1 text-xs text-accent hover:text-accent-hover"
          >
            <Plus className="h-3 w-3" />
            Add
          </button>
        </div>
        <div className="space-y-4">
          {content.faq.map((item, idx) => (
            <div key={idx} className="rounded-lg border border-white/[0.08] bg-surface p-4 space-y-3">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={item.question}
                  onChange={(e) => {
                    const updated = [...content.faq]
                    updated[idx].question = e.target.value
                    setContent({ ...content, faq: updated })
                  }}
                  placeholder="Pregunta"
                  className="flex-1 rounded-lg border border-white/[0.08] bg-background px-3 py-2 text-sm text-text-primary placeholder:text-text-muted focus:border-accent/50 focus:outline-none focus:ring-1 focus:ring-accent/30"
                />
                <button
                  type="button"
                  onClick={() => {
                    const updated = content.faq.filter((_, i) => i !== idx)
                    setContent({ ...content, faq: updated })
                  }}
                  className="p-2 text-text-muted hover:text-red-400 transition-colors"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
              <textarea
                value={item.answer}
                onChange={(e) => {
                  const updated = [...content.faq]
                  updated[idx].answer = e.target.value
                  setContent({ ...content, faq: updated })
                }}
                rows={2}
                placeholder="Respuesta"
                className="w-full rounded-lg border border-white/[0.08] bg-background px-3 py-2 text-sm text-text-primary placeholder:text-text-muted focus:border-accent/50 focus:outline-none focus:ring-1 focus:ring-accent/30 resize-none"
              />
            </div>
          ))}
        </div>
      </section>

      {/* Urgency (only for oferta_limitada) */}
      {proposal.template === 'oferta_limitada' && (
        <section className="space-y-3">
          <label className="block text-sm font-semibold text-text-secondary">Urgencia</label>
          <textarea
            value={content.urgency || ''}
            onChange={(e) => setContent({ ...content, urgency: e.target.value })}
            rows={2}
            placeholder="Ej: Solo quedan 15 unidades a este precio"
            className="w-full rounded-xl border border-white/[0.08] bg-surface px-4 py-3 text-sm text-text-primary placeholder:text-text-muted focus:border-accent/50 focus:outline-none focus:ring-1 focus:ring-accent/30 resize-none"
          />
        </section>
      )}

      {/* Pricing */}
      <section className="space-y-3">
        <label className="text-sm font-semibold text-text-secondary">Precio</label>
        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <label className="text-xs text-text-muted block mb-2">Precio</label>
            <input
              type="number"
              value={content.pricing.price}
              onChange={(e) =>
                setContent({
                  ...content,
                  pricing: { ...content.pricing, price: parseFloat(e.target.value) },
                })
              }
              step="0.01"
              min="0"
              className="w-full rounded-lg border border-white/[0.08] bg-surface px-3 py-2 text-sm text-text-primary placeholder:text-text-muted focus:border-accent/50 focus:outline-none focus:ring-1 focus:ring-accent/30"
              placeholder="99.99"
            />
          </div>
          <div>
            <label className="text-xs text-text-muted block mb-2">Moneda</label>
            <select
              value={content.pricing.currency}
              onChange={(e) =>
                setContent({
                  ...content,
                  pricing: { ...content.pricing, currency: e.target.value },
                })
              }
              className="w-full rounded-lg border border-white/[0.08] bg-surface px-3 py-2 text-sm text-text-primary focus:border-accent/50 focus:outline-none focus:ring-1 focus:ring-accent/30"
            >
              <option value="USD">USD</option>
              <option value="EUR">EUR</option>
              <option value="MXN">MXN</option>
              <option value="ARS">ARS</option>
              <option value="COP">COP</option>
            </select>
          </div>
        </div>

        {/* Original Price (for oferta_limitada) */}
        {proposal.template === 'oferta_limitada' && (
          <div>
            <label className="text-xs text-text-muted block mb-2">Precio Original (opcional)</label>
            <input
              type="number"
              value={content.pricing.originalPrice || ''}
              onChange={(e) =>
                setContent({
                  ...content,
                  pricing: { ...content.pricing, originalPrice: e.target.value ? parseFloat(e.target.value) : undefined },
                })
              }
              step="0.01"
              min="0"
              className="w-full rounded-lg border border-white/[0.08] bg-surface px-3 py-2 text-sm text-text-primary placeholder:text-text-muted focus:border-accent/50 focus:outline-none focus:ring-1 focus:ring-accent/30"
              placeholder="Precio sin descuento"
            />
          </div>
        )}
      </section>

      {/* Actions */}
      <div className="mt-12 flex gap-3 pt-8 border-t border-white/[0.06]">
        <Button onClick={onSave} disabled={saving}>
          {saving ? 'Saving...' : 'Save Draft'}
        </Button>
        <Button onClick={onPublish} disabled={saving} variant="primary">
          {saving ? 'Publishing...' : 'Publish Landing'}
        </Button>
        <Button
          variant="ghost"
          disabled={saving}
          onClick={() => {}} // handled by parent
        >
          Cancel
        </Button>
      </div>
    </div>
  )
}
