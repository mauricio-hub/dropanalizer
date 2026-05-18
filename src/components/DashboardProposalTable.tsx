'use client'

import Link from 'next/link'
import { AlertCircle, ExternalLink, MessageCircle, Link as LinkIcon } from 'lucide-react'

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

export default function DashboardProposalTable({ proposals }: { proposals: Proposal[] }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="border-b border-white/[0.06]">
            <th className="text-left px-6 py-3 text-xs font-semibold text-text-secondary">Producto</th>
            <th className="text-left px-6 py-3 text-xs font-semibold text-text-secondary">Estado</th>
            <th className="text-left px-6 py-3 text-xs font-semibold text-text-secondary">Destino CTA</th>
            <th className="text-left px-6 py-3 text-xs font-semibold text-text-secondary">Creado</th>
            <th className="text-right px-6 py-3 text-xs font-semibold text-text-secondary">Acciones</th>
          </tr>
        </thead>
        <tbody>
          {proposals.length > 0 ? (
            proposals.map((p) => {
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
                      {p.status === 'published' ? 'Publicado' : 'Borrador'}
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
                    <div className="flex gap-2 justify-end">
                      <Link
                        href={`/proposals/${p.id}/edit`}
                        className="text-xs text-accent hover:text-accent-hover transition-colors py-1 px-2 hover:bg-white/5 rounded"
                      >
                        Editar
                      </Link>
                      {p.status === 'published' ? (
                        <Link
                          href={`/proposals/${p.id}/analytics`}
                          className="text-xs text-text-secondary hover:text-text-primary transition-colors py-1 px-2 hover:bg-white/5 rounded"
                        >
                          Analytics
                        </Link>
                      ) : (
                        <span
                          title="Publica la landing para ver analytics"
                          className="text-xs text-text-muted py-1 px-2 opacity-40 cursor-not-allowed"
                        >
                          Analytics
                        </span>
                      )}
                      {p.status === 'published' ? (
                        <Link
                          href={`/p/${p.id}`}
                          target="_blank"
                          className="flex items-center gap-1 text-xs text-accent hover:text-accent-hover transition-colors py-1 px-2 hover:bg-white/5 rounded"
                        >
                          <ExternalLink className="h-3 w-3" />
                          Ver
                        </Link>
                      ) : (
                        <span
                          title="Publica la landing para poder verla"
                          className="flex items-center gap-1 text-xs text-text-muted py-1 px-2 opacity-40 cursor-not-allowed"
                        >
                          <ExternalLink className="h-3 w-3" />
                          Ver
                        </span>
                      )}
                    </div>
                  </td>
                </tr>
              )
            })
          ) : (
            <tr>
              <td colSpan={5} className="px-6 py-12 text-center text-sm text-text-muted">
                No tienes propuestas aún. ¡Crea tu primera landing!
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  )
}
