'use client'

import { useEffect, useState, useRef, useCallback } from 'react'
import { useRouter, useParams } from 'next/navigation'
import Button from '@/components/ui/Button'
import { Trash2, Plus, ChevronDown, Check, Cloud, CloudOff, Loader2, Monitor, Pencil } from 'lucide-react'
import type { ProposalContent, DropshippingContent } from '@/types'

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

type SaveState = 'saved' | 'unsaved' | 'saving' | 'error'
type ViewMode = 'editor' | 'split' | 'preview'

// ── Section wrapper ───────────────────────────────────────────────────────────

function Section({
  title,
  complete,
  defaultOpen = false,
  children,
}: {
  title: string
  complete: boolean
  defaultOpen?: boolean
  children: React.ReactNode
}) {
  const [open, setOpen] = useState(defaultOpen)

  return (
    <div className="rounded-xl border border-white/[0.08] bg-surface overflow-hidden">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between px-5 py-4 hover:bg-white/[0.02] transition-colors"
      >
        <div className="flex items-center gap-3">
          <span className={`flex-shrink-0 h-5 w-5 rounded-full flex items-center justify-center transition-colors ${
            complete ? 'bg-accent/20 text-accent' : 'bg-white/[0.06] text-white/20'
          }`}>
            {complete ? <Check className="h-3 w-3" /> : <span className="h-1.5 w-1.5 rounded-full bg-current" />}
          </span>
          <span className="text-sm font-semibold text-text-primary">{title}</span>
        </div>
        <ChevronDown className={`h-4 w-4 text-text-muted transition-transform duration-200 ${open ? 'rotate-180' : ''}`} />
      </button>
      {open && (
        <div className="px-5 pb-5 border-t border-white/[0.06] pt-4 space-y-3">
          {children}
        </div>
      )}
    </div>
  )
}

// ── Save indicator ────────────────────────────────────────────────────────────

function SaveIndicator({ state }: { state: SaveState }) {
  if (state === 'saving') return (
    <span className="flex items-center gap-1.5 text-xs text-text-muted">
      <Loader2 className="h-3 w-3 animate-spin" />Guardando...
    </span>
  )
  if (state === 'saved') return (
    <span className="flex items-center gap-1.5 text-xs text-accent">
      <Cloud className="h-3 w-3" />Guardado
    </span>
  )
  if (state === 'error') return (
    <span className="flex items-center gap-1.5 text-xs text-red-400">
      <CloudOff className="h-3 w-3" />Error al guardar
    </span>
  )
  return (
    <span className="flex items-center gap-1.5 text-xs text-orange-400">
      <span className="h-1.5 w-1.5 rounded-full bg-orange-400" />Cambios sin guardar
    </span>
  )
}

// ── View mode toggle ──────────────────────────────────────────────────────────

function ViewToggle({ mode, onChange }: { mode: ViewMode; onChange: (m: ViewMode) => void }) {
  const options: { value: ViewMode; icon: React.ReactNode; label: string }[] = [
    { value: 'editor', icon: <Pencil className="h-3.5 w-3.5" />, label: 'Editor' },
    { value: 'split', icon: <Monitor className="h-3.5 w-3.5" />, label: 'Split' },
  ]
  return (
    <div className="hidden md:flex items-center rounded-lg border border-white/[0.08] overflow-hidden">
      {options.map((opt) => (
        <button
          key={opt.value}
          onClick={() => onChange(opt.value)}
          className={`flex items-center gap-1.5 px-3 py-1.5 text-xs transition-colors ${
            mode === opt.value
              ? 'bg-accent text-background font-semibold'
              : 'text-text-muted hover:text-text-primary'
          }`}
        >
          {opt.icon}
          {opt.label}
        </button>
      ))}
    </div>
  )
}

// ── Main page ─────────────────────────────────────────────────────────────────

export default function EditProposalPage() {
  const router = useRouter()
  const params = useParams()
  const proposalId = params.id as string

  const [proposal, setProposal] = useState<Proposal | null>(null)
  const [content, setContent] = useState<ProposalContent | DropshippingContent | null>(null)
  const [loading, setLoading] = useState(true)
  const [saveState, setSaveState] = useState<SaveState>('saved')
  const [publishing, setPublishing] = useState(false)
  const [error, setError] = useState('')
  const [viewMode, setViewMode] = useState<ViewMode>('split')
  const [iframeReady, setIframeReady] = useState(false)

  const isDropshipping = content && (content as any).contentType === 'dropshipping'
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const versionIdRef = useRef<string | null>(null)
  const isFirstLoad = useRef(true)
  const iframeRef = useRef<HTMLIFrameElement>(null)

  // Listen for iframe ready signal
  useEffect(() => {
    function handleMessage(event: MessageEvent) {
      if (event.data?.type === 'PROPLY_PREVIEW_READY') {
        setIframeReady(true)
        // Send current content immediately once iframe is ready
        if (content) {
          iframeRef.current?.contentWindow?.postMessage(
            { type: 'PROPLY_PREVIEW_UPDATE', content },
            '*'
          )
        }
      }
    }
    window.addEventListener('message', handleMessage)
    return () => window.removeEventListener('message', handleMessage)
  }, [content])

  useEffect(() => {
    async function loadProposal() {
      try {
        const res = await fetch(`/api/proposals/${proposalId}`)
        if (!res.ok) { setError('Propuesta no encontrada'); return }
        const data = await res.json()
        setProposal(data)
        if (data.versions?.[0]?.content) {
          setContent(data.versions[0].content)
          versionIdRef.current = data.versions[0].id
        }
      } catch {
        setError('Error al cargar la propuesta')
      } finally {
        setLoading(false)
      }
    }
    loadProposal()
  }, [proposalId])

  const saveContent = useCallback(async (newContent: ProposalContent | DropshippingContent) => {
    if (!versionIdRef.current) return
    setSaveState('saving')
    try {
      const res = await fetch(`/api/proposals/${proposalId}/versions/${versionIdRef.current}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: newContent }),
      })
      setSaveState(res.ok ? 'saved' : 'error')
    } catch {
      setSaveState('error')
    }
  }, [proposalId])

  const handleContentChange = useCallback((newContent: ProposalContent | DropshippingContent) => {
    setContent(newContent)

    // Push to iframe immediately — no debounce needed for preview
    if (iframeReady) {
      iframeRef.current?.contentWindow?.postMessage(
        { type: 'PROPLY_PREVIEW_UPDATE', content: newContent },
        '*'
      )
    }

    if (isFirstLoad.current) { isFirstLoad.current = false; return }
    setSaveState('unsaved')
    if (debounceRef.current) clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => saveContent(newContent), 1500)
  }, [saveContent, iframeReady])

  async function handlePublish() {
    if (!proposal?.versions[0]) return
    if (debounceRef.current) {
      clearTimeout(debounceRef.current)
      if (content) await saveContent(content)
    }
    setPublishing(true)
    setError('')
    try {
      const res = await fetch(
        `/api/proposals/${proposalId}/versions/${proposal.versions[0].id}`,
        { method: 'POST' }
      )
      if (!res.ok) {
        const data = await res.json()
        setError(data.error || 'Error al publicar')
        return
      }
      const data = await res.json()
      router.push(`/p/${data.publicUrl}`)
    } catch {
      setError('Error al publicar')
    } finally {
      setPublishing(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="h-6 w-6 animate-spin text-accent" />
          <p className="text-sm text-text-muted">Cargando...</p>
        </div>
      </div>
    )
  }

  if (!proposal || !content) {
    return (
      <div className="min-h-screen bg-background py-12 px-6">
        <p className="text-red-400">{error || 'Propuesta no encontrada'}</p>
        <Button onClick={() => router.push('/dashboard')} className="mt-4">Volver</Button>
      </div>
    )
  }

  const isSplit = viewMode === 'split'

  return (
    <div className="h-screen flex flex-col bg-background overflow-hidden">
      {/* ── Top bar ── */}
      <div className="flex-shrink-0 flex items-center justify-between px-4 py-3 border-b border-white/[0.06] bg-background/95 backdrop-blur z-10">
        <div className="flex items-center gap-4 min-w-0">
          <button
            onClick={() => router.push('/dashboard')}
            className="text-xs text-text-muted hover:text-text-primary transition-colors flex-shrink-0"
          >
            ← Dashboard
          </button>
          <div className="hidden sm:block h-4 w-px bg-white/[0.08]" />
          <h1 className="text-sm font-semibold text-text-primary truncate">{proposal.title}</h1>
        </div>

        <div className="flex items-center gap-3 flex-shrink-0">
          <SaveIndicator state={saveState} />
          <ViewToggle mode={viewMode} onChange={setViewMode} />
          <Button
            onClick={handlePublish}
            disabled={publishing || saveState === 'saving'}
            variant="primary"
            className="text-xs py-1.5 px-4"
          >
            {publishing ? <><Loader2 className="h-3.5 w-3.5 animate-spin" /> Publicando...</> : 'Publicar'}
          </Button>
        </div>
      </div>

      {error && (
        <div className="flex-shrink-0 px-4 py-2 bg-red-500/10 border-b border-red-500/20">
          <p className="text-xs text-red-400">{error}</p>
        </div>
      )}

      {/* ── Main split area ── */}
      <div className="flex-1 flex overflow-hidden">
        {/* Editor panel */}
        <div className={`flex flex-col overflow-hidden transition-all duration-300 ${
          isSplit ? 'w-[420px] flex-shrink-0 border-r border-white/[0.06]' : 'flex-1'
        }`}>
          <div className="flex-1 overflow-y-auto">
            <div className="p-5 space-y-3">
              {isDropshipping ? (
                <DropshippingEditorForm
                  content={content as DropshippingContent}
                  setContent={handleContentChange}
                  proposal={proposal}
                />
              ) : (
                <ProposalEditorForm
                  content={content as ProposalContent}
                  setContent={handleContentChange}
                />
              )}
            </div>
          </div>
        </div>

        {/* Preview panel */}
        {isSplit && (
          <div className="flex-1 flex flex-col overflow-hidden bg-gray-100">
            <div className="flex-shrink-0 flex items-center justify-between px-4 py-2 bg-white border-b border-gray-200">
              <span className="text-xs font-medium text-gray-500">Vista previa</span>
              {!iframeReady && (
                <span className="flex items-center gap-1.5 text-xs text-gray-400">
                  <Loader2 className="h-3 w-3 animate-spin" />Cargando preview...
                </span>
              )}
            </div>
            <div className="flex-1 overflow-hidden">
              <iframe
                ref={iframeRef}
                src={`/p/${proposalId}/preview`}
                className="w-full h-full border-0"
                title="Preview"
              />
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

// ── Dropshipping editor ───────────────────────────────────────────────────────

function DropshippingEditorForm({
  content,
  setContent,
  proposal,
}: {
  content: DropshippingContent
  setContent: (c: DropshippingContent) => void
  proposal: Proposal
}) {
  const isOferta = proposal.template === 'oferta_limitada'

  return (
    <>
      <Section title="Headline" complete={!!content.headline?.trim()} defaultOpen>
        <input
          type="text"
          value={content.headline}
          onChange={(e) => setContent({ ...content, headline: e.target.value })}
          placeholder="Ej: La solución que esperabas"
          className="w-full rounded-lg border border-white/[0.08] bg-background px-4 py-3 text-sm text-text-primary placeholder:text-text-muted focus:border-accent/50 focus:outline-none focus:ring-1 focus:ring-accent/30"
        />
      </Section>

      <Section title="Beneficios" complete={content.benefits?.some(b => b.trim())}>
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
                className="flex-1 rounded-lg border border-white/[0.08] bg-background px-3 py-2 text-sm text-text-primary placeholder:text-text-muted focus:border-accent/50 focus:outline-none"
                placeholder={`Beneficio ${idx + 1}`}
              />
              <button
                type="button"
                onClick={() => setContent({ ...content, benefits: content.benefits.filter((_, i) => i !== idx) })}
                className="p-2 text-text-muted hover:text-red-400 transition-colors"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          ))}
          <button
            type="button"
            onClick={() => setContent({ ...content, benefits: [...content.benefits, ''] })}
            className="flex items-center gap-1.5 text-xs text-accent hover:text-accent-hover transition-colors pt-1"
          >
            <Plus className="h-3 w-3" />Agregar beneficio
          </button>
        </div>
      </Section>

      <Section title="Prueba Social" complete={!!content.socialProof?.trim()}>
        <textarea
          value={content.socialProof}
          onChange={(e) => setContent({ ...content, socialProof: e.target.value })}
          rows={3}
          placeholder="Testimonio o estadística que genere confianza"
          className="w-full rounded-lg border border-white/[0.08] bg-background px-4 py-3 text-sm text-text-primary placeholder:text-text-muted focus:border-accent/50 focus:outline-none resize-none"
        />
      </Section>

      <Section title="Preguntas Frecuentes" complete={content.faq?.some(f => f.question.trim())}>
        <div className="space-y-3">
          {content.faq.map((item, idx) => (
            <div key={idx} className="rounded-lg border border-white/[0.06] bg-background/50 p-3 space-y-2">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={item.question}
                  onChange={(e) => {
                    const updated = [...content.faq]
                    updated[idx] = { ...updated[idx], question: e.target.value }
                    setContent({ ...content, faq: updated })
                  }}
                  placeholder="Pregunta"
                  className="flex-1 rounded-lg border border-white/[0.08] bg-background px-3 py-2 text-sm text-text-primary placeholder:text-text-muted focus:border-accent/50 focus:outline-none"
                />
                <button
                  type="button"
                  onClick={() => setContent({ ...content, faq: content.faq.filter((_, i) => i !== idx) })}
                  className="p-2 text-text-muted hover:text-red-400 transition-colors"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
              <textarea
                value={item.answer}
                onChange={(e) => {
                  const updated = [...content.faq]
                  updated[idx] = { ...updated[idx], answer: e.target.value }
                  setContent({ ...content, faq: updated })
                }}
                rows={2}
                placeholder="Respuesta"
                className="w-full rounded-lg border border-white/[0.08] bg-background px-3 py-2 text-sm text-text-primary placeholder:text-text-muted focus:border-accent/50 focus:outline-none resize-none"
              />
            </div>
          ))}
          <button
            type="button"
            onClick={() => setContent({ ...content, faq: [...content.faq, { question: '', answer: '' }] })}
            className="flex items-center gap-1.5 text-xs text-accent hover:text-accent-hover transition-colors"
          >
            <Plus className="h-3 w-3" />Agregar pregunta
          </button>
        </div>
      </Section>

      {isOferta && (
        <Section title="Mensaje de Urgencia" complete={!!content.urgency?.trim()}>
          <textarea
            value={content.urgency || ''}
            onChange={(e) => setContent({ ...content, urgency: e.target.value })}
            rows={2}
            placeholder="Ej: Solo quedan 15 unidades a este precio"
            className="w-full rounded-lg border border-white/[0.08] bg-background px-4 py-3 text-sm text-text-primary placeholder:text-text-muted focus:border-accent/50 focus:outline-none resize-none"
          />
        </Section>
      )}

      <Section title="Precio" complete={!!content.pricing?.price}>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-xs text-text-muted block mb-1.5">Precio de venta</label>
            <input
              type="number"
              value={content.pricing.price}
              onChange={(e) => setContent({ ...content, pricing: { ...content.pricing, price: parseFloat(e.target.value) } })}
              step="0.01" min="0"
              className="w-full rounded-lg border border-white/[0.08] bg-background px-3 py-2 text-sm text-text-primary focus:border-accent/50 focus:outline-none"
              placeholder="99.99"
            />
          </div>
          <div>
            <label className="text-xs text-text-muted block mb-1.5">Moneda</label>
            <select
              value={content.pricing.currency}
              onChange={(e) => setContent({ ...content, pricing: { ...content.pricing, currency: e.target.value } })}
              className="w-full rounded-lg border border-white/[0.08] bg-background px-3 py-2 text-sm text-text-primary focus:border-accent/50 focus:outline-none"
            >
              <option value="USD">USD</option>
              <option value="EUR">EUR</option>
              <option value="MXN">MXN</option>
              <option value="ARS">ARS</option>
              <option value="COP">COP</option>
            </select>
          </div>
        </div>
        {isOferta && (
          <div className="mt-3">
            <label className="text-xs text-text-muted block mb-1.5">Precio original (tachado)</label>
            <input
              type="number"
              value={content.pricing.originalPrice || ''}
              onChange={(e) => setContent({ ...content, pricing: { ...content.pricing, originalPrice: e.target.value ? parseFloat(e.target.value) : undefined } })}
              step="0.01" min="0"
              className="w-full rounded-lg border border-white/[0.08] bg-background px-3 py-2 text-sm text-text-primary focus:border-accent/50 focus:outline-none"
              placeholder="Precio sin descuento"
            />
          </div>
        )}
      </Section>
    </>
  )
}

// ── B2B proposal editor ───────────────────────────────────────────────────────

function ProposalEditorForm({
  content,
  setContent,
}: {
  content: ProposalContent
  setContent: (c: ProposalContent) => void
}) {
  return (
    <>
      <Section title="Alcance del proyecto" complete={!!content.scope?.trim()} defaultOpen>
        <textarea
          value={content.scope}
          onChange={(e) => setContent({ ...content, scope: e.target.value })}
          rows={5}
          className="w-full rounded-lg border border-white/[0.08] bg-background px-4 py-3 text-sm text-text-primary placeholder:text-text-muted focus:border-accent/50 focus:outline-none resize-none"
          placeholder="Describe el alcance del proyecto..."
        />
      </Section>

      <Section title="Entregables" complete={content.deliverables?.some(d => d.trim())}>
        <div className="space-y-2">
          {content.deliverables.map((d, idx) => (
            <div key={idx} className="flex gap-2">
              <input
                type="text"
                value={d}
                onChange={(e) => {
                  const updated = [...content.deliverables]
                  updated[idx] = e.target.value
                  setContent({ ...content, deliverables: updated })
                }}
                className="flex-1 rounded-lg border border-white/[0.08] bg-background px-3 py-2 text-sm text-text-primary placeholder:text-text-muted focus:border-accent/50 focus:outline-none"
                placeholder={`Entregable ${idx + 1}`}
              />
              <button
                type="button"
                onClick={() => setContent({ ...content, deliverables: content.deliverables.filter((_, i) => i !== idx) })}
                className="p-2 text-text-muted hover:text-red-400 transition-colors"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          ))}
          <button
            type="button"
            onClick={() => setContent({ ...content, deliverables: [...content.deliverables, ''] })}
            className="flex items-center gap-1.5 text-xs text-accent hover:text-accent-hover transition-colors pt-1"
          >
            <Plus className="h-3 w-3" />Agregar entregable
          </button>
        </div>
      </Section>

      <Section title="Timeline" complete={content.timeline?.some(t => t.phase?.trim())}>
        <div className="space-y-3">
          {content.timeline.map((phase, idx) => (
            <div key={idx} className="rounded-lg border border-white/[0.06] bg-background/50 p-3 space-y-2">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={phase.phase}
                  onChange={(e) => {
                    const updated = [...content.timeline]
                    updated[idx] = { ...updated[idx], phase: e.target.value }
                    setContent({ ...content, timeline: updated })
                  }}
                  className="flex-1 rounded-lg border border-white/[0.08] bg-background px-3 py-2 text-sm text-text-primary placeholder:text-text-muted focus:border-accent/50 focus:outline-none"
                  placeholder="Nombre de la fase"
                />
                <button
                  type="button"
                  onClick={() => setContent({ ...content, timeline: content.timeline.filter((_, i) => i !== idx) })}
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
                  updated[idx] = { ...updated[idx], duration: e.target.value }
                  setContent({ ...content, timeline: updated })
                }}
                className="w-full rounded-lg border border-white/[0.08] bg-background px-3 py-2 text-sm text-text-primary placeholder:text-text-muted focus:border-accent/50 focus:outline-none"
                placeholder="Duración (ej: 2 semanas)"
              />
              <textarea
                value={phase.description}
                onChange={(e) => {
                  const updated = [...content.timeline]
                  updated[idx] = { ...updated[idx], description: e.target.value }
                  setContent({ ...content, timeline: updated })
                }}
                rows={2}
                className="w-full rounded-lg border border-white/[0.08] bg-background px-3 py-2 text-sm text-text-primary placeholder:text-text-muted focus:border-accent/50 focus:outline-none resize-none"
                placeholder="¿Qué se hace en esta fase?"
              />
            </div>
          ))}
          <button
            type="button"
            onClick={() => setContent({ ...content, timeline: [...content.timeline, { phase: '', duration: '', description: '' }] })}
            className="flex items-center gap-1.5 text-xs text-accent hover:text-accent-hover transition-colors"
          >
            <Plus className="h-3 w-3" />Agregar fase
          </button>
        </div>
      </Section>

      <Section title="Precio" complete={!!content.pricing?.total}>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-xs text-text-muted block mb-1.5">Monto total</label>
            <input
              type="number"
              value={content.pricing.total}
              onChange={(e) => setContent({ ...content, pricing: { ...content.pricing, total: parseFloat(e.target.value) } })}
              className="w-full rounded-lg border border-white/[0.08] bg-background px-3 py-2 text-sm text-text-primary focus:border-accent/50 focus:outline-none"
              placeholder="5000"
            />
          </div>
          <div>
            <label className="text-xs text-text-muted block mb-1.5">Moneda</label>
            <select
              value={content.pricing.currency}
              onChange={(e) => setContent({ ...content, pricing: { ...content.pricing, currency: e.target.value } })}
              className="w-full rounded-lg border border-white/[0.08] bg-background px-3 py-2 text-sm text-text-primary focus:border-accent/50 focus:outline-none"
            >
              <option>USD</option><option>EUR</option><option>ARS</option><option>MXN</option><option>COP</option>
            </select>
          </div>
        </div>
        <div className="mt-3">
          <label className="text-xs text-text-muted block mb-1.5">Desglose (opcional)</label>
          <textarea
            value={content.pricing.breakdown || ''}
            onChange={(e) => setContent({ ...content, pricing: { ...content.pricing, breakdown: e.target.value } })}
            rows={3}
            className="w-full rounded-lg border border-white/[0.08] bg-background px-3 py-2 text-sm text-text-primary placeholder:text-text-muted focus:border-accent/50 focus:outline-none resize-none"
            placeholder="¿Cómo se distribuye el precio?"
          />
        </div>
      </Section>
    </>
  )
}
