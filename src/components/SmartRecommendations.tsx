'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { AlertTriangle, CheckCircle, Info, XCircle, X, Loader2, Zap } from 'lucide-react'
import type { Signal } from '@/lib/recommendations'

interface Props {
  proposalId: string
  language: 'es' | 'en'
}

const severityConfig = {
  critical: {
    icon: XCircle,
    iconColor: 'text-red-400',
    border: 'border-red-500/20',
    bg: 'bg-red-500/[0.05]',
    dot: 'bg-red-400',
    label: { es: 'Acción urgente', en: 'Urgent action' },
  },
  warning: {
    icon: AlertTriangle,
    iconColor: 'text-amber-400',
    border: 'border-amber-500/20',
    bg: 'bg-amber-500/[0.05]',
    dot: 'bg-amber-400',
    label: { es: 'Atención', en: 'Attention' },
  },
  success: {
    icon: CheckCircle,
    iconColor: 'text-accent',
    border: 'border-accent/20',
    bg: 'bg-accent/[0.05]',
    dot: 'bg-accent',
    label: { es: 'Bien', en: 'Good' },
  },
  info: {
    icon: Info,
    iconColor: 'text-blue-400',
    border: 'border-blue-500/20',
    bg: 'bg-blue-500/[0.05]',
    dot: 'bg-blue-400',
    label: { es: 'Info', en: 'Info' },
  },
}

export default function SmartRecommendations({ proposalId, language }: Props) {
  const router = useRouter()
  const [signals, setSignals] = useState<Signal[]>([])
  const [dismissed, setDismissed] = useState<Set<number>>(new Set())
  const [loading, setLoading] = useState(true)

  const es = language === 'es'

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch(`/api/recommendations/${proposalId}?lang=${language}`)
        if (res.ok) {
          const data = await res.json()
          setSignals(data.signals ?? [])
        }
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [proposalId, language])

  function handleAction(signal: Signal) {
    if (!signal.actionType) return
    switch (signal.actionType) {
      case 'edit_content':
        router.push(`/proposals/${proposalId}/edit`)
        break
      case 'new_version':
        router.push(`/proposals/${proposalId}/edit`)
        break
      case 'change_product':
        router.push('/proposals/new')
        break
      case 'share_link':
      case 'scale_traffic':
        navigator.clipboard.writeText(`${window.location.origin}/p/${proposalId}`)
        break
    }
  }

  const visible = signals.filter((_, i) => !dismissed.has(i))

  if (loading) {
    return (
      <div className="flex items-center gap-3 py-6 text-text-muted text-sm">
        <Loader2 className="h-4 w-4 animate-spin" />
        {es ? 'Analizando tu página...' : 'Analyzing your page...'}
      </div>
    )
  }

  if (visible.length === 0) return null

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2 mb-4">
        <Zap className="h-4 w-4 text-accent" />
        <h2 className="text-sm font-semibold text-text-primary uppercase tracking-widest">
          {es ? 'Señales' : 'Signals'}
        </h2>
      </div>

      {visible.map((signal, idx) => {
        const config = severityConfig[signal.severity]
        const Icon = config.icon
        const originalIdx = signals.indexOf(signal)

        return (
          <div
            key={idx}
            className={`relative rounded-xl border p-5 ${config.border} ${config.bg}`}
          >
            <button
              onClick={() => setDismissed((prev) => new Set(Array.from(prev).concat(originalIdx)))}
              className="absolute top-3 right-3 p-1 text-text-muted hover:text-text-primary transition-colors rounded"
              aria-label={es ? 'Ignorar' : 'Dismiss'}
            >
              <X className="h-3.5 w-3.5" />
            </button>

            <div className="flex items-start gap-3 pr-6">
              <Icon className={`h-5 w-5 flex-shrink-0 mt-0.5 ${config.iconColor}`} />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className={`inline-block h-1.5 w-1.5 rounded-full flex-shrink-0 ${config.dot}`} />
                  <p className="text-sm font-semibold text-text-primary">{signal.title}</p>
                </div>
                <p className="text-sm text-text-muted leading-relaxed">{signal.body}</p>
                {signal.actionLabel && signal.actionType && (
                  <button
                    onClick={() => handleAction(signal)}
                    className="mt-3 inline-flex items-center gap-1.5 text-xs font-semibold text-accent hover:text-accent-hover transition-colors"
                  >
                    → {signal.actionLabel}
                  </button>
                )}
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}
