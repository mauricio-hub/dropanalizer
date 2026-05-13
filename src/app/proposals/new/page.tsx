'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Container from '@/components/ui/Container'
import PageHeader from '@/components/ui/PageHeader'
import Button from '@/components/ui/Button'

export default function NewProposalPage() {
  const router = useRouter()
  const [title, setTitle] = useState('')
  const [brief, setBrief] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)

    await fetch('/api/proposals', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title, brief }),
    })

    router.push('/dashboard')
  }

  return (
    <div className="min-h-screen bg-background py-12">
      <Container className="max-w-2xl">
        <PageHeader
          title="New Proposal"
          subtitle="Fill in the details to create your proposal."
        />

        <form onSubmit={handleSubmit} className="mt-6 space-y-5">
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-text-secondary">Title</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              placeholder="e.g. Website redesign for Acme Co."
              className="w-full rounded-xl border border-white/[0.08] bg-surface px-4 py-2.5 text-sm text-text-primary placeholder:text-text-muted focus:border-accent/50 focus:outline-none focus:ring-1 focus:ring-accent/30"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-medium text-text-secondary">Brief</label>
            <textarea
              value={brief}
              onChange={(e) => setBrief(e.target.value)}
              required
              rows={6}
              placeholder="Describe the project, scope, deliverables..."
              className="w-full rounded-xl border border-white/[0.08] bg-surface px-4 py-2.5 text-sm text-text-primary placeholder:text-text-muted focus:border-accent/50 focus:outline-none focus:ring-1 focus:ring-accent/30 resize-none"
            />
          </div>

          <div className="flex items-center gap-3 pt-2">
            <Button type="submit" disabled={loading}>
              {loading ? 'Saving...' : 'Create Proposal'}
            </Button>
            <Button
              type="button"
              variant="ghost"
              onClick={() => router.push('/dashboard')}
            >
              Cancel
            </Button>
          </div>
        </form>
      </Container>
    </div>
  )
}
