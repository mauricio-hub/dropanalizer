import { notFound } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import PreviewShell from './PreviewShell'

export default async function PreviewPage({ params }: { params: { id: string } }) {
  const proposal = await prisma.proposal.findUnique({
    where: { id: params.id },
    include: {
      images: { orderBy: { order: 'asc' } },
      versions: { orderBy: { createdAt: 'desc' }, take: 1 },
    },
  })

  if (!proposal) notFound()

  const version = proposal.versions[0]
  if (!version) notFound()

  return (
    <PreviewShell
      proposal={{
        id: proposal.id,
        title: proposal.title,
        template: proposal.template,
        createdAt: proposal.createdAt.toISOString(),
        images: proposal.images.map((img) => ({ url: img.url, order: img.order })),
        buyUrl: proposal.buyUrl ?? undefined,
      }}
      initialContent={version.content as any}
      initialVersionId={version.id}
    />
  )
}
