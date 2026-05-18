'use client'

import { useEffect, useRef, useState } from 'react'
import { Check, Star, ShoppingCart, ArrowRight } from 'lucide-react'
import { trackView, trackClick, trackTimeSpent } from '@/lib/tracking'
import type { DropshippingContent } from '@/types'
import { landingText } from './landingText'

interface MinimalistTemplateProps {
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

export default function MinimalistTemplate({ proposal, version }: MinimalistTemplateProps) {
  const content = version.content as DropshippingContent
  const images = proposal.images || []
  const firstImage = images[0]
  const t = landingText[content.lang || 'es']

  const sectionRefs = useRef<Record<string, { element: HTMLElement; startTime: number | null; totalTime: number }>>({})

  useEffect(() => {
    const sections = ['hero', 'benefits', 'gallery', 'social-proof', 'urgency', 'pricing', 'faq', 'cta']
    sections.forEach((section) => {
      if (!sectionRefs.current[section]) {
        sectionRefs.current[section] = { element: null as any, startTime: null, totalTime: 0 }
      }
    })
  }, [])

  useEffect(() => {
    trackView(version.id)
  }, [version.id])

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

    return () => observer.disconnect()
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
    <div className="min-h-screen bg-white text-gray-900 font-sans">
      {/* Hero */}
      <section className="relative min-h-screen flex items-center" data-section="hero" onClick={() => handleSectionClick('hero')}>
        <div className="absolute inset-0">
          <div className="absolute top-1/2 right-0 w-96 h-96 bg-yellow-100 rounded-full filter blur-3xl opacity-40" />
        </div>

        <div className="relative max-w-7xl mx-auto px-6 py-20 grid md:grid-cols-2 gap-16 items-center">
          <div>
            <div className="mb-12">
              <p className="text-sm tracking-widest text-gray-600 uppercase mb-4">{t.premiumBadge}</p>
              <h1 className="text-6xl md:text-7xl font-light leading-tight mb-6 text-gray-900">
                {content.headline}
              </h1>
              <p className="text-xl text-gray-600 leading-relaxed mb-8">
                {t.heroCraft}
              </p>
              <button
                onClick={() => handleBuy('hero-cta')}
                className="bg-gray-900 text-white px-8 py-4 hover:bg-gray-800 transition-colors font-medium flex items-center gap-2"
              >
                {t.shopNow}
                <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          </div>

          {firstImage && (
            <div className="hidden md:block relative h-96">
              <img src={firstImage.url} alt={proposal.title} className="w-full h-full object-cover" fetchPriority="high" decoding="async" />
            </div>
          )}
        </div>
      </section>

      {/* Benefits */}
      <section className="py-24 bg-gray-50" data-section="benefits" onClick={() => handleSectionClick('benefits')}>
        <div className="max-w-6xl mx-auto px-6">
          <h2 className="text-5xl font-light text-center mb-20 text-gray-900">{t.whyChoose}</h2>
          <div className="grid md:grid-cols-3 gap-16">
            {(content.benefits || []).map((benefit: string, idx: number) => (
              <div key={idx} className="text-center">
                <div className="w-12 h-12 bg-gray-900 rounded-full mx-auto mb-6 flex items-center justify-center">
                  <Check className="h-6 w-6 text-white" />
                </div>
                <p className="text-lg text-gray-700">{benefit}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Gallery */}
      {images.length > 1 && (
        <section className="py-24" data-section="gallery" onClick={() => handleSectionClick('gallery')}>
          <div className="max-w-7xl mx-auto px-6">
            <h2 className="text-5xl font-light text-center mb-20">{t.gallery}</h2>
            <div className="grid md:grid-cols-3 gap-8">
              {images.map((img, idx) => (
                <img key={idx} src={img.url} alt={`Product ${idx + 1}`} className="w-full h-96 object-cover hover:opacity-80 transition-opacity" loading="lazy" decoding="async" />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Social Proof */}
      <section className="py-24 bg-gray-50" data-section="social-proof" onClick={() => handleSectionClick('social-proof')}>
        <div className="max-w-4xl mx-auto px-6 text-center">
          <div className="flex justify-center gap-1 mb-6">
            {[...Array(5)].map((_, i) => <Star key={i} className="h-6 w-6 text-yellow-400 fill-yellow-400" />)}
          </div>
          <p className="text-2xl text-gray-700 leading-relaxed mb-6">"{content.socialProof}"</p>
          <p className="text-gray-600">{t.trustedBy}</p>
        </div>
      </section>

      {/* Pricing */}
      <section className="py-24" data-section="pricing" onClick={() => handleSectionClick('pricing')}>
        <div className="max-w-4xl mx-auto px-6 grid md:grid-cols-2 gap-16 items-center">
          <div>
            <h2 className="text-5xl font-light mb-8">{t.investment}</h2>
            {content.pricing.originalPrice && (
              <p className="text-gray-500 line-through text-lg mb-2">${content.pricing.originalPrice.toFixed(2)}</p>
            )}
            <div className="flex items-baseline gap-2 mb-8">
              <span className="text-6xl font-light text-gray-900">${content.pricing.price.toFixed(2)}</span>
              <span className="text-gray-600">{content.pricing.currency}</span>
            </div>
            {content.pricing.originalPrice && (
              <p className="text-green-600 font-medium">Save {((content.pricing.originalPrice - content.pricing.price) / content.pricing.originalPrice * 100).toFixed(0)}%</p>
            )}
          </div>
          <button
            onClick={() => handleBuy('pricing-cta')}
            className="bg-gray-900 text-white px-8 py-6 text-lg hover:bg-gray-800 transition-colors w-full font-medium"
          >
            {t.addToCart}
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-6xl mx-auto px-6 text-center">
          <p className="text-gray-400">© {new Date().getFullYear()} {proposal.title}. {t.allRights}</p>
          <p className="text-gray-500 text-sm mt-4">{t.poweredBy} Proply</p>
        </div>
      </footer>
    </div>
  )
}
