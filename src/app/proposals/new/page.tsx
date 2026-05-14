'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Container from '@/components/ui/Container'
import PageHeader from '@/components/ui/PageHeader'
import Button from '@/components/ui/Button'
import { Sparkles } from 'lucide-react'

export default function NewProposalPage() {
  const router = useRouter()
  const [title, setTitle] = useState('')
  const [brief, setBrief] = useState('')
  const [generateWithAI, setGenerateWithAI] = useState(true)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const res = await fetch('/api/proposals', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, brief, generateWithAI }),
      })

      if (!res.ok) {
        const data = await res.json()
        setError(data.error || 'Failed to create proposal')
        setLoading(false)
        return
      }

      const proposal = await res.json()
      router.push(`/proposals/${proposal.id}/edit`)
    } catch (err) {
      setError('An error occurred. Please try again.')
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-background py-12">
      <Container className="max-w-2xl">
        <PageHeader
          title="Create New Proposal"
          subtitle="Tell us about your project and we'll help structure it."
        />

        <form onSubmit={handleSubmit} className="mt-8 space-y-6">
          {error && (
            <div className="rounded-lg border border-red-500/20 bg-red-500/5 p-4">
              <p className="text-sm text-red-400">{error}</p>
            </div>
          )}

          <div className="space-y-2">
            <label className="text-sm font-semibold text-text-secondary">Proposal Title</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              placeholder="e.g. Website redesign for Acme Co."
              className="w-full rounded-xl border border-white/[0.08] bg-surface px-4 py-3 text-sm text-text-primary placeholder:text-text-muted focus:border-accent/50 focus:outline-none focus:ring-1 focus:ring-accent/30"
            />
            <p className="text-xs text-text-muted">{title.length}/200 characters</p>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-semibold text-text-secondary">Project Brief</label>
            <textarea
              value={brief}
              onChange={(e) => setBrief(e.target.value)}
              required
              rows={8}
              placeholder="Describe the project in detail:
- What is the project about?
- What are the main goals?
- Who is the client?
- What timeline are you thinking?
- Any specific requirements or constraints?"
              className="w-full rounded-xl border border-white/[0.08] bg-surface px-4 py-3 text-sm text-text-primary placeholder:text-text-muted focus:border-accent/50 focus:outline-none focus:ring-1 focus:ring-accent/30 resize-none"
            />
            <p className="text-xs text-text-muted">{brief.length}/5000 characters</p>
          </div>

          <div className="rounded-lg border border-accent/20 bg-accent/5 p-4">
            <label className="flex items-start gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={generateWithAI}
                onChange={(e) => setGenerateWithAI(e.target.checked)}
                className="mt-1 h-4 w-4 rounded border-white/20 bg-surface accent-accent"
              />
              <div>
                <p className="flex items-center gap-2 text-sm font-medium text-text-primary">
                  <Sparkles className="h-4 w-4 text-accent" />
                  Generate with AI
                </p>
                <p className="text-xs text-text-muted mt-1">
                  Our AI will automatically structure your brief into scope, deliverables, timeline, and pricing.
                </p>
              </div>
            </label>
          </div>

          <div className="flex items-center gap-3 pt-4">
            <Button type="submit" disabled={loading || !title || !brief}>
              {loading ? (
                <>
                  <Sparkles className="h-4 w-4 animate-spin" />
                  {generateWithAI ? 'Generating...' : 'Creating...'}
                </>
              ) : (
                <>
                  <Sparkles className="h-4 w-4" />
                  Create Proposal
                </>
              )}
            </Button>
            <Button
              type="button"
              variant="ghost"
              onClick={() => router.push('/dashboard')}
              disabled={loading}
            >
              Cancel
            </Button>
          </div>
        </form>
      </Container>
    </div>
  )
}
