'use client'

import { useEffect, useRef } from 'react'
import { Check, Star, ArrowRight, Sparkles, Shield, Zap } from 'lucide-react'
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

  const handleSectionClick = (section: string) => trackClick(version.id, section)

  const handleBuy = (section: string) => {
    trackClick(version.id, section)
    if (proposal.buyUrl) window.open(proposal.buyUrl, '_blank', 'noopener,noreferrer')
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white font-sans">
      {/* Nav */}
      <nav className="sticky top-0 z-50 bg-[#0a0a0a]/80 backdrop-blur-xl border-b border-white/5">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <span className="text-sm tracking-[0.3em] uppercase text-amber-400/80 font-medium">{proposal.title}</span>
          <button
            onClick={() => handleBuy('nav-cta')}
            className="group flex items-center gap-2 text-sm tracking-widest uppercase text-white/70 hover:text-amber-400 transition-colors duration-300"
          >
            {t.shopNow}
            <ArrowRight className="h-3 w-3 group-hover:translate-x-1 transition-transform" />
          </button>
        </div>
      </nav>

      {/* Hero */}
      <section
        className="relative min-h-screen flex items-center overflow-hidden"
        data-section="hero"
        onClick={() => handleSectionClick('hero')}
      >
        {/* Background elements */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-1/4 right-1/4 w-[600px] h-[600px] bg-amber-500/5 rounded-full blur-[120px]" />
          <div className="absolute bottom-1/4 left-1/4 w-[400px] h-[400px] bg-amber-300/5 rounded-full blur-[100px]" />
          <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff05_1px,transparent_1px),linear-gradient(to_bottom,#ffffff05_1px,transparent_1px)] bg-[size:60px_60px]" />
        </div>

        <div className="relative max-w-7xl mx-auto px-6 py-32 grid md:grid-cols-2 gap-20 items-center">
          <div>
            <div className="inline-flex items-center gap-2 border border-amber-400/20 bg-amber-400/5 px-4 py-2 rounded-full mb-8">
              <Sparkles className="h-3 w-3 text-amber-400" />
              <span className="text-xs tracking-[0.25em] uppercase text-amber-400">{t.premiumBadge}</span>
            </div>
            <h1 className="text-6xl md:text-7xl lg:text-8xl font-extralight leading-[0.95] mb-8 tracking-tight">
              {content.headline}
            </h1>
            <div className="w-16 h-px bg-amber-400/60 mb-8" />
            <p className="text-lg text-white/40 leading-relaxed mb-12 max-w-md font-light">
              {t.heroCraft}
            </p>
            <button
              onClick={() => handleBuy('hero-cta')}
              className="group relative inline-flex items-center gap-3 bg-amber-400 text-black px-10 py-5 font-medium tracking-wider uppercase text-sm hover:bg-amber-300 transition-all duration-300"
            >
              {t.shopNow}
              <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
            </button>
          </div>

          {firstImage && (
            <div className="hidden md:block relative">
              <div className="absolute -inset-4 bg-gradient-to-br from-amber-400/10 to-transparent rounded-3xl" />
              <img
                src={firstImage.url}
                alt={proposal.title}
                className="relative w-full aspect-square object-cover rounded-2xl"
                fetchPriority="high"
                decoding="async"
              />
              <div className="absolute -bottom-6 -left-6 bg-[#111] border border-white/10 p-4 rounded-2xl backdrop-blur-sm">
                <div className="flex gap-0.5 mb-1">
                  {[...Array(5)].map((_, i) => <Star key={i} className="h-3 w-3 text-amber-400 fill-amber-400" />)}
                </div>
                <p className="text-xs text-white/50">4.9 / 5.0 rating</p>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Trust strip */}
      <div className="border-y border-white/5 bg-white/[0.02]">
        <div className="max-w-6xl mx-auto px-6 py-6 flex flex-wrap justify-center gap-10 md:gap-20">
          {[
            { icon: Shield, label: t.qualityLabel },
            { icon: Zap, label: t.shippingLabel },
            { icon: Sparkles, label: t.warrantyLabel },
          ].map(({ icon: Icon, label }) => (
            <div key={label} className="flex items-center gap-3 text-white/40">
              <Icon className="h-4 w-4 text-amber-400" />
              <span className="text-sm tracking-widest uppercase">{label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Benefits */}
      <section
        className="py-32"
        data-section="benefits"
        onClick={() => handleSectionClick('benefits')}
      >
        <div className="max-w-6xl mx-auto px-6">
          <div className="mb-20">
            <p className="text-xs tracking-[0.4em] uppercase text-amber-400/60 mb-4">01 — {t.whyChoose}</p>
            <h2 className="text-5xl md:text-6xl font-extralight text-white/90">{t.whyChoose}</h2>
          </div>
          <div className="grid md:grid-cols-3 gap-4">
            {(content.benefits || []).map((benefit: string, idx: number) => (
              <div key={idx} className="bg-white/[0.03] rounded-xl p-8 hover:bg-white/[0.06] transition-colors group">
                <div className="flex items-center gap-3 mb-6">
                  <span className="text-xs text-white/20 font-mono">0{idx + 1}</span>
                  <div className="h-px flex-1 bg-white/10 group-hover:bg-amber-400/30 transition-colors" />
                </div>
                <Check className="h-5 w-5 text-amber-400 mb-4" />
                <p className="text-white/70 text-lg font-light leading-relaxed">{benefit}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Gallery */}
      {images.length > 1 && (
        <section
          className="py-32 bg-[#070707]"
          data-section="gallery"
          onClick={() => handleSectionClick('gallery')}
        >
          <div className="max-w-7xl mx-auto px-6">
            <div className="mb-20">
              <p className="text-xs tracking-[0.4em] uppercase text-amber-400/60 mb-4">02 — {t.gallery}</p>
              <h2 className="text-5xl md:text-6xl font-extralight">{t.gallery}</h2>
            </div>
            <div className="grid md:grid-cols-3 gap-2">
              {images.map((img, idx) => (
                <div key={idx} className="group relative overflow-hidden bg-white/5 aspect-square">
                  <img
                    src={img.url}
                    alt={`Product ${idx + 1}`}
                    className="w-full h-full object-cover opacity-80 group-hover:opacity-100 group-hover:scale-105 transition-all duration-700"
                    loading="lazy"
                    decoding="async"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Social Proof */}
      <section
        className="py-32 relative overflow-hidden"
        data-section="social-proof"
        onClick={() => handleSectionClick('social-proof')}
      >
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-amber-400/3 rounded-full blur-[150px]" />
        </div>
        <div className="relative max-w-4xl mx-auto px-6 text-center">
          <div className="flex justify-center gap-1 mb-8">
            {[...Array(5)].map((_, i) => <Star key={i} className="h-5 w-5 text-amber-400 fill-amber-400" />)}
          </div>
          <p className="text-3xl md:text-4xl font-extralight text-white/80 leading-relaxed mb-10">
            &ldquo;{content.socialProof}&rdquo;
          </p>
          <div className="inline-flex items-center gap-3">
            <div className="h-px w-8 bg-amber-400/40" />
            <p className="text-sm tracking-widest uppercase text-white/30">{t.trustedBy}</p>
            <div className="h-px w-8 bg-amber-400/40" />
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section
        className="py-32 bg-[#070707]"
        data-section="pricing"
        onClick={() => handleSectionClick('pricing')}
      >
        <div className="max-w-5xl mx-auto px-6">
          <div className="grid md:grid-cols-2 gap-20 items-center">
            <div>
              <p className="text-xs tracking-[0.4em] uppercase text-amber-400/60 mb-6">03 — {t.investment}</p>
              <h2 className="text-5xl font-extralight mb-10">{t.investment}</h2>
              {content.pricing.originalPrice && (
                <p className="text-white/30 line-through text-xl mb-3 font-light">
                  ${content.pricing.originalPrice.toFixed(2)} {content.pricing.currency}
                </p>
              )}
              <div className="flex items-baseline gap-3 mb-6">
                <span className="text-7xl font-extralight text-white">${content.pricing.price.toFixed(2)}</span>
                <span className="text-white/40 text-xl">{content.pricing.currency}</span>
              </div>
              {content.pricing.originalPrice && (
                <div className="inline-flex items-center gap-2 bg-amber-400/10 border border-amber-400/20 px-4 py-2 rounded-full">
                  <Sparkles className="h-3 w-3 text-amber-400" />
                  <span className="text-amber-400 text-sm font-medium">
                    {t.save} {((content.pricing.originalPrice - content.pricing.price) / content.pricing.originalPrice * 100).toFixed(0)}%
                  </span>
                </div>
              )}
            </div>
            <div className="space-y-4">
              <button
                onClick={() => handleBuy('pricing-cta')}
                className="w-full bg-amber-400 text-black py-6 text-lg font-medium tracking-wider uppercase hover:bg-amber-300 transition-all duration-300 group flex items-center justify-center gap-3"
              >
                {t.addToCart}
                <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
              </button>
              <div className="grid grid-cols-3 gap-2 text-center">
                {[t.shippingLabel, t.qualityLabel, t.warrantyLabel].map((label) => (
                  <div key={label} className="bg-white/[0.03] border border-white/5 p-3 rounded-lg">
                    <p className="text-xs text-white/30 tracking-wide">{label}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/5 py-12">
        <div className="max-w-6xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-4">
          <span className="text-sm tracking-[0.3em] uppercase text-amber-400/60">{proposal.title}</span>
          <p className="text-white/20 text-sm">© {new Date().getFullYear()} · {t.allRights}</p>
          <p className="text-white/20 text-xs tracking-widest uppercase">{t.poweredBy} Dropanalizer</p>
        </div>
      </footer>
    </div>
  )
}
