'use client'

import Link from 'next/link'
import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useUser } from '@clerk/nextjs'
import { FileText, BarChart2, GitBranch, Zap, Check, Building2, Star } from 'lucide-react'
import { LanguageSwitcher } from '@/components/LanguageSwitcher'
import { useLanguage } from '@/components/LanguageContext'
import { LandingPreview } from '@/components/LandingPreview'
import Button from '@/components/ui/Button'
import Card from '@/components/ui/Card'

export default function Home() {
  const { language } = useLanguage()
  const t = language === 'es' ? esContent : enContent
  const features = language === 'es' ? featuresEs : featuresEn
  const steps = language === 'es' ? stepsEs : stepsEn
  const { isSignedIn, isLoaded } = useUser()
  const router = useRouter()

  useEffect(() => {
    if (isLoaded && isSignedIn) {
      router.replace('/dashboard')
    }
  }, [isLoaded, isSignedIn, router])

  if (!isLoaded || isSignedIn) return null

  return (
    <div className="min-h-screen bg-background text-text-primary">
      {/* Topbar */}
      <header className="sticky top-0 z-10 flex h-16 items-center justify-between border-b border-white/[0.06] bg-background/90 backdrop-blur-xl px-6 md:px-10">
        <span className="text-lg font-bold tracking-tight">
          Pro<span className="text-accent">ply</span>
        </span>
        <nav className="hidden md:flex items-center gap-1 text-sm text-text-secondary">
          <a href="#features" className="px-3 py-1.5 rounded-lg hover:bg-white/[0.06] hover:text-text-primary transition-all">{t.features}</a>
          <a href="#how" className="px-3 py-1.5 rounded-lg hover:bg-white/[0.06] hover:text-text-primary transition-all">{t.howWorks}</a>
          <a href="#pricing" className="px-3 py-1.5 rounded-lg hover:bg-white/[0.06] hover:text-text-primary transition-all">{t.pricing}</a>
        </nav>
        <div className="flex items-center gap-2">
          <LanguageSwitcher />
          <div className="w-px h-4 bg-white/[0.08] mx-1" />
          <Link href="/sign-in">
            <Button variant="ghost" size="sm">{t.signIn}</Button>
          </Link>
          <Link href="/sign-up">
            <Button size="sm">{t.startBtn} →</Button>
          </Link>
        </div>
      </header>

      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(34,197,94,0.08)_0%,transparent_60%)]" />
        <div className="relative mx-auto max-w-6xl px-6 py-24 md:py-36">
          <div className="inline-flex items-center gap-2 rounded-full border border-accent/20 bg-accent/5 px-3 py-1 text-xs font-medium text-accent mb-6">
            <Zap className="h-3 w-3" />
            {t.heroBadge}
          </div>
          <h1 className="max-w-3xl text-4xl md:text-6xl font-semibold tracking-tight text-text-primary leading-[1.1]">
            {t.heroTitle}
          </h1>
          <p className="mt-6 max-w-xl text-lg text-text-secondary leading-relaxed">
            {t.heroDescription}
          </p>
          <div className="mt-8 flex items-center gap-4">
            <Link href="/sign-up">
              <Button size="lg">{t.ctaPrimary} →</Button>
            </Link>
            <Link href="/sign-in">
              <Button size="lg" variant="secondary">{t.signIn}</Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Divider */}
      <div className="border-t border-white/[0.06] mx-6" />

      {/* Features */}
      <section id="features" className="mx-auto max-w-6xl px-6 py-20">
        <p className="text-xs font-semibold uppercase tracking-widest text-accent mb-4">{t.featuresLabel}</p>
        <h2 className="text-2xl md:text-3xl font-semibold text-text-primary mb-12">
          {t.featuresTitle}
        </h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {features.map((f) => (
            <Card key={f.title} hover className="p-6">
              <div className="mb-4 flex h-9 w-9 items-center justify-center rounded-lg bg-accent/10 text-accent">
                <f.icon className="h-4 w-4" />
              </div>
              <h3 className="mb-2 text-sm font-semibold text-text-primary">{f.title}</h3>
              <p className="text-sm text-text-secondary leading-relaxed">{f.description}</p>
            </Card>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section id="how" className="border-t border-white/[0.06]">
        <div className="mx-auto max-w-6xl px-6 py-20">
          <p className="text-xs font-semibold uppercase tracking-widest text-accent mb-4">{t.howLabel}</p>
          <h2 className="text-2xl md:text-3xl font-semibold text-text-primary mb-12">
            {t.howTitle}
          </h2>
          <div className="grid gap-6 md:grid-cols-3">
            {steps.map((s, i) => (
              <div key={s.title} className="flex gap-4">
                <div className="flex-shrink-0 flex h-8 w-8 items-center justify-center rounded-full border border-accent/30 text-accent text-sm font-semibold">
                  {i + 1}
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-text-primary mb-1">{s.title}</h3>
                  <p className="text-sm text-text-secondary leading-relaxed">{s.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Live Preview + Analytics */}
      <section id="preview" className="border-t border-white/[0.06]">
        <div className="mx-auto max-w-6xl px-6 py-20">
          <p className="text-xs font-semibold uppercase tracking-widest text-accent mb-4">{t.previewLabel}</p>
          <h2 className="text-2xl md:text-3xl font-semibold text-text-primary mb-3">
            {t.previewTitle}
          </h2>
          <p className="text-text-secondary text-base mb-12 max-w-xl">
            {t.previewDesc}
          </p>
          <LandingPreview lang={language} />
        </div>
      </section>

      {/* Social proof banner */}
      <section className="border-t border-white/[0.06]">
        <div className="mx-auto max-w-6xl px-6 py-16">
          <div className="relative overflow-hidden rounded-2xl border border-accent/20 bg-gradient-to-br from-accent/10 via-accent/5 to-transparent p-10 md:p-14 text-center">
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,rgba(34,197,94,0.12)_0%,transparent_60%)]" />
            <div className="relative">
              <div className="flex justify-center gap-1 mb-4">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                ))}
              </div>
              <h2 className="text-2xl md:text-4xl font-bold text-text-primary mb-3">
                {t.socialProofTitle}
              </h2>
              <p className="text-text-secondary text-base md:text-lg max-w-xl mx-auto mb-8">
                {t.socialProofDesc}
              </p>
              <div className="flex flex-wrap justify-center gap-6 md:gap-12 text-center">
                <div>
                  <p className="text-3xl font-bold text-accent">+1,200</p>
                  <p className="text-xs text-text-muted mt-1">{t.statDropshippers}</p>
                </div>
                <div>
                  <p className="text-3xl font-bold text-accent">+8,500</p>
                  <p className="text-xs text-text-muted mt-1">{t.statLandings}</p>
                </div>
                <div>
                  <p className="text-3xl font-bold text-accent">3.4x</p>
                  <p className="text-xs text-text-muted mt-1">{t.statConversion}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="border-t border-white/[0.06]">
        <div className="mx-auto max-w-6xl px-6 py-20">
          <p className="text-xs font-semibold uppercase tracking-widest text-accent mb-4">{t.pricingLabel}</p>
          <h2 className="text-2xl md:text-3xl font-semibold text-text-primary mb-10">
            {t.pricingTitle}
          </h2>

          <div className="grid sm:grid-cols-3 gap-4">
            {publicPlans(language).map((plan) => (
              <div
                key={plan.name}
                className={`relative rounded-2xl border p-6 flex flex-col transition-all ${
                  plan.highlight
                    ? 'border-accent/40 bg-accent/5'
                    : 'border-white/[0.08] bg-surface'
                }`}
              >
                {plan.highlight && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <span className="inline-flex items-center gap-1 rounded-full bg-accent px-3 py-1 text-xs font-semibold text-background">
                      <Zap className="h-3 w-3" />
                      {t.popular}
                    </span>
                  </div>
                )}

                <div className="mb-4">
                  <div className="flex items-center gap-2 mb-1">
                    {plan.name === 'Business'
                      ? <Building2 className="h-4 w-4 text-text-muted" />
                      : <Zap className={`h-4 w-4 ${plan.highlight ? 'text-accent' : 'text-text-muted'}`} />
                    }
                    <span className="text-sm font-semibold text-text-primary">{plan.name}</span>
                  </div>
                  <div className="flex items-baseline gap-1 mt-2">
                    <span className="text-3xl font-bold text-text-primary">${plan.price}</span>
                    <span className="text-sm text-text-muted">/{t.perMonth}</span>
                  </div>
                  <p className="text-xs text-text-muted mt-1">{plan.description}</p>
                </div>

                <ul className="space-y-2 flex-1 mb-6">
                  {plan.features.map((f) => (
                    <li key={f} className="flex items-start gap-2 text-xs text-text-secondary">
                      <Check className="h-3.5 w-3.5 text-accent flex-shrink-0 mt-0.5" />
                      {f}
                    </li>
                  ))}
                </ul>

                <a
                  href={plan.free ? '/sign-up' : '#'}
                  className={`w-full rounded-lg py-2 text-xs font-semibold text-center transition-all ${
                    plan.free
                      ? 'bg-accent text-background hover:bg-accent-hover shadow-glow-green-sm'
                      : plan.highlight
                      ? 'bg-accent/10 text-accent border border-accent/30 cursor-not-allowed opacity-60'
                      : 'bg-white/5 text-text-muted border border-white/[0.08] cursor-not-allowed opacity-60'
                  }`}
                >
                  {plan.cta}
                </a>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="border-t border-white/[0.06]">
        <div className="mx-auto max-w-6xl px-6 py-20">
          <Card className="relative overflow-hidden p-10 md:p-16 text-center border-accent/10">
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(34,197,94,0.06)_0%,transparent_70%)]" />
            <div className="relative">
              <h2 className="text-2xl md:text-4xl font-semibold text-text-primary mb-4">
                {t.ctaTitle}
              </h2>
              <p className="text-text-secondary mb-8 max-w-md mx-auto">
                {t.ctaDescription}
              </p>
              <Link href="/sign-up">
                <Button size="lg">{t.ctaPrimary} →</Button>
              </Link>
            </div>
          </Card>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/[0.06] px-6 py-8">
        <div className="mx-auto max-w-6xl flex items-center justify-between text-sm text-text-muted">
          <span>Pro<span className="text-accent">ply</span></span>
          <span>© {new Date().getFullYear()} Proply</span>
        </div>
      </footer>
    </div>
  )
}

function publicPlans(lang: string) {
  const isEs = lang === 'es'
  return [
    {
      name: 'Free',
      price: '0',
      description: isEs ? 'Para empezar a validar' : 'To start validating',
      features: isEs
        ? ['3 páginas de venta activas', 'Analytics básico', 'Señales básicas (2 recomendaciones)', 'Templates estándar', 'Marca de agua Proply']
        : ['3 active sales pages', 'Basic analytics', 'Basic signals (2 recommendations)', 'Standard templates', 'Proply watermark'],
      cta: isEs ? 'Comenzar gratis' : 'Get started free',
      free: true,
      highlight: false,
    },
    {
      name: 'Pro',
      price: '19',
      description: isEs ? 'Para dropshippers en crecimiento' : 'For growing dropshippers',
      features: isEs
        ? ['Páginas de venta ilimitadas', 'Analytics completo + Buy Intent', 'Diagnóstico AI (actualizado cada 6h)', 'Todas las señales y recomendaciones', 'Todos los templates', 'Sin marca de agua', 'Múltiples destinos CTA', 'Soporte prioritario']
        : ['Unlimited sales pages', 'Full analytics + Buy Intent', 'AI diagnosis (updated every 6h)', 'All signals and recommendations', 'All templates', 'No watermark', 'Multiple CTA destinations', 'Priority support'],
      cta: isEs ? 'Próximamente' : 'Coming soon',
      free: false,
      highlight: true,
    },
    {
      name: 'Business',
      price: '49',
      description: isEs ? 'Para equipos y agencias' : 'For teams and agencies',
      features: isEs
        ? ['Todo lo de Pro', 'Diagnóstico AI cada 2h', 'Recomendaciones cross-páginas', 'Múltiples usuarios', 'A/B testing', 'API access', 'Onboarding dedicado']
        : ['Everything in Pro', 'AI diagnosis every 2h', 'Cross-page recommendations', 'Multiple users', 'A/B testing', 'API access', 'Dedicated onboarding'],
      cta: isEs ? 'Próximamente' : 'Coming soon',
      free: false,
      highlight: false,
    },
  ]
}

const esContent = {
  features: 'Características',
  howWorks: 'Cómo funciona',
  pricing: 'Precios',
  signIn: 'Ingresar',
  startBtn: 'Comenzar',
  heroBadge: 'Generado con IA en segundos',
  heroTitle: 'Convierte más clientes con landing pages que venden',
  heroDescription: 'Landing pages profesionales en minutos. Sin diseñador, sin complicaciones. Mira cómo reaccionan tus clientes y optimiza hasta vender más.',
  featuresLabel: 'Características',
  featuresTitle: 'Todo lo que necesitas para vender más',
  howLabel: 'Cómo funciona',
  howTitle: 'De fotos a primera venta',
  ctaTitle: '¿Listo para vender más?',
  ctaDescription: 'Únete a dropshippers que triplicaron sus conversiones con Proply.',
  ctaPrimary: 'Comenzar gratis',
  socialProofTitle: 'Miles de dropshippers ya están vendiendo más',
  socialProofDesc: 'Deja de adivinar qué funciona. Genera, mide y optimiza tus landing pages con IA — como lo hacen los que más venden.',
  statDropshippers: 'dropshippers activos',
  statLandings: 'páginas de venta generadas',
  statConversion: 'más conversiones promedio',
  previewLabel: 'Demo en vivo',
  previewTitle: 'Mira tu landing y lo que hacen tus clientes — en tiempo real',
  previewDesc: 'No es solo una página bonita. Proply detecta intención de compra, identifica dónde abandonan y te dice qué mejorar.',
  pricingLabel: 'Precios',
  pricingTitle: 'Simple, sin sorpresas',
  popular: 'Popular',
  perMonth: 'mes',
}

const enContent = {
  features: 'Features',
  howWorks: 'How it works',
  pricing: 'Pricing',
  signIn: 'Sign in',
  startBtn: 'Get started',
  heroBadge: 'AI-powered in seconds',
  heroTitle: 'Convert more customers with landing pages that sell',
  heroDescription: 'Professional landing pages in minutes. No designer, no complications. See how your customers react and optimize until you sell more.',
  featuresLabel: 'Features',
  featuresTitle: 'Everything you need to sell more',
  howLabel: 'How it works',
  howTitle: 'From photos to first sale',
  ctaTitle: 'Ready to sell more?',
  ctaDescription: 'Join dropshippers who tripled their conversions with Proply.',
  ctaPrimary: 'Get started for free',
  socialProofTitle: 'Thousands of dropshippers are already selling more',
  socialProofDesc: 'Stop guessing what works. Generate, measure and optimize your landing pages with AI — just like top sellers do.',
  statDropshippers: 'active dropshippers',
  statLandings: 'sales pages generated',
  statConversion: 'avg conversion uplift',
  previewLabel: 'Live demo',
  previewTitle: 'See your landing and what your customers do — in real time',
  previewDesc: "It's not just a pretty page. Proply detects buy intent, identifies where visitors drop off, and tells you what to improve.",
  pricingLabel: 'Pricing',
  pricingTitle: 'Simple, no surprises',
  popular: 'Popular',
  perMonth: 'mo',
}

const featuresEs = [
  {
    icon: FileText,
    title: 'Landing Pages en Minutos',
    description: 'Crea páginas de venta profesionales sin diseñador. IA genera todo automáticamente.',
  },
  {
    icon: BarChart2,
    title: 'Ve Quién Compra y Quién No',
    description: 'Datos reales de cómo interactúan tus clientes. ¿Dónde se van? ¿Qué les interesa?',
  },
  {
    icon: GitBranch,
    title: 'Prueba Versiones Diferentes',
    description: 'IA crea variaciones automáticas. Compara cuál vende más y optimiza.',
  },
  {
    icon: Zap,
    title: 'Vende Más, No Adivines',
    description: 'Mejora basada en datos reales, no intuición. IA te sugiere qué cambiar.',
  },
]

const featuresEn = [
  {
    icon: FileText,
    title: 'Landing Pages in Minutes',
    description: 'Create professional sales pages without a designer. AI generates everything automatically.',
  },
  {
    icon: BarChart2,
    title: "See Who Buys and Who Doesn't",
    description: 'Real data on how your customers interact. Where do they leave? What interests them?',
  },
  {
    icon: GitBranch,
    title: 'Test Different Versions',
    description: 'AI creates automatic variations. Compare what sells most and optimize.',
  },
  {
    icon: Zap,
    title: "Sell More, Don't Guess",
    description: 'Improvements based on real data, not intuition. AI suggests what to change.',
  },
]

const stepsEs = [
  {
    title: 'Sube fotos y datos',
    description: 'Carga imágenes de tu producto, precio y descripción. Sin complicaciones.',
  },
  {
    title: 'IA crea tu página',
    description: 'Proply genera automáticamente una landing page lista para vender.',
  },
  {
    title: 'Comparte y vende',
    description: 'Envía el link a tus clientes. Mira cómo compran y mejora cada día.',
  },
]

const stepsEn = [
  {
    title: 'Upload photos and data',
    description: 'Upload your product images, price and description. No complications.',
  },
  {
    title: 'AI creates your page',
    description: 'Proply automatically generates a landing page ready to sell.',
  },
  {
    title: 'Share and sell',
    description: 'Send the link to your customers. Watch how they buy and improve daily.',
  },
]
