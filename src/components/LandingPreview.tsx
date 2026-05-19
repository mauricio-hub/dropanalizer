'use client'

import { useState, useEffect } from 'react'
import { Eye, Clock, MousePointer, TrendingUp, ShoppingCart, Zap, AlertTriangle, CheckCircle, XCircle } from 'lucide-react'
import Card from '@/components/ui/Card'

const PRODUCTS = [
  {
    id: 'reloj',
    label: 'Reloj Premium',
    labelEn: 'Premium Watch',
    price: '$89.99',
    originalPrice: '$149.99',
    images: [
      '/landing-previews/reloj/reloj1.avif',
      '/landing-previews/reloj/reloj2.avif',
      '/landing-previews/reloj/reloj3.avif',
    ],
    // Simulated analytics data
    analytics: {
      views: 284,
      buyIntent: 68,
      avgTime: '2m 14s',
      hotSection: 'Precio',
      hotSectionEn: 'Price',
      dropSection: 'Beneficios',
      dropSectionEn: 'Benefits',
      scrollDepth: 82,
      ctaClicks: 47,
    },
  },
  {
    id: 'carteras',
    label: 'Cartera de Lujo',
    labelEn: 'Luxury Wallet',
    price: '$54.99',
    originalPrice: '$89.99',
    images: [
      '/landing-previews/carteras/1.avif',
      '/landing-previews/carteras/2.avif',
      '/landing-previews/carteras/3.avif',
      '/landing-previews/carteras/4.avif',
    ],
    analytics: {
      views: 512,
      buyIntent: 74,
      avgTime: '1m 58s',
      hotSection: 'Galería',
      hotSectionEn: 'Gallery',
      dropSection: 'Hero',
      dropSectionEn: 'Hero',
      scrollDepth: 91,
      ctaClicks: 89,
    },
  },
  {
    id: 'zapatos',
    label: 'Zapatos de Dama',
    labelEn: "Women's Shoes",
    price: '$69.99',
    originalPrice: '$119.99',
    images: [
      '/landing-previews/zapatos-dama/1.avif',
      '/landing-previews/zapatos-dama/2.avif',
      '/landing-previews/zapatos-dama/3.avif',
      '/landing-previews/zapatos-dama/4.avif',
    ],
    analytics: {
      views: 731,
      buyIntent: 81,
      avgTime: '3m 02s',
      hotSection: 'Precio',
      hotSectionEn: 'Price',
      dropSection: 'FAQ',
      dropSectionEn: 'FAQ',
      scrollDepth: 76,
      ctaClicks: 134,
    },
  },
]

const SIGNALS: Record<string, {
  severity: 'critical' | 'warning' | 'success'
  titleEs: string
  titleEn: string
  bodyEs: string
  bodyEn: string
  actionEs: string
  actionEn: string
}[]> = {
  reloj: [
    {
      severity: 'warning',
      titleEs: 'Hay interés pero algo frena la decisión',
      titleEn: "There's interest but something stops the purchase",
      bodyEs: 'El 23.9% de visitantes hace click en Comprar — hay interés, pero se quedan a mitad de camino. Prueba agregar urgencia o una garantía visible.',
      bodyEn: '23.9% of visitors click Buy — there\'s interest but they\'re not following through. Try adding urgency or a visible guarantee.',
      actionEs: 'Editar página',
      actionEn: 'Edit page',
    },
  ],
  carteras: [
    {
      severity: 'success',
      titleEs: 'Buena intención de compra',
      titleEn: 'Strong buy intent',
      bodyEs: 'El 14.4% de tus visitantes hace click en Comprar — eso está por encima del promedio del sector (1–3%). Es momento de escalar el tráfico.',
      bodyEn: '14.4% of your visitors click Buy — above the industry average (1–3%). Time to scale your traffic.',
      actionEs: 'Copiar link',
      actionEn: 'Copy link',
    },
  ],
  zapatos: [
    {
      severity: 'critical',
      titleEs: 'Esta página lleva 7+ días sin convertir bien',
      titleEn: 'This page has been underperforming for 7+ days',
      bodyEs: 'Llevas 9 días con una tasa del 11%. Tienes suficientes datos — genera una nueva versión con IA para ver si mejora.',
      bodyEn: 'You\'ve had an 11% rate for 9 days. You have enough data — generate a new AI version to see if it performs better.',
      actionEs: 'Generar nueva versión con IA',
      actionEn: 'Generate new version with AI',
    },
  ],
}

const SEVERITY_CONFIG = {
  critical: { icon: XCircle, color: 'text-red-400', border: 'border-red-500/20', bg: 'bg-red-500/[0.05]', dot: 'bg-red-400', labelEs: 'Acción urgente', labelEn: 'Urgent' },
  warning:  { icon: AlertTriangle, color: 'text-amber-400', border: 'border-amber-500/20', bg: 'bg-amber-500/[0.05]', dot: 'bg-amber-400', labelEs: 'Atención', labelEn: 'Attention' },
  success:  { icon: CheckCircle, color: 'text-accent', border: 'border-accent/20', bg: 'bg-accent/[0.05]', dot: 'bg-accent', labelEs: 'Bien', labelEn: 'Good' },
}

const SECTIONS = ['Hero', 'Beneficios', 'Galería', 'Precio', 'FAQ', 'CTA']
const SECTIONS_EN = ['Hero', 'Benefits', 'Gallery', 'Price', 'FAQ', 'CTA']

// Heat intensity per section per product (0-100)
const HEAT_MAP: Record<string, number[]> = {
  reloj:   [55, 38, 61, 94, 42, 71],
  carteras:[72, 45, 89, 83, 51, 68],
  zapatos: [68, 52, 79, 96, 34, 85],
}

function heatColor(value: number): string {
  if (value >= 85) return 'bg-red-500'
  if (value >= 65) return 'bg-orange-400'
  if (value >= 45) return 'bg-yellow-400'
  if (value >= 25) return 'bg-emerald-400'
  return 'bg-blue-400'
}

function heatLabel(value: number, lang: string): string {
  if (lang === 'es') {
    if (value >= 85) return 'Muy alto'
    if (value >= 65) return 'Alto'
    if (value >= 45) return 'Medio'
    return 'Bajo'
  }
  if (value >= 85) return 'Very high'
  if (value >= 65) return 'High'
  if (value >= 45) return 'Medium'
  return 'Low'
}

interface LandingPreviewProps {
  lang: string
}

export function LandingPreview({ lang }: LandingPreviewProps) {
  const isEs = lang === 'es'
  const [activeProduct, setActiveProduct] = useState(0)
  const [activeImage, setActiveImage] = useState(0)
  const [animating, setAnimating] = useState(false)

  const product = PRODUCTS[activeProduct]
  const heat = HEAT_MAP[product.id]
  const sections = isEs ? SECTIONS : SECTIONS_EN

  // Auto-rotate images
  useEffect(() => {
    const t = setInterval(() => {
      setActiveImage((i) => (i + 1) % product.images.length)
    }, 2400)
    return () => clearInterval(t)
  }, [product.images.length])

  const switchProduct = (idx: number) => {
    if (idx === activeProduct) return
    setAnimating(true)
    setTimeout(() => {
      setActiveProduct(idx)
      setActiveImage(0)
      setAnimating(false)
    }, 200)
  }

  const a = product.analytics

  return (
    <div className="w-full">
      {/* Product tabs */}
      <div className="flex justify-center gap-2 mb-8">
        {PRODUCTS.map((p, i) => (
          <button
            key={p.id}
            onClick={() => switchProduct(i)}
            className={`px-4 py-2 rounded-full text-xs font-semibold transition-all ${
              i === activeProduct
                ? 'bg-accent text-background shadow-glow-green-sm'
                : 'bg-white/[0.06] text-text-secondary hover:bg-white/[0.10] hover:text-text-primary border border-white/[0.08]'
            }`}
          >
            {isEs ? p.label : p.labelEn}
          </button>
        ))}
      </div>

      {/* Main preview container */}
      <div className={`transition-opacity duration-200 ${animating ? 'opacity-0' : 'opacity-100'}`}>
        <div className="grid lg:grid-cols-2 gap-6 items-start">

          {/* LEFT — Landing page mockup */}
          <div className="rounded-2xl border border-white/[0.08] bg-background overflow-hidden shadow-card">
            {/* Browser chrome */}
            <div className="flex items-center gap-2 px-4 py-3 bg-surface border-b border-white/[0.06]">
              <div className="flex gap-1.5">
                <div className="h-2.5 w-2.5 rounded-full bg-red-500/70" />
                <div className="h-2.5 w-2.5 rounded-full bg-yellow-500/70" />
                <div className="h-2.5 w-2.5 rounded-full bg-green-500/70" />
              </div>
              <div className="flex-1 mx-3 bg-white/[0.06] rounded-md px-3 py-1 text-[10px] text-text-muted font-mono">
                dropanalizer.ai/p/{'{'}{product.id}{'}'}
              </div>
              <div className="flex items-center gap-1 text-[10px] text-emerald-400">
                <div className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                {isEs ? 'En vivo' : 'Live'}
              </div>
            </div>

            {/* Landing content preview */}
            <div className="relative">
              {/* Hero image */}
              <div className="relative h-52 overflow-hidden bg-black">
                {product.images.map((src, i) => (
                  <img
                    key={src}
                    src={src}
                    alt=""
                    className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-700 ${
                      i === activeImage ? 'opacity-100' : 'opacity-0'
                    }`}
                  />
                ))}
                {/* Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
                {/* Title overlay */}
                <div className="absolute bottom-0 left-0 right-0 p-4">
                  <div className="h-2 w-40 bg-white/80 rounded mb-2" />
                  <div className="h-1.5 w-24 bg-white/40 rounded" />
                </div>
                {/* Image dots */}
                <div className="absolute top-3 right-3 flex gap-1">
                  {product.images.map((_, i) => (
                    <div key={i} className={`h-1 rounded-full transition-all ${i === activeImage ? 'w-4 bg-white' : 'w-1 bg-white/40'}`} />
                  ))}
                </div>
                {/* Buy intent badge */}
                <div className="absolute top-3 left-3 flex items-center gap-1.5 bg-black/60 backdrop-blur-sm border border-accent/30 rounded-full px-2.5 py-1">
                  <Zap className="h-3 w-3 text-accent" />
                  <span className="text-[10px] font-bold text-accent">{a.buyIntent}% {isEs ? 'intención' : 'intent'}</span>
                </div>
              </div>

              {/* Simulated landing body */}
              <div className="p-4 space-y-3 bg-surface/50">
                {/* Price section */}
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-[10px] text-text-muted line-through">{product.originalPrice}</div>
                    <div className="text-lg font-bold text-accent">{product.price}</div>
                  </div>
                  <div className="bg-accent rounded-lg px-3 py-1.5 flex items-center gap-1.5">
                    <ShoppingCart className="h-3 w-3 text-background" />
                    <span className="text-[10px] font-bold text-background">{isEs ? 'Comprar' : 'Buy now'}</span>
                  </div>
                </div>

                {/* Benefit pills */}
                <div className="flex gap-1.5 flex-wrap">
                  {['✓ Envío rápido', '✓ Garantía', '✓ Seguro'].map((b) => (
                    <span key={b} className="text-[9px] bg-white/[0.05] border border-white/[0.08] rounded-full px-2 py-0.5 text-text-muted">{b}</span>
                  ))}
                </div>

                {/* Review */}
                <div className="bg-white/[0.03] border border-white/[0.06] rounded-lg p-2.5">
                  <div className="flex gap-0.5 mb-1">
                    {[...Array(5)].map((_, i) => <span key={i} className="text-[8px] text-yellow-400">★</span>)}
                  </div>
                  <div className="h-1.5 w-full bg-white/10 rounded mb-1" />
                  <div className="h-1.5 w-3/4 bg-white/10 rounded" />
                </div>
              </div>
            </div>
          </div>

          {/* RIGHT — Analytics panel */}
          <div className="space-y-4">

            {/* Top metrics */}
            <div className="grid grid-cols-2 gap-3">
              <MetricCard
                icon={Eye}
                label={isEs ? 'Visitas hoy' : 'Views today'}
                value={a.views.toString()}
                sub={isEs ? 'últimas 24h' : 'last 24h'}
                color="text-blue-400"
                bg="bg-blue-400/10"
              />
              <MetricCard
                icon={TrendingUp}
                label={isEs ? 'Intención de compra' : 'Buy intent'}
                value={`${a.buyIntent}%`}
                sub={isEs ? 'de visitantes' : 'of visitors'}
                color="text-accent"
                bg="bg-accent/10"
                highlight
              />
              <MetricCard
                icon={Clock}
                label={isEs ? 'Tiempo promedio' : 'Avg. time'}
                value={a.avgTime}
                sub={isEs ? 'en la página' : 'on page'}
                color="text-purple-400"
                bg="bg-purple-400/10"
              />
              <MetricCard
                icon={MousePointer}
                label={isEs ? 'Clicks en CTA' : 'CTA clicks'}
                value={a.ctaClicks.toString()}
                sub={isEs ? 'hoy' : 'today'}
                color="text-orange-400"
                bg="bg-orange-400/10"
              />
            </div>

            {/* Heatmap */}
            <Card className="p-4">
              <div className="flex items-center justify-between mb-3">
                <p className="text-xs font-semibold text-text-primary">
                  {isEs ? 'Atención por sección' : 'Attention by section'}
                </p>
                <span className="text-[10px] text-text-muted">{isEs ? 'tiempo + clics' : 'time + clicks'}</span>
              </div>
              <div className="space-y-2">
                {sections.map((section, i) => (
                  <div key={section} className="flex items-center gap-3">
                    <span className="text-[10px] text-text-muted w-16 shrink-0">{section}</span>
                    <div className="flex-1 bg-white/[0.05] rounded-full h-2 overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-700 ${heatColor(heat[i])}`}
                        style={{ width: `${heat[i]}%` }}
                      />
                    </div>
                    <span className={`text-[10px] font-medium w-14 text-right shrink-0 ${
                      heat[i] >= 85 ? 'text-red-400' :
                      heat[i] >= 65 ? 'text-orange-400' :
                      heat[i] >= 45 ? 'text-yellow-400' : 'text-emerald-400'
                    }`}>
                      {heatLabel(heat[i], lang)}
                    </span>
                  </div>
                ))}
              </div>
            </Card>

            {/* Smart Signals preview */}
            <div>
              <div className="flex items-center gap-2 mb-3">
                <Zap className="h-3.5 w-3.5 text-accent" />
                <p className="text-xs font-semibold text-text-primary uppercase tracking-widest">
                  {isEs ? 'Señales' : 'Signals'}
                </p>
              </div>
              <div className="space-y-2">
                {SIGNALS[product.id].map((signal, i) => {
                  const cfg = SEVERITY_CONFIG[signal.severity]
                  const Icon = cfg.icon
                  return (
                    <div key={i} className={`rounded-xl border p-4 ${cfg.border} ${cfg.bg}`}>
                      <div className="flex items-start gap-2.5">
                        <Icon className={`h-4 w-4 flex-shrink-0 mt-0.5 ${cfg.color}`} />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-1.5 mb-1">
                            <span className={`inline-block h-1.5 w-1.5 rounded-full flex-shrink-0 ${cfg.dot}`} />
                            <p className="text-[11px] font-semibold text-text-primary leading-tight">
                              {isEs ? signal.titleEs : signal.titleEn}
                            </p>
                          </div>
                          <p className="text-[10px] text-text-muted leading-relaxed">
                            {isEs ? signal.bodyEs : signal.bodyEn}
                          </p>
                          <p className={`mt-2 text-[10px] font-semibold ${cfg.color}`}>
                            → {isEs ? signal.actionEs : signal.actionEn}
                          </p>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

function MetricCard({
  icon: Icon,
  label,
  value,
  sub,
  color,
  bg,
  highlight,
}: {
  icon: any
  label: string
  value: string
  sub: string
  color: string
  bg: string
  highlight?: boolean
}) {
  return (
    <Card className={`p-4 ${highlight ? 'border-accent/30 bg-accent/5' : ''}`}>
      <div className={`h-7 w-7 rounded-lg ${bg} flex items-center justify-center mb-3`}>
        <Icon className={`h-3.5 w-3.5 ${color}`} />
      </div>
      <p className="text-xs text-text-muted mb-0.5">{label}</p>
      <p className={`text-xl font-bold ${highlight ? 'text-accent' : 'text-text-primary'}`}>{value}</p>
      <p className="text-[10px] text-text-muted mt-0.5">{sub}</p>
    </Card>
  )
}
