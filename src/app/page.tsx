'use client'

import Link from 'next/link'
import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useUser } from '@clerk/nextjs'
import { FileText, BarChart2, GitBranch, Zap } from 'lucide-react'
import { LanguageSwitcher } from '@/components/LanguageSwitcher'
import { useLanguage } from '@/components/LanguageContext'

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
      <header className="sticky top-0 z-10 flex h-14 items-center justify-between border-b border-white/[0.08] bg-background/80 backdrop-blur-md px-6">
        <span className="text-base font-semibold tracking-tight">
          Pro<span className="text-accent">ply</span>
        </span>
        <nav className="hidden md:flex items-center gap-6 text-sm text-text-secondary">
          <a href="#features" className="hover:text-text-primary transition-colors">{t.features}</a>
          <a href="#how" className="hover:text-text-primary transition-colors">{t.howWorks}</a>
        </nav>
        <div className="flex items-center gap-3">
          <LanguageSwitcher />
          <Link
            href="/sign-in"
            className="text-sm text-text-secondary hover:text-text-primary transition-colors"
          >
            {t.signIn}
          </Link>
          <Link
            href="/sign-up"
            className="inline-flex items-center gap-2 rounded-xl bg-accent px-4 py-2 text-sm font-semibold text-background hover:bg-accent-hover shadow-glow-green-sm hover:shadow-glow-green transition-all"
          >
            {t.startBtn}
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
            <Link
              href="/sign-up"
              className="inline-flex items-center gap-2 rounded-xl bg-accent px-6 py-2.5 text-base font-semibold text-background hover:bg-accent-hover shadow-glow-green-sm hover:shadow-glow-green transition-all"
            >
              {t.ctaPrimary} →
            </Link>
            <Link
              href="/sign-in"
              className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-6 py-2.5 text-base font-medium text-text-primary hover:bg-white/10 hover:border-white/20 transition-all"
            >
              {t.signIn}
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
            <div
              key={f.title}
              className="rounded-xl border border-white/[0.08] bg-surface p-6 shadow-card hover:border-white/[0.14] hover:shadow-glow-green-sm transition-all"
            >
              <div className="mb-4 flex h-9 w-9 items-center justify-center rounded-lg bg-accent/10 text-accent">
                <f.icon className="h-4 w-4" />
              </div>
              <h3 className="mb-2 text-sm font-semibold text-text-primary">{f.title}</h3>
              <p className="text-sm text-text-secondary leading-relaxed">{f.description}</p>
            </div>
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

      {/* CTA */}
      <section className="border-t border-white/[0.06]">
        <div className="mx-auto max-w-6xl px-6 py-20">
          <div className="relative overflow-hidden rounded-2xl border border-accent/10 bg-surface p-10 md:p-16 text-center shadow-card">
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(34,197,94,0.06)_0%,transparent_70%)]" />
            <div className="relative">
              <h2 className="text-2xl md:text-4xl font-semibold text-text-primary mb-4">
                {t.ctaTitle}
              </h2>
              <p className="text-text-secondary mb-8 max-w-md mx-auto">
                {t.ctaDescription}
              </p>
              <Link
                href="/sign-up"
                className="inline-flex items-center gap-2 rounded-xl bg-accent px-8 py-3 text-base font-semibold text-background hover:bg-accent-hover shadow-glow-green hover:shadow-glow-green transition-all"
              >
                {t.ctaPrimary} →
              </Link>
            </div>
          </div>
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

const esContent = {
  features: 'Características',
  howWorks: 'Cómo funciona',
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
}

const enContent = {
  features: 'Features',
  howWorks: 'How it works',
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
    title: 'See Who Buys and Who Doesn\'t',
    description: 'Real data on how your customers interact. Where do they leave? What interests them?',
  },
  {
    icon: GitBranch,
    title: 'Test Different Versions',
    description: 'AI creates automatic variations. Compare what sells most and optimize.',
  },
  {
    icon: Zap,
    title: 'Sell More, Don\'t Guess',
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
