'use client'

import Link from 'next/link'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { AlertCircle, ExternalLink, MessageCircle, Link as LinkIcon, Trash2, Loader2, Copy, Check } from 'lucide-react'
import { useLanguage } from '@/hooks/useLanguage'
import { getTranslation } from '@/lib/i18n'

interface Proposal {
  id: string
  title: string
  status: string
  createdAt: string
  buyUrl?: string
  versions: Array<{ id: string }>
}

function CtaBadge({ buyUrl }: { buyUrl?: string }) {
  if (!buyUrl) {
    return (
      <span className="inline-flex items-center gap-1 text-xs text-orange-400">
        <AlertCircle className="h-3 w-3" />
        Sin destino
      </span>
    )
  }

  const isWA = buyUrl.includes('wa.me')
  let label = ''
  if (isWA) {
    const match = buyUrl.match(/wa\.me\/\+?(\d+)/)
    label = match ? `+${match[1]}` : 'WhatsApp'
  } else {
    try { label = new URL(buyUrl).hostname } catch { label = buyUrl }
  }

  return (
    <span className="inline-flex items-center gap-1 text-xs text-text-muted">
      {isWA
        ? <MessageCircle className="h-3 w-3 text-green-400 flex-shrink-0" />
        : <LinkIcon className="h-3 w-3 text-blue-400 flex-shrink-0" />
      }
      <span className="truncate max-w-[120px]">{label}</span>
    </span>
  )
}

function CopyLinkButton({ id }: { id: string }) {
  const [copied, setCopied] = useState(false)

  async function handleCopy() {
    const url = `${window.location.origin}/p/${id}`
    await navigator.clipboard.writeText(url)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <button
      onClick={handleCopy}
      title="Copiar link de la landing"
      className={`p-1.5 rounded transition-colors ${
        copied
          ? 'text-green-400 bg-green-400/10'
          : 'text-text-muted hover:text-accent hover:bg-accent/10'
      }`}
    >
      {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
    </button>
  )
}

function DeleteButton({ id, title, language }: { id: string; title: string; language: string }) {
  const router = useRouter()
  const t = getTranslation(language as 'es' | 'en')
  const [confirming, setConfirming] = useState(false)
  const [deleting, setDeleting] = useState(false)

  async function handleDelete() {
    setDeleting(true)
    try {
      await fetch(`/api/proposals/${id}`, { method: 'DELETE' })
      router.refresh()
    } finally {
      setDeleting(false)
      setConfirming(false)
    }
  }

  if (confirming) {
    return (
      <span className="flex items-center gap-1">
        <span className="text-xs text-text-muted">{language === 'es' ? '¿Eliminar?' : 'Delete?'}</span>
        <button
          onClick={handleDelete}
          disabled={deleting}
          className="text-xs text-red-400 hover:text-red-300 py-1 px-2 hover:bg-red-400/10 rounded transition-colors disabled:opacity-50"
        >
          {deleting ? <Loader2 className="h-3 w-3 animate-spin" /> : 'Sí'}
        </button>
        <button
          onClick={() => setConfirming(false)}
          className="text-xs text-text-muted hover:text-text-primary py-1 px-1 transition-colors"
        >
          {language === 'es' ? 'No' : 'No'}
        </button>
      </span>
    )
  }

  return (
    <button
      onClick={() => setConfirming(true)}
      title={language === 'es' ? `Eliminar "${title}"` : `Delete "${title}"`}
      className="p-1.5 text-text-muted hover:text-red-400 hover:bg-red-400/10 rounded transition-colors"
    >
      <Trash2 className="h-3.5 w-3.5" />
    </button>
  )
}

export default function DashboardProposalTable({ proposals: initialProposals }: { proposals: Proposal[] }) {
  const { language } = useLanguage()
  const t = getTranslation(language)

  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="border-b border-white/[0.06]">
            <th className="text-left px-6 py-3 text-xs font-semibold text-text-secondary">{t.dashboard.product}</th>
            <th className="text-left px-6 py-3 text-xs font-semibold text-text-secondary">{t.dashboard.status}</th>
            <th className="text-left px-6 py-3 text-xs font-semibold text-text-secondary">{t.dashboard.ctaDestination}</th>
            <th className="text-left px-6 py-3 text-xs font-semibold text-text-secondary">{t.dashboard.created}</th>
            <th className="text-right px-6 py-3 text-xs font-semibold text-text-secondary">{t.dashboard.actions}</th>
          </tr>
        </thead>
        <tbody>
          {initialProposals.length > 0 ? (
            initialProposals.map((p) => {
              const publishedVersion = p.versions[0]
              return (
                <tr key={p.id} className="border-b border-white/[0.06] hover:bg-white/[0.03] transition-colors">
                  <td className="px-6 py-4 text-sm font-medium text-text-primary max-w-xs truncate">{p.title}</td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center gap-1 rounded-full px-2 py-1 text-xs font-medium ${
                      p.status === 'published'
                        ? 'bg-accent/10 text-accent'
                        : 'bg-white/5 text-text-muted'
                    }`}>
                      <span className={`h-1.5 w-1.5 rounded-full ${
                        p.status === 'published' ? 'bg-accent' : 'bg-white/30'
                      }`} />
                      {p.status === 'published' ? t.dashboard.published : t.dashboard.draft}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <CtaBadge buyUrl={p.buyUrl} />
                  </td>
                  <td className="px-6 py-4 text-sm text-text-muted">
                    {new Date(p.createdAt).toLocaleDateString('es-ES', {
                      month: 'short', day: 'numeric', year: 'numeric',
                    })}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex gap-1 justify-end items-center">
                      <Link
                        href={`/proposals/${p.id}/edit`}
                        className="text-xs text-accent hover:text-accent-hover transition-colors py-1 px-2 hover:bg-white/5 rounded"
                      >
                        {t.dashboard.edit}
                      </Link>
                      {p.status === 'published' ? (
                        <Link
                          href={`/proposals/${p.id}/analytics`}
                          className="text-xs text-text-secondary hover:text-text-primary transition-colors py-1 px-2 hover:bg-white/5 rounded"
                        >
                          {t.dashboard.analytics}
                        </Link>
                      ) : (
                        <span
                          title={language === 'es' ? 'Publica la landing para ver analytics' : 'Publish the landing to see analytics'}
                          className="text-xs text-text-muted py-1 px-2 opacity-40 cursor-not-allowed"
                        >
                          {t.dashboard.analytics}
                        </span>
                      )}
                      {p.status === 'published' ? (
                        <Link
                          href={`/p/${p.id}`}
                          target="_blank"
                          className="flex items-center gap-1 text-xs text-accent hover:text-accent-hover transition-colors py-1 px-2 hover:bg-white/5 rounded"
                        >
                          <ExternalLink className="h-3 w-3" />
                          {t.dashboard.view}
                        </Link>
                      ) : (
                        <span
                          title={language === 'es' ? 'Publica la landing para poder verla' : 'Publish the landing to view it'}
                          className="flex items-center gap-1 text-xs text-text-muted py-1 px-2 opacity-40 cursor-not-allowed"
                        >
                          <ExternalLink className="h-3 w-3" />
                          {t.dashboard.view}
                        </span>
                      )}
                      <div className="ml-1 pl-1 border-l border-white/[0.06] flex items-center gap-0.5">
                        {p.status === 'published' && (
                          <CopyLinkButton id={p.id} />
                        )}
                        <DeleteButton id={p.id} title={p.title} language={language} />
                      </div>
                    </div>
                  </td>
                </tr>
              )
            })
          ) : (
            <tr>
              <td colSpan={5} className="px-6 py-12 text-center text-sm text-text-muted">
                {language === 'es' ? 'No tienes propuestas aún. ¡Crea tu primera landing!' : 'No proposals yet. Create your first landing!'}
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  )
}
