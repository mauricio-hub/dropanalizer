'use client'

import { useEffect, useRef, useState } from 'react'
import { Check, Star, ShoppingCart } from 'lucide-react'
import { trackView, trackClick, trackTimeSpent } from '@/lib/tracking'
import type { DropshippingContent, ProposalContent } from '@/types'

interface ProposalLandingProps {
  proposal: {
    id: string
    title: string
    template?: string
    createdAt: string
    images?: { url: string; order: number }[]
  }
  version: {
    id: string
    content: ProposalContent | DropshippingContent
  }
}

export default function ProposalLanding({ proposal, version }: ProposalLandingProps) {
  const content = version.content as any
  const isDropshipping = content.contentType === 'dropshipping'

  const sectionRefs = useRef<Record<string, { element: HTMLElement; startTime: number | null; totalTime: number }>>({})

  // Initialize section refs based on content type
  useEffect(() => {
    const sections = isDropshipping
      ? ['hero', 'benefits', 'gallery', 'social-proof', 'urgency', 'pricing', 'faq', 'cta']
      : ['hero', 'scope', 'deliverables', 'timeline', 'pricing', 'cta']

    sections.forEach((section) => {
      if (!sectionRefs.current[section]) {
        sectionRefs.current[section] = { element: null as any, startTime: null, totalTime: 0 }
      }
    })
  }, [isDropshipping])

  // Track page view on mount
  useEffect(() => {
    trackView(version.id)
  }, [version.id])

  // Setup Intersection Observer for time tracking
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          const sectionName = entry.target.getAttribute('data-section')
          if (!sectionName || !sectionRefs.current[sectionName]) return

          const section = sectionRefs.current[sectionName]

          if (entry.isIntersecting) {
            section.startTime = Date.now()
          } else if (section.startTime !== null) {
            const duration = Math.round((Date.now() - section.startTime) / 1000)
            section.totalTime += duration
            section.startTime = null

            if (duration > 1) {
              trackTimeSpent(version.id, sectionName, duration)
            }
          }
        })
      },
      { threshold: 0.3 }
    )

    Object.keys(sectionRefs.current).forEach((sectionName) => {
      const element = document.querySelector(`[data-section="${sectionName}"]`)
      if (element) {
        sectionRefs.current[sectionName].element = element as HTMLElement
        observer.observe(element)
      }
    })

    return () => {
      observer.disconnect()
      Object.values(sectionRefs.current).forEach((section) => {
        if (section.startTime !== null) {
          const duration = Math.round((Date.now() - section.startTime) / 1000)
          section.totalTime += duration
        }
      })
    }
  }, [version.id])

  const handleSectionClick = (section: string) => {
    trackClick(version.id, section)
  }

  // Render dropshipping landing
  if (isDropshipping) {
    const dropContent = content as DropshippingContent
    const images = proposal.images || []
    const firstImage = images[0]

    return (
      <div className="min-h-screen bg-background">
        {/* Hero */}
        <div className="relative overflow-hidden" data-section="hero" onClick={() => handleSectionClick('hero')}>
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(34,197,94,0.1)_0%,transparent_60%)]" />
          <div className="relative mx-auto max-w-5xl px-6 py-24 md:py-32">
            <div className="grid md:grid-cols-2 gap-12 items-center">
              <div>
                <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-text-primary leading-tight mb-4">
                  {dropContent.headline}
                </h1>
                <p className="text-lg text-text-secondary mb-8">
                  {proposal.title}
                </p>
                <button
                  onClick={() => handleSectionClick('hero-cta')}
                  className="bg-accent hover:bg-accent-hover text-white font-semibold py-3 px-8 rounded-lg transition-colors flex items-center gap-2"
                >
                  <ShoppingCart className="h-5 w-5" />
                  Comprar Ahora
                </button>
              </div>
              {firstImage && (
                <div className="hidden md:block">
                  <img
                    src={firstImage.url}
                    alt={proposal.title}
                    className="w-full h-96 object-cover rounded-2xl border border-white/[0.08]"
                  />
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Content Sections */}
        <div className="mx-auto max-w-5xl px-6 py-16 space-y-20">
          {/* Benefits */}
          <section data-section="benefits" onClick={() => handleSectionClick('benefits')}>
            <h2 className="text-3xl md:text-4xl font-bold text-text-primary mb-8 text-center">
              ¿Por qué elegir este producto?
            </h2>
            <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-6">
              {(dropContent.benefits || []).map((benefit: string, idx: number) => (
                <div
                  key={idx}
                  className="group bg-surface rounded-xl border border-white/[0.08] p-6 hover:border-accent/30 transition-all cursor-pointer"
                >
                  <div className="flex gap-4">
                    <div className="flex-shrink-0 h-6 w-6 rounded-full bg-accent/20 flex items-center justify-center">
                      <Check className="h-4 w-4 text-accent" />
                    </div>
                    <p className="text-text-secondary leading-relaxed">{benefit}</p>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Gallery */}
          {images.length > 1 && (
            <section data-section="gallery" onClick={() => handleSectionClick('gallery')}>
              <h2 className="text-3xl md:text-4xl font-bold text-text-primary mb-8 text-center">
                Galería
              </h2>
              <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-4">
                {images.map((img, idx) => (
                  <div key={idx} className="rounded-xl overflow-hidden border border-white/[0.08] hover:border-accent/30 transition-all cursor-pointer group">
                    <img
                      src={img.url}
                      alt={`Imagen ${idx + 1}`}
                      className="w-full h-48 object-cover group-hover:scale-105 transition-transform"
                    />
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Social Proof */}
          <section data-section="social-proof" onClick={() => handleSectionClick('social-proof')}>
            <div className="bg-surface rounded-2xl border border-white/[0.08] p-8 md:p-12 text-center">
              <div className="flex justify-center gap-1 mb-4">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="h-5 w-5 text-yellow-400 fill-yellow-400" />
                ))}
              </div>
              <p className="text-lg text-text-secondary leading-relaxed max-w-2xl mx-auto">
                &quot;{dropContent.socialProof}&quot;
              </p>
              <p className="text-sm text-text-muted mt-4">Miles de clientes satisfechos</p>
            </div>
          </section>

          {/* Urgency (only for oferta_limitada) */}
          {proposal.template === 'oferta_limitada' && dropContent.urgency && (
            <section data-section="urgency" onClick={() => handleSectionClick('urgency')}>
              <div className="bg-red-500/10 border-2 border-red-500/30 rounded-2xl p-8 md:p-12 text-center">
                <p className="text-2xl md:text-3xl font-bold text-red-400 mb-3">
                  ⚡ {dropContent.urgency}
                </p>
                <p className="text-text-secondary">
                  No esperes más, el inventario es limitado
                </p>
              </div>
            </section>
          )}

          {/* Pricing */}
          <section
            className="bg-surface rounded-2xl border border-white/[0.08] p-8 md:p-12"
            data-section="pricing"
            onClick={() => handleSectionClick('pricing')}
          >
            <div className="grid md:grid-cols-2 gap-12 items-center">
              <div>
                <h2 className="text-3xl font-bold text-text-primary mb-4">Precio</h2>
                <div className="space-y-4">
                  {dropContent.pricing.originalPrice && (
                    <div>
                      <p className="text-sm text-text-muted line-through">
                        {dropContent.pricing.currency} ${dropContent.pricing.originalPrice.toFixed(2)}
                      </p>
                    </div>
                  )}
                  <div className="flex items-baseline gap-2">
                    <span className="text-5xl font-bold text-accent">
                      {dropContent.pricing.price.toFixed(2)}
                    </span>
                    <span className="text-xl text-text-muted">{dropContent.pricing.currency}</span>
                  </div>
                  {dropContent.pricing.originalPrice && (
                    <p className="text-lg text-green-400 font-semibold">
                      Ahorra {((dropContent.pricing.originalPrice - dropContent.pricing.price) / dropContent.pricing.originalPrice * 100).toFixed(0)}%
                    </p>
                  )}
                </div>
              </div>
              <div className="flex items-center justify-center">
                <button
                  onClick={() => handleSectionClick('pricing-cta')}
                  className="w-full bg-accent hover:bg-accent-hover text-white font-semibold py-4 px-6 rounded-lg transition-colors text-lg"
                >
                  Comprar Ahora
                </button>
              </div>
            </div>
          </section>

          {/* FAQ */}
          {(dropContent.faq || []).length > 0 && (
            <section data-section="faq" onClick={() => handleSectionClick('faq')}>
              <h2 className="text-3xl font-bold text-text-primary mb-8 text-center">
                Preguntas Frecuentes
              </h2>
              <div className="space-y-3 max-w-2xl mx-auto">
                {dropContent.faq.map((item: any, idx: number) => (
                  <FaqItem key={idx} item={item} />
                ))}
              </div>
            </section>
          )}

          {/* Final CTA */}
          <section className="text-center py-12 border-y border-white/[0.06]" data-section="cta" onClick={() => handleSectionClick('final-cta')}>
            <h2 className="text-3xl font-bold text-text-primary mb-4">¿Listo para comprar?</h2>
            <p className="text-text-secondary mb-8 max-w-2xl mx-auto">
              Haz tu compra segura con nosotros y recibe tu producto en 48-72 horas.
            </p>
            <button
              onClick={() => handleSectionClick('final-cta-button')}
              className="bg-accent hover:bg-accent-hover text-white font-semibold py-3 px-8 rounded-lg transition-colors inline-flex items-center gap-2"
            >
              <ShoppingCart className="h-5 w-5" />
              Comprar Ahora
            </button>
          </section>
        </div>

        {/* Footer */}
        <footer className="border-t border-white/[0.06]">
          <div className="mx-auto max-w-5xl px-6 py-12">
            <div className="grid md:grid-cols-3 gap-8 mb-8">
              <div>
                <p className="font-semibold text-text-primary mb-2">Proply</p>
                <p className="text-sm text-text-muted">Landings para dropshippers, simplificado.</p>
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-widest text-accent mb-3">Producto</p>
                <p className="text-sm text-text-muted">{proposal.title}</p>
                <p className="text-sm text-text-muted">ID: {proposal.id.slice(0, 8)}</p>
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-widest text-accent mb-3">Estado</p>
                <p className="text-sm text-text-muted">
                  <span className="inline-flex items-center gap-2">
                    <span className="h-2 w-2 rounded-full bg-accent"></span>
                    Activo
                  </span>
                </p>
              </div>
            </div>
            <div className="border-t border-white/[0.06] pt-8 flex items-center justify-between text-xs text-text-muted">
              <span>© 2026 Proply. Todos los derechos reservados.</span>
              <span>Potenciado por <span className="text-accent font-medium">Proply</span></span>
            </div>
          </div>
        </footer>
      </div>
    )
  }

  // Render legacy B2B proposal (unchanged from original)
  const proposalContent = content as ProposalContent
  const scope = proposalContent.scope || ''
  const deliverables = proposalContent.deliverables || []
  const timeline = proposalContent.timeline || []
  const pricing = proposalContent.pricing || { total: 0, currency: 'USD' }

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <div className="relative overflow-hidden" data-section="hero" onClick={() => handleSectionClick('hero')}>
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(34,197,94,0.1)_0%,transparent_60%)]" />
        <div className="relative mx-auto max-w-5xl px-6 py-24 md:py-32">
          <div className="inline-flex items-center gap-2 rounded-full border border-accent/20 bg-accent/5 px-3 py-1 text-xs font-medium text-accent mb-6">
            Commercial Proposal
          </div>
          <h1 className="text-4xl md:text-6xl font-bold tracking-tight text-text-primary leading-tight mb-6">
            {proposal.title}
          </h1>
          <p className="text-lg text-text-secondary max-w-2xl">
            Professional proposal crafted for your success
          </p>
          <p className="mt-6 text-sm text-text-muted">
            {new Date(proposal.createdAt).toLocaleDateString('en-US', {
              month: 'long',
              day: 'numeric',
              year: 'numeric',
            })}
          </p>
        </div>
      </div>

      {/* Content Sections */}
      <div className="mx-auto max-w-5xl px-6 py-16 space-y-20">
        {/* Scope */}
        {scope && (
          <section
            className="grid md:grid-cols-[1fr_1fr] gap-12 items-center"
            data-section="scope"
            onClick={() => handleSectionClick('scope')}
          >
            <div>
              <h2 className="text-2xl md:text-3xl font-bold text-text-primary mb-4">Project Scope</h2>
              <div className="border-l-4 border-accent pl-6">
                <p className="text-text-secondary leading-relaxed whitespace-pre-wrap">{scope}</p>
              </div>
            </div>
            <div className="hidden md:block">
              <div className="bg-surface rounded-2xl border border-white/[0.08] p-8 aspect-square flex items-center justify-center">
                <div className="text-center">
                  <div className="text-accent/20 text-6xl mb-4">📋</div>
                  <p className="text-sm text-text-muted">Project Overview</p>
                </div>
              </div>
            </div>
          </section>
        )}

        {/* Deliverables */}
        {deliverables.length > 0 && (
          <section data-section="deliverables" onClick={() => handleSectionClick('deliverables')}>
            <h2 className="text-2xl md:text-3xl font-bold text-text-primary mb-8">Deliverables</h2>
            <div className="grid sm:grid-cols-2 gap-4">
              {deliverables.map((item: string, idx: number) => (
                <div
                  key={idx}
                  className="group bg-surface rounded-xl border border-white/[0.08] p-6 hover:border-accent/30 transition-all cursor-pointer"
                >
                  <div className="flex gap-4">
                    <div className="flex-shrink-0 h-6 w-6 rounded-full bg-accent/20 flex items-center justify-center">
                      <Check className="h-4 w-4 text-accent" />
                    </div>
                    <p className="text-text-secondary leading-relaxed">{item}</p>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Timeline */}
        {timeline.length > 0 && (
          <section data-section="timeline" onClick={() => handleSectionClick('timeline')}>
            <h2 className="text-2xl md:text-3xl font-bold text-text-primary mb-8">Timeline</h2>
            <div className="space-y-4">
              {timeline.map((phase: any, idx: number) => (
                <div key={idx} className="bg-surface rounded-xl border border-white/[0.08] p-6 hover:border-accent/30 transition-all cursor-pointer">
                  <div className="grid sm:grid-cols-[200px_1fr] gap-6">
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-widest text-accent mb-2">Phase {idx + 1}</p>
                      <h3 className="text-lg font-semibold text-text-primary">{phase.phase}</h3>
                      <p className="text-sm text-text-muted mt-2">{phase.duration}</p>
                    </div>
                    <div>
                      <p className="text-text-secondary leading-relaxed">{phase.description}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Pricing */}
        <section
          className="bg-surface rounded-2xl border border-white/[0.08] p-8 md:p-12"
          data-section="pricing"
          onClick={() => handleSectionClick('pricing')}
        >
          <div className="grid md:grid-cols-2 gap-12">
            <div>
              <h2 className="text-2xl md:text-3xl font-bold text-text-primary mb-6">Investment</h2>
              <div className="space-y-4">
                {pricing.breakdown && (
                  <div>
                    <p className="text-sm text-text-muted mb-3">Cost Breakdown</p>
                    <p className="text-text-secondary leading-relaxed whitespace-pre-wrap">{pricing.breakdown}</p>
                  </div>
                )}
                {!pricing.breakdown && (
                  <p className="text-text-muted">Comprehensive package included</p>
                )}
              </div>
            </div>
            <div className="flex flex-col justify-center">
              <p className="text-xs font-semibold uppercase tracking-widest text-accent mb-3">Total Investment</p>
              <div className="flex items-baseline gap-2">
                <span className="text-5xl font-bold text-text-primary">
                  {pricing.total?.toLocaleString()}
                </span>
                <span className="text-xl text-text-muted">{pricing.currency}</span>
              </div>
              <button
                onClick={() => handleSectionClick('cta')}
                className="mt-8 w-full bg-accent hover:bg-accent-hover text-white font-semibold py-3 px-6 rounded-lg transition-colors"
              >
                Accept Proposal
              </button>
            </div>
          </div>
        </section>

        {/* Call to Action */}
        <section className="text-center py-12 border-y border-white/[0.06]" data-section="cta" onClick={() => handleSectionClick('cta-section')}>
          <h2 className="text-2xl font-bold text-text-primary mb-4">Ready to move forward?</h2>
          <p className="text-text-secondary mb-8 max-w-2xl mx-auto">
            Contact us to discuss details and get started on this project.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={() => handleSectionClick('accept-proposal')}
              className="bg-accent hover:bg-accent-hover text-white font-semibold py-3 px-8 rounded-lg transition-colors"
            >
              Accept Proposal
            </button>
            <button
              onClick={() => handleSectionClick('request-changes')}
              className="border border-white/[0.08] hover:border-accent/30 text-text-primary font-semibold py-3 px-8 rounded-lg transition-colors"
            >
              Request Changes
            </button>
          </div>
        </section>
      </div>

      {/* Footer */}
      <footer className="border-t border-white/[0.06]">
        <div className="mx-auto max-w-5xl px-6 py-12">
          <div className="grid md:grid-cols-3 gap-8 mb-8">
            <div>
              <p className="font-semibold text-text-primary mb-2">Proply</p>
              <p className="text-sm text-text-muted">Professional proposals, made simple.</p>
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-widest text-accent mb-3">Proposal</p>
              <p className="text-sm text-text-muted">ID: {proposal.id.slice(0, 8)}</p>
              <p className="text-sm text-text-muted">Created {new Date(proposal.createdAt).toLocaleDateString()}</p>
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-widest text-accent mb-3">Status</p>
              <p className="text-sm text-text-muted">
                <span className="inline-flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full bg-accent"></span>
                  Active
                </span>
              </p>
            </div>
          </div>
          <div className="border-t border-white/[0.06] pt-8 flex items-center justify-between text-xs text-text-muted">
            <span>© 2026 Proply. All rights reserved.</span>
            <span>Powered by <span className="text-accent font-medium">Proply</span></span>
          </div>
        </div>
      </footer>
    </div>
  )
}

// FAQ Item Component
function FaqItem({ item }: { item: { question: string; answer: string } }) {
  const [open, setOpen] = useState(false)

  return (
    <details
      className="group bg-surface rounded-xl border border-white/[0.08] hover:border-accent/30 transition-all cursor-pointer"
      open={open}
      onToggle={(e) => setOpen(e.currentTarget.open)}
    >
      <summary className="p-4 font-semibold text-text-primary hover:text-accent transition-colors">
        {item.question}
      </summary>
      <div className="px-4 pb-4 border-t border-white/[0.08] text-text-secondary">
        {item.answer}
      </div>
    </details>
  )
}
