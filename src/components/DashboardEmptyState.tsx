'use client'

import Link from 'next/link'
import Button from '@/components/ui/Button'
import { Plus, Zap, BarChart2, Share2 } from 'lucide-react'
import { useLanguage } from '@/hooks/useLanguage'
import { getTranslation } from '@/lib/i18n'

export default function DashboardEmptyState() {
  const { language } = useLanguage()
  const t = getTranslation(language)

  const steps = [
    { icon: <Zap className="h-4 w-4 text-accent" />, label: language === 'es' ? 'Crea' : 'Create', desc: language === 'es' ? 'Describe tu producto y sube fotos' : 'Describe your product and upload photos' },
    { icon: <Share2 className="h-4 w-4 text-accent" />, label: language === 'es' ? 'Comparte' : 'Share', desc: language === 'es' ? 'Copia el link y pégalo en tus anuncios' : 'Copy the link and paste it in your ads' },
    { icon: <BarChart2 className="h-4 w-4 text-accent" />, label: language === 'es' ? 'Analiza' : 'Analyze', desc: language === 'es' ? 'Ve cuántos visitan y hacen click en comprar' : 'See how many visit and click to buy' },
  ]

  return (
    <div className="mt-6 rounded-2xl border border-dashed border-white/[0.10] bg-white/[0.02] px-6 py-16 flex flex-col items-center text-center">
      <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-accent/10 mb-6">
        <Zap className="h-7 w-7 text-accent" />
      </div>
      <h2 className="text-xl font-semibold text-text-primary mb-2">
        {language === 'es' ? 'Crea tu primera página de venta' : 'Create your first sales page'}
      </h2>
      <p className="text-sm text-text-muted max-w-sm mb-8">
        {language === 'es'
          ? 'Sube tu producto, agrega imágenes y en minutos tendrás una página lista para compartir y vender.'
          : 'Upload your product, add images, and in minutes you\'ll have a page ready to share and sell.'}
      </p>
      <div className="flex flex-col sm:flex-row gap-6 mb-10 text-left">
        {steps.map((step) => (
          <div key={step.label} className="flex items-start gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-accent/10 flex-shrink-0 mt-0.5">
              {step.icon}
            </div>
            <div>
              <p className="text-sm font-semibold text-text-primary">{step.label}</p>
              <p className="text-xs text-text-muted">{step.desc}</p>
            </div>
          </div>
        ))}
      </div>
      <Link href="/proposals/new">
        <Button>
          <Plus className="h-4 w-4" />
          {language === 'es' ? 'Crear mi primera página de venta' : 'Create my first sales page'}
        </Button>
      </Link>
    </div>
  )
}
