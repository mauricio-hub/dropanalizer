'use client'

import { useEffect, useRef } from 'react'
import { Check, Star, ShoppingCart, ArrowRight, Truck, Shield, Headphones, Zap, TrendingUp, Award } from 'lucide-react'
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
          if (duration > 1) trackTimeSpent(version.id, sectionName, duration)
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

  const handleSectionClick = (section: string) => trackClick(version.id, section)

  const handleBuy = (section: string) => {
    trackClick(version.id, section)
    if (proposal.buyUrl) window.open(proposal.buyUrl, '_blank', 'noopener,noreferrer')
  }

  return (
    <div className="min-h-screen bg-white text-gray-900 overflow-x-hidden">
      {/* Navigation */}
      <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-xl border-b border-gray-100 shadow-sm">
        <div className="max-w-7xl mx-auto px-6 py-3 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-violet-600 to-fuchsia-500 flex items-center justify-center">
              <Zap className="h-4 w-4 text-white" />
            </div>
            <h1 className="text-lg font-bold text-gray-900">{proposal.title}</h1>
          </div>
          <button
            onClick={() => handleBuy('nav-cta')}
            className="group relative bg-gradient-to-r from-violet-600 to-fuchsia-500 text-white px-6 py-2.5 rounded-full font-semibold text-sm hover:shadow-lg hover:shadow-violet-200 transition-all duration-300 flex items-center gap-2"
          >
            <ShoppingCart className="h-4 w-4" />
            {t.navBuy}
          </button>
        </div>
      </nav>

      {/* Hero */}
      <section
        className="relative overflow-hidden bg-gradient-to-br from-violet-50 via-white to-fuchsia-50 pt-16 pb-24"
        data-section="hero"
        onClick={() => handleSectionClick('hero')}
      >
        {/* Animated blobs */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute -top-20 -left-20 w-[500px] h-[500px] bg-violet-200 rounded-full mix-blend-multiply filter blur-[80px] opacity-50 animate-blob" />
          <div className="absolute -top-20 -right-20 w-[500px] h-[500px] bg-fuchsia-200 rounded-full mix-blend-multiply filter blur-[80px] opacity-50 animate-blob animation-delay-2000" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 w-[400px] h-[400px] bg-pink-200 rounded-full mix-blend-multiply filter blur-[80px] opacity-30 animate-blob animation-delay-4000" />
        </div>

        <div className="relative max-w-7xl mx-auto px-6 grid md:grid-cols-2 gap-12 items-center">
          <div>
            {/* Badge */}
            <div className="inline-flex items-center gap-2 bg-gradient-to-r from-violet-100 to-fuchsia-100 border border-violet-200 px-4 py-2 rounded-full mb-6">
              <TrendingUp className="h-3.5 w-3.5 text-violet-600" />
              <span className="text-xs font-bold tracking-wider uppercase text-violet-700">{t.premiumBadge}</span>
            </div>

            <h2 className="text-5xl md:text-6xl lg:text-7xl font-black leading-[1.05] mb-6 tracking-tight">
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-violet-700 via-fuchsia-600 to-pink-500">
                {content.headline}
              </span>
            </h2>

            <p className="text-lg text-gray-500 mb-8 leading-relaxed max-w-lg">
              {t.heroSubtitle}
            </p>

            {/* Social proof mini */}
            <div className="flex items-center gap-4 mb-10">
              <div className="flex -space-x-2">
                {[...Array(4)].map((_, i) => (
                  <div key={i} className={`h-8 w-8 rounded-full border-2 border-white bg-gradient-to-br ${
                    ['from-violet-400 to-fuchsia-400', 'from-pink-400 to-rose-400', 'from-amber-400 to-orange-400', 'from-emerald-400 to-teal-400'][i]
                  }`} />
                ))}
              </div>
              <div>
                <div className="flex gap-0.5">
                  {[...Array(5)].map((_, i) => <Star key={i} className="h-3 w-3 text-amber-400 fill-amber-400" />)}
                </div>
                <p className="text-xs text-gray-500 font-medium">{t.trustedBy}</p>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3">
              <button
                onClick={() => handleBuy('hero-cta')}
                className="group bg-gradient-to-r from-violet-600 to-fuchsia-500 text-white px-8 py-4 rounded-2xl font-bold text-lg hover:shadow-xl hover:shadow-violet-200 transition-all duration-300 flex items-center justify-center gap-3 hover:-translate-y-0.5"
              >
                <ShoppingCart className="h-5 w-5" />
                {t.shopNow}
                <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
              </button>
            </div>
          </div>

          {firstImage && (
            <div className="hidden md:flex justify-center items-center relative">
              <div className="absolute inset-0 bg-gradient-to-br from-violet-200/40 to-fuchsia-200/40 rounded-[40px] blur-3xl scale-90" />
              <div className="relative bg-white p-4 rounded-[32px] shadow-2xl shadow-violet-200/60">
                <img
                  src={firstImage.url}
                  alt={proposal.title}
                  className="w-full h-auto rounded-2xl"
                  fetchPriority="high"
                  decoding="async"
                />
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Stats strip */}
      <div className="bg-gradient-to-r from-violet-600 via-fuchsia-600 to-pink-600 py-6">
        <div className="max-w-6xl mx-auto px-6 grid grid-cols-3 gap-6 text-center text-white">
          <div>
            <p className="text-2xl font-black">4.9★</p>
            <p className="text-xs text-violet-200 uppercase tracking-wider">{t.qualityLabel}</p>
          </div>
          <div>
            <p className="text-2xl font-black">24h</p>
            <p className="text-xs text-violet-200 uppercase tracking-wider">{t.shippingLabel}</p>
          </div>
          <div>
            <p className="text-2xl font-black">100%</p>
            <p className="text-xs text-violet-200 uppercase tracking-wider">{t.warrantyLabel}</p>
          </div>
        </div>
      </div>

      {/* Benefits */}
      <section
        className="py-24"
        data-section="benefits"
        onClick={() => handleSectionClick('benefits')}
      >
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-16">
            <span className="inline-block bg-violet-100 text-violet-700 text-xs font-bold tracking-widest uppercase px-4 py-2 rounded-full mb-4">{t.whyLoveIt}</span>
            <h2 className="text-5xl font-black text-gray-900">{t.whyLoveIt}</h2>
            <p className="text-gray-500 mt-3 max-w-xl mx-auto">{t.benefitsSubtitle}</p>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {(content.benefits || []).map((benefit: string, idx: number) => (
              <div
                key={idx}
                className="group relative p-8 rounded-3xl border border-gray-100 hover:border-violet-200 bg-white hover:bg-gradient-to-br hover:from-violet-50 hover:to-fuchsia-50 transition-all duration-300 hover:shadow-xl hover:shadow-violet-100 hover:-translate-y-1"
              >
                <div className="absolute top-6 right-6 text-4xl font-black text-gray-50 group-hover:text-violet-100 transition-colors">
                  {String(idx + 1).padStart(2, '0')}
                </div>
                <div className="h-12 w-12 bg-gradient-to-br from-violet-500 to-fuchsia-500 rounded-2xl flex items-center justify-center mb-5 shadow-lg shadow-violet-200 group-hover:scale-110 transition-transform">
                  <Check className="h-6 w-6 text-white" />
                </div>
                <p className="text-gray-800 font-semibold text-lg leading-snug">{benefit}</p>
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
          <div className="max-w-7xl mx-auto px-6">
            <div className="text-center mb-16">
              <h2 className="text-5xl font-black text-gray-900">{t.showcase}</h2>
            </div>
            <div className="grid md:grid-cols-3 gap-4">
              {images.map((img, idx) => (
                <div key={idx} className="group relative overflow-hidden rounded-3xl shadow-lg hover:shadow-2xl hover:shadow-violet-200/50 transition-all duration-500 bg-white">
                  <img
                    src={img.url}
                    alt={`Product ${idx + 1}`}
                    className="w-full h-80 object-cover group-hover:scale-110 transition-transform duration-700"
                    loading="lazy"
                    decoding="async"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-violet-900/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Social Proof */}
      <section
        className="py-24 relative overflow-hidden"
        data-section="social-proof"
        onClick={() => handleSectionClick('social-proof')}
      >
        <div className="absolute inset-0 bg-gradient-to-br from-violet-600 via-fuchsia-600 to-pink-600 pointer-events-none" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(255,255,255,0.1),transparent_60%)] pointer-events-none" />
        <div className="relative max-w-4xl mx-auto px-6 text-center text-white">
          <Award className="h-16 w-16 mx-auto mb-6 text-white/80" />
          <div className="flex justify-center gap-1 mb-8">
            {[...Array(5)].map((_, i) => <Star key={i} className="h-7 w-7 text-amber-300 fill-amber-300" />)}
          </div>
          <p className="text-3xl md:text-4xl font-bold leading-relaxed mb-8 text-white/95">
            &ldquo;{content.socialProof}&rdquo;
          </p>
          <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm border border-white/30 px-6 py-3 rounded-full">
            <Star className="h-4 w-4 text-amber-300 fill-amber-300" />
            <span className="font-semibold">{t.socialProofSub}</span>
          </div>
        </div>
      </section>

      {/* Features strip */}
      <section className="py-20 bg-gray-900">
        <div className="max-w-6xl mx-auto px-6">
          <div className="grid md:grid-cols-3 gap-8 text-white text-center">
            <div className="group p-8 rounded-3xl border border-white/10 hover:border-violet-500/50 hover:bg-white/5 transition-all">
              <Truck className="h-12 w-12 text-violet-400 mx-auto mb-4 group-hover:scale-110 transition-transform" />
              <h3 className="font-bold text-xl mb-2">{t.shippingLabel}</h3>
              <p className="text-gray-400">{t.shippingDesc}</p>
            </div>
            <div className="group p-8 rounded-3xl border border-white/10 hover:border-fuchsia-500/50 hover:bg-white/5 transition-all">
              <Shield className="h-12 w-12 text-fuchsia-400 mx-auto mb-4 group-hover:scale-110 transition-transform" />
              <h3 className="font-bold text-xl mb-2">{t.qualityLabel}</h3>
              <p className="text-gray-400">{t.qualityDesc}</p>
            </div>
            <div className="group p-8 rounded-3xl border border-white/10 hover:border-pink-500/50 hover:bg-white/5 transition-all">
              <Headphones className="h-12 w-12 text-pink-400 mx-auto mb-4 group-hover:scale-110 transition-transform" />
              <h3 className="font-bold text-xl mb-2">{t.warrantyLabel}</h3>
              <p className="text-gray-400">{t.warrantyDesc}</p>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section
        className="py-24 bg-gradient-to-b from-gray-50 to-white"
        data-section="pricing"
        onClick={() => handleSectionClick('pricing')}
      >
        <div className="max-w-3xl mx-auto px-6">
          <div className="relative bg-white rounded-[40px] shadow-2xl shadow-violet-100 border border-violet-100 overflow-hidden">
            {/* Top gradient bar */}
            <div className="h-2 bg-gradient-to-r from-violet-600 via-fuchsia-500 to-pink-500" />

            <div className="p-12 text-center">
              <span className="inline-block bg-gradient-to-r from-violet-100 to-fuchsia-100 text-violet-700 text-sm font-bold px-4 py-1.5 rounded-full mb-6">{t.specialOffer}</span>

              {content.pricing.originalPrice && (
                <p className="text-gray-400 line-through text-xl mb-2 font-medium">
                  ${content.pricing.originalPrice.toFixed(2)} {content.pricing.currency}
                </p>
              )}

              <div className="flex justify-center items-baseline gap-2 mb-4">
                <span className="text-8xl font-black bg-clip-text text-transparent bg-gradient-to-r from-violet-600 to-fuchsia-500">
                  ${content.pricing.price.toFixed(2)}
                </span>
                <span className="text-3xl font-bold text-gray-400">{content.pricing.currency}</span>
              </div>

              {content.pricing.originalPrice && (
                <div className="inline-flex items-center gap-2 bg-emerald-50 border border-emerald-200 px-4 py-2 rounded-full mb-10">
                  <TrendingUp className="h-4 w-4 text-emerald-600" />
                  <span className="text-emerald-700 font-bold">
                    {t.save} {((content.pricing.originalPrice - content.pricing.price) / content.pricing.originalPrice * 100).toFixed(0)}% {t.save && '🎉'}
                  </span>
                </div>
              )}

              <button
                onClick={() => handleBuy('pricing-cta')}
                className="w-full bg-gradient-to-r from-violet-600 to-fuchsia-500 text-white font-black py-5 px-12 rounded-2xl text-xl hover:shadow-xl hover:shadow-violet-300 transition-all duration-300 hover:-translate-y-0.5 flex items-center justify-center gap-3 mb-6"
              >
                <ShoppingCart className="h-6 w-6" />
                {t.buyNow}
              </button>

              <div className="grid grid-cols-3 gap-3 text-center text-sm text-gray-500">
                <div className="flex items-center justify-center gap-1.5">
                  <Truck className="h-4 w-4 text-violet-400" />
                  {t.shippingLabel}
                </div>
                <div className="flex items-center justify-center gap-1.5">
                  <Shield className="h-4 w-4 text-fuchsia-400" />
                  {t.qualityLabel}
                </div>
                <div className="flex items-center justify-center gap-1.5">
                  <Headphones className="h-4 w-4 text-pink-400" />
                  {t.warrantyLabel}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-950 text-white py-12">
        <div className="max-w-6xl mx-auto px-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6 pb-8 mb-8 border-b border-white/10">
            <div className="flex items-center gap-3">
              <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-violet-600 to-fuchsia-500 flex items-center justify-center">
                <Zap className="h-4 w-4 text-white" />
              </div>
              <span className="font-bold text-lg">{proposal.title}</span>
            </div>
            <p className="text-gray-500 text-sm">{t.footerTagline2}</p>
            <p className="text-gray-600 text-sm">Powered by Dropanalizer</p>
          </div>
          <div className="text-center text-gray-600 text-sm">
            © {new Date().getFullYear()} {proposal.title}. {t.allRights}
          </div>
        </div>
      </footer>
    </div>
  )
}
