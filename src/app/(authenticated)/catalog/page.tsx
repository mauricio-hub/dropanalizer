'use client'

import { useEffect, useState } from 'react'
import { useLanguage } from '@/hooks/useLanguage'
import { getTranslation } from '@/lib/i18n'
import Container from '@/components/ui/Container'
import PageHeader from '@/components/ui/PageHeader'
import Card from '@/components/ui/Card'
import Button from '@/components/ui/Button'
import { Trash2, Plus, Edit2 } from 'lucide-react'

interface CatalogItem {
  id: string
  name: string
  description: string | null
  price: number | null
  type: 'service' | 'product'
  createdAt: string
}

export default function CatalogPage() {
  const { language } = useLanguage()
  const t = getTranslation(language)
  const [items, setItems] = useState<CatalogItem[]>([])
  const [loading, setLoading] = useState(true)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [showForm, setShowForm] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    type: 'service' as const,
  })

  useEffect(() => {
    loadCatalog()
  }, [])

  async function loadCatalog() {
    try {
      const res = await fetch('/api/catalog')
      if (res.ok) {
        const data = await res.json()
        setItems(data)
      }
    } catch (err) {
      console.error('Failed to load catalog:', err)
    } finally {
      setLoading(false)
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()

    const payload = {
      name: formData.name,
      description: formData.description || null,
      price: formData.price ? parseFloat(formData.price) : null,
      type: formData.type,
    }

    try {
      if (editingId) {
        const res = await fetch(`/api/catalog/${editingId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        })
        if (res.ok) {
          setEditingId(null)
          loadCatalog()
        }
      } else {
        const res = await fetch('/api/catalog', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        })
        if (res.ok) {
          loadCatalog()
        }
      }
      resetForm()
    } catch (err) {
      console.error('Failed to save item:', err)
    }
  }

  function resetForm() {
    setFormData({ name: '', description: '', price: '', type: 'service' })
    setShowForm(false)
  }

  function startEdit(item: CatalogItem) {
    setEditingId(item.id)
    setFormData({
      name: item.name,
      description: item.description || '',
      price: item.price?.toString() || '',
      type: item.type,
    })
    setShowForm(true)
  }

  async function deleteItem(id: string) {
    if (!confirm(t.catalog.delete + '?')) return
    try {
      const res = await fetch(`/api/catalog/${id}`, { method: 'DELETE' })
      if (res.ok) {
        loadCatalog()
      }
    } catch (err) {
      console.error('Failed to delete item:', err)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background py-12 flex items-center justify-center">
        <p className="text-text-muted">Loading...</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background py-12">
      <Container>
        <PageHeader
          title={t.catalog.title}
          subtitle={t.catalog.subtitle}
          actions={
            !showForm && (
              <Button onClick={() => setShowForm(true)}>
                <Plus className="h-4 w-4" />
                {t.catalog.addItem}
              </Button>
            )
          }
        />

        {/* Add/Edit Form */}
        {showForm && (
          <Card>
            <div className="p-6">
              <h3 className="text-lg font-semibold text-text-primary mb-4">
                {editingId ? t.catalog.editItem : t.catalog.addItem}
              </h3>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-text-secondary mb-2">
                    {t.catalog.name} *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-text-primary placeholder-text-muted focus:outline-none focus:border-accent"
                    placeholder="Ej: Diseño Web"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-text-secondary mb-2">
                    {t.catalog.type} *
                  </label>
                  <select
                    required
                    value={formData.type}
                    onChange={(e) => setFormData({ ...formData, type: e.target.value as 'service' | 'product' })}
                    className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-text-primary focus:outline-none focus:border-accent"
                  >
                    <option value="service">{t.catalog.service}</option>
                    <option value="product">{t.catalog.product}</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-text-secondary mb-2">
                    {t.catalog.price}
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                    className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-text-primary placeholder-text-muted focus:outline-none focus:border-accent"
                    placeholder="0.00"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-text-secondary mb-2">
                    {t.catalog.description}
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    rows={3}
                    className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-text-primary placeholder-text-muted focus:outline-none focus:border-accent"
                    placeholder="Describe tu servicio o producto..."
                  />
                </div>

                <div className="flex gap-2 pt-4">
                  <button
                    type="submit"
                    className="flex-1 bg-accent hover:bg-accent-hover text-white font-semibold py-2 px-4 rounded-lg transition-colors"
                  >
                    {t.catalog.save}
                  </button>
                  <button
                    type="button"
                    onClick={resetForm}
                    className="flex-1 border border-white/10 text-text-secondary hover:text-text-primary py-2 px-4 rounded-lg transition-colors"
                  >
                    {t.catalog.cancel}
                  </button>
                </div>
              </form>
            </div>
          </Card>
        )}

        {/* Items List */}
        {items.length > 0 ? (
          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {items.map((item) => (
              <Card key={item.id} hover>
                <div className="p-6">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <h3 className="text-sm font-semibold text-text-primary">{item.name}</h3>
                      <span className="inline-block mt-1 px-2 py-0.5 text-xs font-medium rounded-full bg-accent/10 text-accent">
                        {item.type === 'service' ? t.catalog.service : t.catalog.product}
                      </span>
                    </div>
                  </div>

                  {item.description && (
                    <p className="text-xs text-text-muted mb-3 line-clamp-2">{item.description}</p>
                  )}

                  {item.price && (
                    <p className="text-sm font-semibold text-text-primary mb-4">
                      ${item.price.toFixed(2)}
                    </p>
                  )}

                  <div className="flex gap-2 pt-4 border-t border-white/[0.06]">
                    <button
                      onClick={() => startEdit(item)}
                      className="flex-1 flex items-center justify-center gap-2 text-xs text-accent hover:text-accent-hover transition-colors py-2"
                    >
                      <Edit2 className="h-3 w-3" />
                      {t.catalog.edit}
                    </button>
                    <button
                      onClick={() => deleteItem(item.id)}
                      className="flex-1 flex items-center justify-center gap-2 text-xs text-red-400 hover:text-red-300 transition-colors py-2"
                    >
                      <Trash2 className="h-3 w-3" />
                      {t.catalog.delete}
                    </button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        ) : (
          <div className="mt-12 flex flex-col items-center justify-center rounded-2xl border border-dashed border-white/[0.10] py-20 text-center">
            <p className="text-sm font-medium text-text-primary">{t.catalog.empty}</p>
            <p className="mt-1 text-sm text-text-muted">{t.catalog.emptyDesc}</p>
            <Button onClick={() => setShowForm(true)} className="mt-6">
              <Plus className="h-4 w-4" />
              {t.catalog.addItem}
            </Button>
          </div>
        )}
      </Container>
    </div>
  )
}
