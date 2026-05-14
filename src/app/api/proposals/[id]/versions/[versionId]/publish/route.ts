import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getCurrentUser } from '@/lib/auth'
import { nanoid } from 'nanoid'

export async function POST(
  req: Request,
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

    const version = await prisma.version.findFirst({
      where: { id: params.versionId, proposalId: proposal.id },
    })

    if (!version) {
      return NextResponse.json({ error: 'Version not found' }, { status: 404 })
    }

    // Generate a unique public URL if not already set
    let publicUrl = version.publicUrl
    if (!publicUrl) {
      publicUrl = nanoid(12)
    }

    // Unpublish other versions of this proposal
    await prisma.version.updateMany({
      where: { proposalId: proposal.id, NOT: { id: params.versionId } },
      data: { isPublished: false },
    })

    // Publish this version
    const updated = await prisma.version.update({
      where: { id: params.versionId },
      data: {
        isPublished: true,
        publicUrl,
      },
    })

    // Update proposal status to published
    await prisma.proposal.update({
      where: { id: proposal.id },
      data: { status: 'published' },
    })

    return NextResponse.json({
      ...updated,
      publicUrl,
    })
  } catch (error) {
    console.error('Publish error:', error)
    return NextResponse.json(
      { error: 'Failed to publish version' },
      { status: 500 }
    )
  }
}
