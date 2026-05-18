'use client'

import { useEffect, useState } from 'react'
import { MessageCircle, Link, Plus, Trash2, Pencil, Check, X } from 'lucide-react'
import Card from '@/components/ui/Card'
import { useLanguage } from '@/hooks/useLanguage'
import { getTranslation } from '@/lib/i18n'

export interface CtaDestination {
  id: string
  type: 'whatsapp' | 'link'
  name: string | null
  value: string
}

function phoneFromUrl(url: string): string {
  const match = url.match(/wa\.me\/\+?(\d+)/)
  return match ? `+${match[1]}` : url
}

function displayLabel(d: CtaDestination): string {
  return d.name || (d.type === 'whatsapp' ? phoneFromUrl(d.value) : hostname(d.value))
}

function displaySub(d: CtaDestination): string {
  if (!d.name) return ''
  return d.type === 'whatsapp' ? phoneFromUrl(d.value) : hostname(d.value)
}

function hostname(url: string): string {
  try { return new URL(url).hostname } catch { return url }
}

function buildWaUrl(raw: string): string {
  const digits = raw.replace(/\D/g, '')
  return `https://wa.me/+${digits}`
}

// ── Row ──────────────────────────────────────────────────────────────────────

interface RowProps {
  dest: CtaDestination
  onUpdate: (d: CtaDestination) => void
  onDelete: (id: string) => void
  t: ReturnType<typeof getTranslation>
}

function DestinationRow({ dest, onUpdate, onDelete, t }: RowProps) {
  const [editing, setEditing] = useState(false)
  const [name, setName] = useState(dest.name || '')
  const [value, setValue] = useState(
    dest.type === 'whatsapp' ? phoneFromUrl(dest.value) : dest.value
  )
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [confirmDelete, setConfirmDelete] = useState(false)

  async function handleSave() {
    setError('')
    let finalValue = value.trim()

    if (dest.type === 'whatsapp') {
      const digits = finalValue.replace(/\D/g, '')
      if (digits.length < 7) { setError(t.cta.invalidNumber); return }
      finalValue = buildWaUrl(finalValue)
    } else {
      if (!finalValue.startsWith('http')) finalValue = `https://${finalValue}`
    }

    setSaving(true)
    try {
      const res = await fetch(`/api/cta-destinations/${dest.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: name.trim() || null, value: finalValue }),
      })
      if (!res.ok) { setError(t.cta.saveError); return }
      const updated = await res.json()
      onUpdate(updated)
      setEditing(false)
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete() {
    await fetch(`/api/cta-destinations/${dest.id}`, { method: 'DELETE' })
    onDelete(dest.id)
  }

  if (editing) {
    return (
      <div className="rounded-lg border border-accent/30 bg-surface p-4 space-y-3">
        <input
          type="text"
          value={name}
          onChange={e => setName(e.target.value)}
          placeholder={dest.type === 'whatsapp' ? t.cta.namePlaceholderWA : t.cta.namePlaceholderLink}
          className="w-full rounded-lg border border-white/[0.08] bg-background px-3 py-2 text-sm text-text-primary placeholder:text-text-muted focus:border-accent/50 focus:outline-none"
        />
        <input
          type={dest.type === 'whatsapp' ? 'tel' : 'url'}
          value={value}
          onChange={e => setValue(e.target.value)}
          placeholder={dest.type === 'whatsapp' ? '+52 55 1234 5678' : 'https://...'}
          className="w-full rounded-lg border border-white/[0.08] bg-background px-3 py-2 text-sm text-text-primary placeholder:text-text-muted focus:border-accent/50 focus:outline-none"
        />
        {error && <p className="text-xs text-red-400">{error}</p>}
        <div className="flex gap-2 justify-end">
          <button
            type="button"
            onClick={() => { setEditing(false); setError('') }}
            className="p-1.5 text-text-muted hover:text-text-primary transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={handleSave}
            disabled={saving}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold bg-accent text-background rounded-lg hover:bg-accent-hover transition-colors disabled:opacity-50"
          >
            <Check className="h-3 w-3" />
            {saving ? t.cta.saving : t.cta.save}
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="flex items-center justify-between rounded-lg border border-white/[0.06] bg-surface px-4 py-3 group">
      <div className="min-w-0">
        <p className="text-sm font-medium text-text-primary truncate">{displayLabel(dest)}</p>
        {displaySub(dest) && (
          <p className="text-xs text-text-muted truncate">{displaySub(dest)}</p>
        )}
      </div>
      <div className="flex items-center gap-1 ml-3 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0">
        <button
          onClick={() => setEditing(true)}
          className="p-1.5 text-text-muted hover:text-accent transition-colors rounded"
        >
          <Pencil className="h-3.5 w-3.5" />
        </button>
        {confirmDelete ? (
          <div className="flex items-center gap-1">
            <span className="text-xs text-red-400">{t.cta.delete}</span>
            <button onClick={handleDelete} className="p-1.5 text-red-400 hover:text-red-300 transition-colors rounded">
              <Check className="h-3.5 w-3.5" />
            </button>
            <button onClick={() => setConfirmDelete(false)} className="p-1.5 text-text-muted hover:text-text-primary transition-colors rounded">
              <X className="h-3.5 w-3.5" />
            </button>
          </div>
        ) : (
          <button onClick={() => setConfirmDelete(true)} className="p-1.5 text-text-muted hover:text-red-400 transition-colors rounded">
            <Trash2 className="h-3.5 w-3.5" />
          </button>
        )}
      </div>
    </div>
  )
}

// ── Add Form ─────────────────────────────────────────────────────────────────

interface AddFormProps {
  type: 'whatsapp' | 'link'
  onSave: (dest: CtaDestination) => void
  onCancel: () => void
  t: ReturnType<typeof getTranslation>
}

function AddForm({ type, onSave, onCancel, t }: AddFormProps) {
  const [name, setName] = useState('')
  const [value, setValue] = useState('')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')

    let finalValue = value.trim()
    if (type === 'whatsapp') {
      const digits = finalValue.replace(/\D/g, '')
      if (digits.length < 7) { setError(t.cta.invalidNumber); return }
      finalValue = buildWaUrl(finalValue)
    } else {
      if (!finalValue) { setError(t.cta.invalidUrl); return }
      if (!finalValue.startsWith('http')) finalValue = `https://${finalValue}`
    }

    setSaving(true)
    try {
      const res = await fetch('/api/cta-destinations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type, name: name.trim() || null, value: finalValue }),
      })
      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        setError(data.error || t.cta.saveError)
        return
      }
      const created = await res.json()
      onSave(created)
    } finally {
      setSaving(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="mt-2 p-4 rounded-xl border border-white/[0.08] bg-surface/50 space-y-3">
      <input
        type="text"
        value={name}
        onChange={e => setName(e.target.value)}
        placeholder={type === 'whatsapp' ? t.cta.namePlaceholderWA : t.cta.namePlaceholderLink}
        className="w-full rounded-lg border border-white/[0.08] bg-background px-3 py-2 text-sm text-text-primary placeholder:text-text-muted focus:border-accent/50 focus:outline-none"
      />
      <div className="space-y-1">
        <input
          type={type === 'whatsapp' ? 'tel' : 'text'}
          value={value}
          onChange={e => setValue(e.target.value)}
          placeholder={type === 'whatsapp' ? '+57 302 844 6004' : 'https://...'}
          required
          className="w-full rounded-lg border border-white/[0.08] bg-background px-3 py-2 text-sm text-text-primary placeholder:text-text-muted focus:border-accent/50 focus:outline-none"
        />
        {type === 'whatsapp' && (
          <p className="text-xs text-text-muted">{t.cta.countryHint}</p>
        )}
      </div>
      {error && <p className="text-xs text-red-400">{error}</p>}
      <div className="flex gap-2 justify-end">
        <button type="button" onClick={onCancel} className="px-3 py-1.5 text-xs text-text-muted hover:text-text-primary transition-colors">
          {t.cta.cancel}
        </button>
        <button
          type="submit"
          disabled={saving || !value.trim()}
          className="px-4 py-1.5 text-xs font-semibold bg-accent text-background rounded-lg hover:bg-accent-hover transition-colors disabled:opacity-50"
        >
          {saving ? t.cta.saving : t.cta.save}
        </button>
      </div>
    </form>
  )
}

// ── Group ─────────────────────────────────────────────────────────────────────

interface GroupProps {
  type: 'whatsapp' | 'link'
  destinations: CtaDestination[]
  onAdd: (dest: CtaDestination) => void
  onUpdate: (dest: CtaDestination) => void
  onDelete: (id: string) => void
  t: ReturnType<typeof getTranslation>
}

function DestinationGroup({ type, destinations, onAdd, onUpdate, onDelete, t }: GroupProps) {
  const [adding, setAdding] = useState(false)
  const isWA = type === 'whatsapp'

  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          {isWA
            ? <MessageCircle className="h-4 w-4 text-green-400" />
            : <Link className="h-4 w-4 text-blue-400" />
          }
          <span className="text-sm font-semibold text-text-primary">
            {isWA ? t.cta.whatsappGroup : t.cta.linksGroup}
          </span>
          <span className="text-xs text-text-muted">({destinations.length})</span>
        </div>
        {!adding && (
          <button
            onClick={() => setAdding(true)}
            className="flex items-center gap-1 text-xs text-accent hover:text-accent-hover transition-colors"
          >
            <Plus className="h-3 w-3" />
            {t.cta.add}
          </button>
        )}
      </div>

      <div className="space-y-2">
        {destinations.length === 0 && !adding && (
          <p className="text-xs text-text-muted py-2 pl-1">
            {isWA ? t.cta.noWhatsapp : t.cta.noLinks}
          </p>
        )}

        {destinations.map(d => (
          <DestinationRow key={d.id} dest={d} onUpdate={onUpdate} onDelete={onDelete} t={t} />
        ))}

        {adding && (
          <AddForm
            type={type}
            onSave={dest => { onAdd(dest); setAdding(false) }}
            onCancel={() => setAdding(false)}
            t={t}
          />
        )}
      </div>
    </div>
  )
}

// ── Main ──────────────────────────────────────────────────────────────────────

export default function CtaDestinations() {
  const { language } = useLanguage()
  const t = getTranslation(language)
  const [destinations, setDestinations] = useState<CtaDestination[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/cta-destinations')
      .then(r => r.json())
      .then(data => setDestinations(data))
      .finally(() => setLoading(false))
  }, [])

  function handleAdd(dest: CtaDestination) {
    setDestinations(prev => [...prev, dest])
  }

  function handleUpdate(updated: CtaDestination) {
    setDestinations(prev => prev.map(d => d.id === updated.id ? updated : d))
  }

  function handleDelete(id: string) {
    setDestinations(prev => prev.filter(d => d.id !== id))
  }

  const whatsappDests = destinations.filter(d => d.type === 'whatsapp')
  const linkDests = destinations.filter(d => d.type === 'link')

  return (
    <Card>
      <div className="p-6">
        <div className="mb-6">
          <h2 className="text-base font-semibold text-text-primary">{t.cta.title}</h2>
          <p className="text-xs text-text-muted mt-1">{t.cta.subtitle}</p>
        </div>

        {loading ? (
          <div className="space-y-6 animate-pulse">
            <div className="space-y-2">
              <div className="h-4 w-24 bg-white/[0.06] rounded" />
              <div className="h-10 bg-white/[0.04] rounded-lg" />
              <div className="h-10 bg-white/[0.04] rounded-lg" />
            </div>
            <div className="border-t border-white/[0.06]" />
            <div className="space-y-2">
              <div className="h-4 w-28 bg-white/[0.06] rounded" />
              <div className="h-10 bg-white/[0.04] rounded-lg" />
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            <DestinationGroup type="whatsapp" destinations={whatsappDests} onAdd={handleAdd} onUpdate={handleUpdate} onDelete={handleDelete} t={t} />
            <div className="border-t border-white/[0.06]" />
            <DestinationGroup type="link" destinations={linkDests} onAdd={handleAdd} onUpdate={handleUpdate} onDelete={handleDelete} t={t} />
          </div>
        )}
      </div>
    </Card>
  )
}
