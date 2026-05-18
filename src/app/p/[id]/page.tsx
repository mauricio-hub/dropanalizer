import { notFound } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import ProposalLanding from '@/components/ProposalLanding'

export default async function PublicProposalPage({ params }: { params: { id: string } }) {
  const proposal = await prisma.proposal.findUnique({
    where: { id: params.id },
    include: {
      versions: { where: { isPublished: true }, orderBy: { createdAt: 'desc' }, take: 1 },
      images: { orderBy: { order: 'asc' } },
    },
  })


  if (!proposal) notFound()

  const version = proposal.versions[0]
  if (!version) notFound()

  return (
    <ProposalLanding
      proposal={{
        id: proposal.id,
        title: proposal.title,
        template: proposal.template,
        createdAt: proposal.createdAt.toISOString(),
        images: proposal.images.map((img) => ({ url: img.url, order: img.order })),
        buyUrl: proposal.buyUrl || undefined,
      }}
      version={{
        id: version.id,
        content: version.content as any,
      }}
    />
  )
}
