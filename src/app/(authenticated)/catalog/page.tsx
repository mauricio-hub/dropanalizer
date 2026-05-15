'use client'

import { useEffect, useState } from 'react'
import { useLanguage } from '@/hooks/useLanguage'
import { getTranslation } from '@/lib/i18n'
import Container from '@/components/ui/Container'
import PageHeader from '@/components/ui/PageHeader'
import Card from '@/components/ui/Card'
import Button from '@/components/ui/Button'
import { Trash2, Plus, Edit2, ChevronDown } from 'lucide-react'

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
  const [showTypeDropdown, setShowTypeDropdown] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    type: 'service' as 'service' | 'product',
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
          resetForm()
        } else {
          const error = await res.json()
          console.error('Failed to update item:', error)
        }
      } else {
        const res = await fetch('/api/catalog', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        })
        if (res.ok) {
          loadCatalog()
          resetForm()
        } else {
          const error = await res.json()
          console.error('Failed to create item:', error)
        }
      }
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
                  <div className="relative group">
                    <button
                      type="button"
                      onClick={() => setShowTypeDropdown(!showTypeDropdown)}
                      className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-text-primary focus:outline-none focus:border-accent flex items-center justify-between text-left hover:bg-white/[0.08] transition-colors"
                    >
                      <span>{formData.type === 'service' ? t.catalog.service : t.catalog.product}</span>
                      <ChevronDown className="h-4 w-4" />
                    </button>
                    {showTypeDropdown && (
                      <div className="absolute top-full left-0 mt-1 w-full bg-surface border border-white/[0.08] rounded-lg shadow-lg z-50">
                        <button
                          type="button"
                          onClick={() => {
                            setFormData({ ...formData, type: 'service' })
                            setShowTypeDropdown(false)
                          }}
                          className={`w-full text-left px-3 py-2 text-sm rounded-t-lg transition-colors ${
                            formData.type === 'service'
                              ? 'bg-accent/20 text-accent'
                              : 'text-text-secondary hover:text-text-primary hover:bg-white/5'
                          }`}
                        >
                          {t.catalog.service}
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setFormData({ ...formData, type: 'product' })
                            setShowTypeDropdown(false)
                          }}
                          className={`w-full text-left px-3 py-2 text-sm rounded-b-lg transition-colors ${
                            formData.type === 'product'
                              ? 'bg-accent/20 text-accent'
                              : 'text-text-secondary hover:text-text-primary hover:bg-white/5'
                          }`}
                        >
                          {t.catalog.product}
                        </button>
                      </div>
                    )}
                  </div>
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
        <Card className="mt-8">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-white/[0.06]">
                  <th className="text-left px-6 py-3 text-xs font-semibold text-text-secondary">{t.catalog.name}</th>
                  <th className="text-left px-6 py-3 text-xs font-semibold text-text-secondary">{t.catalog.type}</th>
                  <th className="text-left px-6 py-3 text-xs font-semibold text-text-secondary">{t.catalog.price}</th>
                  <th className="text-left px-6 py-3 text-xs font-semibold text-text-secondary">{t.catalog.description}</th>
                  <th className="text-right px-6 py-3 text-xs font-semibold text-text-secondary">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {items.length > 0 ? (
                  items.map((item) => (
                    <tr key={item.id} className="border-b border-white/[0.06] hover:bg-white/[0.03] transition-colors">
                      <td className="px-6 py-4 text-sm font-medium text-text-primary">{item.name}</td>
                      <td className="px-6 py-4">
                        <span className="inline-block px-2 py-1 text-xs font-medium rounded-full bg-accent/10 text-accent">
                          {item.type === 'service' ? t.catalog.service : t.catalog.product}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-text-primary">
                        {item.price ? `$${item.price.toFixed(2)}` : '—'}
                      </td>
                      <td className="px-6 py-4 text-sm text-text-muted max-w-xs truncate">
                        {item.description || '—'}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex gap-2 justify-end">
                          <button
                            onClick={() => startEdit(item)}
                            className="flex items-center gap-1 text-xs text-accent hover:text-accent-hover transition-colors py-1 px-2 hover:bg-white/5 rounded"
                          >
                            <Edit2 className="h-3 w-3" />
                            {t.catalog.edit}
                          </button>
                          <button
                            onClick={() => deleteItem(item.id)}
                            className="flex items-center gap-1 text-xs text-red-400 hover:text-red-300 transition-colors py-1 px-2 hover:bg-white/5 rounded"
                          >
                            <Trash2 className="h-3 w-3" />
                            {t.catalog.delete}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={5} className="px-6 py-12 text-center text-sm text-text-muted">
                      {t.catalog.empty}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </Card>
      </Container>
    </div>
  )
}
