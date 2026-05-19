'use client'

import { useUser } from '@clerk/nextjs'
import Container from '@/components/ui/Container'
import PageHeader from '@/components/ui/PageHeader'
import Card from '@/components/ui/Card'
import { Check, Zap, Building2, User } from 'lucide-react'

const plans = [
  {
    name: 'Free',
    price: '0',
    description: 'Para empezar a validar',
    features: [
      '3 páginas de venta activas',
      'Analytics básico',
      'Señales básicas (2 recomendaciones)',
      'Templates estándar',
      'Marca de agua Dropanalizer',
    ],
    cta: 'Tu plan actual',
    current: true,
    highlight: false,
  },
  {
    name: 'Pro',
    price: '19',
    description: 'Para dropshippers en crecimiento',
    features: [
      'Páginas de venta ilimitadas',
      'Analytics completo + Buy Intent',
      'Diagnóstico AI (actualizado cada 6h)',
      'Todas las señales y recomendaciones',
      'Todos los templates',
      'Sin marca de agua',
      'Múltiples destinos CTA',
      'Soporte prioritario',
    ],
    cta: 'Próximamente',
    current: false,
    highlight: true,
  },
  {
    name: 'Business',
    price: '49',
    description: 'Para equipos y agencias',
    features: [
      'Todo lo de Pro',
      'Diagnóstico AI cada 2h',
      'Recomendaciones cross-páginas',
      'Múltiples usuarios',
      'A/B testing',
      'API access',
      'Onboarding dedicado',
    ],
    cta: 'Próximamente',
    current: false,
    highlight: false,
  },
]

export default function SettingsPage() {
  const { user, isLoaded } = useUser()

  const displayName = [user?.firstName, user?.lastName].filter(Boolean).join(' ') || '—'
  const email = user?.emailAddresses[0]?.emailAddress || '—'
  const firstInitial = user?.firstName?.[0] ?? 'U'
  const lastInitial = user?.lastName?.[0] ?? ''
  const initials = (firstInitial + lastInitial).toUpperCase()
  const memberSince = user?.createdAt
    ? new Date(user.createdAt).toLocaleDateString('es-ES', { month: 'long', year: 'numeric' })
    : '—'

  if (!isLoaded) {
    return (
      <div className="min-h-screen bg-background py-12">
        <Container className="max-w-4xl">
          <PageHeader title="Configuración" subtitle="Tu cuenta y plan" />
          <div className="mt-10">
            <div className="h-4 w-20 bg-white/[0.06] rounded mb-4" />
            <Card>
              <div className="p-6 flex items-center gap-5 animate-pulse">
                <div className="h-14 w-14 rounded-full bg-white/[0.06] flex-shrink-0" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 w-36 bg-white/[0.06] rounded" />
                  <div className="h-3 w-52 bg-white/[0.06] rounded" />
                  <div className="h-3 w-32 bg-white/[0.06] rounded" />
                </div>
              </div>
            </Card>
          </div>
        </Container>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background py-12">
      <Container className="max-w-4xl">
        <PageHeader title="Configuración" subtitle="Tu cuenta y plan" />

        {/* Account section */}
        <div className="mt-10">
          <h2 className="text-sm font-semibold text-text-secondary uppercase tracking-widest mb-4">Cuenta</h2>
          <Card>
            <div className="p-6 flex items-center gap-5">
              <div className="h-14 w-14 flex-shrink-0 rounded-full bg-accent/20 flex items-center justify-center">
                <span className="text-accent font-bold text-lg leading-none">{initials}</span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-base font-semibold text-text-primary">{displayName}</p>
                <p className="text-sm text-text-muted mt-0.5">{email}</p>
                <p className="text-xs text-text-muted mt-1 flex items-center gap-1.5">
                  <User className="h-3 w-3" />
                  Miembro desde {memberSince}
                </p>
              </div>
              <div className="flex-shrink-0">
                <span className="inline-flex items-center gap-1.5 rounded-full bg-accent/10 px-3 py-1 text-xs font-semibold text-accent">
                  <span className="h-1.5 w-1.5 rounded-full bg-accent" />
                  Free
                </span>
              </div>
            </div>
          </Card>
        </div>

        {/* Plan section */}
        <div className="mt-10">
          <div className="mb-4">
            <h2 className="text-sm font-semibold text-text-secondary uppercase tracking-widest">Plan</h2>
          </div>

          <div className="grid sm:grid-cols-3 gap-4">
            {plans.map((plan) => (
              <div
                key={plan.name}
                className={`relative rounded-2xl border p-6 flex flex-col transition-all ${
                  plan.highlight
                    ? 'border-accent/40 bg-accent/5'
                    : 'border-white/[0.08] bg-surface'
                } ${plan.current ? 'ring-1 ring-accent/30' : ''}`}
              >
                {plan.highlight && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <span className="inline-flex items-center gap-1 rounded-full bg-accent px-3 py-1 text-xs font-semibold text-background">
                      <Zap className="h-3 w-3" />
                      Popular
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
                    <span className="text-sm text-text-muted">/mes</span>
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

                <button
                  disabled={!plan.current}
                  className={`w-full rounded-lg py-2 text-xs font-semibold transition-colors ${
                    plan.current
                      ? 'bg-white/5 text-text-muted cursor-default'
                      : plan.highlight
                      ? 'bg-accent/10 text-accent border border-accent/30 cursor-not-allowed opacity-60'
                      : 'bg-white/5 text-text-muted border border-white/[0.08] cursor-not-allowed opacity-60'
                  }`}
                >
                  {plan.cta}
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Danger zone */}
        <div className="mt-10">
          <h2 className="text-sm font-semibold text-text-secondary uppercase tracking-widest mb-4">Zona de peligro</h2>
          <Card>
            <div className="p-6 flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-text-primary">Eliminar cuenta</p>
                <p className="text-xs text-text-muted mt-0.5">Elimina permanentemente tu cuenta y todos tus datos</p>
              </div>
              <button
                disabled
                className="text-xs font-semibold text-red-400 border border-red-400/30 rounded-lg px-4 py-2 opacity-40 cursor-not-allowed"
                title="Próximamente"
              >
                Eliminar cuenta
              </button>
            </div>
          </Card>
        </div>
      </Container>
    </div>
  )
}
