'use client'

import { useEffect, useRef } from 'react'
import { Check, Star, ShoppingCart, ArrowRight, Truck, Shield, Headphones } from 'lucide-react'
import { trackView, trackClick, trackTimeSpent } from '@/lib/tracking'
import type { DropshippingContent } from '@/types'
import { landingText } from './landingText'

interface VibrantTemplateProps {
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

export default function VibrantTemplate({ proposal, version }: VibrantTemplateProps) {
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
    const observer = new IntersectionObserver((entries) => {
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
    }, { threshold: 0.3 })

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
    <div className="min-h-screen bg-white text-gray-900">
      {/* Navigation */}
      <nav className="sticky top-0 z-50 bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-pink-600 to-orange-500">
            {proposal.title}
          </h1>
          <button onClick={() => handleBuy('nav-cta')} className="bg-gradient-to-r from-pink-600 to-orange-500 text-white px-6 py-2 rounded-full hover:shadow-lg transition-all font-semibold">
            {t.navBuy}
          </button>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative overflow-hidden pt-20 pb-32" data-section="hero" onClick={() => handleSectionClick('hero')}>
        <div className="absolute inset-0">
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-pink-200 rounded-full mix-blend-multiply filter blur-3xl opacity-40 animate-blob" />
          <div className="absolute top-0 right-1/4 w-96 h-96 bg-orange-200 rounded-full mix-blend-multiply filter blur-3xl opacity-40 animate-blob animation-delay-2000" />
        </div>

        <div className="relative max-w-7xl mx-auto px-6 grid md:grid-cols-2 gap-12 items-center">
          <div>
            <h2 className="text-6xl md:text-7xl font-bold leading-tight mb-6 bg-clip-text text-transparent bg-gradient-to-r from-gray-900 via-pink-600 to-orange-500">
              {content.headline}
            </h2>
            <p className="text-xl text-gray-600 mb-8 leading-relaxed">
              {t.heroSubtitle}
            </p>
            <button
              onClick={() => handleBuy('hero-cta')}
              className="bg-gradient-to-r from-pink-600 to-orange-500 text-white px-8 py-4 rounded-full hover:shadow-xl transition-all font-semibold flex items-center gap-2 text-lg"
            >
              <ShoppingCart className="h-5 w-5" />
              {t.shopNow}
            </button>
          </div>
          {firstImage && (
            <div className="hidden md:flex justify-center items-center">
              <img src={firstImage.url} alt={proposal.title} className="w-full h-auto drop-shadow-2xl" />
            </div>
          )}
        </div>
      </section>

      {/* Benefits */}
      <section className="py-20 bg-gradient-to-b from-gray-50 to-white" data-section="benefits" onClick={() => handleSectionClick('benefits')}>
        <div className="max-w-6xl mx-auto px-6">
          <h2 className="text-5xl font-bold text-center mb-4">{t.whyLoveIt}</h2>
          <p className="text-center text-gray-600 mb-16 max-w-2xl mx-auto text-lg">
            {t.benefitsSubtitle}
          </p>
          <div className="grid md:grid-cols-3 gap-8">
            {(content.benefits || []).map((benefit: string, idx: number) => (
              <div key={idx} className="bg-gradient-to-br from-pink-50 to-orange-50 p-8 rounded-2xl border border-pink-200 hover:border-orange-300 transition-all">
                <div className="h-12 w-12 bg-gradient-to-r from-pink-500 to-orange-500 rounded-lg flex items-center justify-center mb-4">
                  <Check className="h-6 w-6 text-white" />
                </div>
                <p className="text-gray-800 font-semibold">{benefit}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Gallery */}
      {images.length > 1 && (
        <section className="py-20" data-section="gallery" onClick={() => handleSectionClick('gallery')}>
          <div className="max-w-7xl mx-auto px-6">
            <h2 className="text-5xl font-bold text-center mb-16">{t.showcase}</h2>
            <div className="grid md:grid-cols-3 gap-6">
              {images.map((img, idx) => (
                <div key={idx} className="group relative overflow-hidden rounded-2xl shadow-lg hover:shadow-2xl transition-all">
                  <img src={img.url} alt={`Product ${idx + 1}`} className="w-full h-80 object-cover group-hover:scale-110 transition-transform duration-300" />
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Social Proof */}
      <section className="py-20 bg-gradient-to-r from-pink-50 to-orange-50" data-section="social-proof" onClick={() => handleSectionClick('social-proof')}>
        <div className="max-w-4xl mx-auto px-6 text-center">
          <div className="flex justify-center gap-1 mb-6">
            {[...Array(5)].map((_, i) => <Star key={i} className="h-7 w-7 text-yellow-400 fill-yellow-400" />)}
          </div>
          <p className="text-2xl text-gray-900 font-semibold leading-relaxed mb-6">
            "{content.socialProof}"
          </p>
          <p className="text-pink-600 font-bold">⭐ {t.socialProofSub}</p>
        </div>
      </section>

      {/* Features */}
      <section className="py-20">
        <div className="max-w-6xl mx-auto px-6">
          <div className="grid md:grid-cols-3 gap-12">
            <div className="text-center">
              <Truck className="h-12 w-12 text-pink-600 mx-auto mb-4" />
              <h3 className="font-bold text-lg mb-2">{t.shippingLabel}</h3>
              <p className="text-gray-600">{t.shippingDesc}</p>
            </div>
            <div className="text-center">
              <Shield className="h-12 w-12 text-orange-500 mx-auto mb-4" />
              <h3 className="font-bold text-lg mb-2">{t.qualityLabel}</h3>
              <p className="text-gray-600">{t.qualityDesc}</p>
            </div>
            <div className="text-center">
              <Headphones className="h-12 w-12 text-pink-600 mx-auto mb-4" />
              <h3 className="font-bold text-lg mb-2">{t.warrantyLabel}</h3>
              <p className="text-gray-600">{t.warrantyDesc}</p>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section className="py-20 bg-gradient-to-b from-white to-gray-50" data-section="pricing" onClick={() => handleSectionClick('pricing')}>
        <div className="max-w-4xl mx-auto px-6">
          <div className="bg-gradient-to-r from-pink-600 to-orange-500 text-white rounded-3xl p-12 md:p-16 text-center">
            <h2 className="text-5xl font-bold mb-4">{t.specialOffer}</h2>
            {content.pricing.originalPrice && (
              <p className="text-xl opacity-90 line-through mb-2">${content.pricing.originalPrice.toFixed(2)}</p>
            )}
            <div className="flex justify-center items-baseline gap-2 mb-8">
              <span className="text-7xl font-bold">${content.pricing.price.toFixed(2)}</span>
              <span className="text-2xl">{content.pricing.currency}</span>
            </div>
            {content.pricing.originalPrice && (
              <p className="text-xl font-bold mb-8">
                {t.save} {((content.pricing.originalPrice - content.pricing.price) / content.pricing.originalPrice * 100).toFixed(0)}% Today! 🎉
              </p>
            )}
            <button
              onClick={() => handleBuy('pricing-cta')}
              className="bg-white text-pink-600 hover:bg-gray-100 font-bold py-4 px-12 rounded-full text-lg transition-all w-full md:w-auto flex items-center justify-center gap-2 mx-auto"
            >
              <ShoppingCart className="h-5 w-5" />
              {t.buyNow}
            </button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-6xl mx-auto px-6">
          <div className="grid md:grid-cols-3 gap-12 mb-8 pb-8 border-b border-gray-800">
            <div>
              <h3 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-pink-400 to-orange-400 mb-2">
                {proposal.title}
              </h3>
              <p className="text-gray-400">{t.footerTagline2}</p>
            </div>
            <div>
              <p className="text-gray-400">{t.shippingLabel} • {t.qualityLabel} • {t.warrantyLabel}</p>
            </div>
            <div className="text-right">
              <p className="text-gray-400">Powered by Proply</p>
            </div>
          </div>
          <div className="text-center text-gray-500 text-sm">
            <p>© {new Date().getFullYear()} {proposal.title}. {t.allRights}</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
