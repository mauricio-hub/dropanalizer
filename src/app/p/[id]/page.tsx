import { notFound } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import { Check } from 'lucide-react'

export default async function PublicProposalPage({ params }: { params: { id: string } }) {
  const proposal = await prisma.proposal.findUnique({
    where: { id: params.id },
    include: { versions: { where: { isPublished: true }, orderBy: { createdAt: 'desc' }, take: 1 } },
  })

  if (!proposal) notFound()

  const version = proposal.versions[0]
  const content = version?.content as any || {}
  const scope = content.scope || ''
  const deliverables = content.deliverables || []
  const timeline = content.timeline || []
  const pricing = content.pricing || { total: 0, currency: 'USD' }

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(34,197,94,0.1)_0%,transparent_60%)]" />
        <div className="relative mx-auto max-w-5xl px-6 py-24 md:py-32">
          <div className="inline-flex items-center gap-2 rounded-full border border-accent/20 bg-accent/5 px-3 py-1 text-xs font-medium text-accent mb-6">
            Commercial Proposal
          </div>
          <h1 className="text-4xl md:text-6xl font-bold tracking-tight text-text-primary leading-tight mb-6">
            {proposal.title}
          </h1>
          <p className="text-lg text-text-secondary max-w-2xl">
            Professional proposal crafted for your success
          </p>
          <p className="mt-6 text-sm text-text-muted">
            {new Date(proposal.createdAt).toLocaleDateString('en-US', {
              month: 'long',
              day: 'numeric',
              year: 'numeric',
            })}
          </p>
        </div>
      </div>

      {/* Content Sections */}
      <div className="mx-auto max-w-5xl px-6 py-16 space-y-20">

        {/* Scope Section */}
        {scope && (
          <section className="grid md:grid-cols-[1fr_1fr] gap-12 items-center">
            <div>
              <h2 className="text-2xl md:text-3xl font-bold text-text-primary mb-4">Project Scope</h2>
              <div className="border-l-4 border-accent pl-6">
                <p className="text-text-secondary leading-relaxed whitespace-pre-wrap">
                  {scope}
                </p>
              </div>
            </div>
            <div className="hidden md:block">
              <div className="bg-surface rounded-2xl border border-white/[0.08] p-8 aspect-square flex items-center justify-center">
                <div className="text-center">
                  <div className="text-accent/20 text-6xl mb-4">📋</div>
                  <p className="text-sm text-text-muted">Project Overview</p>
                </div>
              </div>
            </div>
          </section>
        )}

        {/* Deliverables Section */}
        {deliverables.length > 0 && (
          <section>
            <h2 className="text-2xl md:text-3xl font-bold text-text-primary mb-8">Deliverables</h2>
            <div className="grid sm:grid-cols-2 gap-4">
              {deliverables.map((item: string, idx: number) => (
                <div
                  key={idx}
                  className="group bg-surface rounded-xl border border-white/[0.08] p-6 hover:border-accent/30 transition-all"
                >
                  <div className="flex gap-4">
                    <div className="flex-shrink-0 h-6 w-6 rounded-full bg-accent/20 flex items-center justify-center">
                      <Check className="h-4 w-4 text-accent" />
                    </div>
                    <p className="text-text-secondary leading-relaxed">{item}</p>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Timeline Section */}
        {timeline.length > 0 && (
          <section>
            <h2 className="text-2xl md:text-3xl font-bold text-text-primary mb-8">Timeline</h2>
            <div className="space-y-4">
              {timeline.map((phase: any, idx: number) => (
                <div key={idx} className="bg-surface rounded-xl border border-white/[0.08] p-6">
                  <div className="grid sm:grid-cols-[200px_1fr] gap-6">
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-widest text-accent mb-2">Phase {idx + 1}</p>
                      <h3 className="text-lg font-semibold text-text-primary">{phase.phase}</h3>
                      <p className="text-sm text-text-muted mt-2">{phase.duration}</p>
                    </div>
                    <div>
                      <p className="text-text-secondary leading-relaxed">{phase.description}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Pricing Section */}
        <section className="bg-surface rounded-2xl border border-white/[0.08] p-8 md:p-12">
          <div className="grid md:grid-cols-2 gap-12">
            <div>
              <h2 className="text-2xl md:text-3xl font-bold text-text-primary mb-6">Investment</h2>
              <div className="space-y-4">
                {pricing.breakdown && (
                  <div>
                    <p className="text-sm text-text-muted mb-3">Cost Breakdown</p>
                    <p className="text-text-secondary leading-relaxed whitespace-pre-wrap">{pricing.breakdown}</p>
                  </div>
                )}
                {!pricing.breakdown && (
                  <p className="text-text-muted">Comprehensive package included</p>
                )}
              </div>
            </div>
            <div className="flex flex-col justify-center">
              <p className="text-xs font-semibold uppercase tracking-widest text-accent mb-3">Total Investment</p>
              <div className="flex items-baseline gap-2">
                <span className="text-5xl font-bold text-text-primary">
                  {pricing.total?.toLocaleString()}
                </span>
                <span className="text-xl text-text-muted">{pricing.currency}</span>
              </div>
              <button className="mt-8 w-full bg-accent hover:bg-accent-hover text-white font-semibold py-3 px-6 rounded-lg transition-colors">
                Accept Proposal
              </button>
            </div>
          </div>
        </section>

        {/* Call to Action */}
        <section className="text-center py-12 border-y border-white/[0.06]">
          <h2 className="text-2xl font-bold text-text-primary mb-4">Ready to move forward?</h2>
          <p className="text-text-secondary mb-8 max-w-2xl mx-auto">
            Contact us to discuss details and get started on this project.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button className="bg-accent hover:bg-accent-hover text-white font-semibold py-3 px-8 rounded-lg transition-colors">
              Accept Proposal
            </button>
            <button className="border border-white/[0.08] hover:border-accent/30 text-text-primary font-semibold py-3 px-8 rounded-lg transition-colors">
              Request Changes
            </button>
          </div>
        </section>
      </div>

      {/* Footer */}
      <footer className="border-t border-white/[0.06]">
        <div className="mx-auto max-w-5xl px-6 py-12">
          <div className="grid md:grid-cols-3 gap-8 mb-8">
            <div>
              <p className="font-semibold text-text-primary mb-2">Proply</p>
              <p className="text-sm text-text-muted">Professional proposals, made simple.</p>
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-widest text-accent mb-3">Proposal</p>
              <p className="text-sm text-text-muted">ID: {proposal.id.slice(0, 8)}</p>
              <p className="text-sm text-text-muted">Created {new Date(proposal.createdAt).toLocaleDateString()}</p>
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-widest text-accent mb-3">Status</p>
              <p className="text-sm text-text-muted">
                <span className="inline-flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full bg-accent"></span>
                  Active
                </span>
              </p>
            </div>
          </div>
          <div className="border-t border-white/[0.06] pt-8 flex items-center justify-between text-xs text-text-muted">
            <span>© 2026 Proply. All rights reserved.</span>
            <span>Powered by <span className="text-accent font-medium">Proply</span></span>
          </div>
        </div>
      </footer>
    </div>
  )
}
