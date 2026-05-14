import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getCurrentUser } from '@/lib/auth'

export async function POST(
  _req: Request,
  { params }: { params: { id: string; versionId: string } }
) {
  try {
    const user = await getCurrentUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const proposal = await prisma.proposal.findFirst({
      where: { id: params.id, userId: user.id },
    })

    if (!proposal) {
      return NextResponse.json({ error: 'Proposal not found' }, { status: 404 })
    }

    const version = await prisma.version.findUnique({
      where: { id: params.versionId },
    })

    if (!version || version.proposalId !== proposal.id) {
      return NextResponse.json({ error: 'Version not found' }, { status: 404 })
    }

    // Unpublish all other versions of this proposal
    await prisma.version.updateMany({
      where: {
        proposalId: proposal.id,
        isPublished: true,
      },
      data: { isPublished: false },
    })

    // Publish this version
    const publishedVersion = await prisma.version.update({
      where: { id: params.versionId },
      data: {
        isPublished: true,
        publicUrl: `/p/${proposal.id}-${params.versionId}`,
      },
    })

    // Update proposal status
    await prisma.proposal.update({
      where: { id: proposal.id },
      data: { status: 'published' },
    })

    return NextResponse.json(publishedVersion)
  } catch (error) {
    console.error('Error publishing version:', error)
    return NextResponse.json({ error: 'Failed to publish version' }, { status: 500 })
  }
}
