import { notFound } from 'next/navigation'
import { prisma } from '@/lib/prisma'

export default async function PublicProposalPage({ params }: { params: { id: string } }) {
  const proposal = await prisma.proposal.findUnique({
    where: { id: params.id },
  })

  if (!proposal) notFound()

  return (
    <div className="min-h-screen bg-background">
      {/* Hero */}
      <div className="relative overflow-hidden border-b border-white/[0.06]">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(34,197,94,0.07)_0%,transparent_60%)]" />
        <div className="relative mx-auto max-w-3xl px-6 py-20 md:py-28">
          <div className="inline-flex items-center gap-2 rounded-full border border-accent/20 bg-accent/5 px-3 py-1 text-xs font-medium text-accent mb-6">
            Proposal
          </div>
          <h1 className="text-3xl md:text-5xl font-semibold tracking-tight text-text-primary leading-tight">
            {proposal.title}
          </h1>
          <p className="mt-4 text-sm text-text-muted">
            {new Date(proposal.createdAt).toLocaleDateString('en-US', {
              month: 'long',
              day: 'numeric',
              year: 'numeric',
            })}
          </p>
        </div>
      </div>

      {/* Brief */}
      {proposal.description && (
        <div className="mx-auto max-w-3xl px-6 py-14">
          <p className="text-xs font-semibold uppercase tracking-widest text-accent mb-6">Brief</p>
          <p className="text-base text-text-secondary leading-relaxed whitespace-pre-wrap">
            {proposal.description}
          </p>
        </div>
      )}

      {/* Footer */}
      <div className="border-t border-white/[0.06] mt-12">
        <div className="mx-auto max-w-3xl px-6 py-6 flex items-center justify-between text-xs text-text-muted">
          <span>Powered by <span className="text-accent font-medium">Proply</span></span>
        </div>
      </div>
    </div>
  )
}
