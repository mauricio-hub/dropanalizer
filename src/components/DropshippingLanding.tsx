'use client'

import { useEffect, useRef, useState } from 'react'
import { Check, Star, ShoppingCart, ArrowRight } from 'lucide-react'
import { trackView, trackClick, trackTimeSpent } from '@/lib/tracking'
import type { DropshippingContent } from '@/types'
import { landingText } from './landing-templates/landingText'

interface DropshippingLandingProps {
  proposal: {
    id: string
    title: string
    template?: string
    createdAt: string
    images?: { url: string; order: number }[]
    buyUrl?: string
  }
  version: {
    id: string
    content: DropshippingContent
  }
}

export default function DropshippingLanding({ proposal, version }: DropshippingLandingProps) {
  const content = version.content as DropshippingContent
  const images = proposal.images || []
  const firstImage = images[0]
  const t = landingText[content.lang || 'es']

  const sectionRefs = useRef<Record<string, { element: HTMLElement; startTime: number | null; totalTime: number }>>({})

  // Initialize section refs
  useEffect(() => {
    const sections = ['hero', 'benefits', 'gallery', 'social-proof', 'urgency', 'pricing', 'faq', 'cta']
    sections.forEach((section) => {
      if (!sectionRefs.current[section]) {
        sectionRefs.current[section] = { element: null as any, startTime: null, totalTime: 0 }
      }
    })
  }, [])

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

  const handleBuy = (section: string) => {
    trackClick(version.id, section)
    if (proposal.buyUrl) {
      window.open(proposal.buyUrl, '_blank', 'noopener,noreferrer')
    }
  }

  return (
    <div className="min-h-screen bg-white text-gray-900">
      {/* Navigation */}
      <nav className="sticky top-0 z-50 bg-white/95 backdrop-blur-sm border-b border-gray-200">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="text-xl font-bold text-blue-600">
            {proposal.title}
          </div>
          <button
            onClick={() => handleBuy('nav-cta')}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors font-medium"
          >
            {t.navBuy}
          </button>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-blue-50 via-white to-blue-50 overflow-hidden" data-section="hero" onClick={() => handleSectionClick('hero')}>
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-0 right-0 w-96 h-96 bg-blue-100 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob" />
          <div className="absolute bottom-0 left-0 w-96 h-96 bg-purple-100 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000" />
        </div>

        <div className="relative max-w-6xl mx-auto px-6 py-20 md:py-32">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <h1 className="text-5xl md:text-6xl font-bold text-gray-900 leading-tight mb-6">
                {content.headline}
              </h1>
              <button
                onClick={() => handleBuy('hero-cta')}
                className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 px-8 rounded-lg transition-all transform hover:scale-105 flex items-center gap-3 text-lg"
              >
                <ShoppingCart className="h-6 w-6" />
                {t.shopNow}
                <ArrowRight className="h-5 w-5" />
              </button>
            </div>

            {firstImage && (
              <div className="hidden md:block">
                <img
                  src={firstImage.url}
                  alt={proposal.title}
                  className="w-full h-auto rounded-2xl shadow-2xl"
                  fetchPriority="high"
                  decoding="async"
                />
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-20 bg-white" data-section="benefits" onClick={() => handleSectionClick('benefits')}>
        <div className="max-w-6xl mx-auto px-6">
          <h2 className="text-4xl font-bold text-center text-gray-900 mb-16">
            {t.whyChoose}
          </h2>

          <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-8">
            {(content.benefits || []).map((benefit: string, idx: number) => (
              <div
                key={idx}
                className="p-8 rounded-xl bg-gradient-to-br from-gray-50 to-white border border-gray-200 hover:border-blue-300 transition-all hover:shadow-lg"
              >
                <div className="flex gap-4">
                  <div className="flex-shrink-0">
                    <div className="flex items-center justify-center h-8 w-8 rounded-full bg-blue-100">
                      <Check className="h-5 w-5 text-blue-600" />
                    </div>
                  </div>
                  <p className="text-gray-700 font-medium">{benefit}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Gallery Section */}
      {images.length > 1 && (
        <section className="py-20 bg-gradient-to-b from-gray-50 to-white" data-section="gallery" onClick={() => handleSectionClick('gallery')}>
          <div className="max-w-6xl mx-auto px-6">
            <h2 className="text-4xl font-bold text-center text-gray-900 mb-16">
              {t.gallery}
            </h2>
            <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-6">
              {images.map((img, idx) => (
                <div key={idx} className="group overflow-hidden rounded-xl shadow-md hover:shadow-xl transition-all">
                  <img
                    src={img.url}
                    alt={`Imagen ${idx + 1}`}
                    className="w-full h-64 object-cover group-hover:scale-110 transition-transform duration-300"
                    loading="lazy"
                    decoding="async"
                  />
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Social Proof Section */}
      <section className="py-20 bg-white" data-section="social-proof" onClick={() => handleSectionClick('social-proof')}>
        <div className="max-w-4xl mx-auto px-6">
          <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-2xl border border-blue-200 p-12 text-center">
            <div className="flex justify-center gap-1 mb-6">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="h-6 w-6 text-yellow-400 fill-yellow-400" />
              ))}
            </div>
            <p className="text-2xl text-gray-900 font-medium leading-relaxed mb-4">
              &quot;{content.socialProof}&quot;
            </p>
            <p className="text-blue-600 font-semibold">{t.socialProofSub}</p>
          </div>
        </div>
      </section>

      {/* Urgency Section */}
      {proposal.template === 'oferta_limitada' && content.urgency && (
        <section className="py-20 bg-gradient-to-r from-orange-50 to-red-50" data-section="urgency" onClick={() => handleSectionClick('urgency')}>
          <div className="max-w-4xl mx-auto px-6">
            <div className="bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-2xl p-12 text-center">
              <p className="text-4xl font-bold mb-4">⚡ {content.urgency}</p>
              <p className="text-lg opacity-95">{t.limitedStock}</p>
            </div>
          </div>
        </section>
      )}

      {/* Pricing Section */}
      <section className="py-20 bg-white" data-section="pricing" onClick={() => handleSectionClick('pricing')}>
        <div className="max-w-6xl mx-auto px-6">
          <div className="grid md:grid-cols-2 gap-16 items-center">
            <div>
              <h2 className="text-4xl font-bold text-gray-900 mb-8">{t.specialOffer}</h2>
              <div className="space-y-6">
                {content.pricing.originalPrice && (
                  <div>
                    <p className="text-gray-500 line-through text-xl">
                      {content.pricing.currency} ${content.pricing.originalPrice.toFixed(2)}
                    </p>
                  </div>
                )}
                <div>
                  <div className="flex items-baseline gap-2">
                    <span className="text-6xl font-bold text-blue-600">
                      ${content.pricing.price.toFixed(2)}
                    </span>
                    <span className="text-2xl text-gray-600">{content.pricing.currency}</span>
                  </div>
                </div>
                {content.pricing.originalPrice && (
                  <p className="text-xl font-semibold text-green-600">
                    🎉 {t.save} {((content.pricing.originalPrice - content.pricing.price) / content.pricing.originalPrice * 100).toFixed(0)}%
                  </p>
                )}
              </div>
            </div>

            <div className="bg-gradient-to-br from-blue-600 to-blue-700 text-white rounded-2xl p-12 text-center">
              <button
                onClick={() => handleBuy('pricing-cta')}
                className="w-full bg-white text-blue-600 hover:bg-gray-100 font-bold py-6 px-8 rounded-xl transition-all transform hover:scale-105 text-lg mb-6 flex items-center justify-center gap-2"
              >
                <ShoppingCart className="h-6 w-6" />
                {t.buyNow}
              </button>
              <p className="text-blue-100">{t.shipping}</p>
              <p className="text-blue-100">{t.guarantee}</p>
              <p className="text-blue-100">{t.support}</p>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      {(content.faq || []).length > 0 && (
        <section className="py-20 bg-gray-50" data-section="faq" onClick={() => handleSectionClick('faq')}>
          <div className="max-w-4xl mx-auto px-6">
            <h2 className="text-4xl font-bold text-center text-gray-900 mb-16">
              {t.faq}
            </h2>
            <div className="space-y-4">
              {content.faq.map((item: any, idx: number) => (
                <FaqItem key={idx} item={item} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Final CTA */}
      <section className="py-20 bg-gradient-to-r from-blue-600 to-purple-600 text-white" data-section="cta" onClick={() => handleSectionClick('final-cta')}>
        <div className="max-w-4xl mx-auto px-6 text-center">
          <h2 className="text-4xl font-bold mb-6">{t.readyToBuy}</h2>
          <p className="text-xl text-blue-100 mb-10 leading-relaxed">{t.ctaSubtitle}</p>
          <button
            onClick={() => handleBuy('final-cta-button')}
            className="bg-white text-blue-600 hover:bg-gray-100 font-bold py-4 px-10 rounded-xl transition-all transform hover:scale-105 inline-flex items-center gap-3 text-lg shadow-lg"
          >
            <ShoppingCart className="h-6 w-6" />
            {t.buyNow}
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white">
        <div className="max-w-6xl mx-auto px-6 py-16">
          <div className="grid md:grid-cols-3 gap-12 mb-8 pb-8 border-b border-gray-800">
            <div>
              <p className="text-2xl font-bold text-blue-400 mb-2">Proply</p>
              <p className="text-gray-400">{t.footerTagline}</p>
            </div>
            <div>
              <p className="text-sm font-semibold uppercase tracking-widest text-gray-400 mb-3">{t.productLabel}</p>
              <p className="text-gray-300">{proposal.title}</p>
              <p className="text-gray-500 text-sm">ID: {proposal.id.slice(0, 8)}</p>
            </div>
            <div>
              <p className="text-sm font-semibold uppercase tracking-widest text-gray-400 mb-3">{t.statusLabel}</p>
              <p className="flex items-center gap-2 text-gray-300">
                <span className="h-2 w-2 rounded-full bg-green-400"></span>
                {t.inStock}
              </p>
            </div>
          </div>
          <div className="text-center text-gray-500 text-sm">
            <p>© {new Date().getFullYear()} {proposal.title}. {t.allRights}</p>
            <p>{t.poweredBy} <span className="text-blue-400">Proply</span></p>
          </div>
        </div>
      </footer>
    </div>
  )
}

function FaqItem({ item }: { item: { question: string; answer: string } | string }) {
  const [open, setOpen] = useState(false)
  const question = typeof item === 'string' ? item : item.question
  const answer = typeof item === 'string' ? '' : item.answer

  return (
    <div className="border border-gray-200 rounded-lg overflow-hidden hover:border-blue-300 transition-colors">
      <button
        onClick={() => setOpen(!open)}
        className="w-full px-6 py-4 text-left font-semibold text-gray-900 hover:bg-gray-50 transition-colors flex items-center justify-between"
      >
        {question}
        <span className={`transform transition-transform ${open ? 'rotate-180' : ''}`}>›</span>
      </button>
      {open && answer && (
        <div className="px-6 py-4 bg-gray-50 text-gray-700 border-t border-gray-200">
          {answer}
        </div>
      )}
    </div>
  )
}
