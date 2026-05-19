'use client'

import { useEffect, useRef, useState } from 'react'
import { Check, Star, ShoppingCart, ArrowRight, Shield, Truck, Headphones, Zap, ChevronDown } from 'lucide-react'
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
            if (duration > 1) trackTimeSpent(version.id, sectionName, duration)
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

  const handleSectionClick = (section: string) => trackClick(version.id, section)

  const handleBuy = (section: string) => {
    trackClick(version.id, section)
    if (proposal.buyUrl) window.open(proposal.buyUrl, '_blank', 'noopener,noreferrer')
  }

  return (
    <div className="min-h-screen bg-white text-gray-900">
      {/* Navigation */}
      <nav className="sticky top-0 z-50 bg-white/90 backdrop-blur-xl border-b border-gray-100 shadow-sm">
        <div className="max-w-6xl mx-auto px-6 py-3.5 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="h-7 w-7 rounded-lg bg-blue-600 flex items-center justify-center">
              <Zap className="h-3.5 w-3.5 text-white" />
            </div>
            <span className="text-base font-bold text-gray-900">{proposal.title}</span>
          </div>
          <button
            onClick={() => handleBuy('nav-cta')}
            className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl font-semibold text-sm transition-all flex items-center gap-2 shadow-lg shadow-blue-200"
          >
            <ShoppingCart className="h-4 w-4" />
            {t.navBuy}
          </button>
        </div>
      </nav>

      {/* Hero */}
      <section
        className="relative overflow-hidden"
        data-section="hero"
        onClick={() => handleSectionClick('hero')}
      >
        {/* Full-screen hero with image overlay */}
        <div className="relative min-h-[90vh] flex items-center">
          {/* Background */}
          {firstImage ? (
            <>
              <div className="absolute inset-0">
                <img
                  src={firstImage.url}
                  alt={proposal.title}
                  className="w-full h-full object-cover"
                  fetchPriority="high"
                  decoding="async"
                />
                <div className="absolute inset-0 bg-gradient-to-r from-gray-900/90 via-gray-900/70 to-gray-900/30" />
                <div className="absolute inset-0 bg-gradient-to-t from-gray-900/60 via-transparent to-transparent" />
              </div>
              <div className="relative max-w-6xl mx-auto px-6 py-28 text-white">
                <HeroContent content={content} t={t} onBuy={() => handleBuy('hero-cta')} withImage />
              </div>
            </>
          ) : (
            <div className="relative w-full bg-gradient-to-br from-blue-900 via-blue-800 to-indigo-900">
              <div className="absolute inset-0 pointer-events-none">
                <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-blue-500/20 rounded-full blur-[100px]" />
                <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-indigo-500/20 rounded-full blur-[80px]" />
              </div>
              <div className="relative max-w-6xl mx-auto px-6 py-28 text-white">
                <HeroContent content={content} t={t} onBuy={() => handleBuy('hero-cta')} withImage={false} />
              </div>
            </div>
          )}
        </div>

        {/* Trust badges below hero */}
        <div className="bg-blue-600 py-4">
          <div className="max-w-6xl mx-auto px-6 flex flex-wrap justify-center gap-8 md:gap-16 text-white text-sm font-medium">
            <div className="flex items-center gap-2">
              <Shield className="h-4 w-4 text-blue-200" />
              <span>{t.qualityLabel}</span>
            </div>
            <div className="flex items-center gap-2">
              <Truck className="h-4 w-4 text-blue-200" />
              <span>{t.shippingLabel}</span>
            </div>
            <div className="flex items-center gap-2">
              <Headphones className="h-4 w-4 text-blue-200" />
              <span>{t.warrantyLabel}</span>
            </div>
            <div className="flex items-center gap-2">
              <Star className="h-4 w-4 text-amber-300 fill-amber-300" />
              <span>4.9/5 ⭐ {t.trustedBy}</span>
            </div>
          </div>
        </div>
      </section>

      {/* Benefits */}
      <section
        className="py-24 bg-white"
        data-section="benefits"
        onClick={() => handleSectionClick('benefits')}
      >
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-16">
            <span className="inline-block text-xs font-bold tracking-widest uppercase text-blue-600 bg-blue-50 px-4 py-2 rounded-full mb-4">
              {t.whyChoose}
            </span>
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900">{t.whyChoose}</h2>
          </div>
          <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-5">
            {(content.benefits || []).map((benefit: string, idx: number) => (
              <div
                key={idx}
                className="group relative p-7 rounded-2xl border border-gray-100 bg-white hover:border-blue-200 hover:bg-blue-50/40 hover:shadow-lg hover:shadow-blue-100 transition-all duration-300 hover:-translate-y-0.5"
              >
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0 h-10 w-10 rounded-xl bg-blue-100 group-hover:bg-blue-200 transition-colors flex items-center justify-center">
                    <Check className="h-5 w-5 text-blue-600" />
                  </div>
                  <p className="text-gray-700 font-medium leading-snug pt-1.5">{benefit}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Gallery */}
      {images.length > 1 && (
        <section
          className="py-24 bg-gray-50"
          data-section="gallery"
          onClick={() => handleSectionClick('gallery')}
        >
          <div className="max-w-6xl mx-auto px-6">
            <div className="text-center mb-16">
              <h2 className="text-4xl md:text-5xl font-bold text-gray-900">{t.gallery}</h2>
            </div>
            <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-4">
              {images.map((img, idx) => (
                <div key={idx} className="group relative overflow-hidden rounded-2xl shadow-md hover:shadow-2xl hover:shadow-blue-200/50 transition-all duration-500">
                  <img
                    src={img.url}
                    alt={`Imagen ${idx + 1}`}
                    className="w-full h-64 object-cover group-hover:scale-110 transition-transform duration-700"
                    loading="lazy"
                    decoding="async"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-blue-900/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Social Proof */}
      <section
        className="py-24 bg-white"
        data-section="social-proof"
        onClick={() => handleSectionClick('social-proof')}
      >
        <div className="max-w-4xl mx-auto px-6">
          <div className="relative bg-gradient-to-br from-blue-600 to-indigo-700 rounded-3xl p-12 md:p-16 text-center text-white overflow-hidden">
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(255,255,255,0.15),transparent_60%)] pointer-events-none" />
            <div className="relative">
              <div className="flex justify-center gap-1 mb-6">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="h-7 w-7 text-amber-300 fill-amber-300" />
                ))}
              </div>
              <p className="text-2xl md:text-3xl font-bold leading-relaxed mb-8 text-white/95">
                &ldquo;{content.socialProof}&rdquo;
              </p>
              <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm px-5 py-2.5 rounded-full border border-white/30">
                <Star className="h-4 w-4 text-amber-300 fill-amber-300" />
                <span className="font-semibold text-sm">{t.socialProofSub}</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Urgency */}
      {proposal.template === 'oferta_limitada' && content.urgency && (
        <section
          className="py-16"
          data-section="urgency"
          onClick={() => handleSectionClick('urgency')}
        >
          <div className="max-w-4xl mx-auto px-6">
            <div className="relative bg-gradient-to-r from-orange-500 via-red-500 to-rose-500 text-white rounded-3xl p-10 text-center overflow-hidden">
              <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(255,255,255,0.1),transparent_70%)]" />
              <div className="relative">
                <Zap className="h-10 w-10 mx-auto mb-4 text-yellow-300" />
                <p className="text-3xl md:text-4xl font-black mb-3">{content.urgency}</p>
                <p className="text-base text-red-100 font-medium">{t.limitedStock}</p>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Pricing */}
      <section
        className="py-24 bg-gray-50"
        data-section="pricing"
        onClick={() => handleSectionClick('pricing')}
      >
        <div className="max-w-5xl mx-auto px-6">
          <div className="bg-white rounded-3xl shadow-2xl shadow-blue-100 border border-blue-50 overflow-hidden">
            <div className="h-1.5 bg-gradient-to-r from-blue-600 to-indigo-600" />
            <div className="grid md:grid-cols-2 gap-0">
              {/* Price side */}
              <div className="p-10 md:p-14 border-b md:border-b-0 md:border-r border-gray-100">
                <h2 className="text-3xl font-bold text-gray-900 mb-8">{t.specialOffer}</h2>
                {content.pricing.originalPrice && (
                  <p className="text-gray-400 line-through text-xl mb-2 font-medium">
                    {content.pricing.currency} ${content.pricing.originalPrice.toFixed(2)}
                  </p>
                )}
                <div className="flex items-baseline gap-2 mb-5">
                  <span className="text-7xl font-black text-blue-600">
                    ${content.pricing.price.toFixed(2)}
                  </span>
                  <span className="text-2xl text-gray-400 font-medium">{content.pricing.currency}</span>
                </div>
                {content.pricing.originalPrice && (
                  <div className="inline-flex items-center gap-2 bg-emerald-50 border border-emerald-200 px-4 py-2 rounded-full">
                    <span className="text-emerald-700 font-bold text-sm">
                      🎉 {t.save} {((content.pricing.originalPrice - content.pricing.price) / content.pricing.originalPrice * 100).toFixed(0)}%
                    </span>
                  </div>
                )}
              </div>

              {/* CTA side */}
              <div className="p-10 md:p-14 bg-gradient-to-br from-blue-600 to-indigo-700 text-white flex flex-col justify-center">
                <button
                  onClick={() => handleBuy('pricing-cta')}
                  className="w-full bg-white text-blue-600 hover:bg-gray-50 font-black py-5 px-8 rounded-2xl text-lg transition-all hover:scale-[1.02] flex items-center justify-center gap-3 mb-6 shadow-xl"
                >
                  <ShoppingCart className="h-6 w-6" />
                  {t.buyNow}
                </button>
                <div className="space-y-3">
                  <div className="flex items-center gap-3 text-blue-100 text-sm">
                    <Truck className="h-4 w-4 flex-shrink-0" />
                    <span>{t.shipping}</span>
                  </div>
                  <div className="flex items-center gap-3 text-blue-100 text-sm">
                    <Shield className="h-4 w-4 flex-shrink-0" />
                    <span>{t.guarantee}</span>
                  </div>
                  <div className="flex items-center gap-3 text-blue-100 text-sm">
                    <Headphones className="h-4 w-4 flex-shrink-0" />
                    <span>{t.support}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ */}
      {(content.faq || []).length > 0 && (
        <section
          className="py-24 bg-white"
          data-section="faq"
          onClick={() => handleSectionClick('faq')}
        >
          <div className="max-w-3xl mx-auto px-6">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-bold text-gray-900">{t.faq}</h2>
            </div>
            <div className="space-y-3">
              {content.faq.map((item: any, idx: number) => (
                <FaqItem key={idx} item={item} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Final CTA */}
      <section
        className="py-24 relative overflow-hidden bg-blue-600"
        data-section="cta"
        onClick={() => handleSectionClick('final-cta')}
      >
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-white/5 rounded-full blur-[80px]" />
          <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-indigo-900/30 rounded-full blur-[80px]" />
        </div>
        <div className="relative max-w-4xl mx-auto px-6 text-center text-white">
          <h2 className="text-4xl md:text-5xl font-bold mb-6">{t.readyToBuy}</h2>
          <p className="text-xl text-blue-200 mb-12 leading-relaxed max-w-xl mx-auto">{t.ctaSubtitle}</p>
          <button
            onClick={() => handleBuy('final-cta-button')}
            className="group bg-white text-blue-600 hover:bg-gray-50 font-black py-5 px-14 rounded-2xl text-xl transition-all hover:scale-105 inline-flex items-center gap-3 shadow-2xl shadow-blue-900/30"
          >
            <ShoppingCart className="h-6 w-6" />
            {t.buyNow}
            <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-950 text-white">
        <div className="max-w-6xl mx-auto px-6 py-12">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6 pb-8 mb-8 border-b border-white/10">
            <div className="flex items-center gap-3">
              <div className="h-8 w-8 rounded-lg bg-blue-600 flex items-center justify-center">
                <Zap className="h-4 w-4 text-white" />
              </div>
              <span className="font-bold text-lg">{proposal.title}</span>
            </div>
            <div className="flex items-center gap-2 text-gray-500 text-sm">
              <span className="h-2 w-2 rounded-full bg-emerald-400" />
              {t.inStock}
            </div>
            <p className="text-gray-600 text-sm">
              {t.poweredBy} <span className="text-blue-400">Dropanalizer</span>
            </p>
          </div>
          <div className="text-center text-gray-600 text-sm">
            © {new Date().getFullYear()} {proposal.title}. {t.allRights}
          </div>
        </div>
      </footer>
    </div>
  )
}

function HeroContent({
  content,
  t,
  onBuy,
  withImage,
}: {
  content: DropshippingContent
  t: (typeof landingText)[keyof typeof landingText]
  onBuy: () => void
  withImage: boolean
}) {
  return (
    <div className={`${withImage ? 'max-w-2xl' : 'max-w-3xl mx-auto text-center'}`}>
      <div className={`inline-flex items-center gap-2 border border-white/20 bg-white/10 backdrop-blur-sm px-4 py-2 rounded-full mb-6 ${withImage ? '' : 'mx-auto'}`}>
        <Star className="h-3.5 w-3.5 text-amber-300 fill-amber-300" />
        <span className="text-xs font-bold tracking-widest uppercase text-white/90">{t.premiumBadge}</span>
      </div>
      <h1 className="text-5xl md:text-6xl lg:text-7xl font-black leading-tight mb-6 tracking-tight">
        {content.headline}
      </h1>
      <div className={`flex ${withImage ? '' : 'justify-center'} gap-4 mt-10`}>
        <button
          onClick={onBuy}
          className="group bg-white text-blue-600 hover:bg-blue-50 font-black py-4 px-10 rounded-2xl text-lg transition-all hover:scale-105 flex items-center gap-3 shadow-xl"
        >
          <ShoppingCart className="h-5 w-5" />
          {t.shopNow}
          <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
        </button>
      </div>
    </div>
  )
}

function FaqItem({ item }: { item: { question: string; answer: string } | string }) {
  const [open, setOpen] = useState(false)
  const question = typeof item === 'string' ? item : item.question
  const answer = typeof item === 'string' ? '' : item.answer

  return (
    <div className="border border-gray-200 rounded-2xl overflow-hidden hover:border-blue-200 transition-colors bg-white">
      <button
        onClick={() => setOpen(!open)}
        className="w-full px-6 py-5 text-left font-semibold text-gray-900 hover:bg-gray-50 transition-colors flex items-center justify-between gap-4"
      >
        <span>{question}</span>
        <ChevronDown className={`h-5 w-5 text-gray-400 flex-shrink-0 transition-transform duration-300 ${open ? 'rotate-180' : ''}`} />
      </button>
      {open && answer && (
        <div className="px-6 py-5 bg-blue-50/50 text-gray-700 border-t border-gray-100 leading-relaxed">
          {answer}
        </div>
      )}
    </div>
  )
}
