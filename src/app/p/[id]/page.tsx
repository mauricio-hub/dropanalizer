import { notFound } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import ProposalLanding from '@/components/ProposalLanding'
import type { Metadata } from 'next'

export async function generateMetadata({ params }: { params: { id: string } }): Promise<Metadata> {
  const proposal = await prisma.proposal.findUnique({
    where: { id: params.id },
    select: {
      title: true,
      description: true,
      images: { orderBy: { order: 'asc' }, take: 1, select: { url: true } },
    },
  })

  if (!proposal) return {}

  const title = `${proposal.title} — Proply`
  const description = proposal.description
    ? proposal.description.slice(0, 155)
    : `Conoce ${proposal.title} y consíguelo ahora.`
  const image = proposal.images[0]?.url ?? null

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: 'website',
      ...(image && { images: [{ url: image, width: 1200, height: 630, alt: proposal.title }] }),
    },
    twitter: {
      card: image ? 'summary_large_image' : 'summary',
      title,
      description,
      ...(image && { images: [image] }),
    },
  }
}

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
